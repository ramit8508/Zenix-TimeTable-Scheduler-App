# 🔌 Offline Mode Documentation

## Overview
This application is **fully functional offline** with the exception of the AI Plan Generator feature. All core functionality works without an internet connection.

## ✅ Features Available Offline

### Authentication
- ✅ **User Signup** - Create new accounts offline (stored in localStorage)
- ✅ **User Login** - Authenticate with offline accounts
- ✅ **User Logout** - Sign out safely
- ✅ **Session Persistence** - Stay logged in even when offline

### Task Management
- ✅ **Create Tasks** - Add new tasks with all properties
- ✅ **View Tasks** - See all your tasks organized by date
- ✅ **Update Tasks** - Edit task details and mark as complete
- ✅ **Delete Tasks** - Remove tasks permanently
- ✅ **Task Statistics** - View completion rates and progress
- ✅ **Weekly Schedule** - Browse tasks by week
- ✅ **Today's Tasks** - Quick view of today's schedule
- ✅ **Date Range Filtering** - Filter tasks by custom date ranges

### UI Features
- ✅ **Theme Toggle** - Switch between dark/light themes
- ✅ **Offline Indicator** - Visual badge shows when offline
- ✅ **Desktop Notifications** - Task reminders work offline (Electron)

## ❌ Features Requiring Internet

### AI Plan Generator
- ❌ Requires internet connection
- Shows clear message when attempting to use offline
- All other features remain functional

## 📦 How Offline Data is Stored

All offline data is stored in browser `localStorage`:

### User Data
```javascript
localStorage.getItem('offline_users')  // Array of registered users
localStorage.getItem('token')          // Current session token
localStorage.getItem('user')           // Current user data
```

### Task Data
```javascript
localStorage.getItem('offline_tasks')  // Array of all tasks
```

## 🔄 Online/Offline Behavior

### Automatic Detection
The app automatically detects your connection status:
- **Online** → Uses backend API for all operations
- **Offline** → Switches to localStorage automatically
- **Reconnected** → Continues using localStorage until manual sync

### Offline Indicator
A visual badge appears in the top-right corner when offline:
- 🟠 **"Offline Mode"** badge = No internet connection
- No badge = Connected to internet

## 🚀 Getting Started Offline

1. **First Time Setup (requires internet)**
   - Initial app load (downloads fonts and assets)
   - After first load, works completely offline

2. **Create an Account Offline**
   ```
   1. Click "Sign Up"
   2. Fill in your details
   3. Account is created in localStorage
   4. Automatically logged in
   ```

3. **Login Offline**
   ```
   1. Use the same email/password you created
   2. Works even without internet
   3. Session persists across restarts
   ```

4. **Manage Tasks Offline**
   - All CRUD operations work normally
   - Data syncs when online (future feature)

## 💾 Data Persistence

### What Happens to Offline Data?
- Data persists in browser localStorage
- Survives browser restarts
- Specific to each browser profile
- Not synced across devices (yet)

### Clearing Offline Data
To reset all offline data:
```javascript
// Open browser console and run:
localStorage.clear()
```

## ⚠️ Important Notes

1. **Different Databases**
   - Offline users ≠ Online users
   - Offline tasks ≠ Online tasks
   - They don't sync automatically

2. **Password Security**
   - Offline passwords stored in localStorage (not encrypted)
   - Use only for development/testing
   - Production needs proper encryption

3. **Browser Limitations**
   - localStorage limited to ~5-10MB
   - Clearing browser data removes offline storage
   - Private/Incognito mode doesn't persist data

## 🔮 Future Enhancements

- [ ] Auto-sync when internet restored
- [ ] Conflict resolution for offline changes
- [ ] Encrypted offline storage
- [ ] Service Worker for better offline support
- [ ] IndexedDB for larger storage capacity

## 🛠️ Technical Details

### Offline Detection
```javascript
const isOnline = () => navigator.onLine;
```

### Automatic Fallback
All service functions check connection status:
```javascript
if (!isOnline()) {
  // Use localStorage
} else {
  // Use backend API
}
```

### Response Format
Both offline and online modes return consistent response formats:
```javascript
// Offline
{ tasks: [...], offline: true }

// Online
{ tasks: [...], success: true }
```

## 📝 Testing Offline Mode

### Method 1: Browser DevTools
1. Open DevTools (F12)
2. Network tab → Throttling dropdown
3. Select "Offline"

### Method 2: OS Network Settings
1. Disable WiFi/Ethernet
2. App continues working normally

### Method 3: Browser Settings
1. Chrome: chrome://settings/content/network
2. Toggle offline mode

## ✨ Credits

Offline mode implementation ensures the app works as a true Progressive Web App (PWA) with full functionality regardless of internet connectivity!
