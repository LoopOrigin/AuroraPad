const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron')

// Ensure the app consistently identifies as AuroraPad across platforms
// Setting this early helps with macOS dock name and app menu
app.name = 'AuroraPad'
app.setName('AuroraPad')
if (process.platform === 'win32') {
  app.setAppUserModelId('com.aurorapad.app')
}

const path = require('path')
const fs = require('fs').promises
const fsSync = require('fs')
const Store = require('electron-store')
const chokidar = require('chokidar')
const iconv = require('iconv-lite')
const jschardet = require('jschardet')
const pty = require('node-pty')
const { RemoteConnectionManager } = require('./remote-manager')

const store = new Store()
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged
const shouldOpenDevTools = process.env.AURORAPAD_OPEN_DEVTOOLS === '1'
const REMOTE_KEYCHAIN_SERVICE = 'AuroraPad.RemoteProfiles'
let keytar = null

try {
  keytar = require('keytar')
} catch {
  keytar = null
}

let mainWindow = null
let watchers = new Map()
let terminals = new Map()
let nextTerminalId = 1

function hasKeychainSupport() {
  return !!keytar && typeof keytar.getPassword === 'function'
}

function ensureKeychainSupport() {
  if (!hasKeychainSupport()) {
    const err = new Error('OS keychain is not available on this machine')
    err.code = 'KEYCHAIN_UNAVAILABLE'
    throw err
  }
}

async function getRemoteSecret(profileId) {
  if (!hasKeychainSupport()) return null
  const raw = await keytar.getPassword(REMOTE_KEYCHAIN_SERVICE, `profile:${profileId}`)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

async function setRemoteSecret(profileId, secret) {
  ensureKeychainSupport()
  const payload = JSON.stringify(secret || {})
  await keytar.setPassword(REMOTE_KEYCHAIN_SERVICE, `profile:${profileId}`, payload)
}

async function deleteRemoteSecret(profileId) {
  if (!hasKeychainSupport()) return false
  return keytar.deletePassword(REMOTE_KEYCHAIN_SERVICE, `profile:${profileId}`)
}

const remoteManager = new RemoteConnectionManager({
  getProfiles: () => store.get('remoteProfiles', []),
  setProfiles: (profiles) => store.set('remoteProfiles', profiles),
  getSecret: getRemoteSecret,
  setSecret: setRemoteSecret,
  deleteSecret: deleteRemoteSecret,
  ensureSecretStorage: ensureKeychainSupport,
})

function getPlatformInfo() {
  const isWindows = process.platform === 'win32'
  const isMac = process.platform === 'darwin'
  const isLinux = process.platform === 'linux'
  const defaultShellPath = process.env.SHELL || (isMac ? '/bin/zsh' : isWindows ? (process.env.COMSPEC || 'C:\\Windows\\System32\\cmd.exe') : '/bin/bash')
  const terminalProfiles = [
    {
      id: 'default',
      label: isWindows ? 'Command Prompt' : path.basename(defaultShellPath),
      available: true,
      accent: 'default',
    },
  ]

  if (isWindows) {
    const powerShellPath = process.env.POWERSHELL_EXE || 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe'
    terminalProfiles.push({
      id: 'powershell',
      label: 'PowerShell',
      available: fsSync.existsSync(powerShellPath),
      accent: 'powershell',
    })
    terminalProfiles.push({
      id: 'bash',
      label: 'Git Bash',
      available: fsSync.existsSync('C:\\Program Files\\Git\\bin\\bash.exe'),
      accent: 'bash',
    })
    terminalProfiles.push({
      id: 'wsl',
      label: 'WSL',
      available: true,
      accent: 'wsl',
    })
  }

  return {
    platform: process.platform,
    isWindows,
    isMac,
    isLinux,
    revealInFolderLabel: isMac ? 'Finder' : isWindows ? 'Explorer' : 'File Manager',
    terminalAppLabel: isWindows ? 'Command Prompt' : 'Terminal',
    defaultShellProfile: 'default',
    terminalProfiles,
  }
}

function resolveTerminalLaunch(shellType = 'default', cwd = '') {
  if (String(shellType).startsWith('ssh:')) {
    return remoteManager.resolveSshLaunch(shellType, cwd)
  }

  const isWindows = process.platform === 'win32'

  if (isWindows) {
    if (shellType === 'powershell') {
      const file = process.env.POWERSHELL_EXE || 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe'
      return fsSync.existsSync(file)
        ? { file, args: ['-NoLogo'], shellKey: 'powershell' }
        : null
    }
    if (shellType === 'bash') {
      const file = 'C:\\Program Files\\Git\\bin\\bash.exe'
      return fsSync.existsSync(file)
        ? { file, args: ['--login', '-i'], shellKey: 'bash' }
        : null
    }
    if (shellType === 'wsl') {
      return { file: 'wsl.exe', args: [], shellKey: 'wsl' }
    }

    return {
      file: process.env.COMSPEC || 'C:\\Windows\\System32\\cmd.exe',
      args: [],
      shellKey: 'default',
    }
  }

  return {
    file: process.env.SHELL || (process.platform === 'darwin' ? '/bin/zsh' : '/bin/bash'),
    args: [],
    shellKey: 'default',
  }
}

function getRecentFiles() {
  return store.get('recentFiles', [])
}

function addRecentFile(filePath) {
  let recent = getRecentFiles().filter(p => p !== filePath)
  recent.unshift(filePath)
  store.set('recentFiles', recent.slice(0, 20))
}

function createWindow() {
  const assetsDir = path.join(__dirname, '../../assets')
  const iconName = process.platform === 'win32' ? 'aurorapad-app-icon.ico' : 'aurorapad-app-icon.png'
  const candidateIcon = path.join(assetsDir, iconName)
  const fallbackPng = path.join(__dirname, '../../src/assets/aurorapad-app-icon.png')
  const appIcon =
    (fsSync.existsSync(candidateIcon) && candidateIcon) ||
    (fsSync.existsSync(fallbackPng) && fallbackPng) ||
    undefined

  mainWindow = new BrowserWindow({
    title: 'AuroraPad',
    width: 1200,
    height: 800,
    minWidth: 600,
    minHeight: 400,
    // Use the branded AuroraPad app icon for the window/taskbar/dock
    icon: appIcon,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
    show: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    if (shouldOpenDevTools) {
      mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.openDevTools()
      })
    }
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => mainWindow.show())
  mainWindow.on('closed', () => { mainWindow = null })
}

function buildMenu(pluginMenuItems = []) {
  const platformInfo = getPlatformInfo()
  const pluginsSubmenu = [
    { label: 'Plugin Manager', click: () => mainWindow?.webContents.send('menu:plugin-manager') },
    { type: 'separator' },
    ...pluginMenuItems.map(item => ({
      label: item.label,
      click: () => mainWindow?.webContents.send('menu:plugin-run', { pluginId: item.pluginId, actionId: item.actionId }),
    })),
  ]
  if (pluginMenuItems.length === 0) {
    pluginsSubmenu.push({ label: 'No plugins loaded', enabled: false })
  }

  // Ensure the app name is correctly labeled on macOS
  const appName = 'AuroraPad'
  app.name = appName // Reinforce app name before template building
  app.setName(appName)

  const template = [
    ...(process.platform === 'darwin'
      ? [
          {
            label: appName,
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              { label: 'Preferences...', accelerator: 'Cmd+,', click: () => mainWindow?.webContents.send('menu:preferences') },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' },
            ],
          },
        ]
      : []),
    {
      label: 'File',
      submenu: [
        { label: 'New', accelerator: 'CmdOrCtrl+N', click: () => mainWindow?.webContents.send('menu:new') },
        { type: 'separator' },
        { label: 'Open File...', accelerator: 'CmdOrCtrl+O', click: () => mainWindow?.webContents.send('menu:open-file') },
        { label: 'Open Folder...', accelerator: 'CmdOrCtrl+Shift+O', click: () => mainWindow?.webContents.send('menu:open-folder') },
        { type: 'separator' },
        { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => mainWindow?.webContents.send('menu:save') },
        { label: 'Save All', accelerator: 'CmdOrCtrl+Shift+S', click: () => mainWindow?.webContents.send('menu:save-all') },
        { label: 'Save As...', accelerator: 'F12', click: () => mainWindow?.webContents.send('menu:save-as') },
        { label: 'Save a Copy As...', click: () => mainWindow?.webContents.send('menu:save-copy-as') },
        { label: 'Rename...', click: () => mainWindow?.webContents.send('menu:rename') },
        { type: 'separator' },
        { label: 'Close Tab', accelerator: 'CmdOrCtrl+W', click: () => mainWindow?.webContents.send('menu:close-tab') },
        { label: 'Close All', click: () => mainWindow?.webContents.send('menu:close-all') },
        { label: 'Close All But Active', click: () => mainWindow?.webContents.send('menu:close-others') },
        { type: 'separator' },
        {
          label: 'Recent Files',
          submenu: [
            ...(getRecentFiles().map(p => ({
              label: p,
              click: () => mainWindow?.webContents.send('menu:open-recent', p),
            })) || []),
            { type: 'separator' },
            { label: 'Open All Recent Files', click: () => mainWindow?.webContents.send('menu:open-all-recent') },
            { label: 'Restore Recently Closed File', click: () => mainWindow?.webContents.send('menu:restore-recent') },
            { label: 'Empty Recent Files List', click: () => mainWindow?.webContents.send('menu:clear-recent') },
          ],
        },
        { type: 'separator' },
        {
          label: 'Open Containing Folder',
          submenu: [
            {
              label: `in ${platformInfo.revealInFolderLabel}`,
              click: () => mainWindow?.webContents.send('menu:open-containing-folder:explorer'),
            },
            {
              label: `in ${platformInfo.terminalAppLabel}`,
              click: () => mainWindow?.webContents.send('menu:open-containing-folder:cmd'),
            },
            { label: 'as Workspace', click: () => mainWindow?.webContents.send('menu:open-containing-folder:faw') },
          ],
        },
        { label: 'Open in Default Viewer', click: () => mainWindow?.webContents.send('menu:open-in-default-viewer') },
        { type: 'separator' },
        { label: 'Reload from Disk', click: () => mainWindow?.webContents.send('menu:reload-from-disk') },
        { type: 'separator' },
        { label: 'Exit', accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4', click: () => app.quit() },
      ],
    },
    {
      label: 'Remote',
      submenu: [
        { label: 'Remote Manager...', click: () => mainWindow?.webContents.send('menu:remote-manager') },
        { label: 'Connect Server...', click: () => mainWindow?.webContents.send('menu:connect-server') },
        { label: 'Disconnect Server', click: () => mainWindow?.webContents.send('menu:disconnect-server') },
        { label: 'Open SSH Terminal', click: () => mainWindow?.webContents.send('menu:open-ssh-terminal') },
        { type: 'separator' },
        { label: 'New SFTP Profile', click: () => mainWindow?.webContents.send('menu:remote-new-sftp') },
        { label: 'New FTP Profile', click: () => mainWindow?.webContents.send('menu:remote-new-ftp') },
        { label: 'New FTPS Profile', click: () => mainWindow?.webContents.send('menu:remote-new-ftps') },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', click: () => mainWindow?.webContents.send('menu:undo') },
        { label: 'Redo', accelerator: 'CmdOrCtrl+Y', click: () => mainWindow?.webContents.send('menu:redo') },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', click: () => mainWindow?.webContents.send('menu:cut') },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', click: () => mainWindow?.webContents.send('menu:copy') },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', click: () => mainWindow?.webContents.send('menu:paste') },
        { type: 'separator' },
        { label: 'Duplicate Line', accelerator: 'CmdOrCtrl+D', click: () => mainWindow?.webContents.send('menu:duplicate-line') },
        { label: 'Delete Line', accelerator: 'CmdOrCtrl+L', click: () => mainWindow?.webContents.send('menu:delete-line') },
        { label: 'Move Line Up', accelerator: 'CmdOrCtrl+Shift+Up', click: () => mainWindow?.webContents.send('menu:move-line-up') },
        { label: 'Move Line Down', accelerator: 'CmdOrCtrl+Shift+Down', click: () => mainWindow?.webContents.send('menu:move-line-down') },
        { label: 'Join Lines', accelerator: 'CmdOrCtrl+J', click: () => mainWindow?.webContents.send('menu:join-lines') },
        { type: 'separator' },
        { label: 'Toggle Comment', accelerator: 'CmdOrCtrl+Q', click: () => mainWindow?.webContents.send('menu:toggle-comment') },
        { type: 'separator' },
        { label: 'Lowercase', accelerator: 'CmdOrCtrl+U', click: () => mainWindow?.webContents.send('menu:lowercase') },
        { label: 'UPPERCASE', accelerator: 'CmdOrCtrl+Shift+U', click: () => mainWindow?.webContents.send('menu:uppercase') },
      ],
    },
    {
      label: 'Search',
      submenu: [
        { label: 'Find', accelerator: 'CmdOrCtrl+F', click: () => mainWindow?.webContents.send('menu:find') },
        { label: 'Replace', accelerator: 'CmdOrCtrl+H', click: () => mainWindow?.webContents.send('menu:replace') },
        { label: 'Find Next', accelerator: 'F3', click: () => mainWindow?.webContents.send('menu:find-next') },
        { label: 'Find Previous', accelerator: 'Shift+F3', click: () => mainWindow?.webContents.send('menu:find-prev') },
        { label: 'Go to Line...', accelerator: 'CmdOrCtrl+G', click: () => mainWindow?.webContents.send('menu:go-to-line') },
        { type: 'separator' },
        { label: 'Find in Files…', accelerator: 'CmdOrCtrl+Shift+F', click: () => mainWindow?.webContents.send('menu:find-in-files') },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Word Wrap', type: 'checkbox', id: 'wordWrap', click: (item) => mainWindow?.webContents.send('menu:word-wrap', item.checked) },
        { label: 'Line Numbers', type: 'checkbox', checked: true, id: 'lineNumbers', click: (item) => mainWindow?.webContents.send('menu:line-numbers', item.checked) },
        { type: 'separator' },
        { label: 'Zoom In', accelerator: 'CmdOrCtrl+=', click: () => mainWindow?.webContents.send('menu:zoom-in') },
        { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', click: () => mainWindow?.webContents.send('menu:zoom-out') },
        { label: 'Reset Zoom', accelerator: 'CmdOrCtrl+0', click: () => mainWindow?.webContents.send('menu:zoom-reset') },
        { type: 'separator' },
        { label: 'Toggle Sidebar', accelerator: 'CmdOrCtrl+B', click: () => mainWindow?.webContents.send('menu:toggle-sidebar') },
        { label: 'Toggle Toolbar', click: () => mainWindow?.webContents.send('menu:toggle-toolbar') },
        { label: 'Toggle Status Bar', click: () => mainWindow?.webContents.send('menu:toggle-status-bar') },
        { label: 'Toggle Minimap', click: () => mainWindow?.webContents.send('menu:toggle-minimap') },
        { label: 'Toggle Split View', click: () => mainWindow?.webContents.send('menu:toggle-split-view') },
        { type: 'separator' },
        { label: 'Fold All', click: () => mainWindow?.webContents.send('menu:fold-all') },
        { label: 'Unfold All', click: () => mainWindow?.webContents.send('menu:unfold-all') },
        { type: 'separator' },
        { label: 'Dark Theme', type: 'checkbox', id: 'darkTheme', click: (item) => mainWindow?.webContents.send('menu:theme', item.checked ? 'dark' : 'light') },
      ],
    },
    {
      label: 'Encoding',
      submenu: [
        { label: 'UTF-8', click: () => mainWindow?.webContents.send('menu:encoding:utf8') },
        { label: 'UTF-16 LE', click: () => mainWindow?.webContents.send('menu:encoding:utf16le') },
        { label: 'UTF-16 BE', click: () => mainWindow?.webContents.send('menu:encoding:utf16be') },
        { label: 'Latin1', click: () => mainWindow?.webContents.send('menu:encoding:latin1') },
        { label: 'Windows-1252', click: () => mainWindow?.webContents.send('menu:encoding:windows-1252') },
      ],
    },
    {
      label: 'Language',
      submenu: [
        { label: 'Normal', click: () => mainWindow?.webContents.send('menu:language:plaintext') },
        { label: 'JavaScript', click: () => mainWindow?.webContents.send('menu:language:javascript') },
        { label: 'TypeScript', click: () => mainWindow?.webContents.send('menu:language:typescript') },
        { label: 'HTML', click: () => mainWindow?.webContents.send('menu:language:html') },
        { label: 'CSS', click: () => mainWindow?.webContents.send('menu:language:css') },
        { label: 'JSON', click: () => mainWindow?.webContents.send('menu:language:json') },
        { label: 'Markdown', click: () => mainWindow?.webContents.send('menu:language:markdown') },
        { label: 'Python', click: () => mainWindow?.webContents.send('menu:language:python') },
        { label: 'XML', click: () => mainWindow?.webContents.send('menu:language:xml') },
        { type: 'separator' },
        { label: 'C', click: () => mainWindow?.webContents.send('menu:language:c') },
        { label: 'C++', click: () => mainWindow?.webContents.send('menu:language:cpp') },
        { label: 'C#', click: () => mainWindow?.webContents.send('menu:language:csharp') },
        { label: 'Java', click: () => mainWindow?.webContents.send('menu:language:java') },
        { label: 'PHP', click: () => mainWindow?.webContents.send('menu:language:php') },
        { label: 'Ruby', click: () => mainWindow?.webContents.send('menu:language:ruby') },
        { label: 'Go', click: () => mainWindow?.webContents.send('menu:language:go') },
        { label: 'Rust', click: () => mainWindow?.webContents.send('menu:language:rust') },
        { label: 'SQL', click: () => mainWindow?.webContents.send('menu:language:sql') },
        { label: 'Shell Script', click: () => mainWindow?.webContents.send('menu:language:shell') },
        { label: 'YAML', click: () => mainWindow?.webContents.send('menu:language:yaml') },
      ],
    },
    {
      label: 'Macro',
      submenu: [
        { label: 'Start Recording', enabled: false },
        { label: 'Stop Recording', enabled: false },
        { label: 'Playback', enabled: false },
      ],
    },
    {
      label: 'Run',
      submenu: [
        { label: 'Run...', accelerator: 'F5', click: () => mainWindow?.webContents.send('menu:run-command') },
        { label: 'Run Last Command', enabled: false, click: () => mainWindow?.webContents.send('menu:run-last-command') },
      ],
    },
    {
      label: 'Terminal',
      submenu: [
        { label: 'Toggle Integrated Terminal', click: () => mainWindow?.webContents.send('menu:toggle-terminal') },
        { type: 'separator' },
        { label: 'New Default Terminal', click: () => mainWindow?.webContents.send('menu:terminal-new-default') },
        ...(platformInfo.terminalProfiles.find(profile => profile.id === 'powershell')?.available
          ? [{ label: 'New PowerShell Terminal', click: () => mainWindow?.webContents.send('menu:terminal-new-powershell') }]
          : []),
        ...(platformInfo.terminalProfiles.find(profile => profile.id === 'bash')?.available
          ? [{ label: 'New Git Bash Terminal', click: () => mainWindow?.webContents.send('menu:terminal-new-gitbash') }]
          : []),
        ...(platformInfo.terminalProfiles.find(profile => profile.id === 'wsl')?.available
          ? [{ label: 'New WSL Terminal', click: () => mainWindow?.webContents.send('menu:terminal-new-wsl') }]
          : []),
        { type: 'separator' },
        { label: 'Next Terminal', accelerator: 'Ctrl+Tab', click: () => mainWindow?.webContents.send('menu:terminal-next') },
        { label: 'Previous Terminal', accelerator: 'Ctrl+Shift+Tab', click: () => mainWindow?.webContents.send('menu:terminal-prev') },
      ],
    },
    {
      label: 'Tools',
      submenu: [
        { label: 'MD5 of Document', click: () => mainWindow?.webContents.send('menu:hash-md5') },
        { label: 'SHA-1 of Document', click: () => mainWindow?.webContents.send('menu:hash-sha1') },
        { label: 'SHA-256 of Document', click: () => mainWindow?.webContents.send('menu:hash-sha256') },
      ],
    },
    {
      label: 'Plugins',
      submenu: pluginsSubmenu,
    },
    {
      label: 'Window',
      submenu: [
        { label: 'Close Tab', accelerator: 'CmdOrCtrl+W', click: () => mainWindow?.webContents.send('menu:close-tab') },
        { type: 'separator' },
        { label: 'Sort Tabs by Name', click: () => mainWindow?.webContents.send('menu:sort-tabs-name') },
        { label: 'Sort Tabs by Path', click: () => mainWindow?.webContents.send('menu:sort-tabs-path') },
        { label: 'Sort Tabs by Type', click: () => mainWindow?.webContents.send('menu:sort-tabs-type') },
        { type: 'separator' },
        { label: 'Move to Other View', click: () => mainWindow?.webContents.send('menu:move-to-other-view') },
        { label: 'Clone to Other View', click: () => mainWindow?.webContents.send('menu:clone-to-other-view') },
      ],
    },
    {
      label: 'Settings',
      submenu: [
        { label: 'Preferences...', accelerator: 'CmdOrCtrl+,', click: () => mainWindow?.webContents.send('menu:preferences') },
      ],
    },
    {
      label: 'Help',
      submenu: [
        { label: 'Command Palette', accelerator: 'CmdOrCtrl+P', click: () => mainWindow?.webContents.send('menu:command-palette') },
        { type: 'separator' },
        { label: 'About AuroraPad', click: () => mainWindow?.webContents.send('menu:about') },
      ],
    },
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

async function isBinaryBuffer(buffer) {
  try {
    if (!buffer || !buffer.length) return false
    if (buffer.length > 5 * 1024 * 1024) return false
    const { fileTypeFromBuffer } = await import('file-type')
    const type = await fileTypeFromBuffer(buffer)
    if (!type) return false
    return ![
      'text/plain',
      'application/json',
      'application/javascript',
      'text/html',
      'text/css',
      'text/xml',
      'application/xml',
    ].includes(type.mime)
  } catch {
    return false
  }
}

function decodeTextBuffer(buffer, encoding = 'utf8') {
  let detectedEncoding = encoding || 'utf8'
  try {
    const detection = jschardet.detect(buffer)
    if (detection && detection.encoding && detection.confidence >= 0.6) {
      detectedEncoding = detection.encoding.toLowerCase()
    }
  } catch {
    // Best-effort detection; fall back to requested/default encoding
  }

  let content
  if (detectedEncoding === 'utf-8' || detectedEncoding === 'utf8') {
    content = buffer.toString('utf8')
    detectedEncoding = 'utf8'
  } else {
    try {
      content = iconv.decode(buffer, detectedEncoding)
    } catch {
      content = buffer.toString('utf8')
      detectedEncoding = 'utf8'
    }
  }

  return { content, encoding: detectedEncoding }
}

// IPC handlers
ipcMain.handle('fs:readFile', async (_, filePath, encoding = 'utf8') => {
  try {
    const buffer = await fs.readFile(filePath)
    const isBinary = await isBinaryBuffer(buffer)
    if (isBinary) {
      return { error: 'Binary file', binary: true }
    }
    const { content, encoding: detectedEncoding } = decodeTextBuffer(buffer, encoding)

    addRecentFile(filePath)
    return { content, encoding: detectedEncoding }
  } catch (e) {
    return { error: e.message }
  }
})

ipcMain.handle('fs:writeFile', async (_, filePath, content, encoding = 'utf8') => {
  try {
    const buffer = encoding === 'utf8' ? Buffer.from(content, 'utf8') : iconv.encode(content, encoding)
    await fs.writeFile(filePath, buffer)
    addRecentFile(filePath)
    return { ok: true }
  } catch (e) {
    return { error: e.message }
  }
})

ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
  })
  if (canceled || !filePaths.length) return null
  return filePaths
})

ipcMain.handle('dialog:saveFile', async (_, defaultPath, defaultName) => {
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultPath || undefined,
    defaultFileName: defaultName || 'untitled.txt',
  })
  return canceled ? null : filePath
})

ipcMain.handle('dialog:openFolder', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  })
  if (canceled || !filePaths.length) return null
  return filePaths[0]
})

ipcMain.handle('store:getRecentFiles', () => getRecentFiles())
ipcMain.handle('store:clearRecentFiles', () => store.set('recentFiles', []))

ipcMain.handle('remote:listProfiles', async () => {
  try {
    return {
      ok: true,
      keychainAvailable: hasKeychainSupport(),
      profiles: remoteManager.listProfiles(),
    }
  } catch (e) {
    return { error: e.message, code: e.code || 'REMOTE_LIST_FAILED' }
  }
})

ipcMain.handle('remote:saveProfile', async (_, profile) => {
  try {
    const saved = await remoteManager.saveProfile(profile || {})
    return { ok: true, profile: saved, keychainAvailable: hasKeychainSupport() }
  } catch (e) {
    return { error: e.message, code: e.code || 'REMOTE_SAVE_PROFILE_FAILED' }
  }
})

ipcMain.handle('remote:deleteProfile', async (_, profileId) => {
  try {
    await remoteManager.deleteProfile(profileId)
    return { ok: true }
  } catch (e) {
    return { error: e.message, code: e.code || 'REMOTE_DELETE_PROFILE_FAILED' }
  }
})

ipcMain.handle('remote:connect', async (_, profileId, secretInput) => {
  try {
    const connection = await remoteManager.connect(profileId, secretInput || {})
    return { ok: true, connection }
  } catch (e) {
    return {
      error: e.message,
      code: e.code || 'REMOTE_CONNECT_FAILED',
      secretType: e.secretType || null,
      currentVersion: e.currentVersion || null,
    }
  }
})

ipcMain.handle('remote:disconnect', async (_, connectionId) => {
  try {
    await remoteManager.disconnect(connectionId)
    return { ok: true }
  } catch (e) {
    return { error: e.message, code: e.code || 'REMOTE_DISCONNECT_FAILED' }
  }
})

ipcMain.handle('remote:readDir', async (_, connectionId, remotePath) => {
  try {
    const entries = await remoteManager.list(connectionId, remotePath)
    return entries
  } catch (e) {
    return { error: e.message, code: e.code || 'REMOTE_READ_DIR_FAILED' }
  }
})

ipcMain.handle('remote:readFile', async (_, connectionId, remotePath, encoding = 'utf8') => {
  try {
    const result = await remoteManager.readFile(connectionId, remotePath)
    const isBinary = await isBinaryBuffer(result.buffer)
    if (isBinary) return { error: 'Binary file', binary: true }
    const decoded = decodeTextBuffer(result.buffer, encoding)
    return {
      content: decoded.content,
      encoding: decoded.encoding,
      version: result.version,
      modifiedAt: result.modifiedAt,
      size: result.size,
      path: result.path,
    }
  } catch (e) {
    return { error: e.message, code: e.code || 'REMOTE_READ_FILE_FAILED' }
  }
})

ipcMain.handle('remote:writeFile', async (_, connectionId, remotePath, content, encoding = 'utf8', expectedVersion = null) => {
  try {
    const buffer = encoding === 'utf8' ? Buffer.from(content || '', 'utf8') : iconv.encode(content || '', encoding)
    const result = await remoteManager.writeFile(connectionId, remotePath, buffer, expectedVersion)
    return result
  } catch (e) {
    return {
      error: e.message,
      code: e.code || 'REMOTE_WRITE_FILE_FAILED',
      currentVersion: e.currentVersion || null,
    }
  }
})

ipcMain.handle('remote:movePath', async (_, connectionId, fromPath, toPath) => {
  try {
    return await remoteManager.move(connectionId, fromPath, toPath)
  } catch (e) {
    return { error: e.message, code: e.code || 'REMOTE_MOVE_FAILED' }
  }
})

ipcMain.handle('remote:mkdir', async (_, connectionId, remotePath) => {
  try {
    return await remoteManager.mkdir(connectionId, remotePath)
  } catch (e) {
    return { error: e.message, code: e.code || 'REMOTE_MKDIR_FAILED' }
  }
})

ipcMain.handle('remote:openSshTerminal', async (_, connectionId, cwd = '') => {
  try {
    const descriptor = remoteManager.getSshTerminalDescriptor(connectionId, cwd)
    return { ok: true, ...descriptor }
  } catch (e) {
    return { error: e.message, code: e.code || 'REMOTE_SSH_TERMINAL_FAILED' }
  }
})

ipcMain.handle('fs:renameFile', async (_, oldPath, newPath) => {
  try {
    await fs.rename(oldPath, newPath)
    addRecentFile(newPath)
    return { ok: true }
  } catch (e) {
    return { error: e.message }
  }
})

ipcMain.handle('shell:openInDefaultViewer', async (_, filePath) => {
  if (!filePath) return { error: 'No file path provided' }
  try {
    const res = await shell.openPath(filePath)
    if (res) return { error: res }
    return { ok: true }
  } catch (e) {
    return { error: e.message }
  }
})

ipcMain.handle('shell:revealInFolder', async (_, filePath) => {
  if (!filePath) return { error: 'No file path provided' }
  try {
    if (fsSync.existsSync(filePath)) {
      shell.showItemInFolder(filePath)
      return { ok: true }
    }

    const fallbackDir = path.dirname(filePath)
    const res = await shell.openPath(fallbackDir)
    if (res) return { error: res }
    return { ok: true }
  } catch (e) {
    return { error: e.message }
  }
})

ipcMain.handle('platform:getInfo', () => getPlatformInfo())

function getSession() {
  return store.get('session', null)
}

function setSession(data) {
  store.set('session', data)
}

ipcMain.on('window:minimize', () => mainWindow?.minimize())
ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow?.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})
ipcMain.on('window:close', () => mainWindow?.close())

ipcMain.handle('store:getSession', () => getSession())
ipcMain.handle('store:setSession', (_, data) => setSession(data))

ipcMain.handle('tools:getHash', async (_, algorithm, text) => {
  try {
    const crypto = require('crypto')
    const hash = crypto.createHash(algorithm || 'md5')
    hash.update(text || '', 'utf8')
    return { ok: true, value: hash.digest('hex') }
  } catch (e) {
    return { error: e.message }
  }
})

ipcMain.handle('run:command', async (_, command, cwd) => {
  try {
    const { exec } = require('child_process')
    return await new Promise((resolve) => {
      const child = exec(command, { cwd: cwd || process.cwd(), windowsHide: true }, (error, stdout, stderr) => {
        if (error) {
          resolve({ error: error.message, stdout, stderr })
        } else {
          resolve({ ok: true, stdout, stderr })
        }
      })
    })
  } catch (e) {
    return { error: e.message }
  }
})

ipcMain.handle('terminal:create', async (_, options = {}) => {
  try {
    const shellType = options.shell || 'default'
    const requestedCwd = options.cwd || ''
    const isSshShell = String(shellType).startsWith('ssh:')
    const cwd = isSshShell ? process.cwd() : (requestedCwd || process.cwd())
    const terminalLaunch = resolveTerminalLaunch(shellType, requestedCwd) || resolveTerminalLaunch('default')
    if (!terminalLaunch) {
      return { error: `The ${shellType} terminal profile is not available on this platform.` }
    }
    const { file, args, shellKey } = terminalLaunch

    const cols = options.cols || 80
    const rows = options.rows || 24

    const term = pty.spawn(file, args, {
      name: 'xterm-color',
      cols,
      rows,
      cwd,
      env: process.env,
    })

    const id = `term-${nextTerminalId++}`
    terminals.set(id, term)

    term.onData(data => {
      mainWindow?.webContents.send('terminal:data', { id, data })
    })

    term.onExit(() => {
      terminals.delete(id)
      mainWindow?.webContents.send('terminal:exit', { id })
    })

    return { ok: true, id, shell: shellKey }
  } catch (e) {
    return { error: e.message }
  }
})

ipcMain.handle('terminal:write', async (_, { id, data }) => {
  const term = terminals.get(id)
  if (!term) return { error: 'Terminal not found' }
  term.write(data)
  return { ok: true }
})

ipcMain.handle('terminal:resize', async (_, { id, cols, rows }) => {
  const term = terminals.get(id)
  if (!term) return { error: 'Terminal not found' }
  term.resize(cols, rows)
  return { ok: true }
})

ipcMain.handle('terminal:dispose', async (_, { id }) => {
  const term = terminals.get(id)
  if (!term) return { ok: true }
  try {
    term.kill()
  } catch {}
  terminals.delete(id)
  return { ok: true }
})

ipcMain.handle('fs:readDir', async (_, dirPath) => {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    return entries
      .filter(d => {
        if (d.name.startsWith('.')) return false
        const lower = d.name.toLowerCase()
        // Skip heavy or irrelevant folders to keep tree fast
        if (lower === 'node_modules' || lower === '.git' || lower === '.svn' || lower === 'dist' || lower === 'release') return false
        return true
      })
      .map(d => ({ name: d.name, isDirectory: d.isDirectory(), path: path.join(dirPath, d.name) }))
      .sort((a, b) => (a.isDirectory === b.isDirectory ? a.name.localeCompare(b.name) : a.isDirectory ? -1 : 1))
  } catch (e) {
    return { error: e.message }
  }
})

ipcMain.handle('fs:watchFolder', async (_, folderPath) => {
  if (watchers.has(folderPath)) return
  const watcher = chokidar.watch(folderPath, {
    ignoreInitial: true,
    ignored: ['**/node_modules/**', '**/.git/**', '**/.svn/**', '**/dist/**', '**/release/**'],
    depth: 5,
  })
  watcher.on('all', (event, p) => {
    mainWindow?.webContents.send('fs:folderChanged', { event, path: p, root: folderPath })
  })
  watchers.set(folderPath, watcher)
})

ipcMain.handle('fs:unwatchFolder', async (_, folderPath) => {
  const w = watchers.get(folderPath)
  if (w) {
    w.close()
    watchers.delete(folderPath)
  }
})

ipcMain.handle('search:findInFiles', async (_, options) => {
  const root = options?.root
  const needle = options?.pattern ?? ''
  const mask = options?.mask ?? '*.*'
  const useRegex = !!options?.useRegex
  const matchCase = !!options?.matchCase

  if (!root || !needle) return []

  const maxFiles = 5000
  const maxBytesPerFile = 512 * 1024

  function buildMaskRegex(maskStr) {
    const parts = (maskStr || '*.*').split(';').map(s => s.trim()).filter(Boolean)
    const escaped = parts.map(p => p
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.'))
    const source = escaped.length ? `^(${escaped.join('|')})$` : '.*'
    return new RegExp(source, 'i')
  }

  const maskRe = buildMaskRegex(mask)
  let patternRe
  try {
    patternRe = useRegex
      ? new RegExp(needle, matchCase ? 'g' : 'gi')
      : new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), matchCase ? 'g' : 'gi')
  } catch (error) {
    return { error: `Invalid search pattern: ${error.message}` }
  }

  const results = []
  let filesScanned = 0

  async function walk(dir) {
    if (filesScanned >= maxFiles) return
    let entries
    try {
      entries = await fs.readdir(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue
      const lower = entry.name.toLowerCase()
      if (entry.isDirectory()) {
        if (['node_modules', '.git', '.svn', 'dist', 'release'].includes(lower)) continue
        await walk(path.join(dir, entry.name))
      } else {
        if (!maskRe.test(entry.name)) continue
        if (filesScanned >= maxFiles) break
        filesScanned++
        const fullPath = path.join(dir, entry.name)
        let content
        try {
          const stat = await fs.stat(fullPath)
          if (stat.size > maxBytesPerFile) continue
          content = await fs.readFile(fullPath, 'utf8')
        } catch {
          continue
        }
        const lines = content.split(/\r\n|\r|\n/)
        for (let i = 0; i < lines.length; i++) {
          const lineText = lines[i]
          patternRe.lastIndex = 0
          const m = patternRe.exec(lineText)
          if (m) {
            results.push({
              path: fullPath,
              line: i + 1,
              column: m.index + 1,
              preview: lineText.trim(),
            })
          }
        }
      }
    }
  }

  await walk(root)
  return results
})

ipcMain.handle('search:replaceInFiles', async (_, options) => {
  const root = options?.root
  const needle = options?.pattern ?? ''
  const replacement = options?.replaceWith ?? ''
  const mask = options?.mask ?? '*.*'
  const useRegex = !!options?.useRegex
  const matchCase = !!options?.matchCase

  if (!root || !needle) return { files: [], totalReplacements: 0 }

  const maxFiles = 5000
  const maxBytesPerFile = 512 * 1024

  function buildMaskRegex(maskStr) {
    const parts = (maskStr || '*.*').split(';').map(s => s.trim()).filter(Boolean)
    const escaped = parts.map(p => p
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.'))
    const source = escaped.length ? `^(${escaped.join('|')})$` : '.*'
    return new RegExp(source, 'i')
  }

  const maskRe = buildMaskRegex(mask)
  let regexError = null

  const results = []
  let filesScanned = 0
  let totalReplacements = 0

  async function walk(dir) {
    if (filesScanned >= maxFiles) return
    let entries
    try {
      entries = await fs.readdir(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue
      const lower = entry.name.toLowerCase()
      if (entry.isDirectory()) {
        if (['node_modules', '.git', '.svn', 'dist', 'release'].includes(lower)) continue
        await walk(path.join(dir, entry.name))
      } else {
        if (!maskRe.test(entry.name)) continue
        if (filesScanned >= maxFiles) break
        filesScanned++
        const fullPath = path.join(dir, entry.name)
        let content
        try {
          const stat = await fs.stat(fullPath)
          if (stat.size > maxBytesPerFile) continue
          content = await fs.readFile(fullPath, 'utf8')
        } catch {
          continue
        }

        let fileReplacements = 0
        let newContent

        if (useRegex) {
          const flags = matchCase ? 'g' : 'gi'
          let re
          try {
            re = new RegExp(needle, flags)
          } catch {
            regexError = 'Invalid search pattern'
            continue
          }
          newContent = content.replace(re, () => {
            fileReplacements++
            return replacement
          })
        } else {
          if (!needle) continue
          const escapedNeedle = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          const flags = matchCase ? 'g' : 'gi'
          const re = new RegExp(escapedNeedle, flags)
          newContent = content.replace(re, () => {
            fileReplacements++
            return replacement
          })
        }

        if (fileReplacements > 0 && newContent !== content) {
          try {
            await fs.writeFile(fullPath, newContent, 'utf8')
            totalReplacements += fileReplacements
            results.push({
              path: fullPath,
              replacements: fileReplacements,
            })
          } catch {
            // ignore write failures for now
          }
        }
      }
    }
  }

  await walk(root)
  if (regexError) {
    return { error: regexError, files: [], totalReplacements: 0 }
  }
  return { files: results, totalReplacements }
})

const pluginsDir = () => path.join(app.getPath('userData'), 'plugins')

ipcMain.handle('plugin:getPluginsPath', async () => pluginsDir())

ipcMain.handle('plugin:listUserPlugins', async () => {
  try {
    await fs.mkdir(pluginsDir(), { recursive: true })
    const entries = await fs.readdir(pluginsDir(), { withFileTypes: true })
    return entries.filter(e => e.isFile() && e.name.endsWith('.js')).map(e => e.name)
  } catch {
    return []
  }
})

ipcMain.handle('plugin:readUserPlugin', async (_, filename) => {
  const filePath = path.join(pluginsDir(), filename)
  try {
    return await fs.readFile(filePath, 'utf8')
  } catch {
    return null
  }
})

ipcMain.handle('plugin:openPluginsFolder', async () => {
  await fs.mkdir(pluginsDir(), { recursive: true })
  shell.openPath(pluginsDir())
})

app.whenReady().then(() => {
  buildMenu()
  createWindow()

  // Ensure the dock icon on macOS uses the AuroraPad branding
  if (process.platform === 'darwin') {
    const iconPath = path.join(__dirname, '../../assets', 'aurorapad-app-icon.png')
    try {
      app.dock.setIcon(iconPath)
    } catch {
      // If the icon file is missing or invalid, fall back silently
    }
  }

  ipcMain.on('app:quit', () => app.quit())

  ipcMain.on('plugin:menuStructure', (_, items) => {
    buildMenu(items)
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

function buildMinimalMenu() {
  const template = [
    {
      // Make sure the native app menu shows the AuroraPad name
      label: app.name || 'AuroraPad',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

app.on('window-all-closed', () => {
  watchers.forEach(w => w.close())
  watchers.clear()
  remoteManager.disconnectAll().catch(() => {})
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  remoteManager.disconnectAll().catch(() => {})
})
