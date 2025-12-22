import React from 'react'
import { useNavigate } from 'react-router-dom'
import { CiClock1 } from "react-icons/ci";
import { IoIosArrowRoundBack } from "react-icons/io";
import '../Styles/Login.css'

export default function Login() {
    const navigate = useNavigate()
  return (
   
    <>
    <button className='back-button' onClick={() => navigate('/')}><IoIosArrowRoundBack className='logo-back' />
Back</button>
    <div className="login-page">
      <div className="login-box">
<CiClock1  className='login-logo'/>

        <h2 className="login-heading">Welcome Back</h2>
        <p className='login-para'>login to your account</p>
        <form className="login-form">
          <label htmlFor="email" className="login-label">Email Address</label>
          <input type="email" id="email" className="login-input" placeholder="
Enter your email" required />

          <label htmlFor="password" className="login-label">Password</label>
          <input type="password" id="password" className="login-input" placeholder="Enter your password" required />
            <button type="submit" className="login-button">Log In</button>
        </form>
        <h1 className='login-tosignup'>Don't have an account?<button className='login-tosignup-button' onClick={() => navigate('/signup')}>Sign Up</button></h1>
      </div>
    </div>
    </>
  )
}

