const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

function isLikelyUrl(value) {
  return /^(https?:\/\/|file:\/\/)/i.test(value)
}

function isLikelyBase64Blob(value) {
  if (!value || value.length < 64) {
    return false
  }

  return /^[A-Za-z0-9+/=\r\n]+$/.test(value)
}

function isExistingFile(value) {
  if (!value) {
    return false
  }

  try {
    return fs.existsSync(value) && fs.statSync(value).isFile()
  } catch {
    return false
  }
}

function hasSigningFileExtension(value) {
  return /\.(p12|pfx)$/i.test(value || '')
}

function sanitizeSigningEnv(env) {
  const nextEnv = { ...env }

  const windowsCert = nextEnv.WIN_CSC_LINK
  const macCert = nextEnv.CSC_LINK

  const validWindowsCert =
    isExistingFile(windowsCert) ||
    hasSigningFileExtension(windowsCert) ||
    isLikelyUrl(windowsCert) ||
    isLikelyBase64Blob(windowsCert)

  if (!validWindowsCert) {
    delete nextEnv.WIN_CSC_LINK
    delete nextEnv.WIN_CSC_KEY_PASSWORD
    nextEnv.CSC_IDENTITY_AUTO_DISCOVERY = 'false'
  }

  const validMacCert =
    isExistingFile(macCert) ||
    hasSigningFileExtension(macCert) ||
    isLikelyUrl(macCert) ||
    isLikelyBase64Blob(macCert)

  if (!validMacCert) {
    delete nextEnv.CSC_LINK
    delete nextEnv.CSC_KEY_PASSWORD
  }

  const hasAppleNotary =
    Boolean(nextEnv.APPLE_API_KEY) &&
    Boolean(nextEnv.APPLE_API_KEY_ID) &&
    Boolean(nextEnv.APPLE_API_ISSUER)

  if (!hasAppleNotary) {
    delete nextEnv.APPLE_API_KEY
    delete nextEnv.APPLE_API_KEY_ID
    delete nextEnv.APPLE_API_ISSUER
  }

  return nextEnv
}

const builderBin = path.join(
  process.cwd(),
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'electron-builder.cmd' : 'electron-builder'
)

const env = sanitizeSigningEnv(process.env)
const result = spawnSync(builderBin, process.argv.slice(2), {
  stdio: 'inherit',
  env,
  shell: false,
})

if (result.error) {
  throw result.error
}

process.exit(result.status ?? 1)
