import React from "react";
import { useNavigate } from "react-router-dom";
import Video from "../assests/dvideo.mp4";

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
          <video
            width="100%"
            height="auto"
            style={{ borderRadius: "20px", opacity: "0.8" }}
            autoPlay
            loop
            muted
          >
            <source src={Video} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </header>
    </div>
  );
}
