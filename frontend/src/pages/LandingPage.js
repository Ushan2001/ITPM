import React from "react";

import "./style.css";
import NavBar from "./NavBar";
import Footer from "./Footer";
import GetStartForm from "./GetStartForm";
import Pricing from "./Pricing";
import Header from "./Header";

const LandingPage = () => {
  return (
    <div className="landing-container">
      <NavBar />
      <Header />
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
        <Pricing />
      </section>

      <section id="contact" className="contact">
        <GetStartForm />
      </section>
      <Footer />
    </div>
  );
};

export default LandingPage;
