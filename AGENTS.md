# Axolotl Launcher Monorepo

Axolotl contains a Vue 3 / Nuxt 3 website, a Vue 3 desktop frontend, and a Rust / Tauri shell. Turborepo (`turbo.jsonc`) and pnpm workspaces (`pnpm-workspace.yaml`) coordinate the packages. Frontend styling uses Tailwind CSS v3.

## Instruction Routing

Read the applicable instruction files before editing, even when your session starts at the repository root. Root rules apply everywhere; more specific files refine rules for their subtree. For a change spanning packages, read each affected package's instructions. Links are relative to the file containing them.

| Changed area                                                    | Read                                                           |
| --------------------------------------------------------------- | -------------------------------------------------------------- |
| Desktop frontend, routes, providers, settings                   | [apps/app-frontend/AGENTS.md](apps/app-frontend/AGENTS.md)     |
| Desktop shell, native IPC commands/callers, build and packaging | [apps/app/AGENTS.md](apps/app/AGENTS.md)                       |
| Windows installer UI (`apps/installer-ui/`)                     | [apps/app/AGENTS.md](apps/app/AGENTS.md)                       |
| Website                                                         | [apps/website/AGENTS.md](apps/website/AGENTS.md)               |
| Shared UI, layouts and DI contracts                             | [packages/ui/AGENTS.md](packages/ui/AGENTS.md)                 |
| API client                                                      | [packages/api-client/AGENTS.md](packages/api-client/AGENTS.md) |
| Desktop runtime, persistence, migrations or downgrade tooling   | [packages/app-lib/AGENTS.md](packages/app-lib/AGENTS.md)       |
| Any frontend implementation                                     | [Frontend development](standards/frontend/DEVELOPMENT.md)      |
| Agent instructions, Skills or their validation                  | [.agents/AGENTS.md](.agents/AGENTS.md)                         |
| Agent delivery: commits, pushes, PRs, reviews, archiving        | [REVIEW.md](REVIEW.md)                                         |

Standards carry the technical detail these files deliberately leave out. Read only the ones your change touches; the list is in [standards/README.md](standards/README.md).

## Repository Map

- `apps/app-frontend`: desktop Vue frontend; `apps/app`: Tauri shell; `apps/website`: official website.
- `apps/installer-ui`: Windows-only installer UI, a standalone Rust binary that renders `src/installer.html`; desktop CI compiles it and runs a real uninstall smoke test against it.
- `apps/telemetry-worker`, `apps/telemetry-dashboard`: Cloudflare telemetry ingestion and its dashboard, each deployed by its own workflow.
- `packages/ui`, `assets`, `utils`: shared components, theme assets and utilities.
- `packages/api-client`: public content-service API client; `packages/app-lib`: desktop runtime library.
- `packages/content-management`: provider-neutral resource and installation models.
- `packages/server`: dedicated-server config schemas, manifest types and download resolution shared by the app and the CLI.
- `packages/daedalus`, `ariadne`, `async-minecraft-ping`: Minecraft metadata, social/tunnel protocols and server ping.
- `packages/launcher-mcp`, `packages/launcher-tools`: the MCP server the app exposes, and launcher maintenance tooling.
- `packages/path-util`, `tooling-config`: shared paths and tooling.

This map is for orientation, not a membership list: `apps/*` and `packages/*` are pnpm workspace members by glob, and the Cargo members are enumerated in `Cargo.toml`. Read those manifests rather than inferring from this page.

## Before you start

- Read [CONTRIBUTING.md](CONTRIBUTING.md) for environment setup and application data isolation before launching the desktop app.
- Run `pnpm install` at the repository root, and `git submodule update --init --recursive` before any desktop or website build that needs `cubiomes`, Blockbench or the Java sources.
- Run `pnpm website:dev` or `pnpm app:dev` from the root. Service URLs come from `packages/app-lib/build.rs`, which reads an optional `packages/app-lib/.env` and otherwise falls back to the public defaults; create that file only to point the launcher at a local service.

## Global Safeguards

- Do not write or append release announcements or an update log unless explicitly requested. Use the exact user-supplied version; never infer it from local metadata or query a remote to choose it. Launcher notes belong only in `apps/app-frontend/src/announcements/catalog.ts`, under the rules in [announcement instructions](apps/app-frontend/src/announcements/AGENTS.md).
- Applied database migrations are immutable, including locally applied migrations. Follow the [migration standard](standards/app-lib/MIGRATIONS.md) for new forward migrations and downgrade mappings; do not rewrite migration checksums.
- Local desktop builds can change the installed application's database. Use the data isolation procedure in the contribution guide before starting development processes.
- Do not create unrelated scripts, SQL files or documentation. Remove files created only for temporary verification after checks complete.
- Agent intermediate and archived artifacts — plans, specs, worklogs and captured evidence — belong in the ignored `.agents/plans/` and nowhere else, with descriptive filenames so a later session can find the plan it needs and restore that work's context. Never stage them with `git add -f` or otherwise bypass `.gitignore`; repository content is for code, configuration and maintained documentation.
- Avoid heading comments such as `=== Helper methods ===`. Use doc comments where helpful; add inline comments only when necessary to explain non-obvious behavior.
- Preserve exact source whitespace when editing; do not copy tool line numbers or display markers into source.
- Indent with spaces only: four for source, two for JSON, YAML and Markdown.

## Verification

- Use existing package scripts and relevant tests during development; see [frontend validation and formatting](standards/frontend/DEVELOPMENT.md). Rust formatting check: `cargo fmt --all --check`; writing formatter: `cargo fmt --all`.
- Before a frontend commit, run the affected package's `fix` script as described in the frontend standard. Inspect the diff, preserve user changes, and stage corrected files without unrelated formatting changes.
- Cargo builds share one target directory. Read [Rust build resources](standards/build/RUST_BUILD_RESOURCES.md) before running Cargo, and before interpreting a lock or an access-denied warning.
- Run full pre-PR workflows only when explicitly requested. If the user indicates they are about to create a PR without requesting checks, ask whether to run them. Do not repeat them after each prompt.
- Pre-PR commands: website `pnpm prepr:website`; app frontend `pnpm prepr:frontend:app`; frontend libraries `pnpm prepr:frontend:lib`; all packages `pnpm prepr`.
- `prepr` can write formatting and extracted/pruned locale files. It is not a universal read-only lint/test/build gate. The task graph in `turbo.jsonc` and each package's scripts determine coverage; run relevant lint, tests and build separately.

## Delivery

Commits, trailers, `[skip ci]`, pushes, pull requests, review expectations and archiving are owned by **[REVIEW.md](REVIEW.md)**. Read it before any of those actions. This file does not restate those rules, and a task instruction does not authorize a delivery action on its own.

## Tool Output

Use `rg` for searches. Read command output without piping it through `head`, `tail`, `less` or `more`. Prefer command-specific limits, such as `git log -n 10`. If output is truncated, narrow the command and read the remaining relevant output.

## Technical Standards

Read only the standards relevant to the task:

- [Surface system](standards/frontend/SURFACE_SYSTEM.md): UI elevation, separators and strokes.
- [Styling](standards/frontend/STYLING.md): the shared Tailwind preset, text colours and colour palette.
- [Modals](standards/frontend/MODALS.md): regular and multistage modal APIs.
- [API modules](standards/frontend/ADDING_API_MODULES.md): endpoint types, module registration and exports.
- [Dependency injection](standards/frontend/DEPENDENCY_INJECTION.md): platform capabilities and page contexts.
- [Internationalization](standards/frontend/INTERNATIONALIZATION.md): visible strings, ICU and rich text.
- [Deep links](standards/DEEP_LINKS.md): the `axolotl://` scheme, its namespaces and its confirmation rules.
- [Figma](standards/frontend/FIGMA_MCP_USAGE.md): adapting designs to existing components and tokens.
- [API client](standards/api-client/ARCHITECTURE.md): request flow, client hierarchy and types.
- [Persistence](standards/app-lib/PERSISTENCE.md): which half of the app database owns which rows.
- [Migrations](standards/app-lib/MIGRATIONS.md): immutability, checksums and the downgrade mapping.
- [Rust build resources](standards/build/RUST_BUILD_RESOURCES.md): the shared target directory and lock rules.
- [Changelog style](standards/maintaining/CHANGELOG.md): requested release-note writing or review.
