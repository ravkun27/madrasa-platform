import { useState, useEffect } from "react";
import { getFetch, deleteFetch } from "../../utils/apiCall";
import { toast } from "react-hot-toast";
import { FiChevronLeft, FiSettings } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ProfileSection from "../../components/ProfileSection";
import SecuritySection from "../../components/SecuritySection";
import AccountManagementSection from "../../components/AccountManagementSection";
import { ConfirmationModal } from "../../components/Modal/ConfiramtionModal";
import { useLanguage } from "../../context/LanguageContext";

// Animation variants
const slideInVariants = {
  hidden: { x: "100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: { x: "100%", opacity: 0, transition: { duration: 0.2 } },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

interface UserSettingsPageProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserData {
  name: string;
  email: string;
  phone: string;
  telegram?: string;
  whatsapp?: string;
  contactMethod?: string;
}

const UserSettingsPage = ({
  isOpen = false,
  onClose = () => {},
}: UserSettingsPageProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    name: "",
    email: "",
    phone: "",
    contactMethod: "telegram",
  });
  const { language } = useLanguage();

  const translations = {
    en: {
      settings: {
        title: "Account Settings",
        back: "Back",
        dashboard: "Dashboard",
        loading: "Loading...",
        signin_prompt: "Sign in to access your account settings",
        signin: "Sign In",
        signup: "Sign Up",
        logout_success: "Logged out successfully",
        logout_fail: "Logout failed",
        delete_account: "Delete Account",
        delete_confirm_message: "Are you sure you want to delete this admin?",
        delete_success: "Account deleted successfully",
        delete_fail: "Account deletion failed",
        fetch_fail: "Failed to load user data",
      },
    },
    ar: {
      settings: {
        title: "إعدادات الحساب",
        back: "رجوع",
        dashboard: "لوحة التحكم",
        loading: "جارٍ التحميل...",
        signin_prompt: "قم بتسجيل الدخول للوصول إلى إعدادات حسابك",
        signin: "تسجيل الدخول",
        signup: "إنشاء حساب",
        logout_success: "تم تسجيل الخروج بنجاح",
        logout_fail: "فشل في تسجيل الخروج",
        delete_account: "حذف الحساب",
        delete_confirm_message: "هل أنت متأكد أنك تريد حذف هذا المسؤول؟",
        delete_success: "تم حذف الحساب بنجاح",
        delete_fail: "فشل في حذف الحساب",
        fetch_fail: "فشل في تحميل بيانات المستخدم",
      },
    },
  };
  const t = translations[language];

  useEffect(() => {
    if (user && isOpen) {
      fetchUserData();
      // Lock body scroll when sidebar is open
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = "auto";
      };
    }
  }, [isOpen, user]);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const result: any = await getFetch("/user", { showToast: false });
      if (result.success) {
        setUserData({
          name: `${result.data.firstName || ""} ${result.data.lastName || ""}`.trim(),
          email: result.data.email,
          phone: result.data.phoneNumber,
          telegram: result.data.telegram,
          whatsapp: result.data.whatsapp,
          contactMethod: result.data.TelegramOrWhatsapp || "telegram",
        });
      }
    } catch (error) {
      toast.error(t.settings.fetch_fail);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success(t.settings.logout_success);
      onClose();
      navigate("/login");
    } catch (error) {
      toast.error(t.settings.logout_fail);
    }
  };

  // Triggered when the "Delete Account" button is clicked
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  // Called only when the user confirms deletion in the modal
  const handleConfirmDelete = async () => {
    setIsLoading(true);
    try {
      await deleteFetch("/user");
      logout();
      toast.success(t.settings.delete_success);
      onClose();
      navigate("/");
    } catch (error) {
      toast.error(t.settings.delete_fail);
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden min-h-screen">
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sidebar */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pointer-events-none">
            <motion.div
              variants={slideInVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full sm:max-w-md md:max-w-lg bg-white dark:bg-gray-900 shadow-xl overflow-y-auto flex flex-col h-full pointer-events-auto"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                  {/* Back button */}
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label="Close"
                  >
                    <FiChevronLeft className="w-6 h-6" />
                  </motion.button>

                  {/* Title */}
                  {user && (
                    <div className="flex items-center justify-between flex-1 ml-4">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-base font-semibold">
                        <FiSettings className="w-5 h-5" />
                        <span>{t.settings.title}</span>
                      </div>
                      <Link
                        to={`/${user.role}-dashboard`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors text-center"
                        onClick={onClose}
                      >
                        {t.settings.dashboard}
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              {isLoading && !userData.name ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : user ? (
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-6 max-w-2xl mx-auto">
                    <ProfileSection
                      userData={userData}
                      setUserData={setUserData}
                    />
                    <SecuritySection userData={userData} />
                    <AccountManagementSection
                      onLogout={handleLogout}
                      onDeleteAccount={handleDeleteClick}
                      isLoading={isLoading}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-center items-center gap-6 p-6">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    {t.settings.signin_prompt}
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
                    <Link
                      to="/login"
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg text-center font-medium hover:bg-blue-700 transition-colors"
                      onClick={onClose}
                    >
                      {t.settings.signin}
                    </Link>
                    <Link
                      to="/signup"
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-lg text-center font-medium hover:from-indigo-700 hover:to-blue-700 transition-colors"
                      onClick={onClose}
                    >
                      {t.settings.signup}
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {showDeleteConfirm && (
            <ConfirmationModal
              message={t.settings.delete_confirm_message}
              onConfirm={handleConfirmDelete}
              onCancel={() => setShowDeleteConfirm(false)}
            />
          )}
        </div>
      )}
    </AnimatePresence>
  );
};

export default UserSettingsPage;
