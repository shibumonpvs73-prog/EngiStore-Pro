const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

let mainWindow = null;

// ===============================
// AUTO UPDATE SETTINGS
// ===============================
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.allowDowngrade = false;


// ===============================
// CREATE WINDOW
// ===============================
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

  mainWindow.loadFile(
    path.join(__dirname, 'index.html')
  );


  // ===============================
  // UPDATE EVENTS
  // ===============================

  autoUpdater.on('checking-for-update', () => {

    sendUpdateStatus({
      type: 'checking'
    });

  });


 autoUpdater.on('update-available', (info) => {

  sendUpdateStatus({
    type: 'available',
    version: info.version
  });

  autoUpdater.downloadUpdate().catch((err) => {

    sendUpdateStatus({
      type: 'error',
      message: err.message || 'Download failed'
    });

  });

});

  autoUpdater.on('update-not-available', (info) => {

    sendUpdateStatus({
      type: 'none',
      version: info?.version || app.getVersion()
    });

  });


  autoUpdater.on('download-progress', (progress) => {

    sendUpdateStatus({
      type: 'progress',
      percent: Math.round(progress.percent),
      transferred: progress.transferred,
      total: progress.total,
      bytesPerSecond: progress.bytesPerSecond
    });

  });


  autoUpdater.on('update-downloaded', (info) => {

    sendUpdateStatus({
      type: 'downloaded',
      version: info.version
    });

  });


  autoUpdater.on('error', (error) => {

    sendUpdateStatus({
      type: 'error',
      message: error?.message || 'Update error'
    });

  });

}


// ===============================
// SEND STATUS TO RENDERER
// ===============================
function sendUpdateStatus(data) {

  if (
    mainWindow &&
    !mainWindow.isDestroyed() &&
    mainWindow.webContents
  ) {

    mainWindow.webContents.send(
      'update-status',
      data
    );

  }

}


// ===============================
// CHECK FOR UPDATE
// ===============================
ipcMain.handle(
  'check-for-update',
  async () => {

    try {

      const result =
        await autoUpdater.checkForUpdates();

      return {
        success: true,
        version:
          result?.updateInfo?.version || null
      };

    } catch (error) {

      return {
        success: false,
        error:
          error?.message ||
          'Unable to check for update'
      };

    }

  }
);


// ===============================
// INSTALL UPDATE
// ===============================
ipcMain.handle(
  'install-update',
  () => {

    try {

      autoUpdater.quitAndInstall(
        false,
        true
      );

      return {
        success: true
      };

    } catch (error) {

      return {
        success: false,
        error:
          error?.message ||
          'Unable to install update'
      };

    }

  }
);


// ===============================
// APP READY
// ===============================
app.whenReady().then(() => {

  createWindow();


  // Give Electron a moment to
  // finish loading the application.
  setTimeout(() => {

    autoUpdater.checkForUpdates()
      .catch(() => {
        // Update check failure is
        // already handled by updater event.
      });

  }, 5000);


  app.on(
    'activate',
    () => {

      if (
        BrowserWindow
          .getAllWindows()
          .length === 0
      ) {

        createWindow();

      }

    }
  );

});


// ===============================
// CLOSE
// ===============================
app.on(
  'window-all-closed',
  () => {

    if (
      process.platform !== 'darwin'
    ) {

      app.quit();

    }

  }
);
