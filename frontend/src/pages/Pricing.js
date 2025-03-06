import React from 'react'

export default function Pricing() {
  return (
    <div>
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
    </div>
  )
}
