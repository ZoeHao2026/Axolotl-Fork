# @modrinth/api-client

Platform-agnostic API client for Modrinth's services. It works in Nuxt (SSR + CSR), Tauri (desktop app), and plain Node/browser environments, so nothing here may assume a particular runtime.

## Before you change it

- Read [architecture](../../standards/api-client/ARCHITECTURE.md) for the request flow, the client hierarchy, the module registry and the type conventions.
- Read [uploads](../../standards/api-client/UPLOADS.md) before touching a method that sends files.
- Read [WebSocket](../../standards/api-client/WEBSOCKET.md) before touching `archon.sockets`.
- For a new endpoint module, follow the [`api-module` skill](../../.agents/skills/api-module/SKILL.md) and the [API module standard](../../standards/frontend/ADDING_API_MODULES.md).

## Rules

- **Every HTTP call goes through `this.client.request()`** (or `.upload`). Never `$fetch`, `fetch`, or another HTTP library: the request method is what routes through the platform implementation and the feature middleware chain. A direct `$fetch` bypasses both and fails in Tauri. The only exception is `ISO3166Module`, which is explicitly node-only.
- For external (non-Modrinth) APIs, pass the full base URL as `api` and set `skipAuth: true`.
- Types must match the backend response 1:1. Do not reshape, rename or omit fields; the client is a direct representation of the API, not a model layer.
- Do not add platform-specific behaviour to a shared module; put it behind a platform implementation under `src/platform/`.

## Verification

- `pnpm --filter @modrinth/api-client lint` for eslint and formatting.
- `pnpm --filter @modrinth/api-client build` to confirm the bundle and the emitted declarations still compile.

## Reference

- [Architecture](../../standards/api-client/ARCHITECTURE.md)
- [Uploads](../../standards/api-client/UPLOADS.md)
- [WebSocket](../../standards/api-client/WEBSOCKET.md)
