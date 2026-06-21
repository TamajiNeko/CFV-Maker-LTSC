const { app, BrowserWindow, protocol, net, Menu, ipcMain, nativeTheme, session } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const isDev = !app.isPackaged;

let mainWindowRef = null;

// Request single instance lock to prevent multi-instance database locks (Internal error)
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindowRef && !mainWindowRef.isDestroyed()) {
      if (mainWindowRef.isMinimized()) mainWindowRef.restore();
      mainWindowRef.focus();
    }
  });

  // Register scheme 'app'
  protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } }
  ]);

function createMainWindow(showSplash = false) {
  const systemBgColor = nativeTheme.shouldUseDarkColors ? '#1e1e1e' : '#f5f5f5';
  let splashWindow = null;

  if (showSplash) {
    // Create splash screen window
    splashWindow = new BrowserWindow({
      width: 450,
      height: 310,
      icon: path.join(__dirname, 'icon.png'),
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      resizable: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      backgroundColor: systemBgColor,
    });

    splashWindow.loadFile(path.join(__dirname, 'splash.html'));
  }

  const mainWindowOptions = {
    title: 'CFV Maker',
    icon: path.join(__dirname, 'icon.png'),
    width: 1280,
    height: 720,
    minWidth: 1080,
    minHeight: 600,
    show: !showSplash, // Don't show the main window immediately if showing splash
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      devTools: isDev,
    },
    backgroundColor: systemBgColor,
  };

  if (process.platform === 'win32') {
    mainWindowOptions.titleBarOverlay = {
      color: nativeTheme.shouldUseDarkColors ? '#252525' : '#f5f5f5',
      symbolColor: nativeTheme.shouldUseDarkColors ? '#a0a0a0' : '#5a5a5a',
      height: 32
    };
  }

  const mainWindow = new BrowserWindow(mainWindowOptions);
  mainWindowRef = mainWindow;

  mainWindow.forceClose = false;

  mainWindow.on('close', (e) => {
    if (!mainWindow.forceClose) {
      e.preventDefault();
      mainWindow.webContents.send('close-window-request');
    }
  });

  if (showSplash) {
    ipcMain.once('splash-finished', () => {
      mainWindow.show();
      mainWindow.maximize();
      if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.close();
      }
    });
  } else {
    mainWindow.maximize();
  }

  // Handle window open events (spawn secondary window for docs, keep editor intact)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // If it's a local docs link, open in a dedicated docs window
    if (url.includes('/docs')) {
      const docsWindowOptions = {
        title: 'CFV Maker - Docs',
        icon: path.join(__dirname, 'icon.png'),
        width: 1024,
        height: 720,
        minWidth: 1080,
        minHeight: 600,
        titleBarStyle: 'hidden',
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          preload: path.join(__dirname, 'preload.js'),
          devTools: isDev,
          partition: 'docs', // Isolated in-memory partition to prevent IndexedDB lock collisions with editor window
        },
        backgroundColor: systemBgColor,
      };

      if (process.platform === 'win32') {
        docsWindowOptions.titleBarOverlay = {
          color: nativeTheme.shouldUseDarkColors ? '#252525' : '#f5f5f5',
          symbolColor: nativeTheme.shouldUseDarkColors ? '#a0a0a0' : '#5a5a5a',
          height: 32
        };
      }

      const docsWindow = new BrowserWindow(docsWindowOptions);

      docsWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('app://') || url.startsWith('http://localhost')) {
          if (mainWindowRef && !mainWindowRef.isDestroyed()) {
            if (mainWindowRef.isMinimized()) mainWindowRef.restore();
            mainWindowRef.focus();
          }
          return { action: 'deny' };
        }
        const { shell } = require('electron');
        shell.openExternal(url);
        return { action: 'deny' };
      });

      docsWindow.webContents.on('did-finish-load', () => {
        docsWindow.setTitle('CFV Maker - Docs');
      });

      docsWindow.loadURL(url);
      return { action: 'deny' };
    }

    // If it's other internal links, load in main window
    if (url.startsWith('app://') || url.startsWith('http://localhost')) {
      mainWindow.loadURL(url);
      return { action: 'deny' };
    }

    // Open external links in user's default browser
    const { shell } = require('electron');
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadURL('app://index.html');
  }
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

app.whenReady().then(() => {
  // Disable default menu bar globally
  Menu.setApplicationMenu(null);

  // Register custom protocol handler in production
  if (!isDev) {
    const handleAppProtocol = (request) => {
      // Rewrite app:// to a http:// format to properly parse paths on all platforms
      const urlString = request.url.replace(/^app:\/\//, 'http://app-assets/');
      const url = new URL(urlString);
      let pathname = decodeURIComponent(url.pathname);

      // Strip leading /index.html if it exists (e.g. app://index.html/_next/...)
      if (pathname.startsWith('/index.html')) {
        pathname = pathname.slice(11);
      }

      if (pathname === '/' || pathname === '') {
        pathname = '/index.html';
      }

      let filePath = path.join(__dirname, 'out', pathname);

      let isDir = false;
      try {
        isDir = fs.statSync(filePath).isDirectory();
      } catch (err) {}

      // Check if file exists and is not a directory. If not, check fallback paths
      if (isDir || !fs.existsSync(filePath)) {
        if (fs.existsSync(filePath + '.html')) {
          filePath = filePath + '.html';
        } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
          filePath = path.join(filePath, 'index.html');
        } else {
          // Fallback to index.html for SPA client-side routing
          filePath = path.join(__dirname, 'out', 'index.html');
        }
      }

      const mimeType = getMimeType(filePath);
      const stream = fs.createReadStream(filePath);
      return new Response(stream, {
        headers: { 'content-type': mimeType }
      });
    };

    protocol.handle('app', handleAppProtocol);
    session.fromPartition('docs').protocol.handle('app', handleAppProtocol);
  }

  // Dynamically update operating system native title bars to match the app's theme
  // and broadcast the change to all other open windows.
  ipcMain.on('theme-changed', (event, theme) => {
    nativeTheme.themeSource = theme; // 'light' or 'dark'
    
    BrowserWindow.getAllWindows().forEach((win) => {
      // Update window overlay style on Windows
      const isSplash = win.webContents && win.webContents.getURL().includes('splash.html');
      if (process.platform === 'win32' && !isSplash && !win.isDestroyed()) {
        try {
          const isDark = theme === 'dark' || (theme === 'system' && nativeTheme.shouldUseDarkColors);
          win.setTitleBarOverlay({
            color: isDark ? '#252525' : '#f5f5f5',
            symbolColor: isDark ? '#a0a0a0' : '#5a5a5a',
            height: 32
          });
        } catch (e) {
          console.error('Failed to set title bar overlay:', e);
        }
      }

      if (win.webContents !== event.sender) {
        win.webContents.send('theme-updated', theme);
      }
    });
  });

  // Handle opening new main windows
  ipcMain.on('new-project', () => {
    createMainWindow(false);
  });

  // Handle forcing a window to close (ignoring save warning)
  ipcMain.on('force-close-window', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      win.forceClose = true;
      win.close();
    }
  });

  // Handle native save dialog and file writing in Electron
  ipcMain.handle('save-file-dialog', async (event, { data, defaultPath, filters }) => {
    const { dialog } = require('electron');
    const fs = require('fs');
    const win = BrowserWindow.fromWebContents(event.sender);

    let dialogFilters = filters;
    if (!dialogFilters) {
      const ext = path.extname(defaultPath).toLowerCase().replace('.', '');
      if (ext === 'zip') {
        dialogFilters = [{ name: 'Zip Files', extensions: ['zip'] }];
      } else if (ext === 'png') {
        dialogFilters = [{ name: 'PNG Images', extensions: ['png'] }];
      } else {
        dialogFilters = [{ name: 'All Files', extensions: ['*'] }];
      }
    }

    const { filePath } = await dialog.showSaveDialog(win, {
      defaultPath,
      filters: dialogFilters
    });

    if (filePath) {
      try {
        fs.writeFileSync(filePath, Buffer.from(data));
        return { success: true, filePath };
      } catch (err) {
        console.error('Failed to write file natively:', err);
        return { success: false, error: err.message };
      }
    }
    return { success: false };
  });



  createMainWindow(true);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow(true);
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
}
