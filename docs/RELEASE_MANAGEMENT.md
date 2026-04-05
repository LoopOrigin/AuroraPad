# Release Management

AuroraPad now includes GitHub release automation through:

- `.github/workflows/build.yml`
- `.github/workflows/release.yml`
- `.github/release.yml`

## How it works

1. Keep the repository baseline version at `0.1.0`.
2. Every push to `main` or `master` runs the release workflow.
3. GitHub Actions looks for the latest semantic version tag such as `v0.1.0`, `v0.2.0`, or `v1.0.0`.
4. CI calculates the next semantic version automatically from commit history:
   - `major` for `BREAKING CHANGE:` commits or conventional commits with `!`
   - `minor` for `feat:`
   - `patch` for everything else
5. If no matching release exists yet, the workflow starts at `v0.1.0`.
6. GitHub Actions builds AuroraPad on:
   - Ubuntu for Linux artifacts
   - Windows for Windows artifacts
   - macOS for macOS artifacts
7. The workflow updates `package.json` and `package-lock.json` during CI so packaged binaries carry the computed version.
8. The workflow creates and pushes the matching git tag, such as `v0.1.0`.
9. The workflow collects packaged artifacts from `release/`.
10. A GitHub Release is created or updated for that tag.
11. The generated installers and metadata files are uploaded to the release.

## Notes

- Windows `.ico` assets are generated from `assets/aurorapad-app-icon.png` by `scripts/generate-icons.js`.
- Pull request validation happens through `.github/workflows/build.yml`, and it now builds Windows, Linux, and macOS artifacts too.
- The release workflow uses the repository `GITHUB_TOKEN`, so no extra token setup is required for basic releases.
- GitHub’s generated release notes are grouped using `.github/release.yml`.
- Re-running the release workflow on the same commit reuses the matching semantic version tag if one already points at `HEAD`.
- If you want signed macOS or Windows binaries later, add the appropriate signing secrets and extend the workflow.
- GitHub Releases are now backed by real git tags, not just release entries.
- The release job creates the GitHub Release with all assets attached in one step, which keeps it compatible with immutable releases.

## Recommended release flow

1. Merge release-ready changes into `main` or `master`.
2. Let GitHub Actions create the next semantic version release automatically.
3. Review the generated GitHub Release page after the workflow completes.

## Local versioning

- The repository baseline is `0.1.0`.
- CI owns semantic version increments after that, so local development does not need manual version bumps for each release.
- Using conventional commits such as `feat:` and `fix:` will make release bumps predictable.
