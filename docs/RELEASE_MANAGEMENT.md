# Release Management

AuroraPad now includes GitHub release automation through:

- `.github/workflows/build.yml`
- `.github/workflows/release.yml`
- `.github/release.yml`

## How it works

1. Push a version tag such as `v1.1.0`.
2. GitHub Actions builds AuroraPad on:
   - Ubuntu for Linux artifacts
   - Windows for Windows artifacts
   - macOS for macOS artifacts
3. The workflow collects packaged artifacts from `release/`.
4. A GitHub Release is created or updated for that tag.
5. The generated installers and metadata files are uploaded to the release.

## Notes

- Windows `.ico` assets are generated from `assets/aurorapad-app-icon.png` by `scripts/generate-icons.js`.
- Regular branch and pull request validation happens through `.github/workflows/build.yml`.
- The workflow uses the repository `GITHUB_TOKEN`, so no extra token setup is required for basic releases.
- GitHub’s generated release notes are grouped using `.github/release.yml`.
- If you want signed macOS or Windows binaries later, add the appropriate signing secrets and extend the workflow.

## Recommended release flow

1. Update version in `package.json`.
2. Commit release-ready changes.
3. Tag the release:

```bash
git tag v1.1.0
git push origin v1.1.0
```

4. Review the GitHub Release page after the workflow completes.
