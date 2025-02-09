import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom"; // Import Outlet
import { useTheme } from "../context/ThemeContext";

const PublicLayout: React.FC = () => {
  const { theme } = useTheme();

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="flex flex-col min-h-screen bg-background dark:bg-background-dark">
      <Header />
      <motion.main
        className="flex-grow p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Outlet />
      </motion.main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
