# Repository Agent Configuration

This folder owns the agent resources — instruction files, skills and their validation. The delivery workflow is not one of them: that belongs to [REVIEW.md](../REVIEW.md).

## Rules

- `AGENTS.md` files hold the routing and constraints for their subtree; repository-wide rules and the routing table stay at the root.
- `.agents/skills/<name>/SKILL.md` defines a reusable workflow. Keep `name` and `description` on the real trigger and express inputs in plain language, so implicit and explicit invocation both work.
- **Technical facts belong in `standards/`**, linked rather than copied. Read only the references the task needs; do not load every frontend or design document by default.
- Links are relative to their file; paths in prose are repository-relative. Use real files in examples and label hypothetical ones.
- A review request stays read-only, and a skill never authorizes implementation, dependencies, commits or remote actions beyond what the user asked for.
- Scratch files go in ignored `.agents/tmp/` or `.agents/cache/`; plans, specs and evidence in ignored `.agents/plans/`. Never ignore all of `.agents/`.
- Before removing a reference, inspect its callers. Moving a rule means updating the root routing table.

## Verify

`pnpm axolotl:check-agents` validates Skill frontmatter, eval fixtures and Markdown links, and rejects leftover legacy Claude instruction files. It does not read paths written in prose, so search the guidance yourself when you move a file — and a green check still does not prove model behaviour. Exercise representative scenarios for workflow changes.
