# LibreTranslate Mobile — FAQ

## Does my text leave my device?

The text you translate goes to the LibreTranslate server you configured, because that is what
translating it requires. Nothing else does. There is no analytics SDK, no crash reporter, and
no telemetry.

Your history, favourites, settings, and server list stay on the device.

## Which server should I use?

Use the default LibreTranslate instance for a hosted service, or your own server for control over processing. The public instance has rate limits and currently requires an API key.

## Do I need an API key?

The official default instance currently requires a key. Custom instances may allow keyless access; leave the field blank in that case.

## Does it work offline?

No. Every translation is a request to your server. There is no on-device model.

Your **history** is readable offline, since it is a local database. The language list is cached
for an hour and the stale copy is reused if the server is unreachable, so the picker keeps
working — but translating does not.

## Is there an Android version?

There is an `android/` directory and it may well build, but nothing is tested there. iOS is
what is maintained.

## How much history is kept?

The history and favourites screens show the 100 and 50 most recent entries. Rows below that are
still in the database but not reachable in the app — see
[`internal/known-issues.md`](./internal/known-issues.md) if that matters to you.

## Can I get my history out?

Yes — export from the history screen writes a JSON file and hands it to the iOS share sheet.
Read the export note in `internal/known-issues.md` first; it does not include everything.

## Why does swapping languages do nothing on Auto?

There is no language to swap *to* until detection has run, so swap is disabled while the source
is Auto Detect and no detected language is available. Translate first or select a source language.

## Why is there a delay before it translates?

Text is debounced for 500ms. The default server also has a three-second minimum request interval; additional server cooldowns appear as a countdown.

## Why is my language missing from the picker?

The list comes from your server. An instance with fewer models installed offers fewer
languages — install the model there.

## Why does speech sound wrong for my language?

Speech input and output map languages to locales through a built-in table of eleven common
languages, and anything outside it falls back to US English. See
[`internal/known-issues.md`](./internal/known-issues.md).

## Is this affiliated with LibreTranslate?

No. It is an independent client for their software.
