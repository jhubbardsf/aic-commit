# Release Process for aic-commit

This document explains how to release a new version of `aic-commit` to npm.

## Repository Structure

There is **one repository**: `jhubbardsf/aic-commit` — the source code and the published package both live here. Unlike Homebrew taps (which need a separate `homebrew-*` repo), npm publishes directly from this repo via `npm publish`.

## Prerequisites

- `bun` installed (used for `bun run validate` and `bun run build`)
- `npm` logged in as the publishing account — verify with `npm whoami`
- `gh` CLI installed and authenticated (`brew install gh && gh auth login`) — used to create the GitHub release
- Push access to `jhubbardsf/aic-commit`

## Step-by-Step Release Process

### 1. Bump the Version

Two places need the new version number (keep them in sync):

- `package.json` → `"version"` field
- `src/cli.ts` line 31 → `.version('X.Y.Z')` (hardcoded in the commander setup)

A future cleanup would be to read the version from `package.json` at build time so there's only one source of truth.

### 2. Update CHANGELOG.md

Add a new entry above the previous one:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- Description of new features

### Changed
- Description of changes to existing behavior

### Fixed
- Description of bug fixes
```

Follow [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format — the existing entries set the style.

### 3. Validate and Build

```bash
bun run validate && bun run build
```

The `prepublishOnly` hook re-runs this automatically during `npm publish`, but running it manually first means problems are caught before tagging.

### 4. Inspect the Tarball

```bash
npm pack --dry-run
```

Expected contents: only `dist/cli.js`, `README.md`, `LICENSE`, `package.json`. Anything else means the `files` field has been overridden somewhere — investigate before publishing.

### 5. Commit and Push

```bash
git add -A
git commit -m "chore(release): vX.Y.Z"
git push
```

### 6. Tag and Push the Tag

```bash
git tag -a vX.Y.Z -m "Release X.Y.Z"
git push origin vX.Y.Z
```

### 7. Create the GitHub Release

```bash
gh release create vX.Y.Z --title "vX.Y.Z" --notes "$(cat <<'EOF'
## What's Changed

- Bullet list mirroring the CHANGELOG entry for this version
EOF
)"
```

Or interactively, pasting from the CHANGELOG:

```bash
gh release create vX.Y.Z --title "vX.Y.Z" --notes-file -
# Paste your notes, then Ctrl+D
```

### 8. Publish to npm

```bash
npm publish
```

No `--access public` flag needed — `aic-commit` is an unscoped name. The `prepublishOnly` script runs the full validate + build chain before the publish actually goes through.

### 9. Verify

```bash
npm view aic-commit version           # should print the new version
npx aic-commit@X.Y.Z --version        # should print the new version
```

## Upgrading Locally After Release

Global install:

```bash
npm install -g aic-commit@latest
```

Per-project install:

```bash
npm install --save-dev aic-commit@latest
```

## Quick Reference: One-Liner Commands

After bumping the version in both files (step 1) and updating the CHANGELOG (step 2):

```bash
VERSION="X.Y.Z"

bun run validate && bun run build
npm pack --dry-run

git add -A
git commit -m "chore(release): v${VERSION}"
git push

git tag -a "v${VERSION}" -m "Release ${VERSION}" && git push origin "v${VERSION}"

gh release create "v${VERSION}" --title "v${VERSION}" --notes "See CHANGELOG.md for details."

npm publish

npm view aic-commit version
```

## Notes

- End users install with `npm install -g aic-commit` (or `bun install -g aic-commit`).
- The `prepublishOnly` hook gates publication on `validate` passing. If validation fails locally, the publish never reaches the registry.

### Recovery from a Bad Publish

npm versions are **immutable**. Once a version is published, the exact name+version combo is permanently reserved on the registry — even after `unpublish`.

- **Within 72 hours of the publish**: `npm unpublish aic-commit@X.Y.Z` works *if* nothing else depends on that version.
- **After 72 hours**: `npm deprecate aic-commit@X.Y.Z "reason"` marks the version as deprecated, then publish a corrected `X.Y.(Z+1)` with the fix.
- The same version number cannot be republished — the registry rejects it permanently.

### Recovery from a Bad Tag (only before `npm publish` has happened)

```bash
gh release delete vX.Y.Z --yes
git push --delete origin vX.Y.Z
git tag -d vX.Y.Z
```

Once `npm publish` has run, the tag should generally stay — it's the historical reference for what was on the registry at that time.
