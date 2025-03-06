import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardLogo from "../logo/BuySellNexusLogo";

export default function Header() {
  const navigate = useNavigate();

  const handleOurSellers = () => {
    navigate("/sellers-list");
  };
  return (
    <div>
      <header className="hero">
        <div className="hero-content">
          <h1>Streamline Your Buying & Selling Process</h1>
          <p>The ultimate management system for businesses of all sizes</p>
          <button className="cta-btn">Get Started</button>&nbsp;&nbsp;
          <button className="cta-btn" onClick={handleOurSellers}>
            Our Sellers
          </button>
        </div>
        <div className="hero-image">
          <DashboardLogo width={450} height={450} />
        </div>
      </header>
    </div>
  );
}
