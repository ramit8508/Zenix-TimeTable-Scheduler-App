import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import StartingPage from './Pages/StartingPage'
import Login from './Pages/Login'
import Signup from './Pages/Signup'

function App() {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark')
  }
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StartingPage theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/login" element={<Login theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/signup" element={<Signup theme={theme} toggleTheme={toggleTheme} />} />
      </Routes>
    </Router>
  )
}

export default App
