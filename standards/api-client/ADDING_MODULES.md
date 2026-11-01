# Adding an API Module

Conventions for a new endpoint module in `packages/api-client`. The workflow itself lives in the [`api-module` skill](../../.agents/skills/api-module/SKILL.md); this page is the reference it points at.

## Naming

| Thing          | Pattern                          | Example                         |
| -------------- | -------------------------------- | ------------------------------- |
| Module class   | `{Api}{Domain}V{N}Module`        | `LabrinthThingsV3Module`        |
| Module ID      | `{api}_{domain}_v{n}`            | `labrinth_things_v3`            |
| Type namespace | `Namespace.Domain.Version`       | `Labrinth.MyDomain.v3.Thing`    |
| File path      | `modules/<api>/<domain>/v<N>.ts` | `modules/labrinth/things/v3.ts` |

## Request options

| Field         | Values                                            | Purpose                            |
| ------------- | ------------------------------------------------- | ---------------------------------- |
| `api`         | `'labrinth'`, `'archon'`, or a full URL           | Which base URL to use              |
| `version`     | `2`, `3`, `'internal'`, `'modrinth/v0'`, etc.     | URL version segment                |
| `method`      | `'GET'`, `'POST'`, `'PUT'`, `'PATCH'`, `'DELETE'` | HTTP method                        |
| `body`        | object                                            | JSON request body                  |
| `params`      | `Record<string, string>`                          | Query parameters                   |
| `skipAuth`    | `boolean`                                         | Skip auth feature for this request |
| `useNodeAuth` | `boolean`                                         | Use node-level auth (kyros)        |
| `timeout`     | `number`                                          | Request timeout in ms              |
| `retry`       | `boolean \| number`                               | Override retry behavior            |

A module is thin: one method per endpoint, each returning `this.client.request(...)`.

```ts
export class LabrinthThingsV3Module extends AbstractModule {
  public getModuleID(): string {
    return 'labrinth_things_v3'
  }

  public async get(id: string): Promise<Labrinth.MyDomain.v3.Thing> {
    return this.client.request(`/thing/${id}`, { api: 'labrinth', version: 3, method: 'GET' })
  }
}
```

## Uploads

Return an `UploadHandle` instead of a `Promise`, passing `file` for a single file or `formData` for multipart, and give uploads a longer `timeout` than a normal request.

## Registration

Add the class to `MODULE_REGISTRY` in `modules/index.ts` under its module ID. The flat key becomes nested access at runtime (`labrinth_things_v3` → `client.labrinth.things_v3`), which is what the [client reference](CLIENT.md) describes.

## Types

A new API service needs `modules/<service>/types.ts` re-exported from `modules/types.ts`. Adding to an existing namespace needs no export change. The 1:1 rule for the shapes themselves is in the [client reference](CLIENT.md).

## Key files

- `src/core/abstract-module.ts` — base class every module extends
- `src/core/abstract-client.ts` — `request()` and `upload()`
- `src/modules/index.ts` — `MODULE_REGISTRY` and `buildModuleStructure()`
- `src/types/upload.ts` — `UploadHandle`, `UploadProgress`, `UploadRequestOptions`
