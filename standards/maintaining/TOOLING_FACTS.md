# Tooling Facts

Behaviour of this repository's tools that is worth knowing before you fight one. Each entry was measured here, and each one has cost a debugging session.

## Formatting and lint gates

- **TOML table order**: `tombi` formats TOML and sorts tables alphabetically, so `[env]` must precede `[target.*]`. Run `tombi fmt --check` after touching any TOML; when it fails, it fails every branch.
- **`typos` exclusion semantics**: judge whether an exclusion works with a bare `typos`, without a path argument. A path given explicitly bypasses `extend-exclude`, so checking a path that way needs `--force-exclude`.
- **`typos` and submodules**: the CI `typos` job does not fetch submodules (only `cargo-shear` and `clippy` do). With submodules initialised locally, a bare `typos` reports errors under `third-party/` that have nothing to do with your change. Judge only your own files, and do not edit `_typos.toml` exclusions to silence them.
- **Visual gate flakiness**: in `test:visual`, the worker count and the per-test timeout drive how flaky the run looks. Any change to those two numbers has to be justified by the slowest single case, not by total file duration.

## Installation and environment

- **Dependency install floor**: `pnpm-workspace.yaml` sets `minimumReleaseAge`, so versions inside the window are rejected by our own gate. Work around it per request with `--config.minimumReleaseAgeExclude`; never change the repository setting.
- **turbo env passthrough**: task `env` in `turbo.jsonc` is a closed allowlist, and anything undeclared is stripped. `RUST_*` and `NEXTEST_*` are already listed; a new variable has to be declared too.

## Gate scripts

- **What `check-agents` covers**: `pnpm axolotl:check-agents` validates Markdown links and Skill frontmatter for the files listed in `trackedGuidance` inside [check-agents.mjs](../../scripts/axolotl/check-agents.mjs). A new root-level instruction file is only checked once it is added to that list.
