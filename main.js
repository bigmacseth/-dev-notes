import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import prompt from "custom-electron-prompt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.loadFile("index.html");
  fs.watch(notebooksDir, (eventType, filename) => {
    win.webContents.send("notebooks-updated");
  });
  // show new save prompt dialog
  ipcMain.handle("show-prompt", async (event, options) => {
    try {
      const result = await prompt(
        {
          title: options.title || "Input",
          label: options.label || "",
          value: options.value || "",
          type: options.type || "input",
        },
        win
      );

      if (result === null) {
        console.log("Prompt canceled.")
        return null
      }

      console.log("User entered: ", result)
      return result
    } catch (err) {
      console.error("Prompt error: ", err)
      return null
    }
  })
}

app.on("ready", () => {
  createWindow()

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// this is getting and setting the notebooks path
const notebooksDir = path.join(
  app.getPath("documents"),
  "-dev-notes",
  "notebooks"
)

// makes sure the directories exist
if (!fs.existsSync(notebooksDir))
  fs.mkdirSync(notebooksDir, { recursive: true })

// gets all notebook folders
ipcMain.handle("getNotebooks", async () => {
  return fs
    .readdirSync(notebooksDir)
    .filter((f) => fs.statSync(path.join(notebooksDir, f)).isDirectory())
})

// gets notes inside of notebooks
ipcMain.handle("getNotes", async (event, notebookName) => {
  const notebookPath = path.join(notebooksDir, notebookName)
  if (!fs.existsSync(notebookPath)) return []
  return fs.readdirSync(notebookPath).filter((f) => f.endsWith(".md") || f.endsWith(".txt"))
});

// reads the note file
ipcMain.handle("readNote", async (event, { notebookName, noteName }) => {
  const filePath = path.join(notebooksDir, notebookName, noteName);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf-8") : "";
});

// save or overwrite a note
ipcMain.handle(
  "saveNote",
  async (event, { notebookName, noteName, content }) => {
    const filePath = path.join(notebooksDir, notebookName, noteName);
    fs.writeFileSync(filePath, content, "utf-8");
    return filePath;
  }
);

// create a new notebook folder
ipcMain.handle("createNotebook", async (event, notebookName) => {
  const notebookPath = path.join(notebooksDir, notebookName);
  if (!fs.existsSync(notebookPath)) fs.mkdirSync(notebookPath);
  return `Created notebook: ${notebookName}`;
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
