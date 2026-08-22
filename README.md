<!-- Logo -->
<h1 align="center">LibreTranslate Mobile</h1>

<!-- Copy -->
<h4 align="center">An iOS-first React Native client for your own self-hosted LibreTranslate — text and voice translation that never touches a third-party service.</h4>

<!-- Badges -->
<div align="center">
  <img alt="iOS CI" src="https://img.shields.io/github/actions/workflow/status/willtheorangeguy/libretranslate-mobile/ios-ci.yml?label=iOS%20CI">
  <img alt="GitHub Issues" src="https://img.shields.io/github/issues/willtheorangeguy/libretranslate-mobile">
  <img alt="GitHub Pull Requests" src="https://img.shields.io/github/issues-pr/willtheorangeguy/libretranslate-mobile">
  <img alt="License" src="https://img.shields.io/github/license/willtheorangeguy/libretranslate-mobile">
</div>

<!-- Navigation -->
<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#support">Support</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#credits">Credits</a> •
  <a href="#license">License</a>
</p>

## Key Features

- Point it at **your own** LibreTranslate server — no API key, no third-party translator.
- Text translation with debounce, language swap, and automatic source detection.
- Speech in and speech out, plus clipboard copy and paste.
- History and favourites in a local SQLite database, searchable, exportable as JSON.
- Theme, text size, default languages, and auto-detect, all configurable.
- Lint, typecheck, and unit, integration, and scenario tests behind one `npm run ci`.

## Installation

```bash
npm install
npm start
```

Then in another terminal:

```bash
npm run ios
```

Requires macOS with Xcode. See [`docs/installation.md`](docs/installation.md).

## Usage

Enter your LibreTranslate server URL on first run, then translate. History and favourites build up locally as you go.

## Documentation

Full documentation lives in [`docs/`](docs/index.md):
[Quickstart](docs/quickstart.md) · [Installation](docs/installation.md) · [Configuration](docs/configuration.md) · [Architecture](docs/architecture.md) · [API](docs/api.md) · [Development](docs/development.md) · [FAQ](docs/faq.md) · [Troubleshooting](docs/troubleshooting.md) · [Roadmap](docs/roadmap.md)

App Store metadata is in [`docs/app-store/`](docs/app-store/metadata.md). Legal documents are [`PRIVACY_POLICY.md`](PRIVACY_POLICY.md) and [`TERMS_OF_SERVICE.md`](TERMS_OF_SERVICE.md).

## Support

Open a [GitHub Discussion](https://github.com/willtheorangeguy/libretranslate-mobile/discussions/new) or file an [issue](https://github.com/willtheorangeguy/libretranslate-mobile/issues/new/choose).

## Contributing

Contributions welcome. See the org-wide [Contributing Guide](https://github.com/willtheorangeguy/.github/blob/main/CONTRIBUTING.md) and [Code of Conduct](https://github.com/willtheorangeguy/.github/blob/main/CODE_OF_CONDUCT.md).

## Credits

Translation by [LibreTranslate](https://libretranslate.com/). Built with [React Native](https://reactnative.dev/), [Redux Toolkit](https://redux-toolkit.js.org/), and [React Navigation](https://reactnavigation.org/).

## License

MIT — see [`LICENSE.md`](LICENSE.md).

> Your text goes to the server you configure and nowhere else. History stays in a local database on the device.
