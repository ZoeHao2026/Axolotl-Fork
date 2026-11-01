# API Client Architecture

`@modrinth/api-client` is the platform-agnostic client for Modrinth's services. This standard covers the request flow, the client hierarchy, the module registry and the type conventions. It is reference material: read the part your change touches, not all of it.

## Request flow

```
Module Method → client.request() → Feature Chain (middleware) → Platform executeRequest()
```

**Every HTTP call goes through `this.client.request()`** (or `.upload`). Never use `$fetch`, `fetch`, or any other HTTP library directly. The request method routes through the platform-specific implementation (Nuxt `$fetch`, Tauri HTTP plugin, etc.) and the feature middleware chain (auth, retry, circuit breaker). Using `$fetch` directly bypasses the platform layer and will fail in Tauri (CORS/sandboxing). The only exception is the `ISO3166Module`, which is explicitly node-only.

For external APIs (non-Modrinth), pass the full base URL as the `api` field and set `skipAuth: true`:

```ts
this.client.request<MyType>('/endpoint', {
  api: 'https://external-api.com',
  version: 1,
  method: 'POST',
  body: { data },
  skipAuth: true,
})
```

## Key directories

- **`src/core/`** — base classes (`AbstractModrinthClient`, `AbstractModule`, `AbstractFeature`, etc.)
- **`src/platform/`** — platform implementations (generic, nuxt, tauri, xhr-upload, websocket)
- **`src/features/`** — middleware plugins (auth, retry, circuit-breaker, etc.)
- **`src/modules/`** — API endpoint modules organized by service (`labrinth/`, `archon/`, `kyros/`, `iso3166/`)
- **`src/types/`** — core type definitions (client config, request options, upload types, errors)

## Client hierarchy

All platform clients extend `XHRUploadClient` → `AbstractModrinthClient`:

- **`GenericModrinthClient`** — uses `ofetch`, attaches WebSocket client to `archon.sockets`
- **`NuxtModrinthClient`** — uses Nuxt's `$fetch`, SSR-aware, blocks `upload()` during SSR
- **`TauriModrinthClient`** — uses `@tauri-apps/plugin-http`

## Module access

Modules are lazy-loaded and accessed as a nested structure:

```ts
client.labrinth.projects_v2
client.labrinth.projects_v3
client.labrinth.versions_v3
client.labrinth.collections
client.labrinth.billing_internal
client.archon.servers_v0
client.archon.servers_v1
client.archon.backups_queue_v1
client.archon.backups_v1
client.archon.content_v0
client.kyros.files_v0
client.iso3166.data
... etc.
```

This structure is derived at runtime from the flat `MODULE_REGISTRY` in `modules/index.ts` via `buildModuleStructure()`, and the TypeScript types are inferred automatically via `InferredClientModules`.

## Types

Types must match 1:1 with how they are returned from the backend API they are fetching from. Do not reshape, rename, or omit fields — the types should be a direct representation of the API response.

Types are organized in namespaces that mirror the backend services:

```ts
import type { Labrinth, Archon, Kyros, ISO3166 } from '@modrinth/api-client'

const project: Labrinth.Projects.v3.Project = ...
const server: Archon.Servers.v0.Server = ...
const auth: Archon.Websocket.v0.WSAuth = ...
```

Each API has a `types.ts` in its module directory (`modules/labrinth/types.ts`, `modules/archon/types.ts`, etc.) using nested namespaces: `Namespace.Domain.Version.Type`.

## Features (middleware)

Features wrap requests in a chain. Each feature can modify the request, retry, or short-circuit:

- **`AuthFeature`** — injects `Authorization: Bearer <token>`, supports async token providers
- **`RetryFeature`** — exponential/linear/constant backoff, retries on 408/429/5xx and network errors
- **`CircuitBreakerFeature`** — opens after N consecutive failures per endpoint, resets after timeout

## Wiring a client into an app

Vue consumers provide the client through the [dependency injection standard](../frontend/DEPENDENCY_INJECTION.md). The following shows the platform setup pattern; verify each app's actual provider setup before using it. The current website does not provide the desktop layout contracts:

```ts
// apps/website/src/app.vue (Nuxt)
const client = new NuxtModrinthClient({ ... })
provideModrinthClient(client)

// apps/app-frontend/src/App.vue (Tauri)
const client = new TauriModrinthClient({ ... })
provideModrinthClient(client)
```

Components anywhere in the tree then inject it:

```ts
const { labrinth, archon, kyros } = injectModrinthClient()

// Fetch data
const project = await labrinth.projects_v3.get(projectId)

// Use with TanStack Query
const { data } = useQuery({
  queryKey: ['project', projectId],
  queryFn: () => labrinth.projects_v3.get(projectId),
})
```

`provideModrinthClient` and `injectModrinthClient` are exported from `@modrinth/ui` (defined in `packages/ui/src/providers/api-client.ts`). The provider is typed as `AbstractModrinthClient`, so shared components in `packages/ui` work with any platform client.
