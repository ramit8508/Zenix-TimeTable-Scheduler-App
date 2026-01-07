import { useState, useEffect, lazy, Suspense } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProtectedRoute } from './Components/ProtectedRoute'
import OfflineIndicator from './Components/OfflineIndicator'

// Lazy load pages for better performance
const StartingPage = lazy(() => import('./Pages/StartingPage'))
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
        <Route path="/" element={<StartingPage theme={theme} toggleTheme={toggleTheme} />} />
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login theme={theme} toggleTheme={toggleTheme} />} 
        />
        <Route 
          path="/signup" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup theme={theme} toggleTheme={toggleTheme} />} 
        />
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
