# LibreTranslate Mobile — Architecture

React Native and TypeScript, with a service layer deliberately kept out of the components.

## The shape

```text
App.tsx
  └── AppNavigator            onboarding → server setup → main tabs
        └── MainAppTabs       Translate · History · Favorites · Settings
              ├── screens/    presentation and local UI state
              ├── store/      Redux Toolkit: server, settings, translation
              └── services/   everything that touches the outside world
```

## The service layer

Four services, each owning one boundary. No screen talks to axios, SQLite, or the speech APIs
directly.

| Service | Boundary | Notes |
|---|---|---|
| `LibreTranslateClient` | HTTP | A class around axios, held as a module singleton |
| `TranslationService` | The client | Adds a language-list cache and empty-input guards |
| `DatabaseService` | SQLite | History, favourites, export |
| `StorageService` | Key-value storage | Servers, settings, onboarding flag |
| `SpeechService` | iOS speech | Recognition and text-to-speech |

This is why the tests are meaningful. `src/__tests__/services/` exercises the client, storage,
and the translation service without a simulator, and `flows/translationFlow.scenario.test.ts`
runs a whole translation end to end against mocked boundaries. Move HTTP calls into components
and that stops being possible.

### The client singleton

`LibreTranslateClient` is instantiated by `initializeClient(url, apiKey)` and fetched by
`getClient()`. Calling `getClient()` before initialisation throws — which is the intended
behaviour, since translating before a server is chosen would mean sending text nowhere in
particular.

The navigator re-initialises it on launch from the saved active server, and the server-setup
screen does so when you add or switch servers.

## State

Redux Toolkit, three slices:

| Slice | Holds |
|---|---|
| `serverSlice` | Configured servers and the active one |
| `settingsSlice` | Theme, text size, default languages, auto-detect |
| `translationSlice` | Current translation, loading, error, in-session history |

Redux holds what the UI renders. **Durable** state lives in the two stores below — the slices
are rehydrated from them, not the reverse.

## Two stores, on purpose

| Store | Holds | Why |
|---|---|---|
| Key-value (AsyncStorage) | Servers, settings, onboarding flag | Small, read whole, written rarely |
| SQLite | Translations | Grows, needs search and ordering |

Putting history in SQLite is what makes `LIKE` search and `ORDER BY created_at` cheap, and it
is why the history screen can search rather than filter in JavaScript.

There is **one** translations table. Favourites are not a separate table — they are rows with
`is_favorite = 1`. That keeps starring a single `UPDATE` and avoids a copy that could drift,
but it has a consequence worth knowing about before you tap "clear history": see
[`internal/known-issues.md`](./internal/known-issues.md).

## The translate flow

1. You type. The handler debounces 500ms.
2. If the source is Auto and auto-detect is on, `POST /detect` resolves it first.
3. `POST /translate` with the resolved source.
4. The result renders, and the row is written to SQLite.

Step 4 reuses one **session id** for as long as you keep editing the same input, and the insert
is `INSERT OR REPLACE`. Editing a sentence therefore leaves one history entry rather than one
per keystroke pause. Clearing the input or swapping languages starts a new session.

## Theming

`src/theme/` exposes `useThemeColors()`; screens build their `StyleSheet` inside a `useMemo`
keyed on the colours. Themes are followed from the setting rather than the system alone, so
"always dark" is possible on a light device.

## Related

- [API](./api.md) — the endpoints
- [Configuration](./configuration.md) — what is stored where
- [Development](./development.md) — running the tests
