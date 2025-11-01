const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
    saveFile: async (content) => {
        return await ipcRenderer.invoke('saveFile', content)
    },
    makeNotebook: async (path, name) => {
        return await ipcRenderer.invoke('makeNotebook', name)
    }
})