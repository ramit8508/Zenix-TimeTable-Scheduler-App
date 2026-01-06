import { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProtectedRoute } from './Components/ProtectedRoute'
import StartingPage from './Pages/StartingPage'
import Login from './Pages/Login'
import Signup from './Pages/Signup'
import DashBoard from './Pages/DashBoard'

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
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App
