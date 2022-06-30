const { BrowserWindow, app, dialog, ipcMain, webContents } = require('electron')
const fs = require('fs');
const os = require('os');
const child_process  = require('child_process');

// include the Node.js 'path' module at the top of your file
const path = require('path')

app.whenReady().then(() => {
    const win = new BrowserWindow({
        title: 'Clarion App Backup',
        minWidth: 600,
        minHeight: 400,
        webPreferences: {
        preload: path.join(__dirname, 'preload.js')
        }
    })

    const createWindow = () => {
        win.loadFile('index.html')
       // win.removeMenu()
    }

    //makes a copy of the app to temp folder
    async function backupApp(appFilepath){
        const appfilepathTemp = os.tmpdir() + appFilepath.substring(appFilepath.lastIndexOf('\\'))

        if (fs.existsSync(appFilepath)){
            await fs.copyFile(appFilepath,appfilepathTemp, (err) => {
                if (err) throw err;
                //console.log('file '+filepathApp+' Copied to '+filepathTemp);
            });
        }
    }

    async function createFileWatch(filepath){
        backupApp(filepath)

        fs.watchFile(filepath,(curr, prev) => {
            //console.log('changed file')
            backupApp(filepath)
        })
    }

    //open select file dialog 
    async function dialogSelectApp(){
        const { canceled, filePaths } = await dialog.showOpenDialog({
            defaultPath: app.getPath("desktop"),
            buttonLabel: "Select",
            title: "Select App...",
            filters: [{name:'App Files',extensions:['app']}],
            properties: ['openFile']
        });
        if (canceled) {
            return ''
        } else {
            return filePaths[0]
        }
    }
        //open select file dialog 
    async function dialogSelectFolder(){
        const { canceled, filePaths } = await dialog.showOpenDialog({
            defaultPath: app.getPath("desktop"),
            buttonLabel: "Select",
            title: "Select Folder...",
            properties: ['openDirectory']
        });
        if (canceled) {
            return ''
        } else {
            return filePaths[0]
        }
    }

    async function copyBackupApp(event,appFilepath){
        let result = ''
        const copyfolder = await dialogSelectFolder()
        if (copyfolder == ''){
            return 'Operation Cancelled';
        }

        const appFilepathTemp = os.tmpdir() + appFilepath.substring(appFilepath.lastIndexOf('\\'))
        const apFilepathTemp = appFilepathTemp.substring(0,appFilepathTemp.length-1)+'~'
        const appCopyFilepath = copyfolder+appFilepath.substring(appFilepath.lastIndexOf('\\'))
        const apCopyFilepath = copyfolder+appCopyFilepath.substring(appFilepath.lastIndexOf('\\'),appCopyFilepath.length-1)+'~'

        if (fs.existsSync(appFilepathTemp)){
            await fs.copyFile(appFilepathTemp,appCopyFilepath, (err) => {
                if (err) result += err;
                console.log('file '+appFilepathTemp+' Copied to '+appCopyFilepath);
            });
        }
        if (fs.existsSync(apFilepathTemp)){
            await fs.copyFile(apFilepathTemp,apCopyFilepath, (err) => {
                if (err) result += err;
                console.log('file '+apFilepathTemp+' Copied to '+apCopyFilepath);
            });
        }
        return result;
    }
    //delete app on temp folder
    async function deleteBackupApp(event,appFilepath){
        const appFilepathTemp = os.tmpdir() + appFilepath.substring(appFilepath.lastIndexOf('\\'))
        const apFilepathTemp = appFilepathTemp.substring(0,appFilepathTemp.length-1)+'~'
        let result = ''

        if (fs.existsSync(appFilepathTemp)){
            await fs.rm(appFilepathTemp, (err) => {
                if (err) result = err;
                //console.log('App backup deleted '+filepathTemp);
            });
        }

        if (fs.existsSync(apFilepathTemp)){
            await fs.rm(apFilepathTemp, (err) => {
                if (err) result += err;
                //console.log('Ap~ backup deleted '+filepathTemp);
            });
        }
        return result;
    }
    //start app on windows
    async function openApp(event,appFilepath){
        const child = child_process.exec('"'+appFilepath+'"',(err) =>{
            if (err) return err;
            //console.log('error executing: +appFilepath);
        });
        
        child.on('exit', function() {
            fs.unwatchFile(appFilepath)
            fs.unwatchFile(apFilepath)
            win.webContents.send('enable:selectApp',1)
        })

        win.webContents.send('enable:selectApp',0)

        createFileWatch(appFilepath)

        const apFilepath= appFilepath.substring(0,appFilepath.length-1)+'~'

        if (!fs.existsSync(apFilepath)){
            const appDirectory = appFilepath.substring(0,appFilepath.lastIndexOf('\\'))
            const watcherDirectory = fs.watch(appDirectory);

            watcherDirectory.on('change',function(){
                if (fs.existsSync(apFilepath)){
                    //console.log('Exists: '+ apFilepath)
                    createFileWatch(apFilepath)
                    watcherDirectory.close()
                }
            });
            return ''
        }

        createFileWatch(apFilepath)
        return ''
    }

    ipcMain.handle('open:App', openApp)
    ipcMain.handle('dialog:selectApp', dialogSelectApp)
    ipcMain.handle('delete:backupApp', deleteBackupApp)
    ipcMain.handle('copy:backupApp', copyBackupApp)
    createWindow()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})