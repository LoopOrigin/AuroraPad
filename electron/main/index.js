const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron')
const path = require('path')
const fs = require('fs').promises
const Store = require('electron-store')
const chokidar = require('chokidar')
const iconv = require('iconv-lite')

const store = new Store()
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

let mainWindow = null
let watchers = new Map()

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
        { label: 'Save As...', accelerator: 'CmdOrCtrl+Shift+S', click: () => mainWindow?.webContents.send('menu:save-as') },
        { type: 'separator' },
        { label: 'Close Tab', accelerator: 'CmdOrCtrl+W', click: () => mainWindow?.webContents.send('menu:close-tab') },
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
      label: 'Help',
      submenu: [
        { label: 'Command Palette', accelerator: 'CmdOrCtrl+P', click: () => mainWindow?.webContents.send('menu:command-palette') },
        { type: 'separator' },
        { label: 'About', role: 'about' },
      ],
    },
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

// IPC handlers
ipcMain.handle('fs:readFile', async (_, filePath, encoding = 'utf8') => {
  try {
    const buffer = await fs.readFile(filePath)
    const { fileTypeFromBuffer } = await import('file-type')
    const type = await fileTypeFromBuffer(buffer)
    if (type && !['text/plain', 'application/json', 'application/javascript', 'text/html', 'text/css', 'text/xml', 'application/xml'].includes(type.mime)) {
      return { error: 'Binary file', binary: true }
    }
    const content = encoding === 'utf8' ? buffer.toString('utf8') : iconv.decode(buffer, encoding)
    addRecentFile(filePath)
    return { content, encoding }
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

ipcMain.handle('fs:readDir', async (_, dirPath) => {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    return entries
      .filter(d => !d.name.startsWith('.'))
      .map(d => ({ name: d.name, isDirectory: d.isDirectory(), path: path.join(dirPath, d.name) }))
      .sort((a, b) => (a.isDirectory === b.isDirectory ? a.name.localeCompare(b.name) : a.isDirectory ? -1 : 1))
  } catch (e) {
    return { error: e.message }
  }
})

ipcMain.handle('fs:watchFolder', async (_, folderPath) => {
  if (watchers.has(folderPath)) return
  const watcher = chokidar.watch(folderPath, { ignoreInitial: true })
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

  ipcMain.on('app:quit', () => app.quit())

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

function buildMinimalMenu() {
  const template = [
    {
      label: app.name || 'Notepad Clone',
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
