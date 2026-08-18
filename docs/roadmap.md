# LibreTranslate Mobile — Roadmap

Direction, not a schedule. Defects are tracked separately in
[`internal/known-issues.md`](./internal/known-issues.md) — this page is about what the app is
*for*.

## Where it is

The app does what it set out to do: translate text and speech against a server you control,
keep a searchable local history, and ship to the App Store. The service layer is tested,
including a full-flow scenario test.

## Considered

**Storing the API key in the Keychain.** Currently it sits with the rest of the server record
in ordinary app storage. Anything holding a credential should be using the Keychain instead.

**Surfacing the server's error text.** LibreTranslate explains refusals in the response body,
and the client throws that away. Users currently see status codes for problems the server has
already described in words.

**A real locale table for speech.** Eleven languages are mapped to locales; everything else is
spoken in US English without warning. The device knows which voices it has — asking it would be
better than a hardcoded map.

**History that matches its own description.** The screens show 100 and 50 most recent entries,
export covers only the first of those, and nothing prunes the table. Paging, an honest export,
and a retention setting would make one story out of three.

**Alternatives and `/translate_file`.** The API offers translation alternatives and file
translation; neither is implemented.

## Non-goals

**Offline translation.** Bundling a model would multiply the app size and give worse results
than the server. Point it at a server, or use a different app.

**A default or bundled server.** A default would mean text leaving for somewhere the user did
not choose — exactly what this app exists to avoid. Configuring a server is the first thing it
asks for, deliberately.

**Accounts, sync, or a backend.** History is local because that is the promise. Syncing it
would require somewhere to sync it to.

**Analytics.** None, and none planned.

**Android parity.** The directory exists, but iOS is what is maintained and released. Anyone
wanting Android support should expect to do that work.

## Contributing

Issues and pull requests are welcome — see the
[Contributing Guide](https://github.com/willtheorangeguy/.github/blob/main/CONTRIBUTING.md).
Something in "Considered" is a good place to start.
