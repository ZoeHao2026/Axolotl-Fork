# API Client

`@modrinth/api-client` is the platform-agnostic client for Modrinth's services. This is reference material: read the section your change touches.

## Request flow

```
Module Method → client.request() → Feature Chain (middleware) → Platform executeRequest()
```

**Every HTTP call goes through `this.client.request()`** (or `.upload`). Never `$fetch`, `fetch` or another HTTP library. The request method is the only thing that routes through the platform implementation and the feature middleware chain; a direct `$fetch` bypasses both and fails in Tauri. `ISO3166Module` is the sole exception, and it is node-only.

External (non-Modrinth) APIs pass the full base URL as `api` and set `skipAuth: true`.

## Layout

- `src/core/` — `AbstractModrinthClient`, `AbstractModule`, `AbstractFeature`
- `src/platform/` — generic, nuxt, tauri, xhr-upload, websocket
- `src/features/` — middleware: `AuthFeature` (injects `Authorization: Bearer`, accepts async token providers), `RetryFeature` (constant/linear/exponential backoff; retries 408, 429, 5xx and network errors) and `CircuitBreakerFeature` (opens after N consecutive failures per endpoint, resets after a timeout)
- `src/modules/` — endpoint modules by service: `labrinth/`, `archon/`, `kyros/`, `iso3166/`
- `src/types/` — client config, request options, upload types, errors

Platform clients extend `XHRUploadClient` → `AbstractModrinthClient`: `GenericModrinthClient` (ofetch; the only one that owns `archon.sockets`), `NuxtModrinthClient` (`$fetch`, SSR-aware, blocks `upload()` during SSR) and `TauriModrinthClient` (`@tauri-apps/plugin-http`).

Modules are lazy-loaded into a nested structure (`client.labrinth.projects_v3`, `client.archon.servers_v0`, …), derived at runtime from `MODULE_REGISTRY` in `modules/index.ts` via `buildModuleStructure()`; the types are inferred through `InferredClientModules`.

## Types

Match the backend response 1:1 — do not reshape, rename or omit fields. Types live per service in `modules/<service>/types.ts` as nested namespaces `Namespace.Domain.Version.Type`, for example `Labrinth.Projects.v3.Project`.

## Uploads

Uploads use `XMLHttpRequest` because `fetch` cannot report progress. `upload()` returns an `UploadHandle<T>` exposing `promise`, a chainable `onProgress`, and `cancel()`. Send either `{ file: File | Blob }` (octet-stream) or `{ formData: FormData }` (multipart, boundary set by the platform). They still pass through the feature chain; features detect them via `context.metadata.isUpload`. Implementation: `src/platform/xhr-upload-client.ts`.

## WebSocket

`client.archon.sockets` exists only on `GenericModrinthClient`. `safeConnect(serverId)` fetches a JWT through `archon.servers_v0.getWebSocketAuth()`, opens `wss://`, sends `{ event: 'auth', jwt }` and waits for `auth-ok`. It reconnects with exponential backoff (1s to 30s, 10 attempts). Subscribe with `on(serverId, event, handler)`, which returns its unsubscribe; send with `send(serverId, { event, … })`; call `disconnect(serverId)` on teardown. Events: `log`, `stats`, `power-state`, `uptime`, `backup-progress`, `installation-result`, `filesystem-ops`, `new-mod`, `auth-expiring`, `auth-incorrect`, `auth-ok`. Implementation: `src/core/abstract-websocket.ts`.
