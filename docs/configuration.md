# LibreTranslate Mobile — Configuration

Everything is configured in the app. There is no config file and no environment variable.

## The server

Entered on the server-setup screen and validated before it is accepted. Three fields:

| Field | Notes |
|---|---|
| URL | Prefilled with `http://localhost:5000`; trailing slashes are stripped |
| Name | A label for your own benefit |
| API key | Optional — leave blank for an instance that does not require one |

**There is no remote default.** The prefilled `localhost:5000` is a placeholder, not a service,
so the app cannot translate until you point it somewhere real — deliberate, because a working
default would mean text going somewhere you did not choose.

More than one server can be saved and switched between; they live under the `servers` and
`activeServer` keys.

## Settings

| Setting | Effect |
|---|---|
| Theme | System, light, or dark |
| Text size | Display scaling |
| Default source language | Preselected on the translate screen |
| Default target language | Preselected on the translate screen |
| Auto-detect | Whether the source defaults to detection |
| Onboarding reset | Runs first-launch flow again |

Persisted under the `settings` key.

## What is stored, and where

Two separate stores, doing different jobs:

| Store | Holds | Notes |
|---|---|---|
| Key-value | Server list, active server, settings, onboarding flag | Small preferences |
| SQLite | Translation history and favourites | Can grow large; searchable |

History in a real database rather than a preferences blob is what makes searching it practical
and what allows the JSON export.

**Neither is sent anywhere.** The server sees the text it is asked to translate; it does not
see your history.

## Limits and timeouts

Built in rather than configurable:

| Limit | Value |
|---|---|
| Request timeout | 10s, every request |
| Input length | 5,000 characters |
| History shown | 100 most recent |
| Favourites shown | 50 most recent |
| Debounce before translating | 500ms |
| Language list cache | 1 hour |

A self-hosted instance on modest hardware can exceed the 10s timeout on long text — see
[Troubleshooting](./troubleshooting.md). Note that the history and favourites numbers are
**display** limits, not storage limits; see
[`internal/known-issues.md`](./internal/known-issues.md).

## Languages

A built-in list covers the common cases, and the app also asks your server which languages it
actually supports. A server with fewer models offers fewer options.

## API keys

A LibreTranslate instance can require a key. Enter it alongside the URL and it is sent as
`api_key` in the body of translate and detect requests.

It is stored with the rest of the server record in ordinary app storage, not the iOS Keychain —
see [`internal/known-issues.md`](./internal/known-issues.md) before using a key you would mind
losing.

The connection check that runs when you add a server calls `/languages`, which most instances
serve without a key. A **wrong** key can therefore pass setup and only fail at the first
translation.
