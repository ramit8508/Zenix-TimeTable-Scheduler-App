import React from 'react';
import '../Styles/Footer.css';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';

export default function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-section">
          <h3 className="footer-brand">TimeTable Scheduler</h3>
          <p className="footer-description">
            AI-powered scheduling for students and professionals. Transform your productivity today.
          </p>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#features">Features</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Resources</h4>
          <ul className="footer-links">
            <li><a href="#documentation">Documentation</a></li>
            <li><a href="#support">Support</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Connect With Us</h4>
          <div className="footer-social">
            <a href="https://github.com/ramit8508" className="social-icon" aria-label="GitHub">
              <FaGithub size={24} />
            </a>
            <a href="https://www.linkedin.com/in/ramit-goyal-71b89431a/" className="social-icon" aria-label="LinkedIn">
              <FaLinkedin size={24} />
            </a>
            <a href="mailto:ramitgoyal1987@gmail.com" className="social-icon" aria-label="Email">
              <MdEmail size={24} />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copyright">
          © 2025 TimeTable Scheduler. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
