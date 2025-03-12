import React, { useState, useRef, useEffect } from "react";
import DefaultImg from "../assests/user.png";
import { useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";
import config from "../config";
import "./style.css";

export default function NavBar() {
  const [user, setUser] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useRef(null);
  const [currentTime, setCurrentTime] = useState(new Date());

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
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
    <div>
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
        <div className="current-time">
          🕒 {currentTime.toLocaleDateString()} |{" "}
          {currentTime.toLocaleTimeString()}
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
              Hi! {user.name ? user.name.split(" ")[0] : "Guest"}
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
    </div>
  );
}
