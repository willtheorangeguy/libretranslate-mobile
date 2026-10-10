# LibreTranslate Mobile — Documentation

A React Native client for the default LibreTranslate instance or your own server. Text and file translation, speech, and local history.

```text
libretranslate-mobile/
├── docs/
│   ├── README.md          this page
│   ├── quickstart.md      run it against your server
│   ├── installation.md    prerequisites and setup
│   ├── configuration.md   server URL, settings, what is stored
│   ├── architecture.md    services, store, screens
│   ├── api.md             the LibreTranslate endpoints used
│   ├── development.md     scripts, tests, project layout
│   ├── faq.md             privacy, offline, which server
│   ├── troubleshooting.md server rejection, speech, build failures
│   ├── roadmap.md         known gaps and non-goals
│   └── app-store/         submission metadata and release notes
└── src/
    ├── screens/           Onboarding, ServerSetup, Translate, History, Favorites, Settings
    ├── services/          LibreTranslateClient, TranslationService, DatabaseService, StorageService, SpeechService
    ├── store/slices/      server, settings, translation
    ├── components/        LanguageSelector
    └── __tests__/         services and a full-flow scenario
```

## Pages

- [Quickstart](./quickstart.md) — point it at a server and translate
- [Installation](./installation.md) — macOS, Xcode, and the native dependencies
- [Configuration](./configuration.md) — the server, the settings, and what persists
- [Architecture](./architecture.md) — the service layer and why it is separated
- [API](./api.md) — what it calls on your LibreTranslate instance
- [Development](./development.md) — scripts, tests, layout
- [FAQ](./faq.md) — privacy, offline use, choosing a server
- [Troubleshooting](./troubleshooting.md) — connection, speech, and build problems
- [Roadmap](./roadmap.md) — known gaps and non-goals

## Server choice

The default public instance offers hosted translation with rate limits and optional API-key configuration. The official instance currently requires a key. A custom instance gives you control over where text and files are processed. History and favorites stay in the device’s SQLite database.

## Testing

Tests cover request payloads, server validation, rate-limit cooldowns, server-specific language caches, stale-response handling, and translation/history flows.
