const { app, BrowserWindow } = require('electron');
const path = require('path');

// Import Express server
const expressApp = require('./app');
const PORT = process.env.PORT || 5000;

// Better development detection
const isDev = !app.isPackaged || process.env.NODE_ENV === 'development';

let mainWindow;
let serverInstance;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      // Security: Disable unnecessary features
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
    autoHideMenuBar: true,
    backgroundColor: '#1a1625',
    title: 'StudentOS Timetable - Offline',
    show: false, // Don't show until ready
  });

  // Load your frontend (adjust URL as needed)
  // For development: http://localhost:5173 (Vite default)
  // For production: load built files from Frontend/dist
  const frontendURL = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../Frontend/dist/index.html')}`;
  
  console.log(`📱 Loading frontend from: ${frontendURL}`);
  console.log(`🔧 isDev: ${isDev}, isPackaged: ${app.isPackaged}`);
  
  // Open DevTools in development mode BEFORE loading
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Retry loading with exponential backoff
  let retries = 0;
  const maxRetries = 10;
  const loadWithRetry = async () => {
    try {
      await mainWindow.loadURL(frontendURL);
      console.log('✅ Application window loaded successfully');
      mainWindow.show(); // Show window once loaded
    } catch (error) {
      retries++;
      if (retries < maxRetries) {
        console.log(`⏳ Waiting for frontend server... (attempt ${retries}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        await loadWithRetry();
      } else {
        console.error('❌ Failed to load frontend:', error);
        mainWindow.show(); // Show anyway to display error
      }
    }
  };

  await loadWithRetry();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Log any console messages from renderer
  mainWindow.webContents.on('console-message', (event, level, message) => {
    console.log(`[Renderer] ${message}`);
  });
}

// Start Express server
function startServer() {
  return new Promise((resolve, reject) => {
    try {
      serverInstance = expressApp.listen(PORT, '127.0.0.1', () => {
        console.log(`✅ Backend server running on http://127.0.0.1:${PORT}`);
        console.log(`🔒 Running in secure offline mode`);
        resolve();
      });

      serverInstance.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          console.error(`❌ Port ${PORT} is already in use. Please close other instances or change the port.`);
        } else {
          console.error('❌ Server error:', error);
        }
        reject(error);
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      reject(error);
    }
  });
}

// App lifecycle
app.whenReady().then(async () => {
  try {
    console.log('🚀 Starting StudentOS Timetable Application...');
    
    // Start backend server first
    await startServer();
    
    // Wait longer to ensure server is ready
    console.log('⏳ Waiting for backend to stabilize...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Then create window
    await createWindow();
    
    console.log('✅ Application ready!');
  } catch (error) {
    console.error('❌ Failed to initialize app:', error);
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Close server
  if (serverInstance) {
    serverInstance.close(() => {
      console.log('✅ Server closed');
    });
  }
  
  // Quit app (except on macOS)
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Clean up database connection
  const { closeDB } = require('./db/connection');
  closeDB();
});

// Security: Prevent navigation to external sites
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    // Only allow localhost navigation and file protocol
    const allowedOrigins = ['localhost', '127.0.0.1'];
    const isAllowed = allowedOrigins.some(origin => parsedUrl.hostname === origin) || 
                     parsedUrl.protocol === 'file:';
    
    if (!isAllowed) {
      event.preventDefault();
      console.warn('⚠️  Prevented navigation to external URL:', navigationUrl);
    }
  });

  // Prevent opening new windows
  contents.setWindowOpenHandler(({ url }) => {
    console.warn('⚠️  Prevented opening new window:', url);
    return { action: 'deny' };
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  // Don't exit, just log
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
});
