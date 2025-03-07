import React from 'react'

export default function Footer() {
  return (
    <div>
       <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <h2>BuySell Nexus</h2>
            <p>Simplifying business management since 2025</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h3>Product</h3>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#testimonials">Testimonials</a>
            </div>
            <div className="footer-column">
              <h3>Company</h3>
              <a href="#about">About Us</a>
              <a href="#careers">Careers</a>
              <a href="#blog">Blog</a>
            </div>
            <div className="footer-column">
              <h3>Support</h3>
              <a href="#help">Help Center</a>
              <a href="#contact">Contact Us</a>
              <a href="#faq">FAQ</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 BuySell Nexus. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
