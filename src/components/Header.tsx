import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import logoEng from "../assets/logoEng.png";
import logo from "../assets/logo.png";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import {
  FiSun,
  FiMoon,
  FiUser,
  FiMenu,
  FiX,
  FiLogOut,
  FiSettings,
  FiBook,
  FiInfo,
  FiMail,
} from "react-icons/fi";
import UserSettingsPage from "../pages/shared/UserSettingsPage";
import LanguageToggle from "./LanguageToggle";
import { useLanguage } from "../context/LanguageContext";

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      profile: "Profile",
      settings: "Settings",
      logout: "Logout",
      dashboard: "Dashboard",
      menu: "Menu",
      close: "Close",
      preferences: "Preferences",
      accountSettings: "Account Settings",
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
      profile: "الملف الشخصي",
      settings: "الإعدادات",
      logout: "تسجيل الخروج",
      dashboard: "لوحة التحكم",
      menu: "القائمة",
      close: "إغلاق",
      preferences: "التفضيلات",
      accountSettings: "إعدادات الحساب",
    },
  };

  const t = translations[language === "ar" ? "ar" : "en"];
  const isRTL = language === "ar";

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  useEffect(() => {
    if (showSettings || sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showSettings, sidebarOpen]);

  const navLinks = [
    { to: "/courses", label: t.courses, icon: <FiBook className="h-5 w-5" /> },
    { to: "/about", label: t.about, icon: <FiInfo className="h-5 w-5" /> },
    { to: "/contact", label: t.contact, icon: <FiMail className="h-5 w-5" /> },
  ];

  const handleLogout = () => {
    if (logout) logout();
    setSidebarOpen(false);
  };

  const openUserSettings = () => {
    setShowSettings(true);
    setSidebarOpen(false);
  };

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
          <div className="hidden md:flex flex-1 justify-center space-x-8 ml-44">
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
          <div className="flex md:hidden items-center space-x-3 overflow-x-hidden">
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
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-text hover:text-primary focus:outline-none"
              aria-label={t.menu}
            >
              <FiMenu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`fixed top-0 right-0 bottom-0 w-4/5 max-w-screen bg-background z-50 shadow-xl overflow-y-auto min-h-screen overflow-x-hidden`}
              style={{ direction: "ltr" }}
            >
              <div className="p-5 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <Link
                    to="/"
                    className="flex items-center space-x-2"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <img
                      src={language === "en" ? logoEng : logo}
                      alt="Logo"
                      className="h-8 w-auto"
                    />
                  </Link>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label={t.close}
                  >
                    <FiX className="w-6 h-6 text-text" />
                  </button>
                </div>

                {/* User Info */}
                {user && (
                  <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="bg-primary/10 rounded-full p-3">
                        <FiUser className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                          {user.role || t.user}
                        </p>
                      </div>
                    </div>

                    {/* Quick User Actions */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={openUserSettings}
                        className="flex items-center justify-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg py-2 px-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        <FiSettings className="w-4 h-4" />
                        <span>{t.settings}</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center justify-center space-x-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg py-2 px-3 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <FiLogOut className="w-4 h-4" />
                        <span>{t.logout}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex-1">
                  <ul className="space-y-1">
                    {navLinks.map((link) => (
                      <li key={link.to}>
                        <Link
                          to={link.to}
                          onClick={() => setSidebarOpen(false)}
                          className="flex items-center space-x-3 text-text hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg py-3 px-4 transition-colors"
                        >
                          {link.icon}
                          <span className="font-medium">{link.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Auth Links */}
                {!user && (
                  <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col space-y-3">
                      <Link
                        to="/login"
                        onClick={() => setSidebarOpen(false)}
                        className="text-text hover:text-primary border border-gray-300 dark:border-gray-700 rounded-lg py-3 px-4 text-center font-medium transition-colors"
                      >
                        {t.signIn}
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setSidebarOpen(false)}
                        className="bg-primary hover:bg-primary/90 text-white rounded-lg py-3 px-4 text-center font-medium transition-colors"
                      >
                        {t.signUp}
                      </Link>
                    </div>
                  </div>
                )}

                {/* Settings */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={toggleTheme}
                      className="p-2 text-text hover:text-primary transition-colors"
                      aria-label="Toggle theme"
                    >
                      {theme === "light" ? (
                        <FiMoon className="w-5 h-5" />
                      ) : (
                        <FiSun className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* User Settings Modal */}
      <UserSettingsPage
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </motion.header>
  );
};
export default Header;
