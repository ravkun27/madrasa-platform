import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/logo.png"; // Ensure the logo.png file is in the same directory or update the path

const Header = () => {
  return (
    <motion.header
      className="bg-white shadow-md sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <nav className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Logo and Brand Name */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.img
              src={logo}
              alt="TeachPlatform Logo"
              className="h-14 w-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            />
            <span className="text-2xl font-bold text-gray-800">
              TeachPlatform
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
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

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Link
              to="/auth"
              className="text-gray-600 hover:text-gray-800 transition duration-300 font-medium"
            >
              Sign In
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/auth"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300 font-medium"
              >
                Sign Up
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>
    </motion.header>
  );
};

export default Header;
