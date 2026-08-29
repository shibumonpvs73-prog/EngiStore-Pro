const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

function createWindow(){
  const w=new BrowserWindow({width:1400,height:850,minWidth:1100,minHeight:650,
    title:'EngiStore Pro',backgroundColor:'#f3f5f8',
    webPreferences:{contextIsolation:true,nodeIntegration:false,preload:path.join(__dirname,'preload.js')}});
  w.loadFile(path.join(__dirname,'index.html'));
  autoUpdater.on('checking-for-update',()=>w.webContents.send('update-status',{type:'checking'}));
  autoUpdater.on('update-available',info=>w.webContents.send('update-status',{type:'available',version:info.version}));
  autoUpdater.on('update-not-available',()=>w.webContents.send('update-status',{type:'none'}));
  autoUpdater.on('download-progress',p=>w.webContents.send('update-status',{type:'progress',percent:Math.round(p.percent)}));
  autoUpdater.on('update-downloaded',info=>w.webContents.send('update-status',{type:'downloaded',version:info.version}));
  autoUpdater.on('error',err=>w.webContents.send('update-status',{type:'error',message:err.message||'Update error'}));
  return w;
}

ipcMain.handle('check-for-update', async ()=>{
  try { return await autoUpdater.checkForUpdates(); }
  catch(e){ return {error:e.message||'Unable to check for update'}; }
});
ipcMain.handle('install-update', ()=>{ autoUpdater.quitAndInstall(false,true); return true; });

app.whenReady().then(()=>{const win=createWindow(); app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow();});});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
