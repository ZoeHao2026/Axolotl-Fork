# API Client Uploads

File uploads in `@modrinth/api-client` use `XMLHttpRequest` rather than `fetch`, because `fetch` cannot report progress. This standard covers the handle it returns and the two shapes an upload can take.

## The handle

The `upload()` method returns an `UploadHandle<T>`:

```ts
interface UploadHandle<T> {
  promise: Promise<T>
  onProgress(callback: (progress: UploadProgress) => void): UploadHandle<T> // chainable
  cancel(): void
}
```

## Two modes

- **Single file** — `{ file: File | Blob }` sends with `Content-Type: application/octet-stream`
- **FormData** — `{ formData: FormData }` for multipart uploads (browser/platform sets boundary)

Uploads go through the feature chain (auth, retry, etc.). Features detect uploads via `context.metadata.isUpload`.

## Usage (server file upload)

```ts
const uploader = client.kyros.files_v0.uploadFile(path, file, {
  onProgress: ({ progress }) => {
    uploadProgress.value = Math.round(progress * 100)
  },
})
// Cancel if needed: uploader.cancel()
await uploader.promise
```

## Usage (version creation with FormData)

```ts
const handle = client.labrinth.versions_v3.createVersion(draftVersion, files, projectType)
handle.onProgress((progress) => {
  uploadProgress.value = progress
})
await handle.promise
```

See [the upload implementation](../../packages/api-client/src/platform/xhr-upload-client.ts) for current request and cancellation behavior.
