# Standards

Durable technical facts for developing Axolotl, mostly migrated from Modrinth's internal documentation.

`standards/` owns reference material; `AGENTS.md` files own routing and the constraints an agent must obey. When a fact would help more than one package, it belongs here and the instruction files link to it.

| Folder         | Covers                                                              |
| -------------- | ------------------------------------------------------------------- |
| `api-client/`  | `@modrinth/api-client`: request flow, uploads, WebSocket            |
| `app-lib/`     | Desktop runtime: database persistence and migration safety          |
| `build/`       | Shared Rust build resources and how to tell a lock from a warning   |
| `frontend/`    | Frontend development, styling, DI, modals, API modules, i18n, Figma |
| `maintaining/` | Release-note and changelog writing                                  |

See [DEEP_LINKS.md](DEEP_LINKS.md) for the `axolotl://` URL scheme.

For contributing guidelines see [CONTRIBUTING.md](../CONTRIBUTING.md) — these documents are technical reference, not a guide to making pull requests.
