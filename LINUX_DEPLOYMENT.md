# Linux Deployment Guide - StudentOS Timetable App

## 🐧 Complete Offline Linux Application

This application is designed to run **100% offline** on Linux systems with SQLite database.

---

## 📋 System Requirements

### Minimum Requirements
- **OS**: Any modern Linux distribution (Ubuntu 20.04+, Fedora 36+, Debian 11+, Arch, etc.)
- **CPU**: x64 or ARM64 architecture
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 500MB free space
- **Node.js**: v18.0.0 or higher (for development)

### Runtime Requirements (End Users)
- No Node.js required when using the packaged `.AppImage` or `.deb` file
- No internet connection required

---

## 🚀 Installation Methods

### Method 1: Using Pre-built Package (Recommended for End Users)

#### For Ubuntu/Debian-based Systems (.deb)
```bash
# Install the .deb package
sudo dpkg -i StudentOS-Timetable-*.deb

# If dependencies are missing, run:
sudo apt-get install -f

# Launch the application
studentos-timetable
```

#### For All Linux Distributions (AppImage)
```bash
# Make the AppImage executable
chmod +x StudentOS-Timetable-*.AppImage

# Run the application
./StudentOS-Timetable-*.AppImage

# Optional: Integrate with system menu
./StudentOS-Timetable-*.AppImage --appimage-integrate
```

### Method 2: Building from Source (For Developers)

```bash
# 1. Clone or extract the project
cd Linux_Timetable_App

# 2. Install backend dependencies
cd Backend
npm install

# 3. Install frontend dependencies
cd ../Frontend
npm install

# 4. Build the Linux packages
cd ../Backend
npm run build

# Output files will be in: Backend/dist/
# - StudentOS-Timetable-*.AppImage (universal Linux package)
# - StudentOS-Timetable-*.deb (Debian/Ubuntu package)
```

---

## 🛠️ Development Setup on Linux

### 1. Install Prerequisites
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y nodejs npm git

# Fedora
sudo dnf install -y nodejs npm git

# Arch Linux
sudo pacman -S nodejs npm git
```

### 2. Setup Project
```bash
cd Linux_Timetable_App

# Install backend dependencies
cd Backend
npm install

# Install frontend dependencies
cd ../Frontend
npm install
```

### 3. Run in Development Mode

**Terminal 1 - Frontend:**
```bash
cd Frontend
npm run dev
# Vite dev server will start on http://localhost:5173
```

**Terminal 2 - Electron App:**
```bash
cd Backend
npm run electron:dev
# Electron window will open with the app
```

---

## 📦 Building Linux Packages

### Build AppImage and DEB packages
```bash
cd Backend
npm run build
```

This will create:
- `dist/StudentOS-Timetable-*.AppImage` - Universal Linux package
- `dist/StudentOS-Timetable-*.deb` - Debian/Ubuntu package

### Build Settings (package.json)
```json
{
  "build": {
    "linux": {
      "target": ["AppImage", "deb"],
      "category": "Utility",
      "icon": "icon.png"
    }
  }
}
```

---

## 🗄️ Database Configuration

### SQLite Database Location
```
~/.config/studentos-timetable/data/timetable.db  (Production)
Backend/data/timetable.db                         (Development)
```

### Database Features
- **Auto-save**: Every 5 seconds (configurable in .env)
- **File-based**: Single `.db` file, easy to backup
- **No server required**: Embedded SQLite database
- **Encrypted passwords**: bcrypt hashing

### Environment Variables (.env)
```bash
PORT=5000
NODE_ENV=production
JWT_SECRET=your-secret-key-here
DB_SAVE_INTERVAL=5000  # milliseconds
```

---

## 🔒 Security Features

### Built-in Security
- ✅ JWT token authentication
- ✅ bcrypt password hashing (10 rounds)
- ✅ CORS protection
- ✅ Input validation (express-validator)
- ✅ Content Security Policy (in production)
- ✅ No external network access required
- ✅ Secure local storage only

### Production Security Checklist
- [ ] Generate unique JWT_SECRET (use: `openssl rand -hex 64`)
- [ ] Set NODE_ENV=production
- [ ] Review CORS settings in Backend/app.js
- [ ] Enable HTTPS if exposing to network (optional)

---

## 🧪 Testing

### Test Database Functionality
```bash
cd Backend
node test-database.js
```

Expected output:
```
✅ All tests passed! SQLite database is working correctly.
```

### Test Electron App
```bash
cd Backend
npm run electron:dev
```

1. Sign up with test account
2. Create tasks
3. Verify data persists after app restart
4. Check database file: `ls -lh Backend/data/timetable.db`

---

## 📁 Project Structure

```
Linux_Timetable_App/
├── Backend/
│   ├── app.js                 # Express app configuration
│   ├── index.js               # Standalone server (dev)
│   ├── electron-main.js       # Electron main process
│   ├── package.json           # Backend dependencies
│   ├── .env                   # Environment variables
│   ├── data/
│   │   └── timetable.db       # SQLite database file
│   ├── controllers/           # Business logic
│   │   ├── authController.js
│   │   ├── taskController.js
│   │   └── aiController.js
│   ├── models/                # Database models
│   │   ├── User.js
│   │   └── Task.js
│   ├── routes/                # API routes
│   │   ├── authRoutes.js
│   │   ├── taskRoutes.js
│   │   └── aiRoutes.js
│   ├── middlewares/           # Auth middleware
│   │   └── auth.js
│   └── db/
│       └── connection.js      # SQLite connection
├── Frontend/
│   ├── src/
│   │   ├── Components/        # React components
│   │   ├── Pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── context/           # React context
│   │   └── Styles/            # CSS files
│   ├── dist/                  # Build output (production)
│   └── package.json           # Frontend dependencies
└── LINUX_DEPLOYMENT.md        # This file
```

---

## 🔧 Troubleshooting

### Issue: Permission Denied
```bash
# Make files executable
chmod +x StudentOS-Timetable-*.AppImage
chmod +x Backend/node_modules/.bin/*
```

### Issue: Database Not Persisting
```bash
# Check database directory permissions
ls -la Backend/data/
# Should show read/write permissions for your user

# Check auto-save is enabled
grep DB_SAVE_INTERVAL Backend/.env
# Should be 5000 (5 seconds)
```

### Issue: Port 5000 Already in Use
```bash
# Find process using port 5000
sudo lsof -i :5000

# Kill the process (replace PID)
kill -9 <PID>

# Or change port in Backend/.env
echo "PORT=5001" >> Backend/.env
```

### Issue: Frontend Not Loading
```bash
# Check if Vite dev server is running
curl http://localhost:5173

# Restart frontend dev server
cd Frontend
npm run dev
```

### Issue: Electron Window Shows Black Screen
```bash
# 1. Check if backend is running (port 5000)
curl http://localhost:5000/api/auth/me

# 2. Check if frontend is running (port 5173)
curl http://localhost:5173

# 3. Clear localStorage and restart
rm -rf ~/.config/studentos-timetable/
```

---

## 🚢 Distribution

### For System Integration (Custom Linux OS)

#### 1. Install Location
```bash
# System-wide installation
/opt/studentos-timetable/

# User installation
~/.local/share/studentos-timetable/
```

#### 2. Desktop Entry (Application Menu)
Create: `/usr/share/applications/studentos-timetable.desktop`
```ini
[Desktop Entry]
Name=StudentOS Timetable
Comment=Offline Timetable & Task Manager
Exec=/opt/studentos-timetable/StudentOS-Timetable
Icon=/opt/studentos-timetable/icon.png
Terminal=false
Type=Application
Categories=Utility;Education;Office;
StartupWMClass=studentos-timetable
```

#### 3. System Service (Optional - Auto-start Backend)
Create: `/etc/systemd/user/studentos-timetable.service`
```ini
[Unit]
Description=StudentOS Timetable Backend
After=network.target

[Service]
Type=simple
ExecStart=/opt/studentos-timetable/backend-server
Restart=on-failure
Environment="NODE_ENV=production"

[Install]
WantedBy=default.target
```

Enable:
```bash
systemctl --user enable studentos-timetable
systemctl --user start studentos-timetable
```

#### 4. Package for Your OS
```bash
# Using electron-builder (already configured)
cd Backend
npm run build

# Or create custom package using your OS's package manager
# Example: Create RPM for Fedora-based OS
# Example: Create Pacman package for Arch-based OS
```

---

## 📝 Configuration Files

### Backend/.env (Production Template)
```bash
# Server Configuration
PORT=5000
NODE_ENV=production

# Security (CHANGE THESE!)
JWT_SECRET=$(openssl rand -hex 64)

# Database Configuration
DB_SAVE_INTERVAL=5000

# Logging (Optional)
LOG_LEVEL=info
```

### Frontend Production Build
```bash
cd Frontend
npm run build

# Output: Frontend/dist/
# Copy dist/ contents to Backend for packaging
```

---

## 🎯 Performance Optimization

### Database Optimization
- Auto-save interval: Increase to 10000ms (10 seconds) for better performance
- Use indexes for frequently queried fields
- Regular VACUUM operations to optimize database size

### Memory Optimization
```bash
# Electron memory settings (electron-main.js)
# Adjust based on system RAM
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=512')
```

---

## 📞 Support & Documentation

### Additional Documentation
- [OS_INTEGRATION_GUIDE.md](OS_INTEGRATION_GUIDE.md) - OS developer integration
- [SECURITY.md](Backend/SECURITY.md) - Security best practices
- [BUILD_GUIDE.md](Frontend/BUILD_GUIDE.md) - Frontend build instructions

### Database Schema
```sql
-- Users Table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Tasks Table
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  taskName TEXT NOT NULL,
  duration INTEGER NOT NULL,
  priority TEXT NOT NULL,
  category TEXT NOT NULL,
  notes TEXT,
  date TEXT NOT NULL,
  userId INTEGER NOT NULL,
  isCompleted INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

---

## ✅ Pre-deployment Checklist

- [ ] All dependencies installed (`npm install` in both Backend and Frontend)
- [ ] Environment variables configured (.env file)
- [ ] JWT_SECRET generated and secure
- [ ] Database tests passing (`node Backend/test-database.js`)
- [ ] Frontend built (`cd Frontend && npm run build`)
- [ ] Electron packages built (`cd Backend && npm run build`)
- [ ] AppImage tested on target Linux distribution
- [ ] Desktop entry file created (if system integration)
- [ ] Documentation reviewed and updated
- [ ] Security audit completed

---

## 🎉 Quick Start Summary

**For End Users:**
```bash
chmod +x StudentOS-Timetable-*.AppImage
./StudentOS-Timetable-*.AppImage
```

**For Developers:**
```bash
cd Backend && npm install && cd ../Frontend && npm install
cd ../Backend && npm run electron:dev  # (after starting Frontend/npm run dev)
```

**For Building:**
```bash
cd Backend && npm run build
# Output: Backend/dist/*.AppImage and *.deb
```

---

## 📄 License & Credits

- **SQLite**: Public Domain
- **Electron**: MIT License
- **Node.js**: MIT License
- **React**: MIT License

---

**Made for StudentOS - Complete Offline Linux Application** 🐧
