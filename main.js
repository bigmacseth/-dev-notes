import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  win.loadFile('index.html')
}

app.on('ready', () => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

ipcMain.handle('saveFile', async (event, content) => {
  
  const options = {
        buttonLabel: 'Save File',
        defualtPath: 'untitled.txt',
        filters: [
            { name: 'Text Files', extensions: ['.txt'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    };

  const { filePath } = await dialog.showSaveDialog(options)

  if (!filePath) return

  await fs.promises.writeFile(filePath, content, 'utf8')
  return 'File Saved!'
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})