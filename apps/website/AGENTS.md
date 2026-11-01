# Axolotl Website

Nuxt 4 static site (Vue 3 + Tailwind) for the launcher. It uses `packages/ui` and `packages/assets`, but provides neither the desktop shared-layout DI contracts nor a TanStack Query client — add those only when a feature needs them.

## Rules

- Routes are `src/pages/`, layouts `src/layouts/`, messages `src/locales/`. The website has its own locale integration: inspect it before applying shared UI i18n patterns.
- Shared components belong in `packages/ui` when both surfaces can use them. Colours and surfaces: [styling](../../standards/frontend/STYLING.md).

## Verify

`pnpm website:dev` and `pnpm website:build` from the repository root; `pnpm --filter @axolotl/website test`, and `test:e2e` when rendered output matters. The user performs visual acceptance — do not over-automate.
