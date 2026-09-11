# LibreTranslate Mobile — Quickstart

You need macOS with Xcode 16.1 or newer to build for iOS.

## 1. Choose a server

Use the default `https://libretranslate.com` instance or supply your own URL. The default is rate limited and currently requires an API key. A custom server can be hosted remotely or on your local network.

## 2. Install and run

```bash
npm install
npm start
```

In another terminal:

```bash
npm run ios
```

## 3. Onboarding, then your server

Choose **Default instance** or **Custom server** in setup. Add an API key if your server requires one. For a custom server on your computer, use its LAN address rather than `localhost`. The connection check verifies available languages.

## 4. Translate

On the translate screen:

| Action | Notes |
|---|---|
| Type | Translates as you pause — the input is debounced |
| Auto-detect | Leave the source as Auto and it works the language out |
| Swap | Exchange source and target |
| Speak | Speech-to-text into the input |
| Listen | Text-to-speech on the output |
| Copy and paste | Clipboard both ways |

## 5. History and favourites

Every translation is saved to a local SQLite database. Search it, star what you want to keep,
and export the lot as JSON from the history screen.

**This never leaves the device.** The server sees the text it translates; it does not see your
history.

## 6. Settings

Theme, text size, default source and target languages, auto-detect, and an onboarding reset.

## Then what

- [Configuration](./configuration.md) — what is stored and where
- [Architecture](./architecture.md) — how the pieces fit
- [Troubleshooting](./troubleshooting.md) — if the server is rejected
