# Rust Build Resources

The workspace shares one Cargo target directory across every agent and every concurrent task. These rules decide who may use it, how to tell real contention from noise, and what is never an acceptable way to unblock.

## Use the configured target directory

- Reuse the workspace's configured Cargo target directory and existing build profiles. Before running Cargo, respect any existing `CARGO_TARGET_DIR` or `build.target-dir` configuration; do not change it to avoid contention.

## Tell a lock from a warning

- Distinguish an actual Cargo lock wait from compiler warnings. `Blocking waiting for file lock on artifact directory` is an explicit contention signal. When a command remains blocked on that lock, stop launching competing builds, report the blocked command, and ask the user to notify you when their operation is finished. The user may be running `pnpm app:dev`; do not claim to know the lock owner without evidence. Resume the blocked check after the user confirms the resource is available; independent source/documentation work may continue.
- `warning: error finalizing incremental compilation session directory ...: Access is denied` (including `拒绝访问` for a path under `target/debug/incremental/`) is not evidence of an artifact lock or user activity. Let the command finish and judge success by its exit status and final build/test result. A successful command with this warning is a successful check with a warning; do not stop for user confirmation, repeat the build merely to remove the warning, or change the target directory.
- For other access-denied or locked-file diagnostics, inspect the failing operation and command result before classifying them. A nonzero exit status requires investigation of the actual failure; neither an access-denied message nor an incremental warning alone establishes that the user is occupying the target directory. Apply the wait-for-user rule only with evidence of actual contention.

## What you may not do to unblock

- Do not create an alternate target directory, set `CARGO_TARGET_DIR`, pass `--target-dir`, change Cargo configuration, switch drives/workspaces, or use a temporary checkout to bypass the conflict. A directory outside `target/` is not an acceptable fallback. Alternate build storage requires explicit user authorization for that purpose; ordinary permission to implement or test a feature is insufficient.
- Do not kill the user's app, dev server, Cargo or compiler processes, remove lock files, run `cargo clean`, or delete build caches to release the resource. You may stop only your own task's redundant waiting invocation without terminating the process holding the lock.
- Existing repository packaging workflows may use their declared output directories when that workflow is requested. Do not repurpose those directories or launch a packaging workflow as a workaround for a development build lock.

## Build inputs that are easy to miss

- `packages/app-lib` compiles Java jars through Gradle during `build.rs`, and `apps/app` builds the Blockbench skin editor. Both are part of a Rust build even though no Rust source changed, and both are slow. When a build stalls on them, that is the build working, not a hang.
