# CLAUDE.md

## Project Overview

LibreTranslate Mobile is a React Native (0.86) + TypeScript mobile app for accessing self-hosted LibreTranslate translation servers. iOS-first, with Android support.

## Quick Commands

```bash
npm start              # Start Metro bundler
npm run ios            # Run on iOS simulator
npm run android        # Run on Android emulator
npm test               # Run Jest tests
npm run lint           # ESLint
npm run lint:fix       # ESLint auto-fix
npm run format         # Prettier formatting
npm run typecheck      # TypeScript type checking
npm run ci             # Full quality gate (lint + typecheck + test)
```

## Architecture

```
src/
├── components/        # Reusable UI components
├── screens/           # Screen components (Translate, History, Favorites, Settings, ServerSetup, Onboarding)
├── navigation/        # React Navigation (stack + bottom tabs)
├── services/          # Business logic
│   ├── LibreTranslateClient.ts   # Axios API client (/languages, /translate, /detect)
│   ├── TranslationService.ts     # Translation ops with 1-hour language cache
│   ├── DatabaseService.ts        # SQLite (history/favorites persistence)
│   ├── SpeechService.ts          # Voice input/output
│   └── StorageService.ts         # AsyncStorage (preferences, server config)
├── store/             # Redux Toolkit (3 slices: translation, server, settings)
├── types/             # TypeScript interfaces
├── constants/         # App config, defaults, limits
└── hooks/             # Custom hooks (typed Redux hooks)
```

Entry point: `index.js` → `App.tsx` (Redux Provider + SafeAreaProvider)

## Tech Stack

- **React Native 0.86** with **TypeScript 5.9** (strict mode)
- **Redux Toolkit** + Zustand for state management
- **React Navigation v7** (stack + bottom tabs)
- **Axios** for HTTP, **SQLite** for local DB, **AsyncStorage** for preferences
- **React Native Paper** for Material UI
- **Jest 29** + @testing-library/react-native for tests

## Code Style

- **Prettier**: single quotes, trailing commas, 100 char width, 2-space indent, semicolons
- **ESLint**: @react-native + prettier integration, TypeScript ESLint parser
- Unused vars prefixed with `_` are allowed
- `console.log` warns (console.warn/error allowed)

## Testing

Tests live in `src/__tests__/`. Run with `npm test`.

- Unit tests for services (LibreTranslateClient, StorageService, TranslationService)
- Scenario/flow tests for Redux state transitions
- Coverage collected from `src/**/*.{ts,tsx}` (excluding `.d.ts` and `index.ts`)
- Path alias in tests: `@/*` → `src/*`

## CI/CD

GitHub Actions (`.github/workflows/ios-ci.yml`):
1. **Quality job** (Ubuntu): lint → typecheck → test
2. **iOS build job** (macOS): CocoaPods install → Xcode build (iPhone 16 simulator)

Triggered on push/PR to main/master.

## Key Conventions

- Services use class-based singleton pattern
- API timeout: 10s for translate, 5s for detect/languages
- UI limits: 100 history items, 50 favorites, 5000 char input limit
- Default supported languages: en, es, fr, de, it, pt, ru, ja, ko, zh, ar + auto-detect
- SQLite table: `translations` with indexes on timestamp, isFavorite, sourceLang/targetLang

## Requirements

- Node.js >= 22.11.0
- Ruby >= 2.6.10 (iOS builds, CocoaPods)
- iOS deployment target: 15.0+
