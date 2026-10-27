const { app, BrowserWindow, shell } = require('electron');
const path = require('node:path');

function openExternal(url) {
  if (!/^https?:\/\//i.test(url)) {
    return;
  }

  void shell.openExternal(url).catch((error) => {
    console.error('Could not open external link:', error);
  });
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1200,
    height: 850,
    minWidth: 360,
    minHeight: 600,
    title: 'Civic Router',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    openExternal(url);
    return { action: 'deny' };
  });

  window.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) {
      event.preventDefault();
      openExternal(url);
    }
  });

  void window.loadFile(path.join(app.getAppPath(), 'frontend', 'dist', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
