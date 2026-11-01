# Desktop Application Library

The Rust crate behind every desktop feature: runtime behaviour, persistence and database migrations.

## Rules

- **Never reach the database directly.** No business module may use `sqlx` or spell a statement; call the half of the persistence layer that owns the row. The [persistence standard](../../standards/app-lib/PERSISTENCE.md) defines the boundary, the verbs and the exceptions.
- **Applied migrations are immutable**, including ones applied only to a local database. A fix is a new forward migration plus its downgrade mapping, per the [migration standard](../../standards/app-lib/MIGRATIONS.md).
- A development build shares the installed application's data unless isolated with `THESEUS_CONFIG_DIR` or `AXOLOTL_DATA_DIR_SUFFIX`.
- A new or changed native command follows [the shell's IPC chain](../../apps/app/AGENTS.md).

## Verify

- `cargo fmt --all --check`, then `cargo check --package theseus --all-targets`.
- `cargo test --package theseus --lib -- <filter>` — desktop CI runs targeted filters, not the whole suite.
- Migration touched: `node scripts/axolotl/check-migrations.mjs --base <ref>` and `node scripts/axolotl/downgrade-app-db.test.mjs`.
