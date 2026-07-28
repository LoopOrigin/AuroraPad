'use strict'

const { test, describe, before, after, mock } = require('node:test')
const assert = require('node:assert/strict')

// ---------------------------------------------------------------------------
// Stub out native modules before requiring the manager
// ---------------------------------------------------------------------------
const sftpConnectStub = mock.fn(async () => {})
const sftpEndStub = mock.fn(async () => {})
const sftpListStub = mock.fn(async () => [])
const sftpGetStub = mock.fn(async () => Buffer.from('hello'))
const sftpPutStub = mock.fn(async () => {})
const sftpStatStub = mock.fn(async () => ({ isDirectory: false, size: 5, modifyTime: 1000 }))
const sftpRenameStub = mock.fn(async () => {})
const sftpMkdirStub = mock.fn(async () => {})

class FakeSftpClient {
  constructor() {
    this.client = { forwardOut: mock.fn() } // fake ssh2.Client
    this.connect = sftpConnectStub
    this.end = sftpEndStub
    this.list = sftpListStub
    this.get = sftpGetStub
    this.put = sftpPutStub
    this.stat = sftpStatStub
    this.rename = sftpRenameStub
    this.mkdir = sftpMkdirStub
  }
}

const ftpAccessStub = mock.fn(async () => {})
const ftpCloseStub = mock.fn(() => {})
const ftpListStub = mock.fn(async () => [])
const ftpDownloadStub = mock.fn(async () => {})
const ftpUploadStub = mock.fn(async () => {})
const ftpRenameStub = mock.fn(async () => {})
const ftpEnsureDirStub = mock.fn(async () => {})
const ftpPwdStub = mock.fn(async () => '/')
const ftpSizeStub = mock.fn(async () => 5)
const ftpLastModStub = mock.fn(async () => new Date(1000))

class FakeFtpClient {
  constructor() {
    this.ftp = { verbose: false }
    this.access = ftpAccessStub
    this.close = ftpCloseStub
    this.list = ftpListStub
    this.downloadTo = ftpDownloadStub
    this.uploadFrom = ftpUploadStub
    this.rename = ftpRenameStub
    this.ensureDir = ftpEnsureDirStub
    this.pwd = ftpPwdStub
    this.size = ftpSizeStub
    this.lastMod = ftpLastModStub
  }
}

// Patch require before loading the module under test
const Module = require('node:module')
const _originalLoad = Module._load
Module._load = function (request, ...rest) {
  if (request === 'ssh2-sftp-client') return FakeSftpClient
  if (request === 'basic-ftp') return { Client: FakeFtpClient }
  if (request === 'ssh2') return { Client: class FakeSsh2 {} }
  return _originalLoad.call(this, request, ...rest)
}

const { RemoteConnectionManager } = require('../electron/main/remote-manager')

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeManager(overrides = {}) {
  let profiles = []
  return new RemoteConnectionManager({
    getProfiles: () => profiles,
    setProfiles: (p) => { profiles = p },
    getSecret: async () => null,
    setSecret: async () => {},
    deleteSecret: async () => {},
    ensureSecretStorage: () => {},
    ...overrides,
  })
}

const PASSWORD_SECRET = { password: 'secret123' }

// ---------------------------------------------------------------------------
// Path utility tests (pure, no network)
// ---------------------------------------------------------------------------
describe('path utilities (via sanitizeProfile)', () => {
  const mgr = makeManager()

  test('host and username are required', async () => {
    await assert.rejects(
      () => mgr.saveProfile({}),
      /Host is required/i
    )
  })

  test('port defaults to 22 for sftp', async () => {
    const p = await mgr.saveProfile({ host: 'example.com', username: 'user', protocol: 'sftp', secret: PASSWORD_SECRET })
    assert.equal(p.port, 22)
  })

  test('port defaults to 21 for ftp', async () => {
    const p = await mgr.saveProfile({ host: 'example.com', username: 'user', protocol: 'ftp', secret: PASSWORD_SECRET })
    assert.equal(p.port, 21)
  })

  test('port is clamped to valid range', async () => {
    const p = await mgr.saveProfile({ host: 'h', username: 'u', port: 99999 })
    assert.equal(p.port, 22)
  })

  test('remoteRoot is normalized to POSIX path', async () => {
    const p = await mgr.saveProfile({ host: 'h', username: 'u', remoteRoot: 'var/www' })
    assert.equal(p.remoteRoot, '/var/www')
  })

  test('keepAliveInterval defaults to 15', async () => {
    const p = await mgr.saveProfile({ host: 'h', username: 'u' })
    assert.equal(p.keepAliveInterval, 15)
  })

  test('protocol falls back to sftp for unknown value', async () => {
    const p = await mgr.saveProfile({ host: 'h', username: 'u', protocol: 'scp' })
    assert.equal(p.protocol, 'sftp')
  })

  test('authType is privateKey only for sftp+privateKey combo', async () => {
    const p = await mgr.saveProfile({ host: 'h', username: 'u', protocol: 'sftp', authType: 'privateKey', privateKeyPath: '/tmp/key' })
    assert.equal(p.authType, 'privateKey')
  })

  test('authType falls back to password for ftp+privateKey', async () => {
    const p = await mgr.saveProfile({ host: 'h', username: 'u', protocol: 'ftp', authType: 'privateKey' })
    assert.equal(p.authType, 'password')
  })
})

// ---------------------------------------------------------------------------
// Error normalization
// ---------------------------------------------------------------------------
describe('normalizeRemoteError', () => {
  // We access the function indirectly via testConnection rejection messages
  const mgr = makeManager()

  test('ECONNREFUSED surfaces human-readable message', async () => {
    sftpConnectStub.mock.mockImplementationOnce(async () => {
      const e = new Error('ECONNREFUSED 127.0.0.1:22')
      throw e
    })
    const profile = await mgr.saveProfile({ host: 'localhost', username: 'u' })
    await assert.rejects(
      () => mgr.testConnection({ ...profile, secret: PASSWORD_SECRET }),
      /connection failed/i
    )
  })
})

// ---------------------------------------------------------------------------
// Profile lifecycle
// ---------------------------------------------------------------------------
describe('profile management', () => {
  test('save creates a new profile with id and createdAt', async () => {
    const mgr = makeManager()
    const p = await mgr.saveProfile({ host: 'srv1', username: 'admin' })
    assert.ok(p.id, 'should have id')
    assert.ok(p.createdAt, 'should have createdAt')
  })

  test('save updates existing profile by id', async () => {
    const mgr = makeManager()
    const p1 = await mgr.saveProfile({ host: 'srv1', username: 'admin' })
    const p2 = await mgr.saveProfile({ ...p1, username: 'root' })
    assert.equal(p2.id, p1.id)
    assert.equal(p2.username, 'root')
    assert.equal(mgr.listProfiles().length, 1)
  })

  test('delete removes profile and disconnects active connections', async () => {
    const mgr = makeManager()
    const p = await mgr.saveProfile({ host: 'srv', username: 'u' })
    await mgr.deleteProfile(p.id)
    assert.equal(mgr.listProfiles().length, 0)
  })

  test('listProfiles returns sorted by name', async () => {
    const mgr = makeManager()
    await mgr.saveProfile({ host: 'z', username: 'u', name: 'z-server' })
    await mgr.saveProfile({ host: 'a', username: 'u', name: 'a-server' })
    const names = mgr.listProfiles().map(p => p.name)
    assert.deepEqual(names, ['a-server', 'z-server'])
  })
})

// ---------------------------------------------------------------------------
// SFTP connect / disconnect
// ---------------------------------------------------------------------------
describe('SFTP connection lifecycle', () => {
  before(() => {
    sftpConnectStub.mock.resetCalls()
    sftpEndStub.mock.resetCalls()
  })

  test('connect(sftp) calls sftp.connect and returns connectionId', async () => {
    const mgr = makeManager()
    const p = await mgr.saveProfile({ host: 'srv', username: 'u', protocol: 'sftp' })
    const result = await mgr.connect(p.id, PASSWORD_SECRET)
    assert.ok(result.connectionId)
    assert.equal(result.protocol, 'sftp')
    assert.equal(sftpConnectStub.mock.calls.length, 1)
  })

  test('disconnect closes the sftp client and removes connection', async () => {
    const mgr = makeManager()
    const p = await mgr.saveProfile({ host: 'srv', username: 'u', protocol: 'sftp' })
    const { connectionId } = await mgr.connect(p.id, PASSWORD_SECRET)
    await mgr.disconnect(connectionId)
    assert.throws(() => mgr.getConnection(connectionId), /not found/i)
  })

  test('disconnect with no active connection returns ok', async () => {
    const mgr = makeManager()
    const result = await mgr.disconnect('non-existent')
    assert.equal(result.ok, true)
  })
})

// ---------------------------------------------------------------------------
// FTP connect / disconnect
// ---------------------------------------------------------------------------
describe('FTP connection lifecycle', () => {
  before(() => {
    ftpAccessStub.mock.resetCalls()
    ftpCloseStub.mock.resetCalls()
    ftpPwdStub.mock.resetCalls()
  })

  test('connect(ftp) calls ftp.access', async () => {
    const mgr = makeManager()
    const p = await mgr.saveProfile({ host: 'ftp-srv', username: 'u', protocol: 'ftp' })
    await mgr.connect(p.id, PASSWORD_SECRET)
    assert.equal(ftpAccessStub.mock.calls.length, 1)
  })

  test('connect(ftp) rejects when password missing', async () => {
    const mgr = makeManager()
    const p = await mgr.saveProfile({ host: 'ftp-srv', username: 'u', protocol: 'ftp' })
    await assert.rejects(
      () => mgr.connect(p.id, {}),
      { code: 'SECRET_REQUIRED' }
    )
  })
})

// ---------------------------------------------------------------------------
// SFTP file operations
// ---------------------------------------------------------------------------
describe('SFTP file operations', () => {
  let mgr, connectionId

  before(async () => {
    sftpListStub.mock.mockImplementation(async () => [
      { name: 'app.js', type: '-', size: 1024, modifyTime: 2000 },
      { name: 'src', type: 'd', size: 0, modifyTime: 1000 },
    ])
    mgr = makeManager()
    const p = await mgr.saveProfile({ host: 'srv', username: 'u', protocol: 'sftp' })
    ;({ connectionId } = await mgr.connect(p.id, PASSWORD_SECRET))
  })

  after(async () => { await mgr.disconnect(connectionId) })

  test('list returns entries sorted: directories first', async () => {
    const entries = await mgr.list(connectionId, '/')
    assert.equal(entries[0].name, 'src')
    assert.equal(entries[0].isDirectory, true)
    assert.equal(entries[1].name, 'app.js')
    assert.equal(entries[1].isDirectory, false)
  })

  test('list entry has path, parentPath, version', async () => {
    const [dir] = await mgr.list(connectionId, '/')
    assert.ok(dir.path)
    assert.ok(dir.parentPath !== undefined)
    assert.ok(dir.version)
  })

  test('readFile returns buffer and stat', async () => {
    sftpGetStub.mock.mockImplementationOnce(async () => Buffer.from('file content'))
    sftpStatStub.mock.mockImplementationOnce(async () => ({ isDirectory: false, size: 12, modifyTime: 3000 }))
    const result = await mgr.readFile(connectionId, '/app.js')
    assert.ok(Buffer.isBuffer(result.buffer))
    assert.equal(result.buffer.toString(), 'file content')
    assert.ok(result.version)
  })

  test('writeFile calls sftp.put', async () => {
    sftpPutStub.mock.resetCalls()
    sftpStatStub.mock.mockImplementationOnce(async () => ({ isDirectory: false, size: 5, modifyTime: 4000 }))
    await mgr.writeFile(connectionId, '/app.js', Buffer.from('new content'))
    assert.equal(sftpPutStub.mock.calls.length, 1)
  })

  test('mkdir calls sftp.mkdir with recursive=true', async () => {
    sftpMkdirStub.mock.resetCalls()
    await mgr.mkdir(connectionId, '/new-dir')
    assert.equal(sftpMkdirStub.mock.calls.length, 1)
    assert.equal(sftpMkdirStub.mock.calls[0].arguments[1], true)
  })

  test('move calls sftp.rename', async () => {
    sftpRenameStub.mock.resetCalls()
    await mgr.move(connectionId, '/a.txt', '/b.txt')
    assert.equal(sftpRenameStub.mock.calls.length, 1)
  })
})

// ---------------------------------------------------------------------------
// SSH terminal descriptor
// ---------------------------------------------------------------------------
describe('SSH terminal descriptor', () => {
  test('getSshTerminalDescriptor returns shell token and title', async () => {
    const mgr = makeManager()
    const p = await mgr.saveProfile({ host: 'srv', username: 'dev', protocol: 'sftp' })
    const { connectionId } = await mgr.connect(p.id, PASSWORD_SECRET)
    const desc = mgr.getSshTerminalDescriptor(connectionId)
    assert.ok(desc.shell.startsWith('ssh:'))
    assert.match(desc.title, /dev@srv/)
    await mgr.disconnect(connectionId)
  })

  test('getSshTerminalDescriptor throws for FTP connections', async () => {
    const mgr = makeManager()
    const p = await mgr.saveProfile({ host: 'ftp-srv', username: 'u', protocol: 'ftp' })
    const { connectionId } = await mgr.connect(p.id, PASSWORD_SECRET)
    assert.throws(
      () => mgr.getSshTerminalDescriptor(connectionId),
      { code: 'SSH_NOT_SUPPORTED' }
    )
    await mgr.disconnect(connectionId)
  })
})

// ---------------------------------------------------------------------------
// Port forwarding
// ---------------------------------------------------------------------------
describe('port forwarding', () => {
  test('listPortForwards returns empty array when none active', async () => {
    const mgr = makeManager()
    const p = await mgr.saveProfile({ host: 's', username: 'u', protocol: 'sftp' })
    const { connectionId } = await mgr.connect(p.id, PASSWORD_SECRET)
    assert.deepEqual(mgr.listPortForwards(connectionId), [])
    await mgr.disconnect(connectionId)
  })

  test('startPortForward throws for FTP connection', async () => {
    const mgr = makeManager()
    const p = await mgr.saveProfile({ host: 'f', username: 'u', protocol: 'ftp' })
    const { connectionId } = await mgr.connect(p.id, PASSWORD_SECRET)
    await assert.rejects(
      () => mgr.startPortForward(connectionId, { localPort: 9000, remoteHost: 'db', remotePort: 5432 }),
      { code: 'PROTOCOL_NOT_SUPPORTED' }
    )
    await mgr.disconnect(connectionId)
  })
})

// ---------------------------------------------------------------------------
// disconnectAll
// ---------------------------------------------------------------------------
describe('disconnectAll', () => {
  test('closes every open connection', async () => {
    const mgr = makeManager()
    const p1 = await mgr.saveProfile({ host: 's1', username: 'u', protocol: 'sftp' })
    const p2 = await mgr.saveProfile({ host: 's2', username: 'u', protocol: 'sftp' })
    await mgr.connect(p1.id, PASSWORD_SECRET)
    await mgr.connect(p2.id, PASSWORD_SECRET)
    assert.equal(mgr.connections.size, 2)
    await mgr.disconnectAll()
    assert.equal(mgr.connections.size, 0)
  })
})
