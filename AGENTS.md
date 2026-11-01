# Axolotl Launcher Monorepo

Axolotl contains a Vue 3 / Nuxt 3 website, a Vue 3 desktop frontend and a Rust / Tauri shell. Turborepo (`turbo.jsonc`) and pnpm workspaces (`pnpm-workspace.yaml`) coordinate the packages.

## Instruction Routing

Read the instruction file for the area you are changing, even when your session started at the repository root. Root rules apply everywhere; a scoped file refines them, so a change spanning packages means reading each affected file.

| Changed area                                  | Read                                                           |
| --------------------------------------------- | -------------------------------------------------------------- |
| Desktop frontend, routes, providers, settings | [apps/app-frontend/AGENTS.md](apps/app-frontend/AGENTS.md)     |
| Desktop shell, native IPC, packaging          | [apps/app/AGENTS.md](apps/app/AGENTS.md)                       |
| Windows installer UI (`apps/installer-ui/`)   | [apps/app/AGENTS.md](apps/app/AGENTS.md)                       |
| Website                                       | [apps/website/AGENTS.md](apps/website/AGENTS.md)               |
| Shared UI, layouts and DI contracts           | [packages/ui/AGENTS.md](packages/ui/AGENTS.md)                 |
| API client                                    | [packages/api-client/AGENTS.md](packages/api-client/AGENTS.md) |
| Desktop runtime, persistence, migrations      | [packages/app-lib/AGENTS.md](packages/app-lib/AGENTS.md)       |
| Any frontend implementation                   | [Frontend development](standards/frontend/DEVELOPMENT.md)      |
| Agent instructions, Skills, their validation  | [.agents/AGENTS.md](.agents/AGENTS.md)                         |
| Commits, pushes, PRs, reviews, archiving      | [REVIEW.md](REVIEW.md)                                         |

## Safeguards

- **Applied migrations are immutable**, including ones applied only to a local database. Never edit, renumber or delete one; fix a mistake with a new forward migration under the [migration standard](standards/app-lib/MIGRATIONS.md).
- Do not write release announcements unless asked, and never infer the version from local metadata or the remote — use the one the user gave, per the [announcement rules](apps/app-frontend/src/announcements/AGENTS.md).
- A development build shares the installed application's database unless isolated with `THESEUS_CONFIG_DIR` or `AXOLOTL_DATA_DIR_SUFFIX`; read [CONTRIBUTING.md](CONTRIBUTING.md) before starting it.
- Do not create unrelated scripts, SQL files or documents, and delete anything made only for verification.
- Plans, worklogs and captured evidence belong in the ignored `.agents/plans/`, never staged with `git add -f`.
- Let the formatter own layout. Do not add decorative section comments such as `=== Helpers ===`, and never copy tool line numbers into source.

## Build and verify

- `pnpm install` once, then `git submodule update --init --recursive`. Desktop and Blockbench builds fail without the submodules.
- Rust: `cargo fmt --all --check`, then the tests for the crate you touched. Cargo shares one target directory across every task — read [build resources](standards/build/RUST_BUILD_RESOURCES.md) before working around a lock.
- Frontend: the affected package's `fix`, then `lint`, then `vue-tsc`/`vitest` for the app.
- Run a full `prepr` flow only when the user asks for it. `prepr` writes formatting and locale files; it is not a read-only gate.

## Delivery

Commit format, trailers, `[skip ci]`, push preconditions, pull requests and review expectations are owned by **[REVIEW.md](REVIEW.md)**. Read it before any of those actions; the rules are not restated here.

## Standards

Read only what the task touches:

- [Frontend development](standards/frontend/DEVELOPMENT.md), [Styling](standards/frontend/STYLING.md), [Surface system](standards/frontend/SURFACE_SYSTEM.md), [Modals](standards/frontend/MODALS.md)
- [Dependency injection](standards/frontend/DEPENDENCY_INJECTION.md), [API modules](standards/frontend/ADDING_API_MODULES.md), [Internationalization](standards/frontend/INTERNATIONALIZATION.md), [Figma](standards/frontend/FIGMA_MCP_USAGE.md)
- [API client](standards/api-client/CLIENT.md), [Persistence](standards/app-lib/PERSISTENCE.md), [Migrations](standards/app-lib/MIGRATIONS.md)
- [Deep links](standards/DEEP_LINKS.md), [Rust build resources](standards/build/RUST_BUILD_RESOURCES.md), [Changelog style](standards/maintaining/CHANGELOG.md)
