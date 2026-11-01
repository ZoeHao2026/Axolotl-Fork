# Desktop Application Library

This Rust crate owns desktop runtime behavior, persistence, and database migrations. Everything the desktop frontend can ask for eventually lands here.

## Before you change it

- Read [CONTRIBUTING.md](../../CONTRIBUTING.md#应用数据目录与数据库迁移) before starting the application or operating on an app database.
- Read [persistence](../../standards/app-lib/PERSISTENCE.md) before reading or writing any record through this crate.
- Read [migrations](../../standards/app-lib/MIGRATIONS.md) before touching `migrations/` or the downgrade tooling.
- For behavior exposed to the frontend through a new or changed native command, follow the shell's [IPC command rules](../../apps/app/AGENTS.md).
- For build locks or occupied outputs, follow [Rust build resources](../../standards/build/RUST_BUILD_RESOURCES.md); do not allocate another target directory.

## Rules

- **Do not reach the database on your own.** No business module may use `sqlx` or write a statement; call the half of the persistence layer that owns the row. The [persistence standard](../../standards/app-lib/PERSISTENCE.md) defines the boundary, the verbs and the exceptions.
- **Applied migrations are immutable**, including ones applied only to a local database. Never edit, rename, reorder or delete one; correct mistakes with a new forward migration and the [migration standard](../../standards/app-lib/MIGRATIONS.md).
- Development builds share the installed app's data directory unless explicitly isolated with `THESEUS_CONFIG_DIR` or `AXOLOTL_DATA_DIR_SUFFIX`.

## Verification

- `cargo fmt --all --check` for formatting; `cargo fmt --all` to write it.
- `cargo test --package theseus --lib -- <filter>` for the module you changed. The desktop CI job runs targeted filters rather than the whole suite; mirror the filter it uses for your area.
- `node scripts/axolotl/downgrade-app-db.test.mjs` and `node scripts/axolotl/check-migrations.mjs --base <ref>` when a migration or its mapping changed.
- `cargo check --package theseus --all-targets` before reporting a Rust change complete.

## Reference

- [Persistence](../../standards/app-lib/PERSISTENCE.md)
- [Migrations](../../standards/app-lib/MIGRATIONS.md)
- [Rust build resources](../../standards/build/RUST_BUILD_RESOURCES.md)
