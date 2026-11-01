# Standards

This folder contains the technical standards and documentation we use to develop Axolotl. The majority of this has been migrated from Modrinth's internal documentation.

Standards own durable technical facts. `AGENTS.md` files own routing, scope and the constraints an agent must obey; when a fact would be useful to more than one package, it belongs here and the instruction files link to it.

| Folder         | Covers                                                              |
| -------------- | ------------------------------------------------------------------- |
| `api-client/`  | `@modrinth/api-client`: request flow, uploads, WebSocket protocol   |
| `app-lib/`     | Desktop runtime: database persistence and migration safety          |
| `build/`       | Shared Rust build resources and how to tell a lock from a warning   |
| `frontend/`    | Frontend development, styling, DI, modals, API modules, i18n, Figma |
| `maintaining/` | Release-note and changelog writing                                  |

See [DEEP_LINKS.md](DEEP_LINKS.md) for the `axolotl://` URL scheme.

For contributing guidelines, please refer to [CONTRIBUTING.md](../CONTRIBUTING.md) — these documents are more for technical reference, not a guide on making pull requests, features, etc.
