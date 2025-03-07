import React, { useState, useRef } from "react";
import { Toast } from "primereact/toast";

export default function GetStartForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const toast = useRef(null);

  const showToast = (severity, summary, detail) => {
    toast.current.show({ severity, summary, detail, life: 3000 });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    fetch("https://formcarry.com/s/BNM2SsM78wm", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, message }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.code === 200) {
          showToast(
            "success",
            "Success",
            "We received your submission, thank you!"
          );
          setName("");
          setEmail("");
          setMessage("");
        } else {
          showToast("error", "Error", response.message);
        }
      })
      .catch((error) => {
        showToast("error", "Error", error.message ? error.message : error);
      });
  };

  return (
    <div>
      <Toast ref={toast} />
      <h2>Ready to Get Started?</h2>
      <p>
        Contact our team for a free demo or to learn more about BuySell Nexus
      </p>
      <form className="contact-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <textarea
          placeholder="Your Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        ></textarea>
        <button type="submit" className="submit-btn">
          Send Message
        </button>
      </form>
    </div>
  );
}
