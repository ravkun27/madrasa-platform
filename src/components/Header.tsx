import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <motion.header
      className="bg-white shadow-md sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex justify-between items-center">
          {/* Logo and Brand Name */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.img
              src={logo}
              alt="TeachPlatform Logo"
              className="h-10 w-auto sm:h-12"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            />
            <span className="text-xl sm:text-2xl font-bold text-gray-800">
              Madarasa Platform
            </span>
          </Link>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              className="text-gray-800 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg
                className="w-6 h-6"
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

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/courses"
              className="text-gray-600 hover:text-gray-800 transition duration-300 font-medium"
            >
              Courses
            </Link>
            <Link
              to="/about"
              className="text-gray-600 hover:text-gray-800 transition duration-300 font-medium"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-gray-600 hover:text-gray-800 transition duration-300 font-medium"
            >
              Contact
            </Link>
          </div>

          {/* Auth Buttons (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/auth"
              className="text-gray-600 hover:text-gray-800 transition duration-300 font-medium"
            >
              Sign In
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/auth"
                className="bg-primary-gradient text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 font-medium"
              >
                Sign Up
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Mobile Navigation Links (Toggled by state) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="md:hidden overflow-hidden"
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                closed: {
                  opacity: 0,
                  height: 0,
                  transition: { duration: 0.4, ease: "easeInOut" },
                },
                open: {
                  opacity: 1,
                  height: "auto",
                  transition: { duration: 0.4, ease: "easeInOut" },
                },
              }}
            >
              <motion.div className="py-4 space-y-4">
                <Link
                  to="/courses"
                  className="block text-gray-600 hover:text-gray-800 transition duration-300 font-medium py-2"
                >
                  Courses
                </Link>
                <Link
                  to="/about"
                  className="block text-gray-600 hover:text-gray-800 transition duration-300 font-medium py-2"
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="block text-gray-600 hover:text-gray-800 transition duration-300 font-medium py-2"
                >
                  Contact
                </Link>
                <div className="flex flex-col space-y-4 mt-4">
                  <Link
                    to="/auth"
                    className="text-gray-600 hover:text-gray-800 transition duration-300 font-medium"
                  >
                    Sign In
                  </Link>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to="/auth"
                      className="bg-primary-gradient text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 font-medium text-center block"
                    >
                      Sign Up
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
};

export default Header;
