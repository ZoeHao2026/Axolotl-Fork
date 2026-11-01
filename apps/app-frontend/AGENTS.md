# Desktop Frontend

Vue 3 + Vite frontend for the Tauri app. Orchestration and native capability live here; anything the website can share belongs in `packages/ui`.

## Rules

- Routes are `src/pages/`. Providers are wired in `src/providers/setup.ts`; read the [DI standard](../../standards/frontend/DEPENDENCY_INJECTION.md) before changing a contract.
- Content-management features must preserve provider-qualified identities across display, selection, persistence and installation.
- A native `invoke` follows the shell's [IPC chain](../app/AGENTS.md) — handler, build-time manifest and window permissions in the same change.
- New page, route, nav entry, large component or core workflow: read [onboarding](src/components/ui/onboarding/AGENTS.md). Announcement catalog or updater trigger: read [announcement rules](src/announcements/AGENTS.md).

## Verify

`pnpm --filter @modrinth/app-frontend test` for `vue-tsc` plus vitest, or `test:visual` for the browser specs alone; then `lint` and `fix`. Browser tests use the project's mocks — do not launch the app to replace a component test. The user performs visual acceptance, so say what you did and did not look at.
