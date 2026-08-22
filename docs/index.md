# LibreTranslate Mobile — Documentation

An iOS-first React Native client for a self-hosted LibreTranslate server. Translation, speech,
and a local history database, with nothing leaving the server you choose.

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

## Why self-hosted matters here

Translation is one of the more revealing things you can hand to a third party — you send them
exactly the text you did not want to keep to yourself.

Pointing the app at your own LibreTranslate instance means the text goes to a server you
control. There is no API key, no account, and no default server baked in: the app cannot
translate until you tell it where to.

History and favourites live in a local SQLite database on the device, not on the server.

## Testing worth noting

`src/__tests__/` covers the service layer and includes a **scenario test** running a full
translation flow — unusual at this size, and the reason the service split below is worth
preserving.
