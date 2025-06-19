import path from 'path';
import { fileURLToPath } from 'url';
import { app, BrowserWindow } from 'electron';ToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  // For development
  win.loadURL('http://localhost:5173');

  // Uncomment for production build
  // win.loadFile(path.join(__dirname, 'dist/index.html'));

  // Open DevTools (optional, remove in production)
  // win.webContents.openDevTools();
}

function main() {
  app.whenReady().then(createWindow);

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}

main(); 