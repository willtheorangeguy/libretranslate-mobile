# LibreTranslate Mobile — Configuration

Choose **Default instance** or **Custom server** during setup. Change this later using **Server settings** on the translation screen or **Settings → Manage LibreTranslate Servers**.

## Servers

The default is `https://libretranslate.com`. It is a shared, rate-limited service. The app spaces requests to it at least three seconds apart and honors HTTP 429 cooldowns. Public access is controlled by the operator: the official instance currently requires an API key. Add a key or select a custom instance; the app does not bypass authentication or promise free public access.

For a custom server, enter a complete HTTP or HTTPS base URL, an optional name, and an API key if required. URLs can include a reverse-proxy path, such as `https://example.com/translate`. Trailing slashes are removed. Credentials, queries, and fragments are rejected; keys belong in the API key field.

Use your computer’s LAN address to connect from a physical phone, for example `http://192.168.1.20:5000`. `localhost` refers to the phone itself. Both platforms allow HTTP for user-configured servers; use HTTPS to encrypt text, files, and keys in transit. iOS asks for local-network access when needed.

Setup checks `/languages`. This verifies that the endpoint is reachable and returns a nonempty language list; it does not verify the API key. Authentication failures explain how to update the key or switch servers. Saved servers can be selected, edited, or removed. Switch away from the active server before deleting it.

## Translation

The screen follows LibreTranslate’s web layout with text/file modes, source and target selectors, automatic detection, language swap, and input/output panels. Panels sit side by side on wider displays and stack on phones. Text translates after a 500ms typing pause. Editing, clearing, switching languages, or switching servers invalidates older requests.

The server supplies supported languages, translation directions, character limits, key requirements, and file formats. Auto Detect is available only as a source. When detection returns a language, it can be used for swapping. The app uses `source: "auto"` in a single translation request.

File mode uses the native document picker and sends the chosen file only when **Translate file** is pressed. After translation, **Download / share translation** downloads the result and opens the native share sheet. Unsupported servers show file mode as unavailable.

## Limits

| Limit | Behavior |
|---|---|
| Default instance | At least 3 seconds between requests, plus server quotas |
| HTTP 429 | Honors `Retry-After` seconds or dates; defaults to 60 seconds when absent |
| Retries | Countdown followed by user retry; no automatic retry loop |
| Text length | Server `charLimit`, otherwise 5,000; `-1` means unlimited |
| Request timeout | 30 seconds; file uploads 120 seconds |
| Languages cache | 1 hour, scoped to the active client |
| History / favorites shown | 100 / 50 most recent |

## Preferences and storage

Settings include system/light/dark theme, text size, default languages, automatic source selection, and onboarding reset. Server records (including optional API keys) and settings are stored in ordinary app storage. API keys are not stored in the Keychain. History and favorites are stored in local SQLite.

Text and files go to the selected server. The app’s history database is not uploaded. Speech input may use the platform’s speech recognition service.
