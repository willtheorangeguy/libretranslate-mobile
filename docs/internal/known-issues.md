# Known Issues — libretranslate-mobile

Concrete defects and gaps found while writing this repository's documentation in
August 2026. **Nothing here was changed** — each one needs a code, configuration, or
licensing decision rather than a documentation one.

Ordered by severity. See [`docs/roadmap.md`](../roadmap.md) for the narrative version,
which also covers deliberate non-goals.


**8 open:** 2 high, 4 medium, 2 low.

## 1. Clearing history deletes favourites too

**Severity:** High  
**Where:** `src/services/DatabaseService.ts` -> `clearHistory`, called from `HistoryScreen` and `SettingsScreen`

**What:** Favourites are not a separate table -- they are rows in `translations` with `is_favorite = 1`. `clearHistory` runs `DELETE FROM translations;`, which removes them along with everything else. Neither confirmation dialog mentions favourites.

**Why it matters:** The user explicitly starred those rows to keep them, and the action they took was called *clear history*. The data is gone with no undo and no export prompt, and nothing in the UI warned that the two were the same table. Someone tidying up loses precisely the entries they cared about most.

**Suggested fix:** Change the statement to `DELETE FROM translations WHERE is_favorite = 0;`, and add a separate explicit 'clear favourites' action. If deleting everything is wanted, say so in the dialog.

## 2. History export silently omits everything past the newest 100 rows

**Severity:** High  
**Where:** `src/services/DatabaseService.ts` -> `exportHistory` calls `getHistory`

**What:** `getHistory` applies `LIMIT UI_CONSTANTS.MAX_HISTORY_ITEMS` (100). `exportHistory` calls it with no arguments, so the exported JSON contains at most 100 entries regardless of how many the database holds. The file is presented as the translation history.

**Why it matters:** Export is the escape hatch -- the one operation a user performs *because* they want the whole record, often before clearing or migrating. A truncated file that looks complete is worse than a failure: the missing rows are discovered later, if at all, and by then the source may be cleared.

**Suggested fix:** Give `getHistory` an explicit limit parameter and have `exportHistory` pass none, selecting every row. Include a count in the exported payload so truncation would be visible.

## 3. Nothing prunes the translations table, so old rows accumulate unreachable

**Severity:** Medium  
**Where:** `src/services/DatabaseService.ts` -> `saveTranslation`, `getHistory`

**What:** `MAX_HISTORY_ITEMS` and `MAX_FAVORITES_ITEMS` are applied as SQL `LIMIT` clauses when reading. Nothing applies them when writing, and there is no retention policy or cleanup. Rows past the hundredth stay in the database permanently but are not reachable through any screen.

**Why it matters:** Every translation the user has ever made is retained on the device indefinitely -- including ones they cannot see to delete -- in an app whose stated appeal is control over the text they translate. 'Clear history' is the only removal path, and it is the one that also destroys favourites. The database also grows without bound.

**Suggested fix:** Decide which the limit is. Either prune on write (delete non-favourite rows beyond the newest N), or keep everything and add paging so the older rows are reachable and individually deletable. A retention setting would cover both.

## 4. Server error responses are discarded, leaving unexplainable failures

**Severity:** Medium  
**Where:** `src/services/LibreTranslateClient.ts` -> `handleError`

**What:** The handler maps `ECONNABORTED`, 404, and 503 to friendly messages and falls through to `axiosError.message` for everything else. LibreTranslate returns a JSON body of the form `{"error": "..."}` explaining the refusal -- invalid API key, character limit exceeded, unsupported language pair, rate limit -- and `error.response.data` is never read.

**Why it matters:** The most common real failure is an API key problem, and it produces 'Request failed with status code 403' when the server has already said exactly what is wrong in words. The user cannot act on a status code, and on a phone they have no way to see the response themselves. `validateConnection` compounds this by returning a bare `false`, so setup failures are equally opaque.

**Suggested fix:** Read `error.response?.data?.error` and prefer it when present, falling back to the current messages. Have `validateConnection` return the reason rather than a boolean.

## 5. Speech falls back to US English for any language outside an eleven-entry table

**Severity:** Medium  
**Where:** `src/services/SpeechService.ts` -> `LANGUAGE_TO_LOCALE`, `toLocale`

**What:** `toLocale` looks the language code up in a hardcoded map of eleven languages and returns `en-US` for anything absent. Both `startListening` and speech output use it. The server's language list is typically much longer than eleven.

**Why it matters:** Speaking Dutch text reads it aloud with an American English voice, and dictating Dutch listens for English -- producing plausible-looking nonsense rather than an error. The failure is silent in both directions, and a user who does not speak the fallback language may not immediately realise what happened.

**Suggested fix:** Ask the platform which voices and recognition locales exist rather than hardcoding a map, and disable the speech controls for a language with no match instead of substituting one.

## 6. The API key is stored unencrypted in AsyncStorage

**Severity:** Medium  
**Where:** `src/screens/ServerSetupScreen.tsx`, `src/services/StorageService.ts`, `src/types/index.ts`

**What:** `ServerConfig.apiKey` is persisted as part of the server record via AsyncStorage, which is plain unencrypted files in the app container. iOS provides the Keychain for exactly this.

**Why it matters:** It is a credential to a service the user is paying for or hosting, sitting in cleartext. It is included in device backups, and readable by anything with filesystem access to the container. The rest of this app is careful about where data goes; this is the one place that is not.

**Suggested fix:** Store `apiKey` in the Keychain (`react-native-keychain`) keyed by server URL, keeping the non-secret fields in AsyncStorage.

## 7. Connection validation does not exercise the API key

**Severity:** Low  
**Where:** `src/services/LibreTranslateClient.ts` -> `validateConnection`, `withApiKey`

**What:** `validateConnection` issues `GET /languages`, and `withApiKey` is applied only to the translate and detect bodies. Most instances serve `/languages` without authentication, so a wrong or missing key passes setup.

**Why it matters:** The setup screen reports 'Server configured successfully!' for a configuration that cannot translate. The user learns otherwise at the first translation, by which point the failure looks like a translation bug rather than a setup mistake -- and reports it that way.

**Suggested fix:** Validate with a trivial translate call, or send the key on `/languages` too and treat an auth failure as a validation failure.

## 8. API_TIMEOUTS is defined but never used

**Severity:** Low  
**Where:** `src/constants/index.ts`, `src/services/LibreTranslateClient.ts`

**What:** `API_TIMEOUTS` specifies `TRANSLATE: 10000`, `DETECT: 5000`, `LANGUAGES: 5000`. The axios instance is created with a flat `timeout: 10000` in both the constructor and `updateBaseURL`, and the constant is imported nowhere.

**Why it matters:** The constants file reads as the place timeouts are configured, so someone tuning detection will edit `DETECT` and see no change -- the shortest kind of wasted afternoon. It also means the fast endpoints wait twice as long as intended before giving up.

**Suggested fix:** Pass a per-request timeout from `API_TIMEOUTS` on each call, or delete the constant and put the 10s value where it is actually read.


---

## Also, across every repository

**`.bandit` is present on disk but untracked in git.** Verified in PyWorkout, treklogger,
skyscanner-cli, booking-cli, piggy, and aibot — the config file exists locally in each but
`git ls-files` does not know about it, so none of it reached GitHub.

The August 2026 security sweep therefore looks complete locally and landed nowhere. Worth
checking across all 44 repositories it covered.
