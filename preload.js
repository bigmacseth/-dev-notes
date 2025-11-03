const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
    saveFile: async (content) => {
        return await ipcRenderer.invoke('saveFile', content)
    },
    getNotebooks: () => ipcRenderer.invoke('getNotebooks'),
    getNotesInNotebook: (notebookName) => ipcRenderer.invoke('getNotes', notebookName),
    readNote: (notebookName, noteName) => ipcRenderer.invoke('readNote', { notebookName, noteName }),
    saveNote: (notebookName, noteName, content) => ipcRenderer.invoke('saveNote', { notebookName, noteName, content}),
    createNotebook: (notebookName) => ipcRenderer.invoke('createNotebook', notebookName),

})

ipcRenderer.on('notebooks-updated', () => {
    window.dispatchEvent(new Event('notebooks-updated'))
})
