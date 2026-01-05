# StudentOS Timetable App - OS Integration Guide

## 📋 Overview

This guide will help you integrate the StudentOS Timetable Application into your Linux-based operating system. The application is **100% offline** with no internet dependency, using SQLite for local data storage and Electron for the desktop interface.

---

## 🎯 Prerequisites

**IMPORTANT**: All dependencies are already included in `node_modules` when you receive this folder. **No additional downloads required!**

### Required on Target System:
- Node.js 16.x or higher (for Electron runtime)
- npm (comes with Node.js)

---

## 📁 Application Structure

```
Linux_Timetable_App/
├── Backend/                    # Express server + SQLite database
│   ├── data/                  # SQLite database storage (auto-created)
│   ├── controllers/           # API logic
│   ├── models/                # Database models
│   ├── routes/                # API routes
│   ├── db/                    # Database connection
│   ├── electron-main.js       # Electron entry point
│   ├── app.js                 # Express app
│   ├── index.js               # Server starter
│   └── .env.example           # Environment template
│
└── Frontend/                   # React + Vite frontend
    ├── dist/                  # Production build (after build)
    ├── src/                   # React source code
    ├── electron/              # Electron helpers
    └── package.json
```

---

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies

```bash
# Navigate to Backend
cd Backend
npm install

# Navigate to Frontend
cd ../Frontend
npm install
```

**Note**: This only needs to be done once. All dependencies will be saved in `node_modules`.

---

### Step 2: Configure Environment

```bash
# In Backend directory
cp .env.example .env

# Edit .env file and change JWT_SECRET
# Generate a secure secret:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copy the output and paste it as JWT_SECRET in .env file
```

**Example `.env` file:**
```env
PORT=5000
NODE_ENV=production
JWT_SECRET=your_generated_secret_here_paste_the_long_random_string
DB_SAVE_INTERVAL=5000
```

---

### Step 3: Build and Run

#### Option A: Development Mode (Testing)

```bash
# Terminal 1 - Start Backend Server
cd Backend
npm start

# Terminal 2 - Start Frontend Dev Server
cd Frontend
npm run dev

# Terminal 3 - Launch Electron
cd Backend
npm run electron:dev
```

#### Option B: Production Mode (Recommended)

```bash
# Build Frontend
cd Frontend
npm run build

# This creates Frontend/dist/ with production files

# Run Electron App
cd ../Backend
npm run electron
```

---

## 🔧 OS Integration Options

### Option 1: Standalone Application (Easiest)

Package the app as a standalone Linux application:

```bash
cd Backend
npm run build
```

This creates:
- `Backend/dist/linux-unpacked/` - Executable directory
- `Backend/dist/StudentOS-Timetable-x.x.x.AppImage` - Portable app
- `Backend/dist/StudentOS-Timetable_x.x.x_amd64.deb` - Debian package

**Installation:**
```bash
# For DEB-based systems (Ubuntu, Debian, Linux Mint)
sudo dpkg -i Backend/dist/StudentOS-Timetable_*.deb

# For AppImage (Universal)
chmod +x Backend/dist/StudentOS-Timetable-*.AppImage
./Backend/dist/StudentOS-Timetable-*.AppImage
```

---

### Option 2: System Integration (Custom OS)

#### 2.1 Create Application Entry

Create: `/usr/share/applications/studentos-timetable.desktop`

```ini
[Desktop Entry]
Name=StudentOS Timetable
Comment=Offline Timetable and Task Manager
Exec=/opt/studentos/timetable/start.sh
Icon=/opt/studentos/timetable/icon.png
Terminal=false
Type=Application
Categories=Office;Education;Utility;
StartupNotify=true
```

#### 2.2 Install Application Files

```bash
# Create installation directory
sudo mkdir -p /opt/studentos/timetable

# Copy application files
sudo cp -r Backend /opt/studentos/timetable/
sudo cp -r Frontend/dist /opt/studentos/timetable/Frontend

# Create startup script
sudo nano /opt/studentos/timetable/start.sh
```

**start.sh content:**
```bash
#!/bin/bash
cd /opt/studentos/timetable/Backend
NODE_ENV=production /usr/bin/electron .
```

```bash
# Make executable
sudo chmod +x /opt/studentos/timetable/start.sh

# Set permissions
sudo chown -R root:root /opt/studentos/timetable
sudo chmod -R 755 /opt/studentos/timetable

# User data directory (for database)
mkdir -p ~/.local/share/studentos-timetable
```

#### 2.3 Database Location Configuration

Edit `Backend/db/connection.js` to use user home directory:

```javascript
const dbDir = path.join(process.env.HOME || os.homedir(), '.local/share/studentos-timetable');
```

---

### Option 3: Systemd Service (Background Mode)

Create: `/etc/systemd/system/studentos-timetable-backend.service`

```ini
[Unit]
Description=StudentOS Timetable Backend
After=network.target

[Service]
Type=simple
User=studentos
WorkingDirectory=/opt/studentos/timetable/Backend
ExecStart=/usr/bin/node /opt/studentos/timetable/Backend/index.js
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=5000

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable studentos-timetable-backend
sudo systemctl start studentos-timetable-backend
sudo systemctl status studentos-timetable-backend
```

Then configure Frontend to auto-launch on login.

---

## 🔐 Security Configuration

### 1. File Permissions

```bash
# Database directory (user-specific)
chmod 700 ~/.local/share/studentos-timetable
chmod 600 ~/.local/share/studentos-timetable/timetable.db

# Application files (read-only)
sudo chmod -R 755 /opt/studentos/timetable
sudo chmod 644 /opt/studentos/timetable/Backend/.env
```

### 2. AppArmor Profile (Optional)

Create: `/etc/apparmor.d/usr.bin.studentos-timetable`

```apparmor
#include <tunables/global>

/opt/studentos/timetable/Backend/electron-main.js {
  #include <abstractions/base>
  #include <abstractions/nameservice>
  
  # Application files
  /opt/studentos/timetable/** r,
  
  # User data
  owner @{HOME}/.local/share/studentos-timetable/** rw,
  owner @{HOME}/.local/share/studentos-timetable/ rw,
  
  # Temporary files
  /tmp/** rw,
  
  # Node.js and Electron
  /usr/bin/node ix,
  /usr/bin/electron ix,
  
  # Deny network (offline mode)
  deny network,
}
```

Load profile:
```bash
sudo apparmor_parser -r /etc/apparmor.d/usr.bin.studentos-timetable
```

---

## 📊 Database Management

### Database Location
- Default: `Backend/data/timetable.db`
- User-specific: `~/.local/share/studentos-timetable/timetable.db`

### Backup Script

Create: `/opt/studentos/scripts/backup-timetable.sh`

```bash
#!/bin/bash
BACKUP_DIR="$HOME/.local/share/studentos-timetable/backups"
DB_FILE="$HOME/.local/share/studentos-timetable/timetable.db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"
cp "$DB_FILE" "$BACKUP_DIR/timetable_$TIMESTAMP.db"

# Keep only last 10 backups
ls -t "$BACKUP_DIR"/timetable_*.db | tail -n +11 | xargs -r rm

echo "Backup created: timetable_$TIMESTAMP.db"
```

### Restore Database

```bash
# List backups
ls -lh ~/.local/share/studentos-timetable/backups/

# Restore
cp ~/.local/share/studentos-timetable/backups/timetable_20260105_120000.db \
   ~/.local/share/studentos-timetable/timetable.db
```

---

## 🧪 Testing Checklist

### Pre-Integration Testing

```bash
# Test 1: Dependencies installed
cd Backend && npm list
cd Frontend && npm list

# Test 2: Backend server starts
cd Backend
npm start
# Should see: "✅ SQLite Database Connected"
# Should see: "Server started on port 5000"

# Test 3: Frontend builds
cd Frontend
npm run build
# Should create: Frontend/dist/

# Test 4: Electron launches
cd Backend
npm run electron
# Should open application window

# Test 5: Create test user
# Open app, go to Signup, create account
# Verify: User created successfully

# Test 6: Database persists
# Stop app, restart app, login with same user
# Verify: Login successful

# Test 7: Create tasks
# Add multiple tasks
# Stop app, restart, verify tasks exist

# Test 8: Offline mode
# Disconnect internet
# Verify: All features work without internet
```

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'sql.js'"

**Solution:**
```bash
cd Backend
npm install sql.js --save
```

### Issue: "Database not initialized"

**Solution:**
```bash
# Check data directory exists
ls Backend/data/

# If not, it will be auto-created on first run
# If permission issues:
mkdir -p Backend/data
chmod 755 Backend/data
```

### Issue: "EADDRINUSE: Port 5000 already in use"

**Solution:**
```bash
# Find process using port 5000
sudo lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change port in .env
echo "PORT=5001" >> Backend/.env
```

### Issue: Electron window doesn't open

**Solution:**
```bash
# Check Electron installed
cd Backend
npm list electron

# Reinstall if needed
npm install electron --save-dev

# Try with verbose logging
DEBUG=* npm run electron
```

### Issue: Frontend shows "Failed to fetch"

**Solution:**
```bash
# Ensure backend is running
curl http://localhost:5000/api/health

# Check frontend API URL
# Edit Frontend/src/services/authService.js
# Ensure: const API_BASE_URL = 'http://localhost:5000/api';
```

---

## 📝 Default Credentials

**Note**: No default users exist. Users must sign up first.

First-time setup:
1. Launch app
2. Click "Sign Up"
3. Create admin account
4. Login and start using

---

## 🔄 Update Procedure

When providing updates to the OS developer:

```bash
# Backup current installation
sudo cp -r /opt/studentos/timetable /opt/studentos/timetable.backup

# Stop services
sudo systemctl stop studentos-timetable-backend

# Update files
sudo cp -r Backend/* /opt/studentos/timetable/Backend/
sudo cp -r Frontend/dist/* /opt/studentos/timetable/Frontend/

# Restart services
sudo systemctl start studentos-timetable-backend
```

Database migrations (if schema changes):
- Create migration scripts in `Backend/db/migrations/`
- Run before starting updated app

---

## 📞 Support Information

### Log Files

```bash
# Backend logs (if using systemd)
sudo journalctl -u studentos-timetable-backend -f

# Electron logs
~/.config/StudentOS Timetable/logs/

# Database integrity check
sqlite3 Backend/data/timetable.db "PRAGMA integrity_check;"
```

### Performance Monitoring

```bash
# Check database size
du -sh Backend/data/timetable.db

# Optimize database
sqlite3 Backend/data/timetable.db "VACUUM;"
```

---

## ✅ Post-Integration Checklist

- [ ] All dependencies installed (`npm install` completed)
- [ ] `.env` file created with secure JWT_SECRET
- [ ] Frontend built successfully (`npm run build`)
- [ ] Application launches in Electron mode
- [ ] User can sign up and login
- [ ] Tasks can be created, updated, deleted
- [ ] Database persists after app restart
- [ ] Application works completely offline
- [ ] Desktop entry created (if applicable)
- [ ] File permissions set correctly
- [ ] Backup script configured
- [ ] Security profile applied (if using AppArmor)
- [ ] Documentation provided to end users

---

## 🎓 User Documentation

Provide these instructions to end users:

### Getting Started
1. Launch "StudentOS Timetable" from application menu
2. Create an account (Sign Up)
3. Login with your credentials
4. Start adding tasks and managing your schedule

### Features
- ✅ Create and manage tasks
- ✅ Set priorities (Low, Medium, High)
- ✅ Categorize tasks
- ✅ Track completion status
- ✅ View statistics
- ✅ 100% offline - no internet required
- ✅ Secure local data storage

### Data Location
- All your data is stored locally in:
  `~/.local/share/studentos-timetable/timetable.db`

### Backup Your Data
- Recommended: Weekly backups
- Copy file: `~/.local/share/studentos-timetable/timetable.db`
- Store backup in safe location

---

## 📄 License & Distribution

This application is ready for distribution as part of StudentOS. All dependencies are bundled and no external services are required.

**Package Contents:**
- Backend server (Node.js + Express)
- Frontend application (React + Vite)
- SQLite database (embedded)
- Electron wrapper (desktop app)

**No Online Dependencies:**
- No API keys required
- No cloud services
- No telemetry or analytics
- Complete privacy and data ownership

---

## 🎉 Success!

If you've completed all steps, the StudentOS Timetable App is now integrated into your operating system and ready for users!

**Questions or Issues?**
Refer to the Troubleshooting section or check:
- `Backend/SECURITY.md` - Security guidelines
- `Backend/.env.example` - Configuration template
- Application logs for detailed error messages

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Target OS**: Linux-based systems  
**Mode**: Offline SQLite
