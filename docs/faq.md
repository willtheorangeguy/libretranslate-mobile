# LibreTranslate Mobile — FAQ

### Does my text leave my device?

The text you translate goes to the LibreTranslate server you configured, because that is what
translating it requires. Nothing else does. There is no analytics SDK, no crash reporter, and
no telemetry.

Your history, favourites, settings, and server list stay on the device.

### Which server should I use?

Your own. That is the point of the app — the server sees your text, so it should be one you
control.

A public instance works too, but then you have simply chosen a different stranger.

### Do I need an API key?

Only if your instance requires one. Leave the field blank otherwise.

### Does it work offline?

No. Every translation is a request to your server. There is no on-device model.

Your **history** is readable offline, since it is a local database. The language list is cached
for an hour and the stale copy is reused if the server is unreachable, so the picker keeps
working — but translating does not.

### Is there an Android version?

There is an `android/` directory and it may well build, but nothing is tested there. iOS is
what is maintained.

### How much history is kept?

The history and favourites screens show the 100 and 50 most recent entries. Rows below that are
still in the database but not reachable in the app — see
[`internal/known-issues.md`](./internal/known-issues.md) if that matters to you.

### Can I get my history out?

Yes — export from the history screen writes a JSON file and hands it to the iOS share sheet.
Read the export note in `internal/known-issues.md` first; it does not include everything.

### Why does swapping languages do nothing on Auto?

There is no language to swap *to* until detection has run, so swap is disabled while the source
is Auto Detect. Pick a real source language and it works.

### Why is there a delay before it translates?

500ms of debounce after you stop typing, so a sentence is one request rather than thirty.

### Why is my language missing from the picker?

The list comes from your server. An instance with fewer models installed offers fewer
languages — install the model there.

### Why does speech sound wrong for my language?

Speech input and output map languages to locales through a built-in table of eleven common
languages, and anything outside it falls back to US English. See
[`internal/known-issues.md`](./internal/known-issues.md).

### Is this affiliated with LibreTranslate?

No. It is an independent client for their software.
