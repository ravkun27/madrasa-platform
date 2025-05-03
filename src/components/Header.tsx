import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import logoEng from "../assets/logoEng.png";
import logo from "../assets/logo.png";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { FiSun, FiMoon, FiUser, FiMenu, FiX } from "react-icons/fi";
import UserSettingsPage from "../pages/shared/UserSettingsPage";
import LanguageToggle from "./LanguageToggle";
import { useLanguage } from "../context/LanguageContext";

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language } = useLanguage();

  const translations = {
    en: {
      courses: "Courses",
      about: "About",
      contact: "Contact",
      signIn: "Sign In",
      signUp: "Sign Up",
      user: "User",
      student: "Student",
      teacher: "Teacher",
    },
    ar: {
      courses: "الدورات",
      about: "حول",
      contact: "اتصل",
      signIn: "تسجيل الدخول",
      signUp: "إنشاء حساب",
      user: "مستخدم",
      student: "طالب",
      teacher: "معلم",
    },
  };

  const t = translations[language === "ar" ? "ar" : "en"];
  const isRTL = language === "ar";

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  useEffect(() => {
    if (showSettings || mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showSettings, mobileMenuOpen]);

  const navLinks = [
    { to: "/courses", label: t.courses },
    { to: "/about", label: t.about },
    { to: "/contact", label: t.contact },
  ];

  return (
    <motion.header
      className={`bg-background/90 backdrop-blur-md shadow-sm sticky top-0 z-50 ${
        isRTL ? "font-arabic" : ""
      }`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <nav className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 group flex-shrink-0"
            style={{ direction: "ltr" }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <img
                src={language === "en" ? logoEng : logo}
                alt="Madarasa Platform Logo"
                className="h-10 w-auto"
              />
            </motion.div>
          </Link>
          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-1 justify-center space-x-8 ml-64">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-text hover:text-primary relative py-2 text-sm font-medium tracking-wide transition duration-300 ease-in-out"
              >
                {link.label}
                <motion.span
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary"
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-5 flex-shrink-0">
            {user ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowSettings(true)}
                className="flex items-center space-x-2 text-text hover:text-primary transition group"
              >
                <div className="bg-primary/10 rounded-full p-2 group-hover:bg-primary/20 transition">
                  <FiUser className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium capitalize">
                  {user?.role || t.user}
                </span>
              </motion.button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-text hover:text-primary transition duration-300 text-sm font-medium"
                >
                  {t.signIn}
                </Link>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/signup"
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                  >
                    {t.signUp}
                  </Link>
                </motion.div>
              </>
            )}

            <LanguageToggle />

            <motion.button
              whileHover={{ rotate: 15 }}
              onClick={toggleTheme}
              className="p-2 text-text hover:text-primary transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <FiMoon className="w-5 h-5" />
              ) : (
                <FiSun className="w-5 h-5" />
              )}
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-3">
            <LanguageToggle />

            <motion.button
              whileHover={{ rotate: 15 }}
              onClick={toggleTheme}
              className="p-2 text-text hover:text-primary transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <FiMoon className="w-5 h-5" />
              ) : (
                <FiSun className="w-5 h-5" />
              )}
            </motion.button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-text hover:text-primary focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-background/95 backdrop-blur-md"
          >
            <div className="px-4 py-5 space-y-6 border-t border-gray-200 dark:border-gray-700">
              {/* Navigation Links */}
              <div className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-text hover:text-primary py-2 text-lg font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Auth Links */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                {user ? (
                  <button
                    onClick={() => {
                      setShowSettings(true);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 text-text hover:text-primary transition w-full py-2"
                  >
                    <div className="bg-primary/10 rounded-full p-2">
                      <FiUser className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium">{user?.role || t.user}</span>
                  </button>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-text hover:text-primary transition py-2 text-lg font-medium"
                    >
                      {t.signIn}
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-full text-lg font-medium text-center transition-colors"
                    >
                      {t.signUp}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <UserSettingsPage
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </motion.header>
  );
};

export default Header;
