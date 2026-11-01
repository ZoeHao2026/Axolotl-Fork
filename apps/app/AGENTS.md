# Desktop Shell

The Tauri / Rust application: native command registration, platform integration, packaging and updates. Runtime implementation lives in `packages/app-lib`. `apps/installer-ui` is the Windows-only installer UI that packaging runs — a separate crate whose `main` is a stub on other targets, so a green build elsewhere proves nothing about it.

## Adding or renaming an IPC command

An IPC command lives in four places. Change them together:

1. The `#[tauri::command]` implementation, registered in its plugin's `tauri::generate_handler!` under `src/api/`. App-level commands use the handler in `src/main.rs` instead.
2. `InlinedPlugin::commands` in [build.rs](build.rs) for an inlined plugin — the runtime list does not generate it. Check its `default_permission`; `AllowAllCommands` covers only the build-time list.
3. The window's file in [capabilities/](capabilities/), granting the plugin's default or an explicit permission.
4. Every frontend `invoke` name, namespace and serialized argument name.

Trace the call through all four before reporting done. A mocked invocation, a unit test or a green `cargo check` does not prove the ACL allows it at runtime — exercise it in a rebuilt app when you can, and say so when you could not. [instance_command_manifest_parity.rs](tests/instance_command_manifest_parity.rs) is the regression pattern for runtime/manifest agreement, and it covers the `instance` plugin only. Generated permission files are build outputs; do not patch them.

## Verify

- `cargo fmt --all --check`; `cargo check --package theseus_gui --features updater`.
- Installer UI or the NSIS templates under [nsis/](nsis/): `cargo test --package axolotl-installer-ui`, `node --test apps/installer-ui/tests/installer-ui.test.cjs`, and `apps/installer-ui/tests/uninstall-smoke.ps1`. Windows only.
- Packaging and runtime dependencies decide whether a commit may carry `[skip ci]`.
