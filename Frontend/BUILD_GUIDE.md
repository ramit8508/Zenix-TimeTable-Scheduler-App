# Zenix - Build & Distribution Guide

## Current Status
✅ App works in development mode (`npm run electron:dev`)  
✅ Backend deployed at: https://zenix-timetable-scheduler-app.onrender.com  
❌ Building installers requires Linux environment or special setup

## The Issue
Windows cannot build Linux packages (AppImage/deb) due to symlink permission issues. You have 3 options:

---

## Option 1: Build on Linux (RECOMMENDED)
This gives you the actual Linux packages you want.

### Using WSL (Windows Subsystem for Linux):

1. **Install WSL** (if not already installed):
   ```powershell
   wsl --install
   ```

2. **Open WSL terminal** and navigate to project:
   ```bash
   cd /mnt/d/StudentOS\ Project/Linux_Timetable_App/Frontend
   ```

3. **Install Node.js in WSL**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Build the app**:
   ```bash
   npm run build
   npx electron-builder --linux
   ```

6. **Get your packages**:
   - AppImage: `release/Zenix Timetable Scheduler-1.0.0.AppImage`
   - Debian package: `release/zenix-timetable-scheduler_1.0.0_amd64.deb`

---

## Option 2: Use GitHub Actions (FREE)
Automate builds in the cloud using GitHub.

### Setup:

1. **Create `.github/workflows/build.yml`**:
   ```yaml
   name: Build Electron App

   on:
     push:
       tags:
         - 'v*'
   
   jobs:
     build-linux:
       runs-on: ubuntu-latest
       
       steps:
         - uses: actions/checkout@v3
         
         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '20'
         
         - name: Install dependencies
           working-directory: ./Frontend
           run: npm install
         
         - name: Build app
           working-directory: ./Frontend
           run: |
             npm run build
             npx electron-builder --linux
         
         - name: Upload artifacts
           uses: actions/upload-artifact@v3
           with:
             name: linux-packages
             path: |
               Frontend/release/*.AppImage
               Frontend/release/*.deb
   ```

2. **Commit and push** to GitHub

3. **Create a tag**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

4. **Download from GitHub Actions** artifacts tab

---

## Option 3: Build Windows Version Instead
Build a Windows installer that works on your current system.

### Fix Required:
Enable Developer Mode in Windows to allow symlinks.

1. **Open Settings** → Update & Security → For Developers
2. **Enable Developer Mode**
3. **Restart PowerShell/Terminal**
4. **Run**:
   ```bash
   npm run build
   npx electron-builder --win
   ```

This creates: `release/Zenix Timetable Scheduler Setup 1.0.0.exe`

---

## Option 4: Quick Distribution (Current Files)
The `--dir` build already created an unpacked version.

### Share the folder:
Location: `d:\StudentOS Project\Linux_Timetable_App\Frontend\release\linux-unpacked`

**Users can run**:
```bash
./zenix-timetable-scheduler
```

⚠️ **Not portable** - requires exact same Electron version and dependencies

---

## Recommended Approach

**For Linux users**: Use Option 1 (WSL) or Option 2 (GitHub Actions)  
**For testing**: Use Option 4 (unpacked folder)  
**For Windows users**: Use Option 3 (enable Developer Mode)

---

## File Locations After Successful Build

### Linux build outputs:
- `release/Zenix Timetable Scheduler-1.0.0.AppImage` - Portable, works on any Linux
- `release/zenix-timetable-scheduler_1.0.0_amd64.deb` - For Debian/Ubuntu
- `release/linux-unpacked/` - Unpacked application directory

### Windows build outputs:
- `release/Zenix Timetable Scheduler Setup 1.0.0.exe` - Windows installer
- `release/win-unpacked/` - Unpacked application directory

---

## Current Unpacked Build

✅ You already have an unpacked Linux build at:
```
d:\StudentOS Project\Linux_Timetable_App\Frontend\release\linux-unpacked
```

To use it on Linux:
1. Copy the entire `linux-unpacked` folder to a Linux machine
2. Run: `chmod +x "./zenix-timetable-scheduler"`
3. Execute: `"./zenix-timetable-scheduler"`

---

## Next Steps

**Choose your approach** based on your target platform:
- **Need .AppImage or .deb?** → Use WSL (Option 1)
- **Want automated builds?** → Use GitHub Actions (Option 2)
- **Testing only?** → Use unpacked build (Option 4)
- **Windows users too?** → Enable Developer Mode (Option 3)
