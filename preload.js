const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('engistoreUpdate', {
  check: () => ipcRenderer.invoke('check-for-update'),
  install: () => ipcRenderer.invoke('install-update'),
  onStatus: (callback) => ipcRenderer.on('update-status', (_event, data) => callback(data))
});
