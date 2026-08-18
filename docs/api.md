# LibreTranslate Mobile — API

The app is a client. It defines no API of its own; it calls three endpoints on the
LibreTranslate instance you configure.

## Endpoints used

| Endpoint | Used for |
|---|---|
| `GET /languages` | Connection check on setup, and the language list |
| `POST /translate` | Every translation |
| `POST /detect` | Auto-detect, before translating |

That is the whole surface. If your instance serves those three, the app works.

## Requests

**Translate**

```json
POST /translate
{ "q": "Hello", "source": "en", "target": "fr", "api_key": "optional" }
```

Response: `{ "translatedText": "Bonjour" }`

**Detect**

```json
POST /detect
{ "q": "Bonjour", "api_key": "optional" }
```

Response: an array; the app takes `[0].language`, falling back to `"unknown"`.

**Languages**

```
GET /languages
```

Response: an array of `{ code, name }`. The connection check accepts the server only if the
response is an array — a reverse proxy returning an HTML error page will be rejected, which is
the point.

## Client behaviour

| Behaviour | Detail |
|---|---|
| Base URL | Trailing slashes stripped on entry |
| Timeout | 10s on every request |
| API key | Sent as `api_key` in the **body** of translate and detect, never on `/languages` |
| Language cache | 1 hour, and the stale copy is served if a refresh fails |
| Empty input | Short-circuits before any request is made |

The stale-cache fallback is deliberate: losing the server should not empty the language picker
and leave the UI unusable.

## Errors

`LibreTranslateClient.handleError` maps failures to messages the UI shows directly:

| Condition | Message |
|---|---|
| `ECONNABORTED` | "Connection timeout. Please check your server URL." |
| `404` | "Server endpoint not found. Check your LibreTranslate URL." |
| `503` | "Server is temporarily unavailable." |
| Anything else | The axios message |

That last row is thinner than it looks — LibreTranslate returns a JSON body explaining *why* a
request was refused, and it is discarded. See
[`internal/known-issues.md`](./internal/known-issues.md).

## Not used

`/translate_file`, `/frontend/settings`, `/suggest`, and the alternatives parameter are all
unimplemented. See [Roadmap](./roadmap.md).

## Reference

[LibreTranslate API documentation](https://libretranslate.com/docs/) — the authority on the
endpoints above. Implementation is in `src/services/LibreTranslateClient.ts`.
