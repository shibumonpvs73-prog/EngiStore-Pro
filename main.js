const { app, BrowserWindow, ipcMain, utilityProcess } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

let mainWindow = null;
let serverProcess = null;
const SERVER_PORT = 3000;
const RUNTIME_DIR = () => path.join(app.getPath('userData'), 'runtime');

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.allowDowngrade = false;

function prepareRuntimeFiles() {
  const dir = RUNTIME_DIR();
  fs.mkdirSync(dir, { recursive: true });
  for (const file of ['server.js', 'index.html', 'sw.js', 'manifest.json']) {
    const src = path.join(__dirname, file);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(dir, file));
  }
  return dir;
}

async function startLocalServer() {
  const dir = prepareRuntimeFiles();
  serverProcess = utilityProcess.fork(path.join(dir, 'server.js'), [], {
    cwd: dir,
    env: { ...process.env, PORT: String(SERVER_PORT) }
  });
  serverProcess.on('exit', (code) => {
    serverProcess = null;
    if (code && mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('server-status', { type: 'error', code });
    }
  });
  await new Promise(resolve => setTimeout(resolve, 800));
}

function stopLocalServer() {
  if (serverProcess) {
    try { serverProcess.kill(); } catch (_) {}
    serverProcess = null;
  }
}

function sendUpdateStatus(data) {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('update-status', data);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 850,
    minWidth: 1100,
    minHeight: 650,
    title: 'EngiStore Pro',
    backgroundColor: '#f3f5f8',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  mainWindow.loadURL(`http://127.0.0.1:${SERVER_PORT}/`);
  mainWindow.on('closed', () => { mainWindow = null; });

  autoUpdater.on('checking-for-update', () => sendUpdateStatus({ type: 'checking' }));
  autoUpdater.on('update-available', info => {
    sendUpdateStatus({ type: 'available', version: info.version });
    autoUpdater.downloadUpdate().catch(error => sendUpdateStatus({ type: 'error', message: error.message }));
  });
  autoUpdater.on('update-not-available', info => sendUpdateStatus({ type: 'none', version: info?.version || app.getVersion() }));
  autoUpdater.on('download-progress', progress => sendUpdateStatus({
    type: 'progress', percent: Math.round(progress.percent), transferred: progress.transferred,
    total: progress.total, bytesPerSecond: progress.bytesPerSecond
  }));
  autoUpdater.on('update-downloaded', info => sendUpdateStatus({ type: 'downloaded', version: info.version }));
  autoUpdater.on('error', error => sendUpdateStatus({ type: 'error', message: error?.message || 'Update error' }));
}

ipcMain.handle('check-for-update', async () => {
  try {
    const result = await autoUpdater.checkForUpdates();
    return { success: true, version: result?.updateInfo?.version || null };
  } catch (error) {
    sendUpdateStatus({ type: 'error', message: error?.message || 'Unable to check for update' });
    return { success: false, error: error?.message || 'Unable to check for update' };
  }
});

ipcMain.handle('install-update', () => {
  try {
    autoUpdater.quitAndInstall(false, true);
    return { success: true };
  } catch (error) {
    return { success: false, error: error?.message || 'Unable to install update' };
  }
});

app.whenReady().then(async () => {
  await startLocalServer();
  createWindow();
  if (app.isPackaged) {
    setTimeout(() => autoUpdater.checkForUpdates().catch(error =>
      sendUpdateStatus({ type: 'error', message: error?.message || 'Update check failed' })
    ), 5000);
  }
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', stopLocalServer);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
