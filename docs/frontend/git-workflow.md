# Git Workflow & Conventions

> Local-only notes (gitignored). Conventions and a command cheatsheet for keeping tight
> control over this repo.

## Branching (trunk-based)

- `main` is always releasable. Work happens on short-lived branches off `main`.
- Branch naming: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`, `docs/<slug>`,
  `refactor/<slug>`.
- Rebase feature branches on `main` before merging; prefer squash-merge to keep history
  linear.

## Commits — Conventional Commits

```
<type>(<optional scope>): <short summary>

<optional body>

<optional footer, e.g. BREAKING CHANGE: …>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`,
`chore`, `revert`.

Examples:
- `feat(auth): add httpOnly cookie login via BFF proxy`
- `fix(ws): reconnect after backend restart`
- `docs: capture 2026 stack research`

## Releasing (Semantic Versioning)

Versions follow [SemVer](https://semver.org): `MAJOR.MINOR.PATCH`. Map the Conventional
Commit history since the last tag to the bump:

- `fix:` → **PATCH** · `feat:` → **MINOR** · `BREAKING CHANGE:` / `feat!:` → **MAJOR**.
- `docs:`/`chore:`/`test:`/`ci:`/`style:`/`refactor:` alone don't force a release.

Releases are cut manually (no release tooling/CI by choice). The changelog lives at the
repo root in [`CHANGELOG.md`](../CHANGELOG.md) ([Keep a Changelog](https://keepachangelog.com)
format) — note this is committed, unlike these `docs/` notes.

Steps to cut a release (example: `1.0.0`):

```bash
# 1. Make sure the tree is clean and green
git switch main && git pull --rebase
pnpm typecheck && pnpm lint && pnpm test && pnpm build

# 2. Move [Unreleased] entries under a new version heading in CHANGELOG.md
#    and bump the version field in package.json (keep them in sync).

# 3. Commit the release
git add CHANGELOG.md package.json
git commit -m "chore(release): v1.0.0"

# 4. Tag it (annotated) — review what the tag points at before pushing
git tag -a v1.0.0 -m "v1.0.0"
git show v1.0.0 --stat

# 5. Push commit + tag together (only when ready to publish)
git push --follow-tags
```

> Inspect tags locally with `git tag -l` and `git show <tag>`. Tags are not pushed until
> the explicit `git push --follow-tags` above.

## Automated hooks (to set up during scaffolding)

- **Husky** + **lint-staged** — pre-commit: run ESLint + Prettier on staged files only.
- **pre-push** — run `pnpm typecheck`.
- **commitlint** (`@commitlint/config-conventional`) — reject non-conforming messages.

## .gitignore essentials

- `docs/` (these notes stay local)
- `.env*` except `.env.example`
- `node_modules/`, `.next/`, `out/`, `build/`, `coverage/`
- `.DS_Store`, editor cruft

## Command cheatsheet

```bash
# Status / inspection
git status -sb                 # short, branch-aware status
git status --ignored           # include ignored files (verify docs/ is ignored)
git diff                       # unstaged changes
git diff --staged              # staged changes
git log --oneline --graph -20  # recent history, compact graph

# Branching
git switch -c feat/x           # create + switch to new branch
git switch main                # switch back
git branch -d feat/x           # delete merged branch

# Staging / committing
git add -p                     # stage hunks interactively
git commit -m "feat: …"        # commit
git commit --amend             # fix the last commit (before push)

# Sync
git fetch --prune              # update remotes, drop stale branches
git pull --rebase              # rebase local commits on top of remote
git push -u origin feat/x      # push + set upstream

# Rebase / cleanup (local, pre-push only)
git rebase main                # replay branch on latest main
git restore <file>             # discard unstaged changes to a file
git restore --staged <file>    # unstage (keep changes)
git reset --soft HEAD~1        # undo last commit, keep changes staged
git stash / git stash pop      # shelve / restore work in progress
```

> Note: avoid interactive flags (`-i`) in automated/agent contexts — use scripted,
> non-interactive equivalents instead.
