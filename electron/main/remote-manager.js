const path = require('path')
const fs = require('fs').promises
const { Writable, Readable } = require('stream')
const { Client: Ssh2Client } = require('ssh2')
const SftpClient = require('ssh2-sftp-client')
const ftp = require('basic-ftp')

function nowIso() {
  return new Date().toISOString()
}

function ensurePosixPath(input, fallback = '/') {
  if (!input) return fallback
  let value = String(input).replace(/\\/g, '/')
  if (!value.startsWith('/')) value = `/${value}`
  value = value.replace(/\/{2,}/g, '/')
  return value || fallback
}

function dirnamePosix(input) {
  const normalized = ensurePosixPath(input, '/')
  if (normalized === '/') return '/'
  const idx = normalized.lastIndexOf('/')
  if (idx <= 0) return '/'
  return normalized.slice(0, idx)
}

function basenamePosix(input) {
  const normalized = ensurePosixPath(input, '/')
  if (normalized === '/') return '/'
  const idx = normalized.lastIndexOf('/')
  return idx >= 0 ? normalized.slice(idx + 1) : normalized
}

function makeVersion(stat = {}) {
  const size = Number.isFinite(stat.size) ? stat.size : 0
  const modifiedAt = Number.isFinite(stat.modifiedAt) ? stat.modifiedAt : 0
  return `${size}:${modifiedAt}`
}

function boundedString(input, field, { max = 255, trim = true, allowEmpty = false } = {}) {
  const value = String(input ?? '')
  const normalized = trim ? value.trim() : value
  if (!allowEmpty && !normalized) {
    const error = new Error(`${field} is required`)
    error.code = `${String(field).toUpperCase().replace(/[^A-Z0-9]+/g, '_')}_REQUIRED`
    throw error
  }
  if (normalized.length > max) {
    const error = new Error(`${field} is too long`)
    error.code = `${String(field).toUpperCase().replace(/[^A-Z0-9]+/g, '_')}_TOO_LONG`
    throw error
  }
  return normalized
}

function sortEntries(entries) {
  return entries.sort((a, b) => {
    if (a.isDirectory === b.isDirectory) return a.name.localeCompare(b.name)
    return a.isDirectory ? -1 : 1
  })
}

function normalizeRemoteError(error, profile) {
  if (!error) return error
  const message = String(error.message || error)
  const protocolLabel = String(profile?.protocol || '').toUpperCase() || 'REMOTE'

  if (/before handshake/i.test(message) || /Client network socket disconnected before secure TLS connection was established/i.test(message)) {
    return new Error(
      `${protocolLabel} connection failed before the server handshake completed. Check host, port, and protocol selection. If this server expects plain FTP, use FTP. If it expects TLS on connect, try FTPS and verify whether the server requires implicit FTPS.`
    )
  }

  if (/ECONNREFUSED|ETIMEDOUT|ENOTFOUND|EHOSTUNREACH|ENETUNREACH/i.test(message)) {
    return new Error(`${protocolLabel} connection failed: ${message}. Verify the host, port, and firewall/network access.`)
  }

  return error
}

class RemoteConnectionManager {
  constructor(options = {}) {
    this.connections = new Map()
    this.nextConnectionId = 1
    this.getProfiles = options.getProfiles || (() => [])
    this.setProfiles = options.setProfiles || (() => {})
    this.getSecret = options.getSecret || (async () => null)
    this.setSecret = options.setSecret || (async () => {})
    this.deleteSecret = options.deleteSecret || (async () => {})
    this.ensureSecretStorage = options.ensureSecretStorage || (() => {})
  }

  listProfiles() {
    const profiles = this.getProfiles() || []
    return [...profiles].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  }

  async saveProfile(input) {
    const profile = this.#sanitizeProfile(input)
    if (!profile.id) {
      profile.id = `remote-profile-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      profile.createdAt = nowIso()
    }

    const profiles = this.getProfiles() || []
    const existingIndex = profiles.findIndex(item => item.id === profile.id)
    const existing = existingIndex >= 0 ? profiles[existingIndex] : null

    const shouldSaveSecret = !!input?.saveSecret
    const secretPayload = this.#sanitizeSecretPayload(input?.secret || {})

    if (shouldSaveSecret) {
      this.ensureSecretStorage()
      await this.setSecret(profile.id, secretPayload)
    } else if (input?.clearSavedSecret) {
      await this.deleteSecret(profile.id)
    }

    const merged = {
      ...(existing || {}),
      ...profile,
      updatedAt: nowIso(),
    }

    if (existingIndex >= 0) profiles.splice(existingIndex, 1, merged)
    else profiles.push(merged)
    this.setProfiles(profiles)
    return merged
  }

  async deleteProfile(profileId) {
    if (!profileId) return { ok: true }
    const profiles = this.getProfiles() || []
    const nextProfiles = profiles.filter(item => item.id !== profileId)
    this.setProfiles(nextProfiles)
    await this.deleteSecret(profileId).catch(() => {})

    const activeConnectionIds = [...this.connections.entries()]
      .filter(([, value]) => value.profile?.id === profileId)
      .map(([connectionId]) => connectionId)

    for (const connectionId of activeConnectionIds) {
      await this.disconnect(connectionId).catch(() => {})
    }

    return { ok: true }
  }

  getConnection(connectionId) {
    const connection = this.connections.get(connectionId)
    if (!connection) {
      const error = new Error('Remote connection not found')
      error.code = 'CONNECTION_NOT_FOUND'
      throw error
    }
    return connection
  }

  async connect(profileId, secretInput = {}) {
    const profile = this.listProfiles().find(item => item.id === profileId)
    if (!profile) {
      const error = new Error('Remote profile not found')
      error.code = 'PROFILE_NOT_FOUND'
      throw error
    }

    const storedSecret = await this.getSecret(profile.id).catch(() => null)
    const secret = {
      ...(storedSecret || {}),
      ...(secretInput || {}),
    }

    const connectionId = `remote-${this.nextConnectionId++}`
    let instance
    let rootPath = ensurePosixPath(profile.remoteRoot || '/')

    if (profile.protocol === 'sftp') {
      instance = await this.#connectSftp(profile, secret)
    } else {
      instance = await this.#connectFtp(profile, secret)
      rootPath = await this.#resolveFtpRoot(profile, instance)
    }

    this.connections.set(connectionId, {
      connectionId,
      protocol: profile.protocol,
      profile,
      instance,
      connectedAt: nowIso(),
    })

    return {
      connectionId,
      protocol: profile.protocol,
      profileId: profile.id,
      name: profile.name,
      host: profile.host,
      port: profile.port,
      username: profile.username,
      rootPath,
      authType: profile.authType,
      keyPath: profile.privateKeyPath || '',
    }
  }

  async testConnection(input = {}) {
    const profile = this.#sanitizeProfile(input)
    const secret = this.#sanitizeSecretPayload(input?.secret || {})

    let instance
    let rootPath = ensurePosixPath(profile.remoteRoot || '/')

    try {
      if (profile.protocol === 'sftp') {
        instance = await this.#connectSftp(profile, secret)
        await this.#validateSftpRoot(profile, instance)
      } else {
        instance = await this.#connectFtp(profile, secret)
        rootPath = await this.#resolveFtpRoot(profile, instance)
        await instance.list(rootPath)
      }

      return {
        ok: true,
        protocol: profile.protocol,
        host: profile.host,
        port: profile.port,
        username: profile.username,
        rootPath,
      }
    } finally {
      if (instance) {
        if (profile.protocol === 'sftp') {
          await instance.end().catch(() => {})
        } else {
          instance.close()
        }
      }
    }
  }

  async disconnect(connectionId) {
    const connection = this.connections.get(connectionId)
    if (!connection) return { ok: true }

    if (this.portForwards) {
      const keys = [...this.portForwards.keys()].filter(k => k.startsWith(`${connectionId}:`))
      for (const key of keys) {
        const fwd = this.portForwards.get(key)
        if (fwd) await new Promise(resolve => fwd.server.close(resolve)).catch(() => {})
        this.portForwards.delete(key)
      }
    }

    try {
      if (connection.protocol === 'sftp') {
        await connection.instance.end().catch(() => {})
      } else {
        connection.instance.close()
      }
    } finally {
      this.connections.delete(connectionId)
    }

    return { ok: true }
  }

  async disconnectAll() {
    const ids = [...this.connections.keys()]
    for (const id of ids) {
      await this.disconnect(id).catch(() => {})
    }
  }

  async list(connectionId, remotePath) {
    const connection = this.getConnection(connectionId)
    const targetPath = ensurePosixPath(remotePath || connection.profile.remoteRoot || '/')

    let entries = []
    if (connection.protocol === 'sftp') {
      const list = await connection.instance.list(targetPath)
      entries = list.map(item => {
        const itemPath = ensurePosixPath(path.posix.join(targetPath, item.name))
        const modifiedAt = Number.isFinite(item.modifyTime) ? item.modifyTime : null
        const stat = {
          size: Number.isFinite(item.size) ? item.size : 0,
          modifiedAt: modifiedAt || 0,
        }
        return {
          name: item.name,
          isDirectory: item.type === 'd',
          path: itemPath,
          parentPath: dirnamePosix(itemPath),
          size: stat.size,
          modifiedAt,
          version: makeVersion(stat),
        }
      })
    } else {
      const list = await connection.instance.list(targetPath)
      entries = list.map(item => {
        const itemPath = ensurePosixPath(path.posix.join(targetPath, item.name))
        const modifiedAt = item.modifiedAt ? item.modifiedAt.getTime() : null
        const stat = {
          size: Number.isFinite(item.size) ? item.size : 0,
          modifiedAt: modifiedAt || 0,
        }
        return {
          name: item.name,
          isDirectory: !!item.isDirectory,
          path: itemPath,
          parentPath: dirnamePosix(itemPath),
          size: stat.size,
          modifiedAt,
          version: makeVersion(stat),
        }
      })
    }

    return sortEntries(entries)
  }

  async stat(connectionId, remotePath) {
    const connection = this.getConnection(connectionId)
    const targetPath = ensurePosixPath(remotePath)
    if (connection.protocol === 'sftp') {
      const stat = await connection.instance.stat(targetPath)
      const modifiedAt = Number.isFinite(stat.modifyTime) ? stat.modifyTime : 0
      const size = Number.isFinite(stat.size) ? stat.size : 0
      return {
        path: targetPath,
        isDirectory: stat.isDirectory,
        size,
        modifiedAt,
        version: makeVersion({ size, modifiedAt }),
      }
    }

    let size = 0
    let modifiedAt = 0
    let isDirectory = false
    try {
      const parentPath = dirnamePosix(targetPath)
      const name = basenamePosix(targetPath)
      const siblings = await connection.instance.list(parentPath)
      const match = siblings.find(item => item.name === name)
      if (match) {
        size = Number.isFinite(match.size) ? match.size : 0
        modifiedAt = match.modifiedAt ? match.modifiedAt.getTime() : 0
        isDirectory = !!match.isDirectory
      }
    } catch {
      // Fallback through size/lastMod below
    }

    if (!isDirectory) {
      try {
        size = await connection.instance.size(targetPath)
      } catch {}
      try {
        const lastMod = await connection.instance.lastMod(targetPath)
        modifiedAt = lastMod ? lastMod.getTime() : modifiedAt
      } catch {}
    }

    return {
      path: targetPath,
      isDirectory,
      size,
      modifiedAt,
      version: makeVersion({ size, modifiedAt }),
    }
  }

  async readFile(connectionId, remotePath) {
    const connection = this.getConnection(connectionId)
    const targetPath = ensurePosixPath(remotePath)

    let buffer
    if (connection.protocol === 'sftp') {
      const data = await connection.instance.get(targetPath)
      buffer = Buffer.isBuffer(data) ? data : Buffer.from(data || '')
    } else {
      const chunks = []
      const writable = new Writable({
        write(chunk, enc, cb) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, enc))
          cb()
        },
      })
      await connection.instance.downloadTo(writable, targetPath)
      buffer = Buffer.concat(chunks)
    }

    const stat = await this.stat(connectionId, targetPath)
    return {
      path: targetPath,
      buffer,
      version: stat.version,
      modifiedAt: stat.modifiedAt,
      size: stat.size,
    }
  }

  async writeFile(connectionId, remotePath, contentBuffer, expectedVersion) {
    const connection = this.getConnection(connectionId)
    const targetPath = ensurePosixPath(remotePath)
    const payload = Buffer.isBuffer(contentBuffer) ? contentBuffer : Buffer.from(contentBuffer || '')

    if (expectedVersion) {
      try {
        const current = await this.stat(connectionId, targetPath)
        if (current?.version && current.version !== expectedVersion) {
          const error = new Error('Remote file was modified on the server')
          error.code = 'VERSION_CONFLICT'
          error.currentVersion = current.version
          throw error
        }
      } catch (error) {
        if (error?.code === 'VERSION_CONFLICT') throw error
      }
    }

    if (connection.protocol === 'sftp') {
      await connection.instance.put(payload, targetPath)
    } else {
      const readable = Readable.from(payload)
      await connection.instance.uploadFrom(readable, targetPath)
    }

    const nextStat = await this.stat(connectionId, targetPath)
    return {
      ok: true,
      path: targetPath,
      version: nextStat.version,
      modifiedAt: nextStat.modifiedAt,
      size: nextStat.size,
    }
  }

  async move(connectionId, fromPath, toPath) {
    const connection = this.getConnection(connectionId)
    const source = ensurePosixPath(fromPath)
    const destination = ensurePosixPath(toPath)

    if (connection.protocol === 'sftp') {
      await connection.instance.rename(source, destination)
    } else {
      await connection.instance.rename(source, destination)
    }

    return { ok: true, fromPath: source, toPath: destination }
  }

  async mkdir(connectionId, remotePath) {
    const connection = this.getConnection(connectionId)
    const targetPath = ensurePosixPath(remotePath)

    if (connection.protocol === 'sftp') {
      await connection.instance.mkdir(targetPath, true)
    } else {
      await connection.instance.ensureDir(targetPath)
    }

    return { ok: true, path: targetPath }
  }

  getSshTerminalDescriptor(connectionId, cwd = '') {
    const connection = this.getConnection(connectionId)
    if (connection.protocol !== 'sftp') {
      const error = new Error('SSH terminal is only available for SFTP/SSH connections')
      error.code = 'SSH_NOT_SUPPORTED'
      throw error
    }

    const shell = `ssh:${connectionId}`
    const rootPath = ensurePosixPath(connection.profile.remoteRoot || '/')
    return {
      shell,
      cwd: ensurePosixPath(cwd || rootPath),
      title: `SSH • ${connection.profile.username || 'user'}@${connection.profile.host}`,
    }
  }

  resolveSshLaunch(shellToken, cwd = '') {
    const connectionId = String(shellToken || '').slice(4)
    const connection = this.getConnection(connectionId)
    const profile = connection.profile
    if (connection.protocol !== 'sftp') {
      const error = new Error('SSH launch is only available for SFTP/SSH connections')
      error.code = 'SSH_NOT_SUPPORTED'
      throw error
    }

    const args = ['-t']
    if (profile.port) args.push('-p', String(profile.port))
    if (profile.privateKeyPath) args.push('-i', profile.privateKeyPath)
    const userHost = profile.username ? `${profile.username}@${profile.host}` : profile.host
    args.push(userHost)

    const remoteDir = ensurePosixPath(cwd || profile.remoteRoot || '/')
    if (remoteDir && remoteDir !== '/') {
      args.push(`cd ${this.#shellQuote(remoteDir)} && exec $SHELL -l`)
    }

    return {
      file: 'ssh',
      args,
      shellKey: 'ssh',
      connectionId,
    }
  }

  async #buildSshOptions(profile, secret) {
    const keepAliveInterval = Number.isInteger(profile.keepAliveInterval) && profile.keepAliveInterval > 0
      ? profile.keepAliveInterval * 1000
      : 15000

    const options = {
      host: profile.host,
      port: profile.port || 22,
      username: profile.username,
      readyTimeout: 30000,
      keepaliveInterval: keepAliveInterval,
      keepaliveCountMax: profile.keepAliveCountMax || 3,
    }

    if (profile.authType === 'privateKey') {
      if (!profile.privateKeyPath) {
        const error = new Error('Private key path is required')
        error.code = 'KEY_PATH_REQUIRED'
        throw error
      }
      options.privateKey = await fs.readFile(profile.privateKeyPath)
      if (secret.passphrase) options.passphrase = secret.passphrase
    } else {
      if (!secret.password) {
        const error = new Error('Password is required for this profile')
        error.code = 'SECRET_REQUIRED'
        error.secretType = 'password'
        throw error
      }
      options.password = secret.password
    }

    if (profile.proxyHost) {
      options.sock = await this.#openProxySocket(profile, secret)
    }

    return options
  }

  async #openProxySocket(profile, secret) {
    return new Promise((resolve, reject) => {
      const proxy = new Ssh2Client()
      const proxyPort = profile.proxyPort || 22
      proxy.on('ready', () => {
        proxy.forwardOut('127.0.0.1', 0, profile.host, profile.port || 22, (err, stream) => {
          if (err) { proxy.end(); return reject(err) }
          stream.on('close', () => proxy.end())
          resolve(stream)
        })
      })
      proxy.on('error', reject)
      const proxyOpts = {
        host: profile.proxyHost,
        port: proxyPort,
        username: profile.proxyUsername || profile.username,
        readyTimeout: 15000,
      }
      if (profile.proxyAuthType === 'privateKey' && profile.proxyKeyPath) {
        fs.readFile(profile.proxyKeyPath).then(key => {
          proxyOpts.privateKey = key
          if (secret.proxyPassphrase) proxyOpts.passphrase = secret.proxyPassphrase
          proxy.connect(proxyOpts)
        }).catch(reject)
      } else {
        proxyOpts.password = secret.proxyPassword || secret.password
        proxy.connect(proxyOpts)
      }
    })
  }

  async #connectSftp(profile, secret) {
    const client = new SftpClient()
    const options = await this.#buildSshOptions(profile, secret)

    try {
      await client.connect(options)
      return client
    } catch (error) {
      await client.end().catch(() => {})
      throw normalizeRemoteError(error, profile)
    }
  }

  async startPortForward(connectionId, { localPort, remoteHost, remotePort, type = 'local' }) {
    const net = require('net')
    const connection = this.getConnection(connectionId)
    if (connection.protocol !== 'sftp') {
      const error = new Error('Port forwarding is only supported for SFTP/SSH connections')
      error.code = 'PROTOCOL_NOT_SUPPORTED'
      throw error
    }

    const forwardKey = `${connectionId}:${localPort}`
    if (this.portForwards?.has(forwardKey)) {
      const error = new Error(`Local port ${localPort} is already forwarded`)
      error.code = 'PORT_ALREADY_FORWARDED'
      throw error
    }

    if (!this.portForwards) this.portForwards = new Map()

    // ssh2-sftp-client exposes the underlying ssh2.Client as .client
    const ssh = connection.instance.client
    if (!ssh) {
      const error = new Error('Underlying SSH connection is not available for port forwarding')
      error.code = 'SSH_CLIENT_UNAVAILABLE'
      throw error
    }
    const server = net.createServer(socket => {
      ssh.forwardOut('127.0.0.1', localPort, remoteHost, remotePort, (err, stream) => {
        if (err) { socket.destroy(); return }
        socket.pipe(stream)
        stream.pipe(socket)
        stream.on('close', () => socket.destroy())
        socket.on('close', () => stream.destroy())
        socket.on('error', () => stream.destroy())
        stream.on('error', () => socket.destroy())
      })
    })

    await new Promise((resolve, reject) => {
      server.once('error', reject)
      server.listen(localPort, '127.0.0.1', resolve)
    })

    this.portForwards.set(forwardKey, { server, connectionId, localPort, remoteHost, remotePort, type, startedAt: nowIso() })
    return { ok: true, localPort, remoteHost, remotePort }
  }

  async stopPortForward(connectionId, localPort) {
    const forwardKey = `${connectionId}:${localPort}`
    const forward = this.portForwards?.get(forwardKey)
    if (!forward) return { ok: true }
    await new Promise(resolve => forward.server.close(resolve))
    this.portForwards.delete(forwardKey)
    return { ok: true }
  }

  listPortForwards(connectionId) {
    if (!this.portForwards) return []
    return [...this.portForwards.values()]
      .filter(f => f.connectionId === connectionId)
      .map(({ localPort, remoteHost, remotePort, type, startedAt }) => ({ localPort, remoteHost, remotePort, type, startedAt }))
  }

  async #connectFtp(profile, secret) {
    if (!secret.password) {
      const error = new Error('Password is required for this profile')
      error.code = 'SECRET_REQUIRED'
      error.secretType = 'password'
      throw error
    }

    const client = new ftp.Client(30000)
    client.ftp.verbose = false

    try {
      await client.access({
        host: profile.host,
        port: profile.port || 21,
        user: profile.username,
        password: secret.password,
        secure: profile.protocol === 'ftps',
        secureOptions: profile.protocol === 'ftps' ? { rejectUnauthorized: false } : undefined,
      })
      return client
    } catch (error) {
      client.close()
      throw normalizeRemoteError(error, profile)
    }
  }

  async #resolveFtpRoot(profile, client) {
    const configuredRoot = String(profile.remoteRoot || '').trim()

    if (configuredRoot && configuredRoot !== '/') {
      await client.cd(configuredRoot)
      const activeRoot = await client.pwd().catch(() => configuredRoot)
      return ensurePosixPath(activeRoot || configuredRoot)
    }

    const serverRoot = await client.pwd().catch(() => '/')
    return ensurePosixPath(serverRoot || '/')
  }

  async #validateSftpRoot(profile, client) {
    const targetRoot = ensurePosixPath(profile.remoteRoot || '/')
    await client.list(targetRoot)
    return targetRoot
  }

  #sanitizeSecretPayload(input = {}) {
    const password = input.password ? String(input.password) : ''
    const passphrase = input.passphrase ? String(input.passphrase) : ''
    if (password.length > 4096 || passphrase.length > 4096) {
      const error = new Error('Secret value is too large')
      error.code = 'REMOTE_SECRET_TOO_LARGE'
      throw error
    }
    return {
      password,
      passphrase,
    }
  }

  #sanitizeProfile(input = {}) {
    const protocol = ['sftp', 'ftp', 'ftps'].includes(input.protocol) ? input.protocol : 'sftp'
    const authType = protocol === 'sftp' && input.authType === 'privateKey' ? 'privateKey' : 'password'
    const host = boundedString(input.host, 'Host')
    const username = boundedString(input.username, 'Username')
    const name = boundedString(input.name || `${username}@${host}`, 'Profile name', { max: 120 })
    const remoteRoot = ensurePosixPath(boundedString(input.remoteRoot || '/', 'Default remote root', { max: 1024 }))
    const rawPort = Number(input.port)
    const port = Number.isInteger(rawPort) && rawPort >= 1 && rawPort <= 65535
      ? rawPort
      : (protocol === 'sftp' ? 22 : 21)
    const privateKeyPath = authType === 'privateKey'
      ? path.resolve(boundedString(input.privateKeyPath, 'Private key path', { max: 1024 }))
      : ''

    const rawKeepAlive = Number(input.keepAliveInterval)
    const keepAliveInterval = Number.isInteger(rawKeepAlive) && rawKeepAlive >= 0 ? rawKeepAlive : 15

    const group = input.group ? boundedString(input.group, 'Group', { max: 80, allowEmpty: true }) : ''
    const notes = input.notes ? boundedString(input.notes, 'Notes', { max: 2048, allowEmpty: true }) : ''

    const proxyHost = input.proxyHost ? boundedString(input.proxyHost, 'Proxy host', { max: 255, allowEmpty: true }) : ''
    const rawProxyPort = Number(input.proxyPort)
    const proxyPort = Number.isInteger(rawProxyPort) && rawProxyPort >= 1 && rawProxyPort <= 65535 ? rawProxyPort : 22
    const proxyUsername = input.proxyUsername ? boundedString(input.proxyUsername, 'Proxy username', { max: 128, allowEmpty: true }) : ''
    const proxyAuthType = input.proxyAuthType === 'privateKey' ? 'privateKey' : 'password'
    const proxyKeyPath = proxyAuthType === 'privateKey' && input.proxyKeyPath
      ? path.resolve(boundedString(input.proxyKeyPath, 'Proxy key path', { max: 1024 }))
      : ''

    return {
      id: input.id ? boundedString(input.id, 'Profile id', { max: 160 }) : '',
      name,
      protocol,
      host,
      port,
      username,
      authType,
      remoteRoot,
      privateKeyPath,
      keepAliveInterval,
      keepAliveCountMax: 3,
      group,
      notes,
      proxyHost,
      proxyPort,
      proxyUsername,
      proxyAuthType,
      proxyKeyPath,
      createdAt: input.createdAt || nowIso(),
    }
  }

  #shellQuote(value) {
    return `'${String(value).replace(/'/g, `'\\''`)}'`
  }
}

module.exports = { RemoteConnectionManager }
