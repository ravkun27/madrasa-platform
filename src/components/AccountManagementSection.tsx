import { useState } from "react";
import { FiLogOut, FiTrash2, FiInfo } from "react-icons/fi";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";

interface AccountManagementSectionProps {
  onClose?: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  isLoading: boolean;
  language?: "en" | "ar";
}

const AccountManagementSection = ({
  onLogout,
  onDeleteAccount,
  isLoading,
}: AccountManagementSectionProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userInput, setUserInput] = useState("");

  const { language } = useLanguage();

  const translations = {
    en: {
      accountManagement: "Account Management",
      logout: "Log Out",
      deleteAccount: "Delete Account",
      deleteWarningTitle: "Warning: This action cannot be undone",
      deleteWarningText:
        "Deleting your account will remove all your data permanently. You won't be able to recover your profile, courses, or any other information.",
      typeToConfirm: 'Type "delete" to confirm',
      deletePlaceholder: "delete",
      deleting: "Deleting...",
      confirmDelete: "Confirm Delete",
      cancel: "Cancel",
      permanentDeleteWarning:
        "Warning: Deleting your account is permanent and cannot be undone.",
    },
    ar: {
      accountManagement: "إدارة الحساب",
      logout: "تسجيل الخروج",
      deleteAccount: "حذف الحساب",
      deleteWarningTitle: "تحذير: هذا الإجراء لا يمكن التراجع عنه",
      deleteWarningText:
        "سيؤدي حذف حسابك إلى إزالة جميع بياناتك نهائيًا. لن تتمكن من استعادة ملفك الشخصي أو الدورات أو أي معلومات أخرى.",
      typeToConfirm: 'اكتب "delete" للتأكيد',
      deletePlaceholder: "delete",
      deleting: "جارٍ الحذف...",
      confirmDelete: "تأكيد الحذف",
      cancel: "إلغاء",
      permanentDeleteWarning: "تحذير: حذف حسابك نهائي ولا يمكن التراجع عنه.",
    },
  };

  const t = translations[language];

  const handleStartDeleteProcess = () => {
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setUserInput("");
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  return (
    <section className="mt-8">
      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800/50">
        <h3 className="text-base font-semibold text-red-600 dark:text-red-400 mb-4">
          {t.accountManagement}
        </h3>

        {showDeleteConfirm ? (
          <div className="space-y-4">
            <div className="bg-red-100 dark:bg-red-900/40 p-3 rounded-lg flex items-start gap-3">
              <div className="flex-shrink-0 p-1 bg-red-200 dark:bg-red-800 rounded-full mt-0.5">
                <FiInfo className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-sm text-red-700 dark:text-red-300">
                <p className="font-medium mb-1">{t.deleteWarningTitle}</p>
                <p>{t.deleteWarningText}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.typeToConfirm}
              </label>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder={t.deletePlaceholder}
              />
            </div>

            <div className="flex gap-3">
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={handleCancelDelete}
                className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                {t.cancel}
              </motion.button>
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={onDeleteAccount}
                className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                disabled={isLoading || userInput.toLowerCase() !== "delete"}
              >
                {isLoading ? t.deleting : t.confirmDelete}
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={onLogout}
              className="flex justify-center items-center gap-2 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              <FiLogOut className="w-4 h-4" />
              {t.logout}
            </motion.button>
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={handleStartDeleteProcess}
              className="flex justify-center items-center gap-2 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              disabled={isLoading}
            >
              <FiTrash2 className="w-4 h-4" />
              {t.deleteAccount}
            </motion.button>
          </div>
        )}

        {!showDeleteConfirm && (
          <p className="text-xs text-red-500 dark:text-red-400 mt-3">
            {t.permanentDeleteWarning}
          </p>
        )}
      </div>
    </section>
  );
};

export default AccountManagementSection;
