import React from "react";

const BuySellNexusLogo = ({ width = 200, height = 50 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 100"
      width={width}
      height={height}
    >
      <rect x="10" y="20" width="80" height="60" rx="8" fill="#3498db" />

      <path
        d="M30 60 L50 40 L70 60"
        stroke="white"
        stroke-width="5"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <path
        d="M30 40 L50 60 L70 40"
        stroke="#2c3e50"
        stroke-width="5"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        opacity="0.7"
      />

      <circle cx="90" cy="50" r="10" fill="#3498db" />

      <text
        x="110"
        y="55"
        fontFamily="Arial"
        fontWeight="bold"
        fontSize="32"
        fill="#2c3e50"
      >
        BuySell
      </text>

      <text
        x="230"
        y="55"
        fontFamily="Arial"
        fontWeight="bold"
        fontSize="32"
        fill="#3498db"
      >
        NEXUS
      </text>

      <text x="110" y="75" fontFamily="Arial" fontSize="12" fill="#7f8c8d">
        Streamline Your Trading Experience
      </text>
    </svg>
  );
};

export default BuySellNexusLogo;
