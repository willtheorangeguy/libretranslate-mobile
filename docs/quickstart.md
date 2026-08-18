# LibreTranslate Mobile — Quickstart

You need macOS with Xcode, and a LibreTranslate server you can reach.

## 1. Have a server

The URL field is prefilled with `http://localhost:5000`, which is a placeholder rather than a
working service. The app cannot translate until you point it at something real — which is the
privacy property, not an omission.

Options:

- **Self-host LibreTranslate** — the intended path, and the reason this app exists.
- **A public instance**, if you accept that your text goes to whoever runs it.

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

The app walks you through onboarding, then asks for your LibreTranslate URL, a name for it, and
an optional API key. It checks the connection before saving.

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
