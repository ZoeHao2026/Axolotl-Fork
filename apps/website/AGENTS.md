# Axolotl Website

`apps/website` is the official Axolotl Launcher website. It is a Nuxt 4 static site using Vue 3, Tailwind CSS, and the shared UI and asset packages.

## Before you change it

- Read the [frontend development standard](../../standards/frontend/DEVELOPMENT.md) for validation, formatting and styling.
- Read the [styling standard](../../standards/frontend/STYLING.md) before choosing colours or touching the Tailwind config.

## Rules

- The website has its own locale integration. Inspect `src/locales/` and the consuming component before applying shared UI localization patterns.
- It does not currently provide the desktop shared-layout DI contracts or a TanStack Query client; add those only when the requested feature needs them.
- Shared components and styles belong in `packages/ui` and `packages/assets` when both the website and the desktop application can use them.

## Structure

- `src/pages/` contains file-based routes.
- `src/components/` contains website-specific components.
- `src/layouts/` contains page layouts.
- `src/locales/` contains website messages.

## Verification

- `pnpm website:dev` from the repository root for local development, `pnpm website:build` for the production build.
- `pnpm --filter @axolotl/website test` for the unit tests, and `test:e2e` when a page's rendered output matters.
- The user performs visual and interaction acceptance; do not run excessive browser automation unless requested.
