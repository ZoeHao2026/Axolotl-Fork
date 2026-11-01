# Repository Agent Configuration

This folder owns the agent resources themselves: the instruction files, the skills, and the validation that keeps them honest. It does not own the delivery workflow.

## Ownership

- `AGENTS.md` files are ordinary UTF-8 files containing instructions for their subtree. Keep repository-wide safeguards and routing at the root; put specialized rules beside their owning code.
- `.agents/skills/<name>/SKILL.md` defines a reusable task workflow. Keep `name` and `description` focused on the actual trigger. Express inputs in normal language so implicit and explicit invocation both work.
- `standards/` owns shared technical facts. Link to the relevant standard instead of copying its tables or implementation recipes into multiple skills and instruction files.
- Paths in Markdown links are relative to their containing file. When naming code paths in prose, state that they are repository-relative. Use real files for examples; clearly label hypothetical paths in code examples.
- Read only the skill references relevant to the current task. Do not load all frontend or design references by default.
- A review request stays read-only. A skill does not authorize implementation, dependencies, commits, messages or remote actions beyond the user's request.
- The delivery workflow — commits, pushes, pull requests, reviews and archiving — is owned by the root [REVIEW.md](../REVIEW.md). Read it before any of those actions; this file owns the agent resources themselves.

## Rules

- Keep skills and references tracked. Runtime scratch files belong outside `.agents/skills/`, in ignored `.agents/tmp/` or `.agents/cache/`; never ignore all of `.agents/`.
- Agent intermediate and archived artifacts — plans, specs, worklogs and captured evidence — belong in the ignored `.agents/plans/`. Keep their filenames descriptive, because a later session reads the matching plan to restore the context of that work. Never force-add them past `.gitignore`.
- Before removing a reference, inspect its callers. Preserve domain constraints when moving rules and update the root routing table when adding a new scoped entry point.
- When moving a technical fact out of an instruction file, put it in `standards/` and leave a link, rather than deleting it.

## Verification

- Run `pnpm axolotl:check-agents` after changing agent configuration. It validates Skill frontmatter and evaluation fixtures, rejects leftover legacy Claude instruction files and directories, and fails on broken Markdown links. It does not read paths written in prose, so when you rename or move a file, search the guidance for the old path yourself. A green check does not prove model behavior.
- For workflow changes, exercise representative task scenarios and report the checks actually performed. Keep behavioral evals self-contained and do not claim they ran merely because their JSON is valid.
