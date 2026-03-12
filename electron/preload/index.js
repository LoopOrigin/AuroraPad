const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // File system
  readFile: (path, encoding) => ipcRenderer.invoke('fs:readFile', path, encoding),
  writeFile: (path, content, encoding) => ipcRenderer.invoke('fs:writeFile', path, content, encoding),
  readDir: (path) => ipcRenderer.invoke('fs:readDir', path),
  watchFolder: (path) => ipcRenderer.invoke('fs:watchFolder', path),
  unwatchFolder: (path) => ipcRenderer.invoke('fs:unwatchFolder', path),

  // Dialogs
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  saveFileDialog: (defaultPath, defaultName) => ipcRenderer.invoke('dialog:saveFile', defaultPath, defaultName),
  openFolderDialog: () => ipcRenderer.invoke('dialog:openFolder'),

  // Store
  getRecentFiles: () => ipcRenderer.invoke('store:getRecentFiles'),
  clearRecentFiles: () => ipcRenderer.invoke('store:clearRecentFiles'),
  getSession: () => ipcRenderer.invoke('store:getSession'),
  setSession: (data) => ipcRenderer.invoke('store:setSession', data),

  // Menu events (renderer listens)
  onMenu: (channel, fn) => {
    const subscription = (_, ...args) => fn(...args)
    ipcRenderer.on(channel, subscription)
    return () => ipcRenderer.removeListener(channel, subscription)
  },

  // File tree watcher events
  onFolderChanged: (fn) => {
    ipcRenderer.on('fs:folderChanged', (_, payload) => fn(payload))
  },

  // Plugins: send menu structure to main, listen for plugin run
  sendPluginMenuStructure: (items) => ipcRenderer.send('plugin:menuStructure', items),
  onMenuPluginRun: (fn) => {
    ipcRenderer.on('menu:plugin-run', (_, payload) => fn(payload))
  },
  getPluginsPath: () => ipcRenderer.invoke('plugin:getPluginsPath'),
  listUserPlugins: () => ipcRenderer.invoke('plugin:listUserPlugins'),
  readUserPlugin: (filename) => ipcRenderer.invoke('plugin:readUserPlugin', filename),
  openPluginsFolder: () => ipcRenderer.invoke('plugin:openPluginsFolder'),
  quit: () => ipcRenderer.send('app:quit'),

  // Search
  findInFiles: (options) => ipcRenderer.invoke('search:findInFiles', options),
  replaceInFiles: (options) => ipcRenderer.invoke('search:replaceInFiles', options),
})
