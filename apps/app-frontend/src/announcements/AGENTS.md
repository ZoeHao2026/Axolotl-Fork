# Desktop Update Announcements

Release announcements ship inside `apps/app-frontend` and appear after a completed update and in Settings > Updates.

## Rules

- Write entries only in `apps/app-frontend/src/announcements/catalog.ts`, and only when the user asks for an update log and gives the exact version. Never infer the version from local metadata or the remote.
- An entry stays editable until its release tag is published. Check both `refs/tags/v<version>` and `refs/tags/<version>` with `git ls-remote --tags --refs origin`; once either exists the entry is frozen — never reuse its ID or change its meaning.
- ID `launcher-<version>`, ISO `YYYY-MM-DD` date, newest first. Keep a Changelog categories only (`added`, `changed`, `deprecated`, `removed`, `fixed`, `security`), omitting empty ones.
- Title and every change in both `en-US` and `zh-CN`. Other locales fall back to English on purpose — do not copy bodies into them.
- User-facing and concise: observable behaviour, never implementation detail. Release notes live here and nowhere else — no `UPDATE_LOG.md`.
- `pending_update_toast_for_version` is the persisted trigger. Do not add per-release startup checks, and do not clear it before the announcement closes.
- Startup dialog priority is fixed: initialisation errors, first-run onboarding, post-update announcement, community announcement. A replayed tour must not consume a pending announcement.
- Local dev builds have a preview button in Settings > Updates. Use it instead of adding per-version branches.
- Changing the schema, categories, fallback or priority means updating the catalog types, both display surfaces and this file together.
- The release workflow builds the release body from the catalog through `scripts/axolotl/create-release-notes.mjs`; a tag without an entry must fail preflight.

## Verify

`node --test scripts/axolotl/create-release-notes.test.mjs`; `pnpm --filter @modrinth/app-frontend test` when a display surface changed.
