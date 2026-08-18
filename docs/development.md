# LibreTranslate Mobile — Development

## Scripts

| Script | Does |
|---|---|
| `npm start` | Metro bundler |
| `npm run ios` | Build and run on the simulator |
| `npm run ios:release` | Release configuration |
| `npm run android` | Android, unmaintained — see below |
| `npm run lint` / `lint:fix` | ESLint over `.ts`/`.tsx` |
| `npm run format` | Prettier |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` / `test:watch` / `test:coverage` | Jest |
| `npm run ci` | Lint, typecheck, and tests — what CI runs |

`npm run ci` needs neither a simulator nor a server. Run it before pushing.

## Layout

```
src/
├── screens/       Onboarding, ServerSetup, Translate, History, Favorites, Settings
├── components/    LanguageSelector
├── navigation/    AppNavigator (stack), MainAppTabs (bottom tabs)
├── store/         Redux Toolkit store and the three slices
├── services/      LibreTranslateClient, TranslationService, DatabaseService,
│                  StorageService, SpeechService
├── hooks/         Typed useAppDispatch / useAppSelector
├── theme/         useThemeColors
├── types/         Shared TypeScript types
├── constants/     Storage keys, limits, default language list
└── __tests__/     services/ and flows/
```

## Tests

```bash
npm test
npm run test:coverage
```

Two kinds, and the distinction matters:

- **`__tests__/services/`** — unit tests over the client, storage, and translation service.
- **`__tests__/flows/translationFlow.scenario.test.ts`** — a full translation scenario through
  the service layer with the boundaries mocked.

The scenario test is the one that catches integration mistakes a unit test cannot: a service
that works alone but is wired up wrongly. Keep it passing, and extend it when you add a step to
the translate flow.

Native modules are mocked in `jest.setup.js`. New native dependencies usually need a mock added
there, or the suite fails on import rather than on behaviour.

## Conventions

- **TypeScript is strict.** Type new code properly rather than reaching for `any`.
- **Services own the boundaries.** Screens should not import axios, SQLite, or Voice directly —
  that is what keeps the tests runnable without a device. See [Architecture](./architecture.md).
- **Styles built with `useMemo`** keyed on theme colours, matching the existing screens.
- ESLint and Prettier settle formatting; do not hand-format around them.

## Android

There is an `android/` directory and a run script, but the CI, release process, App Store
artifacts, and manual testing are all iOS. Treat Android as unverified rather than supported.

## CI

`.github/workflows/ios-ci.yml` runs on macOS. It is the same `npm run ci`, so a green local run
is a good predictor.

## Releasing

```bash
npm run ios:release
```

Then archive and upload through Xcode. Store metadata and release notes live in
[`app-store/`](./app-store/metadata.md) — update them in the same PR as the change they
describe, not at submission time.

## Recording defects

Bugs found while working here go in [`internal/known-issues.md`](./internal/known-issues.md)
rather than being fixed in passing, unless fixing them is the job you are on.
