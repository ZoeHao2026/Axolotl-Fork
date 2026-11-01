# App Database Migrations

Every migration under `packages/app-lib/migrations/` runs against databases people already use. This standard covers immutability, the checksum rules, the downgrade mapping that must land in the same change, and what a migration test has to prove.

## Immutability

- Treat every migration as immutable as soon as it has been applied to any database, including a local development database. Never edit, rename, reorder, or delete an applied migration.
- Before changing an existing migration, query the active development database's `_sqlx_migrations` table for its version. If a successful row exists, stop and create a new migration with a higher version instead.
- Fix migration mistakes only with a new forward migration. Do not make an old migration appear compatible by directly changing `_sqlx_migrations` checksums.
- A historical checksum may be reconciled in application code only when the checksum is explicitly allowlisted, the existing schema is validated structurally, and a tested forward migration brings that schema to the canonical state. Unknown checksums must still fail.

## Schema rules

- SQLite table renames do not free global index names. Rebuild migrations must drop or rename legacy indexes before creating replacement indexes.
- Migrations must not access the network. Cache data used during migration is untrusted and must be validated or ignored without blocking the upgrade.

## The downgrade mapping

Every new launcher migration must update `REVERTIBLE_SCHEMA` in `scripts/axolotl/downgrade-app-db.mjs` in the same change.

- Use the migration's 14-digit timestamp prefix as the key; the downgrade tests reject mappings that do not correspond to an existing migration.
- Record every column and table added by the migration in that mapping so removing the migration record cannot leave schema that makes a later re-upgrade fail with duplicate objects. List tables in reverse creation/dependency order so dependent tables are dropped before their parents. A migration that only changes data and leaves no schema to remove must still be registered with an empty object (`{}`).
- If a migration adds durable schema that `REVERTIBLE_SCHEMA` cannot currently describe, extend the downgrade script and its tests in the same change. Do not use `--allow-unmapped` as an implementation or CI workaround.

## What a migration test must cover

- Migration tests must cover both a fresh database and an upgrade database containing the exact previous tables, indexes, foreign keys, representative data, malformed provider data, and missing optional data.
- After a migration test, run `PRAGMA foreign_key_check`, verify that legacy tables and indexes are gone, and verify that provider-qualified data did not change provider identity.

## Running it

- After adding or changing a launcher migration or its downgrade mapping, run `node scripts/axolotl/downgrade-app-db.test.mjs`; this is part of the CI guardrails. Add or update downgrade test coverage when introducing a new mapping shape or rollback behavior.
- Do not start a migration-watching development process while migration files are still being edited. Finish the migration and its upgrade tests first, then start the app once to apply it.
