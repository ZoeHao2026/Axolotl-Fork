# Desktop Shell

This Tauri / Rust application owns native command registration, platform integration, packaging and updates. `apps/installer-ui` is the Windows-only installer UI that packaging runs, and it is a separate crate from the shell. Shared runtime implementation lives in `packages/app-lib`.

## Before you change it

- Read [CONTRIBUTING.md](../../CONTRIBUTING.md) before starting desktop development; initialize the required submodules and isolate application data.
- Read [app-lib instructions](../../packages/app-lib/AGENTS.md) when changing persistence, migrations or downgrade behavior.
- When changing update announcements, updater triggers or startup dialog priority, read [announcement instructions](../app-frontend/src/announcements/AGENTS.md).

## Rules

- Assess build, packaging and runtime dependencies before classifying a commit as safe for `[skip ci]`.
- `apps/installer-ui` builds and behaves only on Windows; its `main` is a stub on other targets, so a green local build elsewhere proves nothing about it. Say plainly when only a cross-target compile was possible.

## Adding or renaming an IPC command

Adding or renaming an IPC command is a change across runtime registration, build-time permissions and frontend callers. Complete the applicable chain in the same change:

1. Define the `#[tauri::command]` implementation and register it in its plugin's `tauri::generate_handler!` list under `src/api/`. App-level commands instead use the handler in `src/main.rs`.
2. For an inlined plugin, add the exact command name to the corresponding `InlinedPlugin::commands` list in [build.rs](build.rs). The runtime handler list does not generate this list automatically. Review its `default_permission` rule; `AllowAllCommands` covers only commands declared in that plugin's build-time list.
3. Verify the intended window/webview is covered by the relevant file in [capabilities/](capabilities/) and receives the plugin's default or explicit command permission. For a new plugin, also register its runtime `init()` in `src/main.rs`. For app-level commands or a plugin using a different permission model, follow that model rather than copying inlined-plugin permission names.
4. Match every frontend `invoke` name, plugin namespace and serialized argument name to the Rust command. When renaming or removing a command, update its callers, runtime handler, build-time list and any explicit permission references together.

Before reporting completion, trace each new or changed IPC call from the frontend through all applicable registration and permission layers. Grant access only to the required commands and windows; do not disable ACL checks or broaden unrelated permissions to silence an error. Generated permission/schema files are build outputs, not the source to patch.

Use [instance_command_manifest_parity.rs](tests/instance_command_manifest_parity.rs) as the existing regression pattern for runtime/build-manifest agreement. It currently covers the `instance` plugin only; do not treat it as coverage of another plugin. Extend appropriate coverage when changing command registration. A mocked frontend invocation, Rust unit test or successful `cargo check` alone does not verify runtime ACL access.

## Verification

- `cargo fmt --all --check` for Rust formatting.
- `cargo check --package theseus_gui --features updater` when shell compilation is affected.
- `cargo test --package axolotl-installer-ui`, `node --test apps/installer-ui/tests/installer-ui.test.cjs` and the smoke run driven by `apps/installer-ui/tests/uninstall-smoke.ps1` when changing the installer UI or the NSIS templates under [nsis/](nsis/). The installer tests are Windows-only.
- Follow [Rust build resources](../../standards/build/RUST_BUILD_RESOURCES.md) before running Cargo or working around a lock.

When native verification is available, exercise the affected action from the intended window in a rebuilt app, since `build.rs` permissions require rebuilding. If a lock or unavailable native runtime prevents this, state that ACL registration was checked statically and the real invocation remains unverified; do not report end-to-end success or change target directories to obtain it.

## Reference

- [Rust build resources](../../standards/build/RUST_BUILD_RESOURCES.md)
- [App database persistence](../../standards/app-lib/PERSISTENCE.md) and [migrations](../../standards/app-lib/MIGRATIONS.md)
