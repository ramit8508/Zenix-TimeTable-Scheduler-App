import React from 'react'
import Navbar from '../Components/Navbar'
import Home from '../Components/Home'
import Features from '../Components/Features'
import Join from '../Components/Join'
import Footer from '../Components/Footer'

function StartingPage({ theme, toggleTheme }) {
  return (
    <>
    <Navbar theme={theme} toggleTheme={toggleTheme} />
    <Home/>
    <Features/>
    <Join/>
    <Footer />
    </>
  )
}

export default StartingPage