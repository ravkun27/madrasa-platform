import React from "react";
import { useTheme } from "../context/ThemeContext"; // Import useTheme hook

const LoadingScreen: React.FC = () => {
  const { theme } = useTheme(); // Get the current theme from context

  return (
    <div
      className={`flex items-center justify-center min-h-screen ${
        theme === "light" ? "bg-background" : "bg-background-dark"
      }`}
    >
      <svg
        width="200px"
        height="95px"
        viewBox="0 0 187.3 93.7"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          stroke="#00c6ff"
          id="outline"
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="10"
          d="M93.9,46.4c9.3,9.5,13.8,17.9,23.5,17.9s17.5-7.8,17.5-17.5s-7.8-17.6-17.5-17.5c-9.7,0.1-13.3,7.2-22.1,17.1 -8.9,8.8-15.7,17.9-25.4,17.9s-17.5-7.8-17.5-17.5s7.8-17.5,17.5-17.5S86.2,38.6,93.9,46.4z"
        ></path>
        <path
          id="outline-bg"
          opacity="0.05"
          fill="none"
          stroke="#f5981c"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="10"
          d="M93.9,46.4c9.3,9.5,13.8,17.9,23.5,17.9s17.5-7.8,17.5-17.5s-7.8-17.6-17.5-17.5c-9.7,0.1-13.3,7.2-22.1,17.1 -8.9,8.8-15.7,17.9-25.4,17.9s-17.5-7.8-17.5-17.5s7.8-17.5,17.5-17.5S86.2,38.6,93.9,46.4z"
        ></path>
      </svg>
    </div>
  );
};

export default LoadingScreen;
