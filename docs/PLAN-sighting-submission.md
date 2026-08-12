# Plan: Record a Sighting — photo provenance, share/email, iRecord CSV

Self-contained build brief for the Old Down Nature Spotter (`~/Desktop/nature-spotter`,
branch `old-down`). Everything needed is here; no other context required.

## Context you need

Vanilla JS single-page app, no build step, no dependencies, works offline from `file://`.

- `index.html` — all screens, each a `<div id="screen-NAME" class="screen hidden">`
- `js/app.js` — one IIFE, ~1300 lines. Screens shown via `showScreen('name')`
- `styles.css` — design system. Use the existing CSS variables: `--moss #3d5a2e`,
  `--fern #5a7a40`, `--chalk #f5f0e8`, `--cream #faf7f0`, `--bark #8b6f4e`,
  `--mist #e8ede0`, `--amber #d4a574`, `--orange #c97a45`, `--danger #8b2020`,
  `--text-dark`, `--text-light`, `--border`, `--radius`, `--shadow-sm/md/lg`.
  Fonts: `--font-heading` (Playfair Display), `--font-body` (Source Serif 4).
  Reuse existing classes where they fit: `.screen`, `.form-header-bar`, `.btn-back`,
  `.form-content`, `.field-form`, `.field-group`, `.field-label`, `.field-input`,
  `.field-textarea`, `.field-hint`, `.field-actions`, `.btn-primary`, `.btn-icon`,
  `.admin-tab`, `.admin-tab-content`, `.tab-badge`, `.admin-empty`.
- `config/location.js` sets `window.LOCATION_CONFIG` — has `id`, `shortName`,
  `defaultLocationFilter`, `contactEmail`, `adminPassword`.
- `data/species.json` — array of species; each has `id`, `common_names[]`,
  `latin_name`, `locations[]`, `photos[]` (each `{url, credit, licence, caption,
  life_stage, month_taken, focal?}`), `life_stages[]` (each may have `photos[]`).
- Existing `#screen-submit` is for **guide corrections** ("Suggest an Addition").
  Leave it alone. This is a separate thing.

Mobile-first. Everything must work one-handed on a phone in a field.

## What we are building

A **Record a Sighting** flow: a recorder logs what they saw, where and when, with
photos they took themselves, and sends it to the club by native share (photos
attached) or email (fallback). The club admin exports the collected records as a
CSV formatted for iRecord's spreadsheet import.

Three parts: **(1) the sighting screen**, **(2) photo provenance checking**,
**(3) send + admin export**.

---

## Part 1 — The sighting screen

New screen `#screen-sighting` in `index.html`, placed after `#screen-submit`.

### Entry points

- Footer link `#footer-submit` ("Submit a sighting") currently opens `#screen-submit`.
  **Repoint it to `#screen-sighting`** — it has always been mislabelled.
- Species detail page: add a button `#btn-detail-sighting` labelled `👁 I saw this`
  in the `.detail-header-bar`, next to the existing `#btn-detail-submit`. Opens the
  sighting screen with the species prefilled.
- Back button returns to wherever you came from — follow the `previousScreen`
  pattern already used by `handleBackFromSubmit()` in `js/app.js`.

### Fields

Group them under small headings. All ids prefixed `sg-`.

**What did you see?**
- `sg-species` — text input, `list="sg-species-list"`. Build the `<datalist>` at load
  from every species whose `locations` includes `LOCATION_CONFIG.defaultLocationFilter`,
  as `Common Name (Latin name)`. Free text allowed — people see things not in the guide.
  Prefilled when arriving from a detail page. **Required.**
- `sg-certainty` — select: `Certain` / `Likely` / `Uncertain`. Default `Likely`.
  These exact three strings — they are iRecord's own values.
- `sg-count` — text input, optional, placeholder `e.g. 1, 3, about 20`.

**When?**
- `sg-date` — `<input type="date">`, defaults to today.
- `sg-time` — `<input type="time">`, defaults to now.

**Where?**
- `sg-locate` — button `📍 Use my location`. Calls
  `navigator.geolocation.getCurrentPosition` with `{enableHighAccuracy:true, timeout:15000}`.
  On success store lat/lon and show `51.24831, -1.09442 · accurate to ~8 m`.
  On failure show a plain message ("Couldn't get a location — you can still describe
  the spot below") and carry on. Never block on it.
- `sg-site` — select: `Old Down` / `Sholing Valley` / `Somewhere else`. Default from
  `LOCATION_CONFIG.defaultLocationFilter`.
- `sg-place` — text input, optional, placeholder `e.g. the top of the chalk slope,
  by the bench`.

**Photos** — see Part 2.

**Anything else?**
- `sg-notes` — textarea, optional.

**Who are you?**
- `sg-recorder` — text input. **Required.** Remembered in `localStorage` key
  `ns_recorder_name` and prefilled next time.
- `sg-email` — email input, optional. Remembered as `ns_recorder_email`.

### Submit gating

The send button `#sg-send` is `disabled` until: `sg-species` non-empty, `sg-date`
non-empty, `sg-recorder` non-empty, **and** the declaration checkbox (Part 2) is ticked.
Re-evaluate on every `input`/`change` in the form.

---

## Part 2 — Photo provenance (the important part)

**The requirement:** the photo must be one the recorder took themselves, not one lifted
from this guide or off the web. If they have not taken one, prompt them to. More than
one is better.

Software cannot truly prove authorship, so this is layered: make the honest path the
easy one, catch the obvious dishonest/mistaken ones, and require an explicit declaration.

### 2a. Camera first

Two buttons, not a bare file input:

```html
<button type="button" class="btn-primary sg-photo-btn" id="sg-take">📷 Take a photo</button>
<button type="button" class="btn-secondary sg-photo-btn" id="sg-choose">Choose an existing photo</button>
<input type="file" id="sg-file-camera" accept="image/*" capture="environment" hidden>
<input type="file" id="sg-file-library" accept="image/*" multiple hidden>
```

`#sg-take` clicks `#sg-file-camera` (the `capture` attribute opens the camera directly
on a phone). `#sg-choose` clicks `#sg-file-library`. Max 4 photos total.

### 2b. EXIF inspection

Write a small EXIF reader in `js/app.js` — **no external library, nothing loaded from a
CDN** (the app must work offline).

```js
async function readExif(file)  // -> {make, model, software, dateTimeOriginal: Date|null, gps: {lat, lon}|null}
```

Implementation notes:
- Read only the first 256 KB: `await file.slice(0, 262144).arrayBuffer()`. EXIF lives at
  the front of a JPEG.
- Use a `DataView`. Confirm `0xFFD8` at offset 0. Walk markers: at each, read the marker
  (`0xFFxx`) and its 2-byte big-endian length; stop at `0xFFDA` (start of scan).
- Find `0xFFE1` whose payload begins with ASCII `Exif\0\0`. The TIFF header starts 6
  bytes later — call that `tiff`.
- At `tiff`: `0x4949` = little-endian, `0x4D4D` = big-endian. All subsequent reads use
  that endianness. `tiff+4` holds the offset (from `tiff`) of IFD0.
- An IFD is: 2-byte entry count, then 12-byte entries, each `tag(2) type(2) count(4)
  valueOrOffset(4)`. If the value is longer than 4 bytes the last field is an offset
  from `tiff`.
- Types needed: 2 = ASCII (`count` bytes, NUL-terminated), 3 = SHORT, 4 = LONG,
  5 = RATIONAL (two LONGs: numerator, denominator).
- IFD0 tags: `0x010F` Make, `0x0110` Model, `0x0131` Software, `0x8769` Exif sub-IFD
  pointer, `0x8825` GPS sub-IFD pointer.
- Exif sub-IFD: `0x9003` DateTimeOriginal, ASCII `"YYYY:MM:DD HH:MM:SS"` — parse to a
  `Date` (note colons in the date part; do not feed it to `new Date()` raw).
- GPS sub-IFD: `0x0001` LatRef (`"N"`/`"S"`), `0x0002` Lat (3 RATIONALs = deg, min, sec),
  `0x0003` LonRef (`"E"`/`"W"`), `0x0004` Lon. Convert:
  `deg + min/60 + sec/3600`, negated for `S`/`W`.
- Wrap the whole thing in `try/catch` and return all-nulls on any malformed input. A
  broken parse must never stop someone filing a record.

### 2c. Verdict

Build once at data load: `guideBasenames`, a `Set` of the lowercased final path segment
of every photo URL in `data/species.json` (top-level `photos` and every
`life_stages[].photos`), URL-decoded.

For each selected file compute a verdict:

**`blocked`** — do not add the photo, show the reason in a `--danger` panel:
- the file's lowercased name is in `guideBasenames`
  → *"That's a photo from the guide. We need one you took yourself."*
- the name matches `/^[a-z0-9-]+-\d+\.(jpe?g|png|webp)$/` **and** its stem without the
  trailing `-N` matches a species `id` in the data
  → same message.
- **no `make`, no `model`, and no `dateTimeOriginal`**
  → *"This doesn't look like a photo from a camera — screenshots and images saved from
  the web have their camera details removed. Please use a photo you took."*

**`warn`** — add the photo but show an `--amber` note with a **Remove** link:
- `dateTimeOriginal` missing but camera make/model present
  → *"No date stored in this photo — worth double-checking it's the right one."*
- `dateTimeOriginal` more than 7 days from the `sg-date` value
  → *"This photo was taken on {photo date}, but the sighting is dated {form date}. Is
  that right?"*

**`ok`** — add it, green note:
> *Looks like your own photo — {make} {model}, {date} {time}*

When `ok` and the photo carries useful EXIF, offer one-tap fills (buttons, not
automatic — never silently overwrite what someone typed):
- GPS present and no location captured yet → **Use this photo's location**
- `dateTimeOriginal` present and `sg-date` still at today's default → **Use this photo's date and time**

### 2d. Prompting for photos

A live panel below the thumbnails, updating on every add/remove:

- **0 photos** — amber:
  > *No photo yet. A photo is what lets someone else confirm the record — please take
  > one if you possibly can.*
  with the `📷 Take a photo` button repeated inside the panel.
- **1 photo** — amber, softer:
  > *One photo is good. Two or three from different angles — the top, the underside, the
  > whole plant — make a record far easier to confirm.* **Add another**
- **2 or more** — green: *That's a good set.*

### 2e. Declaration

Required checkbox `#sg-own`, immediately above the send button:

> **I took these photos myself.**

Disabled with a muted note while there are 0 photos; the send button's own guard covers
the no-photo case. Ticking it is part of the submit gating in Part 1.

### 2f. Downscaling

Photos off a modern phone are 3–12 MB. Before storing or sending, downscale each through
a `<canvas>`:
- long edge max **1600 px**, JPEG quality **0.85**, via `canvas.toBlob`
- wrap the result as a `File` with a tidy name:
  `{species-slug}-{YYYYMMDD}-{n}.jpg`
- also make a **320 px** JPEG data-URL thumbnail for the admin list

Keep the downscaled `File` objects in memory for sharing. Store **only the 320 px
thumbnail** in `localStorage` — full images will blow the quota.

---

## Part 3 — Sending, storage and iRecord export

### 3a. Record shape

```js
{
  id: 'sig-' + Date.now(),
  species, certainty, count,
  date: 'YYYY-MM-DD', time: 'HH:MM',
  site, place, lat, lon, accuracy,
  notes, recorder, email,
  photo_count, thumbnails: [dataUrl, ...],
  photo_meta: [{name, make, model, taken, verdict}, ...],
  created: ISO string,
  sent_irecord: false
}
```

Saved to `localStorage` under `ns_sightings` (mirror the existing
`getSubmissions()` / `saveSubmissions()` helpers).

### 3b. Text block

```
Nature sighting — Old Down

Species:    Common Blue Butterfly (Polyommatus icarus)
Certainty:  Likely
Count:      3
Date:       10/08/2026 14:32
Location:   Old Down — the top of the chalk slope, by the bench
Grid ref:   51.24831, -1.09442 (±8 m)
Recorder:   Jane Smith
Email:      jane@example.com

Notes:
Feeding on knapweed at the top of the slope.

Photos:     2 attached
Sent from the Old Down Nature Spotter guide.
```

### 3c. Send

```js
sendBtn.addEventListener('click', async () => {
  // ...build record, downscale photos BEFORE this handler runs...
  const files = currentPhotoFiles;            // already downscaled Files
  const payload = { title: 'Nature sighting — ' + species, text: recordText, files };
  if (files.length && navigator.canShare && navigator.canShare({ files })) {
    try { await navigator.share(payload); } catch (e) { /* user cancelled — fine */ }
  } else {
    window.location.href = 'mailto:' + to
      + '?subject=' + encodeURIComponent(subject)
      + '&body='    + encodeURIComponent(recordText);
    showAttachReminder();   // "Your email app is open — please attach your photos before sending"
  }
});
```

**Critical:** `navigator.share()` must be called from inside the user-gesture handler.
Do all downscaling and EXIF work **when the photo is added**, not on send — an `await`
before `share()` breaks the gesture on iOS and the share sheet silently fails.

Recipient: add `sightingEmail: "old.down.wildlife@gmail.com"` to `config/location.js`
and read `LOCATION_CONFIG.sightingEmail || LOCATION_CONFIG.contactEmail`.

Save the record to `localStorage` **before** sharing, so a cancelled share still leaves it
in the admin panel. Then show the existing-style thank-you panel.

**No-photo guard:** if `files.length === 0`, `confirm()` first —
*"Send without a photo? Records with a photo are far more likely to be accepted."*

### 3d. Admin panel

Add a fourth tab to `#screen-admin`, matching the existing three:

```html
<button class="admin-tab" data-tab="sightings">Sightings <span id="sightings-count" class="tab-badge">0</span></button>
```
plus `<div id="tab-sightings" class="admin-tab-content hidden">`. The existing tab
handler in `setupAdmin()` is generic and will pick it up.

Contents: a toolbar with **⬇ Download for iRecord (CSV)** and **Clear sent records**,
then a card per sighting — thumbnail strip, species, certainty, date/time, place, grid
ref, recorder, notes, and a **Mark as sent to iRecord** toggle setting `sent_irecord`.

### 3e. iRecord CSV

These column headers exactly (they are iRecord's documented import fields):

```
Species name,Date,Spatial reference,Spatial reference system,Location name,Recorder name,Certainty,Quantity,Occurrence comment,Sample comment
```

- **Species name** — strip any trailing ` (Latin name)` the datalist added; send the
  common name alone, which iRecord matches against the UK Species Inventory.
- **Date** — `dd/mm/yyyy`.
- **Spatial reference** — `lat, lon` to 5 dp. If no GPS was captured, leave blank and put
  the site + place text in **Location name** instead.
- **Spatial reference system** — `4326` when there is a lat/lon, else blank.
- **Location name** — `site — place`.
- **Certainty** — `Certain` / `Likely` / `Uncertain`.
- **Quantity** — the count field.
- **Occurrence comment** — the notes.
- **Sample comment** — `Recorded via the Old Down Nature Spotter. N photo(s) sent by email.`

CSV correctness: wrap any field containing a comma, double-quote or newline in double
quotes and double any internal quote. Prefix the file with a UTF-8 BOM (`﻿`) so
Excel opens it correctly. Download via a Blob + object URL, filename
`old-down-sightings-YYYY-MM-DD.csv`.

---

## Constraints

- **No new dependencies, no CDN, no build step.** Vanilla JS only, offline-capable.
- Match the surrounding code: same IIFE, same helper style, same comment density.
  Comments explain *why*, not *what*.
- Do not touch `#screen-submit`, `data/species.json`, or anything in `assets/`.
- Mobile-first; test at 375 px wide. Tap targets ≥ 44 px.
- Nothing may hard-fail: no geolocation, no EXIF, no Web Share — each degrades to a
  usable path.

## Acceptance criteria — verify every one before reporting done

Serve the site and check in a browser. **The Browser pane's preview servers cannot read
`~/Desktop`** — copy `index.html styles.css js data config assets` into a temp directory,
serve that, and re-copy after each edit.

1. Footer "Submit a sighting" opens the sighting screen, not the suggestion form.
2. `👁 I saw this` on a species page opens it with that species prefilled.
3. Attaching `assets/user-photos/sparrowhawk-1.jpg` is **blocked** — it is both a guide
   asset filename and has no EXIF. Message names the reason.
4. Attaching a real camera photo is **accepted** and shows the make/model and date line.
   Fixture with full EXIF (NIKON COOLPIX P520, taken 2024-11-06):
   `/private/tmp/claude-501/-Users-sarahgarton/ff8c5bdd-4d33-42e8-912f-407de3022b5b/scratchpad/newphotos/Sparrowhawk.jpg`
5. That fixture's EXIF date is years from today, so the **warn** path fires with the
   date-mismatch message and a working Remove link.
6. 0 photos → amber "no photo yet" prompt; 1 → "add another"; 2 → green.
7. Send stays disabled until species, date, recorder and the declaration are all set.
8. With no Web Share support, Send produces a `mailto:` URL whose body contains the
   record text. Verify by reading the href rather than actually opening a mail client.
9. The record appears in the admin Sightings tab with its thumbnails.
   (Admin opens by typing `admin` into the browse search box.)
10. The CSV downloads with exactly the headers above, one row per sighting, and a field
    containing a comma is correctly quoted.
11. `node --check js/app.js` passes and the browser console is free of errors.
12. Browse, detail, filters, spotted-toggle and the existing suggestion form all still work.

Report what you verified and anything you could not.

---

# STATUS

**All four parts are built and verified.** Parts 1–3 and the Part 4 code landed together
in `f9a01db`; this STATUS section was written at the same time and wrongly described
Part 4 as outstanding. Part 4 was re-verified against its acceptance criteria on
12 Aug 2026 and the club/guide names were made config-driven so the same code serves
both sites (see *Multi-site* below).

---

# Part 4 — Photo use permissions

The email must ask permission for the photos to be used by Old Down and iRecord, both
internally and externally (website, social media, grant applications).

New section in `#screen-sighting`, between **Photos** and **Anything else?**, headed
**Can we use your photos?**

Intro, in the muted `.field-hint` style:

> Your record and photos come to the Old Down Wildlife Group. Ticking these is entirely
> optional — your record is just as welcome either way.

Three checkboxes, in order:

| id | default | label | hint |
|---|---|---|---|
| `sg-perm-club` | unticked | Old Down can use my photos in its own work | Newsletters, talks, this species guide, record-keeping, and funding or grant applications. |
| `sg-perm-public` | unticked | Old Down can publish my photos publicly | Website, social media and printed leaflets. |
| `sg-perm-irecord` | **ticked** | This record can be sent to iRecord | iRecord is the national wildlife database. Records there are publicly visible and help conservation. Your photos are not sent to iRecord — only the sighting details. |

Then a text input `sg-credit`:
- Label: *How should we credit you?*
- Prefilled from `sg-recorder` and kept in sync with it **until the user edits
  `sg-credit` directly** — after that, stop overwriting it.
- Hint: *Leave blank if you'd rather not be named.*

Then a closing note in the same muted style:

> Please don't send photos with recognisable people in them unless everyone in the
> picture is happy for you to. You can change your mind about any of this at any time —
> just email us.

Rules:
- Boxes 1 and 2 are genuinely optional and **must not gate the send button**.
- `sg-own` ("I took these photos myself") is unchanged — a separate thing, still gating.
- With **0 photos**: disable boxes 1 and 2 and the credit field, with a muted
  *"No photos to give permission for."* Box 3 stays live — a record can go to iRecord
  without a photo.

### Knock-on changes

**a) Record shape** gains `perm_club`, `perm_public`, `perm_irecord` (booleans) and
`credit_as` (string).

**b) Email/share text block** gains a section after Notes, so the permission is in
writing in the club's inbox:

```
Photo permissions:
  Club use (newsletter, talks, guide, grants):  Yes
  Public use (website, social media, print):    No
  Credit as:                                    Jane Smith
  Send record to iRecord:                       Yes
```

With 0 photos the first three lines read `n/a — no photos sent`. With an empty
`sg-credit`, *Credit as* reads `Anonymous`.

**c) Admin sightings card** shows the permissions as small badges — granted in the
`--fern`/`--mist` green style, withheld in muted grey. Include the credit name.

**d) iRecord CSV must skip any record where `perm_irecord` is false.** Show the held-back
count next to the download button — *"2 records held back (no iRecord permission)"*. If
every record is held back, disable the button rather than downloading an empty file.

### Acceptance criteria for Part 4

1. The three boxes render with the right defaults, and 1 and 2 plus the credit field
   disable at 0 photos and enable at 1+.
2. The credit field tracks the name field, then stops once edited directly.
3. The permission block appears in the mailto body with correct Yes/No values, and reads
   `n/a — no photos sent` when there are none.
4. An empty credit field renders as `Anonymous`.
5. A record with `perm_irecord` false is excluded from the CSV and counted in the note;
   all-excluded disables the button.
6. `node --check js/app.js` passes; no console errors; Parts 1–3 still work.

---

# Multi-site

The sighting flow ships on both the `old-down` and `sholing-valley` branches from the
same `index.html` / `js/app.js` / `styles.css`. Everything site-specific comes from
`LOCATION_CONFIG`, so the two branches must not diverge in the code:

| Config key | Used for |
|---|---|
| `sightingEmail` | the `mailto:` recipient (falls back to `contactEmail`) |
| `orgName` | *"Your record and photos come to **{orgName}**."* — the full phrase including any article, e.g. `"the Old Down Wildlife Group"` |
| `shortName` | the two permission labels — *"**Old Down** can use my photos…"* |
| `name` | *"Sent from the **{name}** guide."* and the CSV *Sample comment* |
| `id` | the CSV filename, `{id}-sightings-YYYY-MM-DD.csv` |

`.sg-perm-org` spans in `index.html` hold the `shortName` text; `applyConfig()` fills
them and `#sg-perm-intro`. The static markup keeps the Old Down wording as its default,
so a config missing these keys still reads sensibly.

**When changing the sighting flow, make the change once and cherry-pick it to the other
branch** — do not hand-edit the second branch, or the sites will drift.

