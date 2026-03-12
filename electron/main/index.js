const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron')
const path = require('path')
const fs = require('fs').promises
const Store = require('electron-store')
const chokidar = require('chokidar')
const iconv = require('iconv-lite')
const jschardet = require('jschardet')
const pty = require('node-pty')

const store = new Store()
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

// Ensure the app consistently identifies as AuroraPad across platforms
app.setName('AuroraPad')
if (process.platform === 'win32') {
  app.setAppUserModelId('com.aurorapad.app')
}

let mainWindow = null
let watchers = new Map()
let terminals = new Map()
let nextTerminalId = 1

function getRecentFiles() {
  return store.get('recentFiles', [])
}

function addRecentFile(filePath) {
  let recent = getRecentFiles().filter(p => p !== filePath)
  recent.unshift(filePath)
  store.set('recentFiles', recent.slice(0, 20))
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 600,
    minHeight: 400,
    // Use the branded AuroraPad app icon for the window/taskbar/dock
    icon: path.join(__dirname, '../../assets', process.platform === 'win32' ? 'aurorapad-app-icon.ico' : 'aurorapad-app-icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => mainWindow.show())
  mainWindow.on('closed', () => { mainWindow = null })
}

function buildMenu(pluginMenuItems = []) {
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

  const template = [
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
        { label: 'Open Containing Folder in Explorer', click: () => mainWindow?.webContents.send('menu:open-containing-folder:explorer') },
        { label: 'Open Containing Folder in Command Prompt', click: () => mainWindow?.webContents.send('menu:open-containing-folder:cmd') },
        { label: 'Open Containing Folder as Workspace', click: () => mainWindow?.webContents.send('menu:open-containing-folder:faw') },
        { label: 'Open in Default Viewer', click: () => mainWindow?.webContents.send('menu:open-in-default-viewer') },
        { type: 'separator' },
        { label: 'Reload from Disk', click: () => mainWindow?.webContents.send('menu:reload-from-disk') },
        { type: 'separator' },
        { label: 'Exit', accelerator: 'Alt+F4', role: 'quit' },
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
        { label: 'Find', accelerator: 'CmdOrCtrl+F', click: () => mainWindow?.webContents.send('menu:find') },
        { label: 'Replace', accelerator: 'CmdOrCtrl+H', click: () => mainWindow?.webContents.send('menu:replace') },
        { label: 'Go to Line...', accelerator: 'CmdOrCtrl+G', click: () => mainWindow?.webContents.send('menu:go-to-line') },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Word Wrap', type: 'checkbox', id: 'wordWrap', click: (item) => mainWindow?.webContents.send('menu:word-wrap', item.checked) },
        { label: 'Line Numbers', type: 'checkbox', checked: true, id: 'lineNumbers', click: (item) => mainWindow?.webContents.send('menu:line-numbers', item.checked) },
        { type: 'separator' },
        { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', click: () => mainWindow?.webContents.send('menu:zoom-in') },
        { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', click: () => mainWindow?.webContents.send('menu:zoom-out') },
        { label: 'Reset Zoom', accelerator: 'CmdOrCtrl+0', click: () => mainWindow?.webContents.send('menu:zoom-reset') },
        { type: 'separator' },
        { label: 'Toggle Sidebar', accelerator: 'CmdOrCtrl+B', click: () => mainWindow?.webContents.send('menu:toggle-sidebar') },
        { label: 'Dark Theme', type: 'checkbox', id: 'darkTheme', click: (item) => mainWindow?.webContents.send('menu:theme', item.checked ? 'dark' : 'light') },
      ],
    },
    {
      label: 'Plugins',
      submenu: pluginsSubmenu,
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

// IPC handlers
ipcMain.handle('fs:readFile', async (_, filePath, encoding = 'utf8') => {
  try {
    const buffer = await fs.readFile(filePath)
    let isBinary = false
    try {
      // Skip expensive MIME detection for very large files to keep open fast
      const stat = await fs.stat(filePath)
      if (stat.size <= 5 * 1024 * 1024) {
        const { fileTypeFromBuffer } = await import('file-type')
        const type = await fileTypeFromBuffer(buffer)
        if (type && !['text/plain', 'application/json', 'application/javascript', 'text/html', 'text/css', 'text/xml', 'application/xml'].includes(type.mime)) {
          isBinary = true
        }
      }
    } catch {
      // Best-effort detection; fall back to treating as text
    }
    if (isBinary) {
      return { error: 'Binary file', binary: true }
    }

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

function getSession() {
  return store.get('session', null)
}

function setSession(data) {
  store.set('session', data)
}

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
    const cwd = options.cwd || process.cwd()

    let file
    let args = []
    if (process.platform === 'win32') {
      if (shellType === 'powershell') {
        file = process.env.COMSPEC || 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe'
      } else if (shellType === 'bash') {
        file = 'C:\\Program Files\\Git\\bin\\bash.exe'
      } else if (shellType === 'wsl') {
        file = 'wsl.exe'
      } else {
        file = process.env.COMSPEC || 'C:\\Windows\\System32\\cmd.exe'
      }
    } else {
      file = process.env.SHELL || '/bin/bash'
    }

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

    return { ok: true, id }
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
  const patternRe = useRegex
    ? new RegExp(needle, matchCase ? 'g' : 'gi')
    : new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), matchCase ? 'g' : 'gi')

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
  buildMinimalMenu()
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
  if (process.platform !== 'darwin') app.quit()
})
