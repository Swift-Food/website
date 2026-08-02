# Partner-branded catering link

The link to give a partner once their space exists in the admin dashboard.

```
https://swiftfood.uk/event-order?partner=<slug>
```

Example:

```
https://swiftfood.uk/event-order?partner=test
```

The page renders with the partner's logo and accent colour, and every order placed
through it is attributed to that partner, with their commission applied. The partner
does not need to host anything - the page is ours.

This is **not** the same as the embeddable widget. A partner who wants catering on
*their own* site embeds `@swift-food-services/catering-widget` with a publishable
key instead; see that package's README. Use this doc for partners who just want a
link.

## The slug

`<slug>` is the partner space's **slug** field in the admin dashboard - lowercase
letters, numbers and hyphens only (`^[a-z0-9-]+$`). It is the same value shown in
the partner spaces list.

The space must be **active**. A slug that is unknown, inactive, or soft-deleted
shows a "This catering page isn't available" screen with a button back to the
unbranded Swift page - the widget does not load at all.

Omitting `?partner=` entirely is valid: the page renders as the normal unbranded
Swift catering page.

## Prefill parameters

All optional, all combinable with `partner`. They pre-populate the order form so
the customer lands with details already filled in.

| Parameter | Format | Fills |
|---|---|---|
| `eventName` | free text | Event name |
| `startDate` | `YYYY-MM-DD` | Event start date |
| `startTime` | `HH:MM` (24-hour) | Event start time |
| `endDate` | `YYYY-MM-DD` | Event end date |
| `endTime` | `HH:MM` (24-hour) | Event end time |
| `guests` | integer | Guest count |
| `line1` | free text | Delivery address line 1 — **required for address** |
| `city` | free text | Delivery city — **required for address** |
| `postcode` | free text | Delivery postcode — **required for address** |
| `lat` | decimal | Delivery latitude — **required for address** |
| `lng` | decimal | Delivery longitude — **required for address** |
| `line2` | free text | Delivery address line 2 (optional) |
| `name` | free text | Contact name |
| `email` | free text | Contact email |
| `phone` | free text | Contact phone |
| `org` | free text | Contact organisation |

Full example:

```
https://swiftfood.uk/event-order?partner=test&eventName=Summer%20Social&startDate=2026-08-14&startTime=12:30&guests=40&line1=1%20Example%20St&city=London&postcode=SW1A%201AA&lat=51.501364&lng=-0.141890&name=Jo%20Bloggs&email=jo@example.com
```

Note `lat` and `lng` — without them the address is discarded even though `line1`,
`city` and `postcode` are all correct. See the address rule below.

**URL-encode every value.** Spaces become `%20`, and an unencoded `&` inside a
value will truncate it and corrupt the rest of the query string.

### Rules worth knowing

These are places where a link can look right and silently do less than expected.

- **The address needs coordinates, not just text.** All five of `line1`, `city`,
  `postcode`, `lat` and `lng` must be present or **no address is prefilled at all**.
  This is the easiest mistake to make: a link carrying a complete, correct postal
  address but no `lat`/`lng` prefills nothing, and the customer types the whole
  address again.

  There are two independent checks. The page drops the address unless `line1`,
  `city` and `postcode` are all present; the widget then drops it again unless
  `lat` and `lng` are both numbers. `line2` rides along and is genuinely optional.

  Get the coordinates from whatever produced the address — a Google Places lookup,
  a postcode API, or the partner's own CRM. They are not validated on the way in,
  so a wrong coordinate prefills a wrong location silently.

  Everything else is unaffected: contact and event fields still prefill normally
  when the address is dropped.
- **Past dates are ignored.** A `startDate` before today is discarded rather than
  applied, so an old link degrades to an empty date picker instead of one stuck in
  the past. A `startTime` earlier today is dropped the same way.
- **Dates and times are strict.** `YYYY-MM-DD` and `HH:MM` only. `14/08/2026`,
  `2026-8-14` and `12:30pm` are all silently ignored.
- **`guests`, `lat` and `lng` must be numeric.** Non-numeric values are dropped.
- **Unknown parameters are ignored.** Adding extra query params is harmless; they
  simply do nothing.
- **Nothing here is validated loudly.** Every malformed value is skipped silently,
  so the page still loads and the customer fills that field in by hand. Always
  click a link before sending it.

## Before sending a link

1. The partner space exists in the admin dashboard and is **Active**.
2. Its logo and accent colour are set, or the page shows the partner's name as
   plain text with the default Swift pink.
3. Commission is set on the space if the partner is owed one.
4. **"Can act as other partners" is enabled on Swift's own partner space.** This is
   the setting that lets our site attribute an order to the branded partner. Until
   it is on, branded pages still render but orders attribute to Swift and the
   partner's commission is not applied. It is a one-time setup on *our* space, not
   on each partner's.

## Related

- Widget embed (partner hosts it themselves): `catering-widget/packages/catering-widget/README.md`
- Deep-link design and param mapping: `docs/superpowers/specs/2026-07-14-branded-partner-catering-deeplinks-design.md`
- Slug delegation design: `backend/docs/superpowers/specs/2026-08-02-partner-slug-delegation-design.md`
