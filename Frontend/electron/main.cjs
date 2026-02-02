const { app, BrowserWindow, Notification, ipcMain } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development';

app.setName('Zenix Timetable Scheduler');
app.setAppUserModelId('com.zenix.timetable');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    icon: path.join(__dirname, 'assets/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    autoHideMenuBar: true,
    backgroundColor: '#1a1625',
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Notifications
ipcMain.on('send-notification', (event, data) => {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: data.title,
      body: data.body,
      icon: path.join(__dirname, 'assets/icon.png'),
      silent: false
    });

    notification.show();

    notification.on('click', () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  }
});

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
