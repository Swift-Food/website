# Your branded catering link

Your customers order catering through a page on Swift Food that carries your logo
and colour. You don't need to host or build anything - just share the link.

```
https://swiftfood.uk/event-order?partner=<your-link-address>
```

For example:

```
https://swiftfood.uk/event-order?partner=test
```

Orders placed through it are attributed to you automatically.

## Finding and changing your link

Your link address is in your partner dashboard under **Settings → Branding**, where
you can copy the full link with one click.

You can change the address there too, but changing it **breaks every link you have
already shared** - old links show an "unavailable" page and are not redirected. If
you change it, update your website, emails, QR codes and any printed material. The
dashboard asks you to confirm before applying the change.

## Customising the page

Also under **Settings → Branding**:

- **Logo** - PNG or JPG, under 5MB. A wide logo on a transparent background works
  best. Without one, your name is shown as text.
- **Accent colour** - a 6-digit hex colour used for buttons and highlights.

Changes take effect immediately.

## Pre-filling order details

If you already know something about the booking, you can add it to the link and the
form arrives part-filled. Every one of these is optional.

| Add to the link | Format | Fills in |
|---|---|---|
| `eventName` | free text | Event name |
| `startDate` | `YYYY-MM-DD` | Event start date |
| `startTime` | `HH:MM` (24-hour) | Event start time |
| `endDate` | `YYYY-MM-DD` | Event end date |
| `endTime` | `HH:MM` (24-hour) | Event end time |
| `guests` | whole number | Guest count |
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

Join them with `&`:

```
https://swiftfood.uk/event-order?partner=test&eventName=Summer%20Social&startDate=2026-08-14&startTime=12:30&guests=40&name=Jo%20Bloggs&email=jo@example.com
```

## Things that will catch you out

Nothing here reports an error. A value the page can't read is skipped silently, the
page still loads, and the customer fills that field in by hand. **Always open a link
yourself before sending it.**

- **The address needs coordinates, not just text.** All five of `line1`, `city`,
  `postcode`, `lat` and `lng` must be present or **no address is filled in at all**.
  A link with a complete, correct postal address but no `lat`/`lng` fills in
  nothing. Take the coordinates from whatever produced the address - a Google
  Places lookup, a postcode lookup, or your own booking system. `line2` is genuinely
  optional. Everything else on the link still works if the address is skipped.
- **Dates and times are strict.** `YYYY-MM-DD` and 24-hour `HH:MM` only.
  `14/08/2026`, `2026-8-14` and `12:30pm` are all ignored.
- **Dates in the past are ignored.** An old link falls back to an empty date rather
  than one stuck in the past, so reusable links stay safe.
- **`guests`, `lat` and `lng` must be numbers.** Anything else is ignored.
- **Special characters must be encoded.** Spaces become `%20`. An unencoded `&`
  inside a value will cut the link short and lose everything after it. If you are
  building links by hand, the simplest safe option is to avoid `&`, `?` and `#`
  inside values.

## Need help?

Contact Swift at [swiftfooduk@gmail.com](mailto:swiftfooduk@gmail.com).
