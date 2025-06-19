const { app, BrowserWindow, dialog, protocol, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      devTools: true,
      webSecurity: false, // Disable web security to allow local file loading
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Determine the correct path to load
  let startUrl;
  let indexPath;
  const possiblePaths = [
    // Development paths
    path.join(__dirname, 'dist', 'index.html'),
    path.join(__dirname, 'index.html'),
    
    // Packaged app paths
    path.join(process.resourcesPath, 'dist', 'index.html'),
    path.join(process.resourcesPath, 'index.html'),
    
    // Fallback paths
    path.join(app.getAppPath(), 'dist', 'index.html'),
    path.join(app.getAppPath(), 'index.html')
  ];

  indexPath = possiblePaths.find(fs.existsSync);

  if (!indexPath) {
    console.error('Could not find index.html in any of these locations:', possiblePaths);
    dialog.showErrorBox('Loading Error', 'Could not find index.html. Please reinstall the application.');
    app.quit();
    return;
  }

  console.log('Loading index.html from:', indexPath);

  // Register custom file protocol to serve local files
  protocol.registerFileProtocol('app', (request, callback) => {
    const filePath = request.url.substr(6); // Remove 'app://' prefix
    callback({ path: path.normalize(`${__dirname}/${filePath}`) });
  });

  // Determine start URL
  if (process.env.ELECTRON_START_URL) {
    // Development mode
    startUrl = process.env.ELECTRON_START_URL;
  } else {
    // Production mode
    startUrl = url.format({
      pathname: indexPath,
      protocol: 'file:',
      slashes: true
    });
  }

  console.log('Final URL to load:', startUrl);

  // Configure additional headers to prevent caching
  win.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    details.requestHeaders['Pragma'] = 'no-cache';
    details.requestHeaders['Expires'] = '0';
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  // Intercept and log all network requests
  win.webContents.session.webRequest.onBeforeRequest((details, callback) => {
    console.log('Network Request:', details.url);
    callback({ cancel: false });
  });

  // Handle navigation
  win.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    // If it's an external URL, prevent default and open in default browser
    if (parsedUrl.protocol.startsWith('http')) {
      event.preventDefault();
      require('electron').shell.openExternal(navigationUrl);
    }
  });

  // Comprehensive error handling for loading
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
    if (isMainFrame) {
      console.error('Failed to load main frame:', {
        errorCode,
        errorDescription,
        validatedURL
      });

      // Attempt to reload or show error dialog
      if (errorCode === -3) {
        // Aborted error, try reloading
        win.loadFile(indexPath);
      } else {
        dialog.showErrorBox(
          'Loading Error', 
          `Failed to load the application. Error: ${errorDescription} (Code: ${errorCode})`
        );
      }
    }
  });

  // Add error logging for renderer process
  win.webContents.on('render-process-gone', (event, details) => {
    console.error('Renderer process crashed:', details);
    dialog.showErrorBox(
      'Application Error', 
      `The application has crashed. Reason: ${details.reason}`
    );
  });

  // Load the app
  win.loadURL(startUrl, {
    userAgent: 'Chrome',
    extraHeaders: 'pragma: no-cache\n'
  }).catch((err) => {
    console.error('Failed to load URL:', err);
    dialog.showErrorBox('Loading Error', `Failed to load the application: ${err.message}`);
  });

  // Open DevTools by default for debugging
  win.webContents.openDevTools();

  win.on('ready-to-show', () => {
    win.show();
  });

  win.on('closed', () => {
    console.log('Window closed');
  });

  return win;
}

function main() {
  console.log('App is starting...');
  console.log('Current environment:', 
    process.env.ELECTRON_START_URL ? 'Development' : 'Production'
  );
  console.log('App path:', app.getAppPath());
  console.log('Resources path:', process.resourcesPath);

  app.on('ready', () => {
    console.log('App is ready. Creating window...');
    createWindow();
  });

  app.on('window-all-closed', () => {
    console.log('All windows closed');
    if (process.platform !== 'darwin') app.quit();
  });

  app.on('activate', () => {
    console.log('App activated');
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Log any errors
  app.on('error', (err) => {
    console.error('Uncaught app error:', err);
  });
}

main(); 