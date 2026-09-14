# Consumer signup and the order-entry auth prompt

Date: 2026-09-14
Repos touched: `backend` (feature branch), `website` (main)

## Problem

Swift has no way for a customer to create an account. Accounts come into
existence only as a side effect of guest catering checkout, where
`cateringService.findOrCreateConsumerAccount()`
(`website/services/api/catering.api.ts:373-421`) posts to `POST /consumer-user`
with a password it generates itself:

```ts
const password = Math.random().toString(36)...
```

The customer is never asked for that password and never told it exists. They
take ownership later through the claim flow (`/account/claim` →
`POST /auth/claim-account` → emailed link → `/account/set-password`), which is
headed "Create your account" despite being the *end* of the process.

`POST /auth/register` looks like a signup endpoint but is not one:
`AuthService.registerUser` throws `NotFoundException` when the email is unknown
(`backend/src/features/core/auth/auth.service.ts:289-291`). It only re-issues a
verification code for a user that already exists. The only paths that create a
brand-new `ConsumerUser` are guest checkout and Google/Apple OAuth.

Separately, we want to prompt customers to sign in when they start an order, so
their details prefill and the order attaches to their account.

## Goals

1. A customer can create an account with an email and a password they choose.
2. A first-time visitor arriving at `/event-order` is invited to sign in once,
   can dismiss it, and is never asked again on that device.

## Non-goals

- OAuth signup in the modal. Google/Apple consumer registration endpoints exist
  and work; wiring them into the frontend is separate work.
- Fixing the email-enumeration oracle (see "Known issues left in place").
- Any change to the `catering-widget` package.

## Piece 1 — Backend signup

### Approach

Assemble signup from parts that already exist rather than build a parallel
stack. `POST /auth/verify-email`
(`backend/src/features/core/auth/auth.service.ts:320-350`) already takes an
email plus a 6-digit code, sets `ConsumerUser.verified = true`, and **returns a
token pair** — so verification doubles as login. Codes live in Redis under
`email-verification:{userId}` with a 5-minute TTL; there is no DB table. The
email template exists (`backend/src/utils/mail/templates/account/auth-code.template.ts`),
delivered by nodemailer over Gmail SMTP.

Only the front half is missing: create the user with a chosen password, then
issue that code. A new endpoint does exactly that and nothing more.

### `POST /auth/register-consumer`

Guard: `@SecureEndpoint({ public: true, rateLimit: RateLimitPresets.AUTH_REGISTER })`
— 3/min, a preset that already exists
(`backend/src/shared/decorators/secure-endpoint.decorator.ts:78-128`).

Body — `RegisterConsumerDto`, added beside the existing DTOs in
`backend/src/features/core/auth/dto/create-auth.dto.ts`:

| Field | Validation |
| --- | --- |
| `email` | `@IsEmail() @IsNotEmpty()` |
| `username` | `@IsString() @IsNotEmpty() @MaxLength(100)` |
| `password` | `@IsString() @MinLength(6) @MaxLength(128)` |

The password bounds match `ResetPasswordDto` (`create-auth.dto.ts:274-289`) so
a password accepted at signup is accepted at reset.

Response on success: `{ success: true }`. **No tokens** — the account is
unverified, and tokens are issued by `verify-email`.

### Implementation

A new file, `backend/src/features/core/auth/consumer-registration.service.ts`,
rather than another method on `AuthService` — that file is already ~1500 lines,
and `account-claim.service.ts` establishes the pattern of giving a
self-contained consumer auth flow its own service.

`registerConsumer(dto)`:

1. Create the `User` and `ConsumerUser` rows in a single transaction, throwing
   `ConflictException` if the normalized email is taken. That 409 propagates to
   the client unchanged.

   **Revised during implementation.** The original plan was to delegate to
   `ConsumerUserService.create()`. Two things ruled it out:

   - `AuthModule → ConsumerUserModule → RestaurantModule → AuthModule` is a
     cycle (`restaurant.module.ts:14,39` imports `AuthModule`), so reuse would
     need `forwardRef`.
   - `ConsumerUserService.create()` does not actually get both rows into its
     transaction. It opens one, then calls `UsersService.createUser`, which
     saves through its own injected repository
     (`users.service.ts:37`) rather than the transactional manager — so a
     failure after the user is saved leaves an orphaned `User` with no consumer
     record. Signup writing both rows through one manager avoids inheriting
     that.

   The duplicated cost is about ten lines of row construction. Email
   normalization (`trim().toLowerCase()`) matches `UsersService` so login,
   reset and claim all resolve the same row.
2. Generate a 6-digit code with `randomInt` from `node:crypto`. The existing
   `registerUser` uses `Math.random()` (`auth.service.ts:301`); this does not
   copy that. The password-reset path already uses `randomInt`, so this matches
   the better of the two precedents.
3. Cache it under `cacheService.generateKey('email-verification', user.id)`
   with the same `5 * 60 * 1000` TTL.
4. Send via `authEmailRouter.sendAuthEmail(email, code, AuthEmailType.VERIFICATION,
   EmailPlatform.SWIFT_FOOD)`.
5. Publish the `CUSTOMER_CREATED` analytics event, matching what guest checkout
   already reports so signups do not go missing from customer analytics.

Once the transaction commits, the account exists and nothing after it is worth
losing the account over. A failed verification email is logged and swallowed,
and the request still returns success: the customer lands on the code screen
and can resend. Throwing instead would hide the fact that the account was
created, and their retry would meet a permanent 409 with no way forward.
Analytics publishing is best-effort for the same reason.

Reusing that exact cache key is the load-bearing decision: **`verify-email`
then works against a registered account with no modification**, and because it
returns a token pair, the client needs no follow-up login call.

### `POST /auth/register-consumer/resend`

Body `{ email }`. Same rate-limit preset.

Two reasons it is not optional. It backs the "didn't get a code?" button on the
code-entry screen. And it is the only recovery path if the email send in step 4
fails after the user row has committed — without it that customer is stranded
behind a permanent 409 with no password they know.

Behavior: if an unverified consumer exists for the email, issue and send a fresh
code; otherwise do nothing. **Always returns the same neutral
`{ success: true }`**, whether the account is missing, already verified, or
unverified. This mirrors `AccountClaimService.requestClaim`
(`account-claim.service.ts:80-105`), which is deliberately non-enumerating.

### Existing-account collision

A customer who ordered as a guest already has a row: random password,
`verified: false`, `claimedAt: null`. Signing up with that email returns 409.

We return the 409 and handle it in the UI ("You've ordered with us before" →
links to log in or claim) rather than silently diverting into the claim flow.
Diverting would be more elegant and would hide account existence, but
`GET /users/email/:email` already answers "is this email registered?" with 200
vs 404 at 100/min, publicly
(`backend/src/features/user-management/users/users.controller.ts:36-45`), so
hardening signup alone buys very little. The honest error is also a better
experience: it names the situation and offers the two routes out.

### Known issues left in place

Found while researching, deliberately not fixed here — each is pre-existing and
wants its own scope:

1. **Email enumeration.** `GET /users/email/:email` is public and distinguishes
   registered from unregistered by status code, and `POST /auth/forgot-password`
   throws `NotFoundException` for unknown emails. Both undercut the care taken
   in the claim flow. Fixing them together is a security change with its own
   blast radius.
2. **`auth.service.ts:335`** interpolates `storedCode` into the "expired" error
   message at a point where it is always falsy, so the message reads
   `Verification code expired, undefined`.
3. **`loginConsumer` does not re-send a code** when it returns
   `needsVerification` (`auth.service.ts:196-204`), while the corporate path
   does. An unverified user can land on a code screen with no code in flight.
   The resend endpoint above gives the frontend a way to paper over this.

## Piece 2 — Frontend signup

`website/services/api/customer-auth.api.ts` gains three functions alongside the
existing eight:

| Function | Endpoint |
| --- | --- |
| `registerConsumer(email, username, password)` | `POST /auth/register-consumer` |
| `resendVerification(email)` | `POST /auth/register-consumer/resend` |
| `verifyEmail(email, code)` | `POST /auth/verify-email` → `CustomerTokenPair` |

A new route `website/app/account/signup/page.tsx` with two states in one page:

- **`details`** — name, email, password, confirm password. Client-side checks
  mirror `set-password/page.tsx:37-44` (min 6, must match).
- **`code`** — 6-digit entry plus a resend link.

Built from the existing `AuthCard` / `AuthField` / `AuthSubmitButton` /
`AuthAlert` in `website/lib/components/account/`, so it is visually identical to
login, claim and set-password. On successful verify, `startSession(tokens)` from
`useCustomerAuth` persists the session and fires `swift:customer-auth-change`,
then redirect — to `?next=` when present, else `/account`.

On 409 the details step shows an inline `AuthAlert` with links to
`/account/login` and `/account/claim`.

The login page footer (`app/account/login/page.tsx:84-92`) gains a link to
signup beside the existing claim link.

## Piece 3 — The order-entry auth prompt

### Trigger and placement

The modal belongs on `/event-order`, the single entry point for ordering —
every "Order Now" CTA on the site routes there
(`HeroSectionNew.tsx:18-20`, `navbar.tsx:95-108`, `:218-222`). It lives entirely
in the `website` repo; the `catering-widget` package is untouched.

### Sequencing, not stacking

The widget opens its own event-details modal (location, date, time) on a new
order. Two overlays at once would compound their scrims toward black and float
our panel over a form the user cannot reach.

Instead `EventOrderClient` gates the mount: when the prompt is showing, the
widget is **not rendered at all**. Dismissing or authenticating mounts it, and
its event-details modal then opens as it normally would. One modal on screen at
any time, and the handoff reads as a deliberate sequence.

### Gate logic

Extracted as a pure function in `website/lib/utils/auth-prompt.ts` so it is
testable under the repo's node-environment vitest setup, which has no DOM:

```ts
shouldShowAuthPrompt({ loading, isAuthenticated, seen }): boolean
```

Returns true only when `loading` is false, `isAuthenticated` is false, and
`seen` is false. The `loading` term matters: `useCustomerAuth` resolves its
session asynchronously (`useCustomerAuth.ts:39-62`), and without that check a
signed-in returning customer gets a flash of the modal before it disappears.
While loading, neither the prompt nor the widget renders.

### Persistence

Key `cust_auth_prompt_seen`, added to `website/lib/api-client/storage-keys.ts`
next to `CUSTOMER_STORAGE_KEYS` so all customer-scoped keys stay in one place.
Written on dismiss and on successful auth. Reads are wrapped — Safari private
mode throws on `localStorage` access — and a throwing read is treated as "not
seen", which shows the prompt rather than failing the page.

Per the agreed behavior, dismissal is permanent on that device.

### Components

- `website/lib/components/Modal.tsx` — a shared shell: overlay, panel, escape
  to close, focus trap, background scroll lock. Both repos currently hand-roll
  `fixed inset-0 bg-black/50 ...` in every modal (five copies in `website`
  alone, e.g. `RefundModal.tsx:168-174`). This is the sixth, so it is factored
  once rather than copied. Existing modals are **not** migrated — that is
  unrelated churn.
- `website/lib/components/account/AuthPromptModal.tsx` — inline login form
  using `AuthField` / `AuthSubmitButton` / `AuthAlert`, a "Create account"
  button routing to `/account/signup?next=/event-order`, and a dismiss control.
  `AuthCard` is not reused: it bakes in full-page height and padding
  (`AuthCard.tsx:14-33`).

### Why login is inline but signup is not

Signup now requires an emailed code. Inline signup at the top of the order
funnel would mean: fill a form, leave the site, find the email, return, type a
code — all before seeing a single menu item. Login is one step and stays inline;
signup routes out to its own page. Dismissing continues as a guest, which
creates their account anyway, so the fastest route to an account is still to
just order.

### Styling

`website` and `catering-widget` each define their own DaisyUI theme with the
same hardcoded token values (`website/app/globals.css:1-45` vs the widget's
`src/styles/index.css`) — there is no shared token package. Matching the
widget's modal shape (`rounded-2xl`, `p-6`, `shadow-xl`) and primary
`#fa43ad` keeps the handoff seamless. The parity is manual and fragile; a
shared token source is worth doing, but not inside this change.

## Testing

**Backend** — colocated Jest unit spec
`consumer-registration.service.spec.ts`, following the house style in
`account-claim.service.spec.ts`: a local `build()` helper, hand-rolled
`jest.fn()` mocks, a `Map`-backed fake cache, direct `new Service(...)`
construction, no NestJS testing module and no real DB or Redis.

- registers: creates the user, caches a 6-digit code under the
  `email-verification` key, sends exactly one verification email
- duplicate email: propagates `ConflictException`, caches nothing, sends nothing
- resend for an unverified account: caches a fresh code and sends one email
- resend for a verified account: returns success, sends nothing
- resend for an unknown email: returns success, sends nothing
- the generated code is 6 digits and drawn from `randomInt`

**Frontend** — vitest, node environment, no DOM, no testing-library
(`website/vitest.config.ts`). Component tests in this repo render through
`renderToStaticMarkup`, and the include globs cover `lib/**/*.test.ts`,
`services/**/*.test.ts` and `app/**/*.test.tsx` — note `lib/**/*.test.tsx` is
not included.

- `lib/utils/auth-prompt.test.ts` — the gate truth table, including that
  loading suppresses the prompt
- `services/api/customer-auth.test.ts` — the three new API functions hit the
  right paths and shape their bodies correctly, mocking `fetch` as
  `auth-client.test.ts` does

Interaction testing of the modal itself is out of reach without a DOM
environment, which is why the gate decision is a pure function. Adding jsdom
plus testing-library would be a repo-wide testing change, out of scope here.

## Build order

1. Backend endpoints and tests, on a feature branch.
2. Frontend signup page and API functions, on main — depends on 1.
3. The modal and the gate, on main — depends on 2 for its "Create account"
   destination.
