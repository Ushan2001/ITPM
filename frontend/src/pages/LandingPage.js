import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";
import config from "../config";
import DefaultImg from "../assests/user.png";
import DashboardLogo from "../Logo/BuySellNexusLogo";

import "./style.css";

const LandingPage = () => {
  const [user, setUser] = useState("");
  const [, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const toast = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      fetchaUser();
    } else {
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, []);

  const fetchaUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${config.apiUrl}/api/v1/user/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      const data = await response.json();
      setUser(data);
      setLoading(false);
    } catch (error) {
      console.error("Error to fetch user data", error);
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    navigate("/");
    setUser("");
  };
  return (
    <div className="landing-container">
      <Toast ref={toast} />
      <nav className="navbar">
        <div className="logo">
          <h1>BuySell Nexus</h1>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#pricing">Pricing</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="nav-auth">
          <div className="user-profile">
            <img
              src={
                user.profilePic
                  ? `${config.apiUrl}/api/v1/uploads/image/profile/${user.profilePic}`
                  : DefaultImg
              }
              alt="Profile"
              className="profile-img"
              onClick={handleProfile}
              style={{ cursor: "pointer" }}
            />
            <span
              className="username"
              onClick={handleProfile}
              style={{ cursor: "pointer" }}
            >
              Hi! {user.name || "Guest"}
            </span>
          </div>
          <>
            {isAuthenticated ? (
              <>
                <button className="login-btn" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button className="login-btn" onClick={handleLogin}>
                  Login
                </button>
                <button className="signup-btn" onClick={handleSignUp}>
                  Sign Up
                </button>
              </>
            )}
          </>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-content">
          <h1>Streamline Your Buying & Selling Process</h1>
          <p>The ultimate management system for businesses of all sizes</p>
          <button className="cta-btn">Get Started</button>
        </div>
        <div className="hero-image">
          <DashboardLogo width={450} height={450} />
        </div>
      </header>

      <section id="features" className="features">
        <h2>Why Choose BuySell Nexus</h2>
        <div className="feature-cards">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Inventory Management</h3>
            <p>
              Keep track of your stock levels in real-time with smart alerts and
              analytics
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💵</div>
            <h3>Transaction Tracking</h3>
            <p>
              Monitor all your sales and purchases with detailed transaction
              history
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Mobile Friendly</h3>
            <p>Manage your business from anywhere with our responsive design</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure Platform</h3>
            <p>Industry-leading security to protect your business data</p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Your Account</h3>
            <p>Sign up and set up your business profile in minutes</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Add Your Inventory</h3>
            <p>Import or manually add your products and services</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Start Selling</h3>
            <p>Process transactions and track your business growth</p>
          </div>
        </div>
      </section>

      <section id="testimonials" className="testimonials">
        <h2>What Our Customers Say</h2>
        <div className="testimonial-cards">
          <div className="testimonial-card">
            <p>
              "BuySell Nexus transformed our business operations. We've
              increased sales by 35% since implementation."
            </p>
            <div className="testimonial-author">- Sarah J., Retail Owner</div>
          </div>
          <div className="testimonial-card">
            <p>
              "The inventory tracking feature alone is worth the investment. No
              more overselling or stockouts!"
            </p>
            <div className="testimonial-author">
              - Michael T., E-commerce Manager
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="pricing">
        <h2>Pricing Plans</h2>
        <div className="pricing-cards">
          <div className="pricing-card">
            <h3>Starter</h3>
            <div className="price">
              $29<span>/month</span>
            </div>
            <ul>
              <li>Up to 500 products</li>
              <li>2 user accounts</li>
              <li>Basic reporting</li>
              <li>Email support</li>
            </ul>
            <button className="price-btn">Choose Plan</button>
          </div>
          <div className="pricing-card featured">
            <div className="most-popular">Most Popular</div>
            <h3>Business</h3>
            <div className="price">
              $79<span>/month</span>
            </div>
            <ul>
              <li>Up to 5,000 products</li>
              <li>10 user accounts</li>
              <li>Advanced reporting</li>
              <li>Priority support</li>
            </ul>
            <button className="price-btn">Choose Plan</button>
          </div>
          <div className="pricing-card">
            <h3>Enterprise</h3>
            <div className="price">
              $199<span>/month</span>
            </div>
            <ul>
              <li>Unlimited products</li>
              <li>Unlimited users</li>
              <li>Custom reporting</li>
              <li>24/7 dedicated support</li>
            </ul>
            <button className="price-btn">Choose Plan</button>
          </div>
        </div>
      </section>

      <section id="contact" className="contact">
        <h2>Ready to Get Started?</h2>
        <p>
          Contact our team for a free demo or to learn more about BuySell Nexus
        </p>
        <form className="contact-form">
          <input type="text" placeholder="Your Name" />
          <input type="email" placeholder="Email Address" />
          <textarea placeholder="Your Message"></textarea>
          <button type="submit" className="submit-btn">
            Send Message
          </button>
        </form>
      </section>

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
  );
};

export default LandingPage;
