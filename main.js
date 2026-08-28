
const {app,BrowserWindow} = require('electron');
const path=require('path');
function createWindow(){
 const w=new BrowserWindow({width:1400,height:850,minWidth:1100,minHeight:650,
   title:'EngiStore Pro',backgroundColor:'#f3f5f8',
   webPreferences:{contextIsolation:true,nodeIntegration:false}});
 w.loadFile(path.join(__dirname,'index.html'));
}
app.whenReady().then(()=>{createWindow();app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow()})});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
