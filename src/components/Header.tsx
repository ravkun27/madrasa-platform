import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import logoEng from "../assets/logoEng.png";
import { useTheme } from "../context/ThemeContext"; // Import useTheme hook
import { useAuth } from "../context/AuthContext"; // Import Auth Context
import { FiSun, FiMoon, FiUser } from "react-icons/fi"; // Icons for light/dark mode
import UserSettingsPage from "../pages/shared/UserSettingsPage";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme(); // Get theme and toggle function
  const { user } = useAuth(); // Get user & logout function
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);
  useEffect(() => {
    if (showSettings) {
      document.body.style.overflow = "hidden"; // Disable scrolling
    } else {
      document.body.style.overflow = ""; // Restore scrolling
    }

    return () => {
      document.body.style.overflow = ""; // Cleanup when unmounting
    };
  }, [showSettings]);

  return (
    <motion.header
      className="bg-white dark:bg-background-dark shadow-md sticky top-0 z-50"
      initial={{ opacity: 0 }} // Start invisible
      animate={{ opacity: 1 }} // Fade in
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }} // Add a slight delay
    >
      <nav className="container mx-auto px-4 lg:px-6 py-2">
        {/* Main Flex Container */}
        <div className="flex justify-between items-center">
          {/* Logo and Brand Name */}
          <Link
            to="/"
            className="flex items-center space-x-2 md:space-x-4 group flex-shrink-0"
          >
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.img
                src={logoEng}
                alt="Madarasa Platform Logo"
                className="h-16 w-auto sm:h-12 drop-shadow-lg"
              />
              {/* Subtle shimmer effect */}
              <motion.span
                className="absolute inset-0 bg-white/10 rounded-full opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-12 flex-grow justify-center ml-24">
            <Link
              to="/courses"
              className="text-gray-600 dark:text-text-dark hover:text-gray-800 dark:hover:text-primary transition duration-300 font-medium"
            >
              Courses
            </Link>
            <Link
              to="/about"
              className="text-gray-600 dark:text-text-dark hover:text-gray-800 dark:hover:text-primary transition duration-300 font-medium"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-gray-600 dark:text-text-dark hover:text-gray-800 dark:hover:text-primary transition duration-300 font-medium"
            >
              Contact
            </Link>
          </div>

          {/* Desktop Auth Buttons and Theme Toggle */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Desktop Auth & Theme Toggle */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                // User is logged in, show role
                <div className="relative">
                  <button
                    className="flex items-center space-x-2 text-gray-600 dark:text-text-dark hover:text-primary transition"
                    onClick={() => setShowSettings(true)}
                  >
                    <FiUser className="w-6 h-6" />
                    <span>{user?.role || "User"}</span>
                    {/* Handle missing role */}
                  </button>
                </div>
              ) : (
                // User is NOT logged in, show login/signup buttons
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 dark:text-text-dark hover:text-gray-800 dark:hover:text-primary transition duration-300 font-medium"
                  >
                    Sign In
                  </Link>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/signup"
                      className="bg-primary-gradient text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 font-medium"
                    >
                      Sign Up
                    </Link>
                  </motion.div>
                </>
              )}

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-text-dark hover:text-gray-800 dark:hover:text-primary transition duration-300"
              >
                {theme === "light" ? (
                  <FiMoon className="w-6 h-6" />
                ) : (
                  <FiSun className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
          {/* Mobile Menu Button and Theme Toggle */}
          <div className="relative md:hidden flex items-center space-x-4 z-50">
            {/* Theme Toggle Button (Mobile) */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-text-dark hover:text-gray-800 dark:hover:text-primary transition duration-300"
            >
              {theme === "light" ? (
                <FiMoon className="w-6 h-6" />
              ) : (
                <FiSun className="w-6 h-6" />
              )}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              className="text-black dark:text-white focus:outline-none z-50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                ></path>
              </svg>
            </button>
          </div>

          {/* Mobile Navigation Links (Toggled by state) */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                className="md:hidden fixed top-16 left-0 w-full bg-white dark:bg-gray-900 shadow-lg z-40"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="py-6 space-y-6 text-center flex flex-col items-center">
                  <Link
                    to="/courses"
                    className="text-lg sm:text-xl block w-full max-w-xs text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-primary transition duration-300 font-medium py-3"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Courses
                  </Link>
                  <Link
                    to="/about"
                    className="text-lg sm:text-xl block w-full max-w-xs text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-primary transition duration-300 font-medium py-3"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    to="/contact"
                    className="text-lg sm:text-xl block w-full max-w-xs text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-primary transition duration-300 font-medium py-3"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>

                  {/* Auth Buttons */}
                  <div className="flex flex-col items-center space-y-4 mt-4 w-full">
                    {user ? (
                      // If user is logged in, show profile dropdown
                      <div className="relative w-full flex flex-col items-center">
                        <button
                          className="flex items-center space-x-2 text-lg sm:text-xl text-secondary dark:text-secondary-dark hover:text-secondary-dark dark:hover:text-secondary transition font-medium"
                          onClick={() => setShowSettings(true)}
                        >
                          <FiUser className="w-6 h-6" />
                          <span>{user?.role || "User"}</span>
                          {/* Arrow Icon (Changes Direction Based on State) */}
                          <svg
                            className={`w-5 h-5 transition-transform ${
                              showSettings ? "rotate-180" : "rotate-0"
                            }`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      // If no user, show Sign In / Sign Up buttons
                      <>
                        <Link
                          to="/login"
                          className="text-lg sm:text-xl text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-primary transition duration-300 font-medium"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Sign In
                        </Link>
                        <motion.div
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Link
                            to="/signup"
                            className="text-lg sm:text-xl bg-primary-gradient text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold w-full max-w-xs text-center block"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Sign Up
                          </Link>
                        </motion.div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
      <UserSettingsPage
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </motion.header>
  );
};

export default Header;
