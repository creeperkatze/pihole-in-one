# Talking to Pi-hole

All Pi-hole requests go through `src/utils/api.ts`. It wraps [pihole-js](https://www.npmjs.com/package/pihole-js), which implements the Pi-hole v6 REST API. Don't call `fetch` for Pi-hole requests anywhere else.

## The client

- Get a client with `getPiHoleClient(instance)`. Clients are cached per URL, password and timeout, so calling it often is cheap.
- Use the pihole-js namespaces directly, like `client.dns.getStatus()` or `client.groups.list()`.
- `getSummary()` is the one extension-specific call. It loads everything the popup and the badge need in parallel. Optional parts like history, groups or lists fall back to empty values when they fail, so an old or restricted Pi-hole still shows the basics.
- Sessions are stored in `browser.storage.local` under `sessionCache`, keyed by URL. They survive the service worker shutting down, so the extension doesn't log in on every refresh.
- The connection timeout comes from the settings. Changing it clears the client cache.
- `updateGravity()` uses its own client with a 5 minute timeout, since gravity downloads every list.

## Errors

- pihole-js throws `PiHoleError` with a `code`. `getApiMessageForError()` in `src/composables/useApiMessages.ts` turns known codes into a translation key. Add new codes there instead of matching error text.

## Host permissions

The extension asks for no host permissions at install. `optional_host_permissions` in `wxt.config.ts` allows any host, and the Pi-hole settings request the origin of each Pi-hole when they are saved. Origins that no instance uses anymore are removed again. Without the permission, the browser can block requests to that Pi-hole, so keep this flow intact when changing how instances are saved.

## The API itself

Pi-hole serves its OpenAPI spec and docs at `/api/docs` on every instance. Check the spec rather than guessing endpoint shapes, and add missing endpoints to pihole-js instead of working around it here.

## Other requests

The only other `fetch` is the release check in `src/utils/update-check.ts`. It asks GitHub for the latest release and caches the answer for 10 minutes.
