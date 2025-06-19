const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');

// Enhanced error handling and logging
function setupErrorHandling() {
  // Global error handler
  window.addEventListener('error', (event) => {
    console.error('[Preload] Uncaught error:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });
  });

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Preload] Unhandled promise rejection:', event.reason);
  });
}

// Expose a limited set of Node.js APIs to the renderer process
function exposeElectronAPI() {
  contextBridge.exposeInMainWorld('electronAPI', {
    // Path and environment helpers
    getAppPath: () => process.cwd(),
    getPlatform: () => process.platform,
    getResourcePath: () => process.resourcesPath,
    
    // Logging methods
    log: (message, level = 'info') => {
      switch(level) {
        case 'error':
          console.error('[Renderer]', message);
          break;
        case 'warn':
          console.warn('[Renderer]', message);
          break;
        default:
          console.log('[Renderer]', message);
      }
    },

    // Error handling
    handleError: (error) => {
      console.error('[Preload] Renderer Error:', error);
    },

    // Optional: Safe file path resolution
    resolvePath: (relativePath) => {
      try {
        return path.resolve(process.cwd(), relativePath);
      } catch (error) {
        console.error('[Preload] Path resolution error:', error);
        return null;
      }
    },

    // Optional: IPC communication methods (commented out for security)
    // sendToMain: (channel, data) => ipcRenderer.send(channel, data),
    // receiveFromMain: (channel, func) => {
    //   ipcRenderer.on(channel, (event, ...args) => func(...args));
    // }
  });
}

// Initialize preload script
function init() {
  setupErrorHandling();
  exposeElectronAPI();
}

init(); 