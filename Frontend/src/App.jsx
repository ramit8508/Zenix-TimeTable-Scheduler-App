import { useState, useEffect, lazy, Suspense } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProtectedRoute } from './Components/ProtectedRoute'
import OfflineIndicator from './Components/OfflineIndicator'
import SplashScreen from './Components/SplashScreen' // ===== NEW: Splash screen component =====

// Lazy load pages for better performance
// ===== COMMENTED OUT: StartingPage (now using splash screen) =====
// const StartingPage = lazy(() => import('./Pages/StartingPage'))
// ===== END COMMENTED OUT =====
const Login = lazy(() => import('./Pages/Login'))
const Signup = lazy(() => import('./Pages/Signup'))
const DashBoard = lazy(() => import('./Pages/DashBoard'))

function AppContent() {
  const [theme, setTheme] = useState('dark')
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark')
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading...</div>
      </div>
    )
  }
  
  return (
    <Suspense fallback={
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading...</div>
      </div>
    }>
      <Routes>
        {/* ===== NEW: Splash Screen at root path ===== */}
        <Route path="/" element={<SplashScreen />} />
        {/* ===== COMMENTED OUT: Original StartingPage route ===== */}
        {/* <Route path="/" element={<StartingPage theme={theme} toggleTheme={toggleTheme} />} /> */}
        {/* ===== END COMMENTED OUT ===== */}
        
        {/* ===== COMMENTED OUT: Login/Signup routes (Device Auth Enabled) ===== */}
        {/* 
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login theme={theme} toggleTheme={toggleTheme} />} 
        />
        <Route 
          path="/signup" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup theme={theme} toggleTheme={toggleTheme} />} 
        />
        */}
        {/* ===== NEW: Direct redirects to dashboard for login/signup paths ===== */}
        <Route 
          path="/login" 
          element={<Navigate to="/dashboard" replace />} 
        />
        <Route 
          path="/signup" 
          element={<Navigate to="/dashboard" replace />} 
        />
        {/* ===== END NEW ===== */}
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute element={<DashBoard theme={theme} toggleTheme={toggleTheme} />} />} 
        />
      </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <OfflineIndicator />
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App
