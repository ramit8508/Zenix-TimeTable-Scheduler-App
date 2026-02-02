# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:


## React Compiler

# Linux Timetable Desktop App

A modern, cross-platform desktop application for managing your academic timetable, built with Electron, Vite, and React. Designed for students who want a fast, beautiful, and easy-to-use experience on Linux (AppImage), Windows, and macOS.

---

## ✨ Features
- **AI-Powered Plan Generator**: Get smart study plans tailored to your needs.
- **Task Management**: Add, edit, and track your daily tasks and assignments.
- **Authentication**: Secure login and signup for personalized experience.
- **Beautiful UI**: Clean, responsive design with dark mode support.
- **Notifications**: Desktop reminders for important tasks.
- **Offline Support**: Works even without internet after first login.

---

## 🖥️ Screenshots
<!-- Add screenshots here -->

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- (For Linux) Required system libraries: `libgtk-3-0`, `libnss3`, etc.

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/Linux_Timetable_App.git
cd Linux_Timetable_App
```

### 2. Install Dependencies
#### Frontend
```bash
cd Frontend
npm install
```
#### Backend
```bash
cd ../Backend
npm install
```

### 3. Development Mode
#### Start Backend
```bash
cd Backend
node index.js
```
#### Start Frontend (with Electron)
```bash
cd ../Frontend
npm run dev
```

### 4. Build Desktop App (AppImage for Linux)
```bash
cd Frontend
npm run build
# Then package with electron-builder or your tool
```

---

## 🐧 Linux AppImage Notes
- Make the AppImage executable: `chmod +x YourApp.AppImage`
- Run from terminal to see errors: `./YourApp.AppImage`
- If you see a black screen, ensure all dependencies are installed and icon paths are correct.

---

## 📁 Project Structure
```
Backend/
	controllers/
	db/
	middlewares/
	models/
	routes/
	utils/
	app.js
	index.js
	package.json
Frontend/
	Assets/
	electron/
		main.cjs
		preload.cjs
	public/
	src/
		Components/
		context/
		Pages/
		services/
		Styles/
	package.json
	vite.config.js
```

---

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📜 License
[MIT](LICENSE)

---

## 🙋‍♂️ Author
- [Your Name](https://github.com/yourusername)

---

## ⭐️ Star this repo if you like it!

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
