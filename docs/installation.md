# LibreTranslate Mobile — Installation

## Requirements

| For | You need |
|---|---|
| Building and running | macOS with Xcode |
| Translating | A LibreTranslate server you can reach |
| Dependencies | Node, and CocoaPods for the iOS native modules |

This is iOS-first. There is a `react-native run-android` script, but the CI, release process,
and App Store artifacts are all built around iOS.

## Install

```bash
git clone https://github.com/willtheorangeguy/libretranslate-mobile.git
cd libretranslate-mobile
npm install
```

Several dependencies have native modules — SQLite, speech recognition, text-to-speech, and
clipboard — so the iOS pods need installing before a build. That is the step that fails first
on a fresh machine.

## Run

```bash
npm start          # Metro bundler
npm run ios        # in another terminal
```

## Release build

```bash
npm run ios:release
```

Signing and CI configuration live in `.github/workflows/ios-ci.yml`.

## Native modules, and why they matter

| Module | Provides |
|---|---|
| `react-native-sqlite-storage` | The local history database |
| `@react-native-community/voice` | Speech-to-text |
| `react-native-tts` | Text-to-speech |
| `@react-native-clipboard/clipboard` | Copy and paste |

None of these work in a JavaScript-only environment, which is why there is no Expo Go path
here — unlike `gittea-mobile` in this org. A real build is required.

Speech also needs microphone and speech-recognition permissions, which iOS prompts for on
first use.

## Verify

```bash
npm run ci
```

Lint, typecheck, and the full test suite. None of it needs a simulator or a server, so it is
the quickest confirmation the checkout is sound.

## Next

[Quickstart](./quickstart.md), or [Configuration](./configuration.md).
