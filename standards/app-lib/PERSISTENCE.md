# App Database Persistence

`packages/app-lib` keeps its records in SQLite through two halves of equal standing. This standard says which half owns which rows, how a caller reaches them, and the one rule that keeps the boundary from eroding.

## The two halves

Records the crate keeps between runs are read and written by its persistence layer. `packages/app-lib/src/state/store/` owns the runtime's own records — settings, caches, the bookkeeping the application keeps about itself. `packages/app-lib/src/state/instances/adapters/sqlite/` owns the instance domain's rows — instances, content sets, entries, provider references, pack members, files, playtime, post-upgrade notices. Each half keeps its own statements: the store answers collection verbs, the instance half answers step functions that run inside the unit the caller opened.

**Do not reach the database on your own**: no business module may use `sqlx` or write a statement. Business code calls one of the two halves, and which half owns a row follows from the table that row lives in. Beginning a transaction to group several steps, or handing a pool to one of them, is how a caller reaches the persistence layer; spelling the SQL is not.

## The collection verbs

A caller names a collection and the fields it looks a record up by, through the handle in `State::data`. The verbs are centred on `get` and `set`, and qualify them the same way everywhere:

- `get(handle, key) -> Result<Option<Record>>` reads one record; `Ok(None)` means the key holds nothing, which is not an error.
- `set(handle, key, Some(record))` writes the record under the key; passing `None` removes the record that key held.
- `get_all(handle)` / `set_all(handle, records)` reach a whole collection.
- `get_scoped(handle, scope)` / `set_scoped(handle, scope, records)` reach the records one scope names.
- `atom_get` / `atom_set` / `atom_get_all` / `atom_set_all` / `atom_get_scoped` / `atom_set_scoped` take a `&mut Atom` instead of the handle and run inside one atomic unit: everything written through it lands together, or nothing does. Open one with `store::atom(&handle)` and finish with `Atom::commit`; dropping an uncommitted unit rolls it back.

## Adding a collection

Which storage answers a collection, and how it is asked, stays inside the store half:

- Add a collection by creating a module under `src/state/store/` that declares its `Key`, its `Scope` and its `Record`, and answers the six statements the verbs are written in terms of — read, write, read-all, replace-all, read-scoped and replace-scoped, each on a `&mut SqliteConnection`. Its statements live in that module and nowhere else; a collection with no narrower group sets `Scope = Key`. A collection implements those statements rather than the verbs: the verbs, and the checks that a replace carries unique keys and no key outside its scope, are the trait defaults and must not be re-implemented per collection.
- Prefer the scoped verbs and atomic units to reading a whole collection and filtering it in the caller: a full read there is the performance defect this interface exists to avoid.

## Boundaries that must hold

- `sqlx` may only appear inside the persistence layer: `src/state/store/` and `src/state/instances/adapters/sqlite/`. `Handle::pool` is visible to the store half alone; a caller reaches the instance half by passing `State::pool` or a transaction it opened into a step.
- The instance half answers step by step. A step that writes takes the `&mut Transaction` its caller opened and never commits it; a step that only reads takes a generic `Executor`, so it can also join an open unit. A guard belongs to the step that acts on it, so no caller can skip the check by writing its own statement.
- Signatures return the crate's own `Result`; a storage's error type must not appear in them, so a replacement storage can report the same failures.
- A record that cannot be interpreted (for example a stored port outside its type) is logged inside the store and skipped, while a collection that cannot be read at all returns `Err` for the caller to decide whether to degrade.
- Call sites that have not moved yet keep working while the collections are migrated one at a time. When you touch one, move that call onto the half that owns the table instead of adding a query beside it; new code never adds a query outside the persistence layer.
