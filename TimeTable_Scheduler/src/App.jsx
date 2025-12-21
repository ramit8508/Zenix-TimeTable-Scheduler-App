import { useState, useEffect } from 'react'
import StartingPage from './Pages/StartingPage'


function App() {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark')
  }
  
  return (
    <>
     <StartingPage theme={theme} toggleTheme={toggleTheme} />
    </>
  )
}

export default App
