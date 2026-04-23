# LibreTranslate Mobile (iOS-first)

React Native + TypeScript mobile app for self-hosted LibreTranslate, with text/voice translation, local SQLite history, favorites, settings, and onboarding.

## Implemented scope

- Server setup and validation for custom LibreTranslate URL
- Translation screen:
  - language selection + swap
  - auto-detect source language
  - text translation with debounce
  - clipboard copy/paste flow
  - speech-to-text input
  - text-to-speech output
- History and favorites:
  - SQLite-backed storage
  - search history/favorites
  - toggle favorites
  - export/share history JSON
- Settings:
  - theme mode (system/light/dark)
  - text size controls
  - default source/target language
  - auto-detect toggle
  - onboarding reset
- QA and deployment readiness:
  - lint + typecheck + unit/integration/scenario tests
  - CI workflow for iOS/macOS
  - privacy policy, terms, release notes artifacts

## Tech stack

- React Native 0.85
- TypeScript (strict)
- Redux Toolkit
- React Navigation
- Axios
- SQLite (`react-native-sqlite-storage`)
- Speech: `@react-native-community/voice`, `react-native-tts`
- Clipboard: `@react-native-clipboard/clipboard`
- Jest

## Getting started

```bash
npm install
npm start
```

In another terminal:

```bash
npm run ios
```

## Quality gates

```bash
npm run lint
npm run typecheck
npm test -- --watch=false
```

Or run all:

```bash
npm run ci
```

## iOS release

```bash
npm run ios:release
```

For CI build/signing setup, see `.github/workflows/ios-ci.yml`.

## App Store and legal docs

- `docs/app-store/metadata.md`
- `docs/app-store/release-notes.md`
- `PRIVACY_POLICY.md`
- `TERMS_OF_SERVICE.md`
