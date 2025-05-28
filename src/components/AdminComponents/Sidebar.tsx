// components/AdminDashboard/Sidebar.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiUsers,
  FiLogOut,
  FiMoon,
  FiSun,
  FiMenu,
  FiChevronLeft,
  FiChevronRight,
  FiUserCheck,
  FiEdit,
  FiUserPlus,
  FiActivity,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { LockOpenIcon } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const [role, setRole] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();

  // Get the screen width to manage responsiveness
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    // Close sidebar by default on mobile devices
    if (screenWidth < 768) {
      setIsOpen(false);
    }

    const handleResize = () => {
      setScreenWidth(window.innerWidth);
      if (window.innerWidth < 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const savedRole = localStorage.getItem("role");
    setRole(savedRole);
  }, []);

  const handleLogout = async () => {
    try {
      logout();
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Animation variants
  const sidebarVariants = {
    open: {
      width: screenWidth < 768 ? "280px" : "280px",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    closed: {
      width: screenWidth < 768 ? "0" : "80px",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  // We'll use this to control the icon animation and prevent shaking
  const iconContainerVariants = {
    open: {
      width: "24px",
      marginRight: "12px",
      transition: { duration: 0.2 },
    },
    closed: {
      width: "24px",
      marginRight: "0px",
      transition: { duration: 0.2 },
    },
  };

  const textVariants = {
    open: {
      opacity: 1,
      width: "auto",
      display: "block",
      transition: { delay: 0.1, duration: 0.2 },
    },
    closed: {
      opacity: 0,
      width: "0px",
      transitionEnd: { display: "none" },
      transition: { duration: 0.2 },
    },
  };

  // Menu items configuration with different icons
  const menuItems = [
    {
      id: "teachers",
      label: "Teachers",
      icon: <FiUserCheck size={20} />,
      visible: true,
    },
    {
      id: "students",
      label: "Students",
      icon: <FiUsers size={20} />,
      visible: true,
    },
    {
      id: "editPages",
      label: "Edit Pages",
      icon: <FiEdit size={20} />,
      visible: role === "superadmin",
    },
    {
      id: "admins",
      label: "Admins",
      icon: <FiUserPlus size={20} />,
      visible: role === "superadmin",
    },
    {
      id: "stats",
      label: "Statistics",
      icon: <FiActivity size={20} />,
      visible: true,
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && screenWidth < 768 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black"
          onClick={toggleSidebar}
        />
      )}

      {/* Toggle Button - Visible on mobile only when sidebar is closed */}
      {screenWidth < 768 && !isOpen && (
        <motion.button
          className="fixed z-50 top-4 left-4 p-2 rounded-full bg-blue-600 text-white shadow-lg"
          onClick={toggleSidebar}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FiMenu className="w-6 h-6" />
        </motion.button>
      )}

      <motion.div
        className="fixed h-screen bg-white dark:bg-gray-800 shadow-lg z-30 overflow-hidden"
        variants={sidebarVariants}
        initial={isOpen ? "open" : "closed"}
        animate={isOpen ? "open" : "closed"}
      >
        <div className="flex flex-col h-full">
          {/* Header - Fixed Height */}
          <div className="h-16 flex items-center px-4 justify-between border-b border-gray-200 dark:border-gray-700">
            <motion.div
              className="flex-1 flex items-center"
              variants={textVariants}
              initial="closed"
              animate={isOpen ? "open" : "closed"}
            >
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Admin Panel
              </h2>
            </motion.div>

            {/* Buttons in header */}
            <div className="flex items-center space-x-1">
              {/* Toggle button */}
              <motion.button
                onClick={toggleSidebar}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isOpen ? (
                  <FiChevronLeft className="w-5 h-5 z-50" />
                ) : (
                  <FiChevronRight className="w-5 h-5 z-50" />
                )}
              </motion.button>
            </div>
          </div>

          {/* Nav Items - Fixed Spacing */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="space-y-1 px-3">
              {menuItems.map(
                (item) =>
                  item.visible && (
                    <motion.button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        if (screenWidth < 768) setIsOpen(false);
                      }}
                      className={`w-full h-12 flex items-center rounded-lg transition-colors ${
                        activeTab === item.id
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100"
                          : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      } ${!isOpen ? "justify-center" : "px-4"}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.div
                        className="flex items-center justify-center"
                        variants={iconContainerVariants}
                        initial="closed"
                        animate={isOpen ? "open" : "closed"}
                      >
                        {item.icon}
                      </motion.div>

                      <motion.span
                        variants={textVariants}
                        initial="closed"
                        animate={isOpen ? "open" : "closed"}
                        className="whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    </motion.button>
                  )
              )}
            </div>
          </nav>

          {/* Logout Button */}
          <div
            className={`flex ${
              isOpen ? "flex-col justify-between" : "flex-col items-center"
            } border-t border-gray-200 dark:border-gray-700 py-3 px-3 gap-3`}
          >
            {/* Logout */}
            <motion.button
              onClick={handleLogout}
              className={`flex items-center w-full h-12 rounded-lg text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors ${
                !isOpen ? "justify-center" : "justify-start px-4"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="flex items-center justify-center mr-2"
                variants={iconContainerVariants}
                initial="closed"
                animate={isOpen ? "open" : "closed"}
              >
                <FiLogOut size={20} />
              </motion.div>
              <motion.span
                variants={textVariants}
                initial="closed"
                animate={isOpen ? "open" : "closed"}
                className="whitespace-nowrap"
              >
                Logout
              </motion.span>
            </motion.button>

            {/* Forgot Password */}
            <motion.button
              onClick={() => navigate("/forgot-password")}
              className={`flex items-center w-full h-12 rounded-lg text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors ${
                !isOpen ? "justify-center" : "justify-start px-4"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LockOpenIcon size={20} className="mr-2" />
              <motion.span
                variants={textVariants}
                initial="closed"
                animate={isOpen ? "open" : "closed"}
                className="whitespace-nowrap"
              >
                Forgot Password
              </motion.span>
            </motion.button>
            {/* Theme Toggle Button */}
            <motion.button
              onClick={toggleTheme}
              className={`flex items-center w-full h-12 rounded-lg transition-colors ${
                isOpen
                  ? "justify-start px-4 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  : "justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="flex items-center justify-center mr-2"
                variants={iconContainerVariants}
                initial="closed"
                animate={isOpen ? "open" : "closed"}
              >
                {theme === "light" ? <FiMoon size={20} /> : <FiSun size={20} />}
              </motion.div>
              <motion.span
                variants={textVariants}
                initial="closed"
                animate={isOpen ? "open" : "closed"}
                className="whitespace-nowrap"
              >
                {theme === "light" ? "Dark Mode" : "Light Mode"}
              </motion.span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
