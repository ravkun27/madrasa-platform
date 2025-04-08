import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Redirect if not authenticated or user is null
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-text">
      <Header />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        aria-label="Main content"
      >
        <Outlet />
      </motion.main>
      <Footer />
    </div>
  );
};

export default ProtectedLayout;
