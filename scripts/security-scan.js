#!/usr/bin/env node

const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const repoRoot = process.cwd()
const trackedFiles = execFileSync('git', ['ls-files'], { cwd: repoRoot, encoding: 'utf8' })
  .split('\n')
  .map(line => line.trim())
  .filter(Boolean)

const ignoredExtensions = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.icns', '.pdf', '.zip', '.gz', '.tgz',
  '.ttf', '.woff', '.woff2', '.eot', '.mp4', '.mov', '.avi', '.dmg', '.exe', '.AppImage',
  '.blockmap',
])

const patterns = [
  {
    label: 'Private key block',
    regex: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/,
  },
  {
    label: 'Certificate block',
    regex: /-----BEGIN CERTIFICATE-----/,
  },
  {
    label: 'Vercel OIDC token',
    regex: /\bVERCEL_OIDC_TOKEN\s*=\s*["']?[A-Za-z0-9_-]+\.[A-Za-z0-9._-]+\.[A-Za-z0-9._-]+["']?/,
  },
  {
    label: 'Generic bearer/JWT-style token',
    regex: /\b(?:token|secret|api[_-]?key|access[_-]?token)\b[^\n]{0,40}[=:][^\n]{0,10}["']?[A-Za-z0-9_-]{16,}\.[A-Za-z0-9._-]{10,}\.[A-Za-z0-9._-]{10,}/i,
  },
  {
    label: 'PEM payload marker',
    regex: /-----BEGIN [A-Z0-9 ]+-----/,
  },
]

const findings = []

for (const relativePath of trackedFiles) {
  const ext = path.extname(relativePath).toLowerCase()
  if (ignoredExtensions.has(ext)) continue

  const absolutePath = path.join(repoRoot, relativePath)
  let stat
  try {
    stat = fs.statSync(absolutePath)
  } catch {
    continue
  }
  if (!stat.isFile() || stat.size > 1024 * 1024) continue

  const content = fs.readFileSync(absolutePath, 'utf8')
  for (const pattern of patterns) {
    const match = content.match(pattern.regex)
    if (match) {
      const start = content.slice(0, match.index).split('\n').length
      findings.push({
        file: relativePath,
        line: start,
        label: pattern.label,
      })
    }
  }
}

if (findings.length) {
  console.error('Security scan failed. Potential secrets or key material were found in tracked files:\n')
  for (const finding of findings) {
    console.error(`- ${finding.label}: ${finding.file}:${finding.line}`)
  }
  process.exit(1)
}

console.log('Security scan passed. No tracked secrets detected by policy.')
