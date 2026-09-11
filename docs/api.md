# LibreTranslate Mobile — API

The app calls the selected LibreTranslate instance.

| Endpoint | Use |
|---|---|
| `GET /languages` | Connection validation, languages, supported target directions |
| `GET /frontend/settings` | Character limit, key requirements, file support and formats |
| `POST /translate` | Text translation, with `source: "auto"` for automatic detection |
| `POST /translate_file` | Multipart file translation; returns `translatedFileUrl` |
| `POST /detect` | Available in the service API; not needed by the text screen |

Optional keys are sent as `api_key` in request bodies. The screen reads `detectedLanguage` from translation responses. File downloads use the server-returned HTTP(S) URL. Servers without `/frontend/settings` (404 or 405) retain text translation with fallback limits and no file mode.

The client validates HTTP(S) URLs and language-list responses, preserves server error messages, explains authentication failures, and honors `Retry-After` on 429 responses. The default instance has an additional three-second minimum request interval. Cooldowns survive client recreation within the running app. Requests time out after 30 seconds, or 120 seconds for file uploads.

The language cache is scoped to the active client. Text requests are debounced and canceled when inputs change; stale responses are ignored even if cancellation arrives too late.

Translation suggestions and alternative translations are not exposed in the UI.

See the [official API documentation](https://docs.libretranslate.com/) and `src/services/LibreTranslateClient.ts`.
