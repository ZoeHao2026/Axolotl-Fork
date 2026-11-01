# Desktop Frontend

Vue 3 + Vite frontend for the Tauri desktop application. Application-specific orchestration and native capabilities live here; anything both the website and the desktop can use belongs in `packages/ui`.

## Before you change it

- Read the [frontend development standard](../../standards/frontend/DEVELOPMENT.md) for validation, commit-time formatting and styling.
- Read the [dependency injection standard](../../standards/frontend/DEPENDENCY_INJECTION.md) before changing a platform contract. Providers are wired through `src/providers/setup.ts` and `src/providers/setup/`.
- Read [onboarding instructions](src/components/ui/onboarding/AGENTS.md) before adding or materially changing a page, route, navigation entry, large user-facing component, core workflow or settings section.
- Read [announcement instructions](src/announcements/AGENTS.md) before touching the announcement catalog, its display, an updater trigger or startup dialog priority.

## Rules

- Routes live in `src/pages/`. Shared UI belongs in `packages/ui` only when its behavior is platform-independent.
- For content-management features, preserve provider-qualified identities across display, selection, persistence and installation.
- When adding, renaming or changing a native `invoke` call, follow the shell's [IPC command rules](../app/AGENTS.md). Include the shell's handler, build-time command manifest and window permissions in the change; frontend mocks cannot establish that the command is allowed at runtime.
- Only edit the announcement catalog when the user explicitly requests an update log and provides the exact version.

## Verification

- `pnpm --filter @modrinth/app-frontend test` for `vue-tsc --noEmit` plus vitest, or `test:visual` for the browser-mode visual specs alone.
- `pnpm --filter @modrinth/app-frontend lint` and `fix` for eslint and formatting.
- Native calls in browser tests require the project's mocks; do not start the real application solely to replace a component test. The user performs visual and interaction acceptance, so say what you did and did not look at.
