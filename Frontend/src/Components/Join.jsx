import React from 'react'
import { useNavigate } from 'react-router-dom'
import '../Styles/Join.css'

export default function Join() {
  const navigate = useNavigate()

  return (
    <>
    <div className="join-container">
    <div className="box-join">
        <h1 className='join-heading'>Ready to Transform Your Productivity?</h1>
        <p className='join-para'>Join thousands of students and professionals who are already scheduling smarter with AI.</p>
        <button className='join-button' onClick={() => navigate('/signup')}>Get Started for Free</button>
    </div>
    </div>
    </>
  )
}
