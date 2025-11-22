const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs").promises;

// =====================================
// 1. FIX PARA WINDOWS (Barra de Tareas)
// =====================================
// Esto agrupa la ventana bajo tu propio ID, permitiendo que el icono cambie en la barra inferior.
if (process.platform === 'win32') {
  app.setAppUserModelId('Simulador.AFD.dev'); 
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 700,
    minWidth: 900,
    minHeight: 600,
    icon: path.join(__dirname, 'src', 'assets', 'img', 'logo.png'),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false 
    }
  });

  win.loadFile(path.join(__dirname, "src", "index.html"));
}

app.whenReady().then(() => {
  // =====================================
  // 2. FIX PARA MAC (Dock)
  // =====================================
  // En Mac, el icono de la ventana no cambia el icono del Dock (el cohete).
  // Debes forzarlo explícitamente aquí:
  if (process.platform === 'darwin') {
    app.dock.setIcon(path.join(__dirname, 'src', 'assets', 'img', 'logo.png'));
  }

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("fs-read-file", async (evt, filePath) => {
  return fs.readFile(filePath, "utf8");
});
