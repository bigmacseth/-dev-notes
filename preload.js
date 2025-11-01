const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
    saveFile: async (content) => {
        return await ipcRenderer.invoke('saveFile', content)
    }
})