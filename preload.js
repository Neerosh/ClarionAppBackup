const { ipcRenderer,contextBridge } = require('electron')

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (const dependency of ['chrome', 'node', 'electron']) {
        replaceText(`${dependency}-version`, process.versions[dependency])
    }
})


contextBridge.exposeInMainWorld('electronAPI',{
    dialogSelectApp: () => ipcRenderer.invoke('dialog:selectApp'),
    openApp: (selectedApp) => ipcRenderer.invoke('open:App',selectedApp),
    deleteBackupApp: (selectedApp) => ipcRenderer.invoke('delete:backupApp',selectedApp),
    copyBackupApp: (selectedApp) => ipcRenderer.invoke('copy:backupApp',selectedApp),

    enableSelectApp: (callback) => ipcRenderer.on('enable:selectApp',callback)
})