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
10. A matching private tag is created in the source repository for semantic version history.
11. The generated installers and metadata files are published to a separate public GitHub releases repository.

## Notes

- Windows `.ico` assets are generated from `assets/aurorapad-app-icon.png` by `scripts/generate-icons.js`.
- Pull request validation happens through `.github/workflows/build.yml`, and it now builds Windows, Linux, and macOS artifacts too.
- The private source repository still uses `GITHUB_TOKEN` for internal tag creation.
- Public release publishing requires:
  - repository variable `PUBLIC_RELEASES_REPO`
  - secret `PUBLIC_RELEASES_TOKEN`
- Optional signing secrets:
  - `WIN_CSC_LINK`
  - `WIN_CSC_KEY_PASSWORD`
  - `CSC_LINK`
  - `CSC_KEY_PASSWORD`
  - `APPLE_API_KEY`
  - `APPLE_API_KEY_ID`
  - `APPLE_API_ISSUER`
  - `GPG_PRIVATE_KEY`
  - `GPG_PASSPHRASE`
- Example:
  - `PUBLIC_RELEASES_REPO=ali111887/AuroraPad-Releases`
- `PUBLIC_RELEASES_TOKEN` should be a fine-grained token with contents write access to that public releases repository.
- `WIN_CSC_LINK` should point to your Windows signing certificate (`.pfx`) in base64 or file URL form supported by `electron-builder`.
- `CSC_LINK` should point to your macOS Developer ID Application certificate (`.p12`) in a form supported by `electron-builder`.
- Apple notarization uses the App Store Connect API key path recommended by `electron-builder`:
  - `APPLE_API_KEY`
  - `APPLE_API_KEY_ID`
  - `APPLE_API_ISSUER`
- `GPG_PRIVATE_KEY` should be stored as base64-encoded armored or binary private key material for release checksum signing.
- GitHub’s generated release notes are grouped using `.github/release.yml`.
- Re-running the release workflow on the same commit reuses the matching semantic version tag if one already points at `HEAD`.
- If you want signed macOS or Windows binaries later, add the appropriate signing secrets and extend the workflow.
- GitHub Releases are now backed by real git tags, not just release entries.
- The public release job creates the GitHub Release with all assets attached in one step, which keeps it compatible with immutable releases.
- The public releases repository can stay public even while the main source repository remains private.
- macOS builds are configured for hardened runtime, entitlements, and notarization when Apple signing secrets are present.
- If macOS signing secrets are missing, macOS artifacts are skipped from the public release instead of failing the whole workflow.
- If Windows signing secrets are missing, Windows artifacts are still built and published, but they are unsigned and may trigger SmartScreen warnings.
- Release artifacts always include `SHA256SUMS.txt`.
- `SHA256SUMS.txt.asc` is included only when GPG signing secrets are configured.

## Recommended release flow

1. Merge release-ready changes into `main` or `master`.
2. Let GitHub Actions create the next semantic version automatically.
3. GitHub Actions tags the private source repository and publishes binaries to the public releases repository.
4. Review the public release page after the workflow completes.

## Local versioning

- The repository baseline is `0.1.0`.
- CI owns semantic version increments after that, so local development does not need manual version bumps for each release.
- Using conventional commits such as `feat:` and `fix:` will make release bumps predictable.

## Public downloads setup

1. Create a public repository dedicated to downloads: `ali111887/AuroraPad-Releases`.
2. Add repository variable `PUBLIC_RELEASES_REPO=ali111887/AuroraPad-Releases` in the private source repository.
3. Add secret `PUBLIC_RELEASES_TOKEN` in the private source repository.
4. Point the website download URL to `https://github.com/ali111887/AuroraPad-Releases/releases`.
5. Optionally add platform signing secrets for Windows and macOS.
6. Optionally add GPG signing secrets for release checksum signing.

## Signing materials checklist

### Windows

- Export a code-signing certificate as `.pfx`.
- Store it in `WIN_CSC_LINK`.
- Store its password in `WIN_CSC_KEY_PASSWORD`.
- If you skip this, Windows releases still publish, but they are unsigned.

### macOS

- Export a `Developer ID Application` certificate as `.p12`.
- Store it in `CSC_LINK`.
- Store its password in `CSC_KEY_PASSWORD`.
- Create an App Store Connect API key and add:
  - `APPLE_API_KEY`
  - `APPLE_API_KEY_ID`
  - `APPLE_API_ISSUER`
- If you skip these, macOS public release artifacts are omitted.

### Cross-platform checksum signing

- Export your GPG private key.
- Base64-encode it and store it in `GPG_PRIVATE_KEY`.
- Store the passphrase in `GPG_PASSPHRASE`.
- If you skip these, the workflow still publishes `SHA256SUMS.txt` without the detached signature file.
