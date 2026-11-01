# Shared UI

The shared UI package used by both `apps/website` (Nuxt 3) and `apps/app-frontend` (Vue 3 + Tauri). Components here must be platform-agnostic — use dependency injection for platform-specific behavior.

## Folder Structure

```
src/
├── assets/           # Image assets the components ship (e.g. Minecraft armor)
├── components/       # Vue components organized by feature domain
├── composables/      # Vue 3 composition API hooks
├── directives/       # Vue directives, including the tooltip layer
├── layouts/          # Self-contained page layouts (see below)
├── providers/        # Dependency injection contexts (createContext pattern)
├── test/             # Visual specs that span components
├── utils/            # Utility functions and constants
├── locales/          # Locale files (FormatJS)
├── styles/           # Tailwind CSS utilities
```

Subdirectories under `components/` expose their public surface through an `index.ts` barrel, with `components/image-viewer-editor` as the one current exception. All public API is re-exported from the root `index.ts`, which is the only entry consumers should import from — reaching into `@modrinth/ui/src/*` is blocked by ESLint.

### `src/layouts/`

Self-contained page layouts, currently all consumed by the desktop application:

- **`shared/`** — Reusable layout modules with their own components, composables, providers, and types. Each module is a self-contained unit (e.g. `shared/content-tab/` contains the content/mods tab layout with its own `layout.vue`, `components/`, `composables/`, `providers/`, and `types.ts`).
- **`wrapped/`** — Intended for page-level components mirroring route structures. It is currently empty (its hosting pages were removed); the website does not consume any shared layout, as it provides none of the DI contracts they require.

Files inside `layouts/` use the `#ui/*` import alias (resolved via the `"imports"` field in `package.json`) to reference other `src/` modules like `#ui/components/base/buttons/Button.vue` or `#ui/composables/i18n`.

## Rules

- **Stay platform-agnostic.** Platform capabilities arrive through the `providers/` DI contracts. Importing `@tauri-apps/*` from this package is blocked by ESLint, because the Nuxt website consumes it too and has no Tauri runtime.
- Define DI contracts with `createContext` from `src/providers/index.ts`. Read the [dependency injection standard](../../standards/frontend/DEPENDENCY_INJECTION.md) before adding or changing one. Key providers exported here: `provideModrinthClient` / `injectModrinthClient` (API client) and `provideNotificationManager` / `injectNotificationManager` (notifications).
- Use `surface-*` variables for backgrounds and strokes and take colours from the [styling standard](../../standards/frontend/STYLING.md); the [surface standard](../../standards/frontend/SURFACE_SYSTEM.md) is authoritative for elevation and separators.
- Never use newline-separated statements in a Vue template event handler such as `@click`. Vue's template compiler cannot parse expressions separated only by newlines; always use semicolons on one line:

  ```vue
  <!-- BAD: will cause "Unexpected token" parse error -->
  @click=" foo = true $emit('bar') "

  <!-- GOOD -->
  @click="foo = true; $emit('bar')"
  ```

## Verification

- `pnpm --filter @modrinth/ui lint` for eslint and formatting; `pnpm --filter @modrinth/ui fix` to write it.
- `pnpm --filter @modrinth/ui test` for the unit suite plus the visual specs. Say which of the two a change was validated with.

## Reference

- [Styling](../../standards/frontend/STYLING.md)
- [Surface system](../../standards/frontend/SURFACE_SYSTEM.md)
- [Dependency injection](../../standards/frontend/DEPENDENCY_INJECTION.md)
- [Modals](../../standards/frontend/MODALS.md)
- [Internationalization](../../standards/frontend/INTERNATIONALIZATION.md)
