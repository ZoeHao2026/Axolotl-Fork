# Shared UI

Used by both `apps/website` (Nuxt) and `apps/app-frontend` (Vue + Tauri). Components must stay platform-agnostic: platform capabilities arrive through the `providers/` DI contracts, and importing `@tauri-apps/*` here is blocked by ESLint.

## Rules

- DI contracts use `createContext` from `src/providers/index.ts`; read the [DI standard](../../standards/frontend/DEPENDENCY_INJECTION.md) before changing one. Shared providers: `provideModrinthClient` / `injectModrinthClient` and `provideNotificationManager` / `injectNotificationManager`.
- `src/layouts/` is desktop-only. `shared/` holds self-contained layout modules; `wrapped/` is empty. The website consumes no shared layout because it provides neither the DI contracts nor the query client they need. Inside `layouts/` use the `#ui/*` alias.
- Public API is re-exported from the root `index.ts`; reaching into `@modrinth/ui/src/*` is blocked by ESLint. Component subdirectories expose an `index.ts` barrel, with `components/image-viewer-editor` as the one exception.
- Colours and surfaces: [styling](../../standards/frontend/STYLING.md) and [surface system](../../standards/frontend/SURFACE_SYSTEM.md).
- Vue template event handlers cannot hold newline-separated statements — the compiler fails with "Unexpected token". Use semicolons on one line: `@click="a = true; $emit('b')"`.

## Verify

`pnpm --filter @modrinth/ui lint`, `fix`, and `test` (unit suite plus the visual specs).
