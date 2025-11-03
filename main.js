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
  fs.watch(notebooksDir, (eventType, filename) => {
    win.webContents.send('notebooks-updated')
  })
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

// this is getting and setting the notebooks path
const notebooksDir = path.join(app.getPath('documents'), '-dev-notes', 'notebooks')

// makes sure the directories exist
if (!fs.existsSync(notebooksDir)) fs.mkdirSync(notebooksDir, { recursive: true })

// gets all notebook folders
ipcMain.handle('getNotebooks', async () => {
  return fs.readdirSync(notebooksDir).filter(f => 
    fs.statSync(path.join(notebooksDir, f)).isDirectory()
  )
})

// gets notes inside of notebooks
ipcMain.handle('getNotes', async (event, notebookName) => {
  const notebookPath = path.join(notebooksDir, notebookName)
  if (!fs.existsSync(notebookPath)) return []
  return fs.readdirSync(notebookPath).filter(f => f.endsWith('.md') || f.endsWith('.txt'))
})

// reads the note file
ipcMain.handle('readNote', async (event, { notebookName, noteName }) => {
  const filePath = path.join(notebooksDir, notebookName, noteName)
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : ''
})

// save or overwrite a note
ipcMain.handle('saveNote', async (event, { notebookName, noteName, content}) => {
  const filePath = path.join(notebooksDir, notebookName, noteName)
  fs.writeFileSync(filePath, content, 'utf-8')
  return 'Note saved succesfully'
})

// create a new notebook folder
ipcMain.handle('createNotebook', async (event, notebookName) => {
  const notebookPath = path.join(notebooksDir, notebookName)
  if (!fs.existsSync(notebookPath)) fs.mkdirSync(notebookPath)
    return `Created notebook: ${notebookName}`
})



app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})