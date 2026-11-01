# @modrinth/api-client

Platform-agnostic API client for Modrinth's services, used by both the Nuxt website and the Tauri desktop app, so nothing here may assume a runtime.

## Rules

- **Every HTTP call goes through `this.client.request()`** (or `.upload`). Never `$fetch`, `fetch` or another HTTP library: the request method is what routes through the platform implementation and the feature chain. A direct `$fetch` bypasses both and fails in Tauri. `ISO3166Module` is the only exception and is node-only.
- Types match the backend response 1:1. Do not reshape, rename or omit fields.
- Platform-specific behaviour belongs in `src/platform/`, never in a shared module.

## Verify

`pnpm --filter @modrinth/api-client lint`, then `build` (the build also emits the type declarations).

## Reference

[Client reference](../../standards/api-client/CLIENT.md) — request flow, layout, uploads, WebSocket. Read the section you need.

A new endpoint module: follow the [`api-module` skill](../../.agents/skills/api-module/SKILL.md) and the [module conventions](../../standards/api-client/ADDING_MODULES.md).
