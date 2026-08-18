# LibreTranslate Mobile — Troubleshooting

## "Connection Failed" when adding a server

The check calls `GET /languages` and requires a JSON array back. It fails when:

| Cause | Check |
|---|---|
| Scheme missing | The URL needs `http://` or `https://` |
| Wrong host from the phone | `localhost` means *the phone*, not your computer — use the LAN IP |
| Server not running | `curl http://your-server:5000/languages` from another machine |
| Firewall | The port must be reachable from the phone's network |
| Proxy returning HTML | An error page is not an array, so it is correctly rejected |

The prefilled `http://localhost:5000` will not work on a physical device. On the simulator it
reaches your Mac, which is why it is there.

### iOS blocks plain HTTP

iOS refuses cleartext HTTP by default. A local `http://` server may be rejected before the
request leaves the device. HTTPS avoids this, and is the right answer for anything not on your
own LAN.

## Setup succeeded but translating fails

Usually an API key problem. The connection check calls `/languages`, which most instances serve
without a key, so a wrong or missing key passes setup and fails on the first translation.

The message shown may be an unhelpful "Request failed with status code 403" — the server's
explanation is discarded before it reaches the UI (see
[`internal/known-issues.md`](./internal/known-issues.md)). Check the server's own logs, which do
have the reason.

## "Connection timeout"

Every request times out at 10 seconds. A self-hosted instance on modest hardware can exceed
that on long input — the first request after startup is usually the worst, since models load on
demand.

Try shorter text, or warm the server with a `curl` translation before using the app.

## Nothing happens when I type

500ms of debounce, then the request. If nothing follows:

1. Check the character count under the input — 5,000 is the maximum.
2. Check the source and target are not the same language.
3. Look for an error message under the output field.

## Speech does not work

| Symptom | Likely cause |
|---|---|
| Nothing recorded | Microphone or speech-recognition permission denied — iOS Settings |
| Wrong accent or voice | The language is outside the eleven-locale table; falls back to US English |
| Silent text-to-speech | Device muted, or no voice installed for that language |

iOS asks for microphone and speech-recognition permission on first use. Deny it and the only
symptom is that nothing is recorded.

## Build failures

```bash
npm start -- --reset-cache          # stale Metro cache
rm -rf node_modules && npm install  # dependency mismatch
```

For native errors, reinstall the iOS pods — SQLite, voice, TTS, and clipboard all have native
modules, and a pod install that predates a dependency change is the usual cause.

Then `npm run ci`, which fails fast without needing a simulator.

## Clearing history removed my favourites

That is a real defect, not a misunderstanding — favourites are rows in the same table and
"clear history" deletes all of them. There is no undo. See
[`internal/known-issues.md`](./internal/known-issues.md); export before clearing.

## Still stuck

[Open an issue](https://github.com/willtheorangeguy/libretranslate-mobile/issues/new/choose)
with your iOS version, whether the server is local or remote, and the exact message.
