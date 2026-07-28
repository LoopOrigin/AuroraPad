const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // File system
  readFile: (path, encoding) => ipcRenderer.invoke('fs:readFile', path, encoding),
  writeFile: (path, content, encoding) => ipcRenderer.invoke('fs:writeFile', path, content, encoding),
  readDir: (path) => ipcRenderer.invoke('fs:readDir', path),
  watchFolder: (path) => ipcRenderer.invoke('fs:watchFolder', path),
  unwatchFolder: (path) => ipcRenderer.invoke('fs:unwatchFolder', path),
  watchFile: (path) => ipcRenderer.invoke('fs:watchFile', path),
  unwatchFile: (path) => ipcRenderer.invoke('fs:unwatchFile', path),

  // Dialogs
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  saveFileDialog: (defaultPath, defaultName) => ipcRenderer.invoke('dialog:saveFile', defaultPath, defaultName),
  openFolderDialog: () => ipcRenderer.invoke('dialog:openFolder'),

  // Store
  getRecentFiles: () => ipcRenderer.invoke('store:getRecentFiles'),
  clearRecentFiles: () => ipcRenderer.invoke('store:clearRecentFiles'),
  getSession: () => ipcRenderer.invoke('store:getSession'),
  setSession: (data) => ipcRenderer.invoke('store:setSession', data),
  renameFile: (oldPath, newPath) => ipcRenderer.invoke('fs:renameFile', oldPath, newPath),
  openInDefaultViewer: (filePath) => ipcRenderer.invoke('shell:openInDefaultViewer', filePath),
  revealInFolder: (filePath) => ipcRenderer.invoke('shell:revealInFolder', filePath),
  getPlatformInfo: () => ipcRenderer.invoke('platform:getInfo'),
  readClipboardText: () => ipcRenderer.invoke('clipboard:readText'),
  writeClipboardText: (text) => ipcRenderer.invoke('clipboard:writeText', text),

  // Window controls
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),

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

  // Individual file change detection
  onFileChangedExternally: (fn) => {
    ipcRenderer.on('fs:fileChangedExternally', (_, payload) => fn(payload))
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

  // Remote workspace
  remoteListProfiles: () => ipcRenderer.invoke('remote:listProfiles'),
  remoteSaveProfile: (profile) => ipcRenderer.invoke('remote:saveProfile', profile),
  remoteDeleteProfile: (profileId) => ipcRenderer.invoke('remote:deleteProfile', profileId),
  remoteExportProfiles: () => ipcRenderer.invoke('remote:exportProfiles'),
  remoteImportProfiles: () => ipcRenderer.invoke('remote:importProfiles'),
  remoteConnect: (profileId, secretInput) => ipcRenderer.invoke('remote:connect', profileId, secretInput),
  remoteTestConnection: (profile) => ipcRenderer.invoke('remote:testConnection', profile),
  remoteDisconnect: (connectionId) => ipcRenderer.invoke('remote:disconnect', connectionId),
  remoteReadDir: (connectionId, remotePath) => ipcRenderer.invoke('remote:readDir', connectionId, remotePath),
  remoteReadFile: (connectionId, remotePath, encoding) => ipcRenderer.invoke('remote:readFile', connectionId, remotePath, encoding),
  remoteWriteFile: (connectionId, remotePath, content, encoding, expectedVersion) =>
    ipcRenderer.invoke('remote:writeFile', connectionId, remotePath, content, encoding, expectedVersion),
  remoteMovePath: (connectionId, fromPath, toPath) => ipcRenderer.invoke('remote:movePath', connectionId, fromPath, toPath),
  remoteMkdir: (connectionId, remotePath) => ipcRenderer.invoke('remote:mkdir', connectionId, remotePath),
  remoteDeleteFile: (connectionId, remotePath) => ipcRenderer.invoke('remote:deleteFile', connectionId, remotePath),
  remoteChmod: (connectionId, remotePath, mode) => ipcRenderer.invoke('remote:chmod', connectionId, remotePath, mode),
  remoteUploadFile: (connectionId, localPath, remotePath) => ipcRenderer.invoke('remote:uploadFile', connectionId, localPath, remotePath),
  remoteDownloadFile: (connectionId, remotePath, localPath) => ipcRenderer.invoke('remote:downloadFile', connectionId, remotePath, localPath),
  deleteFile: (filePath) => ipcRenderer.invoke('fs:deleteFile', filePath),
  fsMkdir: (dirPath) => ipcRenderer.invoke('fs:mkdir', dirPath),
  remoteOpenSshTerminal: (connectionId, cwd) => ipcRenderer.invoke('remote:openSshTerminal', connectionId, cwd),
  remoteStartPortForward: (connectionId, options) => ipcRenderer.invoke('remote:startPortForward', connectionId, options),
  remoteStopPortForward: (connectionId, localPort) => ipcRenderer.invoke('remote:stopPortForward', connectionId, localPort),
  remoteListPortForwards: (connectionId) => ipcRenderer.invoke('remote:listPortForwards', connectionId),

  // Git
  gitGetStatus: (repoPath) => ipcRenderer.invoke('git:getStatus', repoPath),
  gitStageFile: (repoPath, filePath) => ipcRenderer.invoke('git:stageFile', repoPath, filePath),
  gitUnstageFile: (repoPath, filePath) => ipcRenderer.invoke('git:unstageFile', repoPath, filePath),
  gitStageAll: (repoPath) => ipcRenderer.invoke('git:stageAll', repoPath),
  gitDiscardFile: (repoPath, filePath) => ipcRenderer.invoke('git:discardFile', repoPath, filePath),
  gitCommit: (repoPath, message) => ipcRenderer.invoke('git:commit', repoPath, message),
  gitPull: (repoPath) => ipcRenderer.invoke('git:pull', repoPath),
  gitPush: (repoPath) => ipcRenderer.invoke('git:push', repoPath),
  gitLog: (repoPath, limit) => ipcRenderer.invoke('git:log', repoPath, limit),
  gitBranches: (repoPath) => ipcRenderer.invoke('git:branches', repoPath),
  gitCheckout: (repoPath, branch) => ipcRenderer.invoke('git:checkout', repoPath, branch),
  gitDiff: (repoPath, filePath) => ipcRenderer.invoke('git:diff', repoPath, filePath),

  // Tools / Run
  getHash: (algorithm, text) => ipcRenderer.invoke('tools:getHash', algorithm, text),
  runCommand: (command, cwd) => ipcRenderer.invoke('run:command', command, cwd),

  // PTY Terminal
  createTerminal: (options) => ipcRenderer.invoke('terminal:create', options),
  writeTerminal: (payload) => ipcRenderer.invoke('terminal:write', payload),
  resizeTerminal: (payload) => ipcRenderer.invoke('terminal:resize', payload),
  disposeTerminal: (payload) => ipcRenderer.invoke('terminal:dispose', payload),
  onTerminalData: (fn) => {
    ipcRenderer.on('terminal:data', (_, payload) => fn(payload))
  },
  onTerminalExit: (fn) => {
    ipcRenderer.on('terminal:exit', (_, payload) => fn(payload))
  },
})
