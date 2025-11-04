const { contextBridge, ipcRenderer } = require('electron')
const { prompt } = require('electron')

contextBridge.exposeInMainWorld('api', {
    saveFile: async (content) => {
        return await ipcRenderer.invoke('saveFile', content)
    },
    getNotebooks: () => ipcRenderer.invoke('getNotebooks'),
    getNotesInNotebook: (notebookName) => ipcRenderer.invoke('getNotes', notebookName),
    readNote: (notebookName, noteName) => ipcRenderer.invoke('readNote', { notebookName, noteName }),
    saveNote: (notebookName, noteName, content) => ipcRenderer.invoke('saveNote', { notebookName, noteName, content}),
    createNotebook: (notebookName) => ipcRenderer.invoke('createNotebook', notebookName),
    promptUser: async (options) => {
        return await ipcRenderer.invoke('show-prompt', options)
    },
    
})

ipcRenderer.on('notebooks-updated', () => {
    window.dispatchEvent(new Event('notebooks-updated'))
})