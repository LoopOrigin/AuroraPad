# AuroraPad Security Baseline

AuroraPad is a desktop-first Electron editor with local file access, local command execution, integrated terminals, remote server connections, and user-provided plugins. This baseline defines the intended trust model for the current product.

## Trust Model

- AuroraPad treats the local machine and the signed desktop app as trusted.
- User-installed JavaScript plugins are a trusted local power-user feature.
- Remote profile exports are metadata-only and must never include passwords, passphrases, private keys, or tokens.
- OS keychain storage is the only supported persistence layer for remote secrets.

## Explicit Non-Goals

- AuroraPad does not sandbox user JavaScript plugins in the current architecture.
- AuroraPad does not promise safe execution of arbitrary shell commands entered by the user.
- AuroraPad does not import secrets from profile migration files.

## Security Rules

- Never commit `.env.local`, `.env.*.local`, tokens, private keys, or PEM blocks.
- Require explicit user confirmation before executing local shell commands.
- Deny renderer navigation to external pages and deny permission prompts by default.
- Keep Electron `contextIsolation` enabled, `nodeIntegration` disabled, and `sandbox` enabled.
- Restrict preload APIs to operations the renderer actually needs, and validate all IPC inputs in the main process.

## Remote Profile Migration

- Exported profile files contain connection metadata only.
- Imported profile files are validated before being accepted.
- Imported profiles never restore saved secrets automatically.

## Operational Follow-Up

- Rotate or revoke any secret that was ever committed to the repository.
- Run `npm run security:scan` in CI and before release builds.
- Re-run dependency audits after Electron, Vite, Nuxt, and packaging changes.
