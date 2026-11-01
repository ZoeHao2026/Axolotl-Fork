---
name: api-module
description: Add a new API endpoint module to packages/api-client from an OpenAPI schema. Use when adding new backend endpoints, creating API client modules, or when an openapi.yml is provided.
---

Read the [module conventions](../../../standards/api-client/ADDING_MODULES.md) and the [client reference](../../../standards/api-client/CLIENT.md) first. The schema is supplied by the user; ask for its location only when the request does not identify it.

## Steps

1. **Read the OpenAPI schema** named in the request: endpoint paths, server URLs, request and response shapes, path parameters.
2. **Pick the names** — service, domain and version come from the schema's servers and routes; the file path, class and module ID follow the conventions page.
3. **Write the types** in the service's `types.ts`, taken from the schema verbatim.
4. **Write the module class**, one method per endpoint, each routed through `this.client.request()` or `.upload()`.
5. **Register it** in `MODULE_REGISTRY`, and re-export `types.ts` when the service namespace is new.
6. **Verify** the package builds and the types resolve from `@modrinth/api-client`.
