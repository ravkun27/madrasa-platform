import { useLanguage } from "../../context/LanguageContext";

const translations = {
  en: {
    cancel: "Cancel",
    confirm: "Confirm",
  },
  ar: {
    cancel: "إلغاء",
    confirm: "تأكيد",
  },
};

export const ConfirmationModal = ({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="fixed mt-20 inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
        <p className="text-gray-800 dark:text-gray-200 text-lg mb-4">
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            {t.cancel}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg"
          >
            {t.confirm}
          </button>
        </div>
      </div>
    </div>
  );
};
