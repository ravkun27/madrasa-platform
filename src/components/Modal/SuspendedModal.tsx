import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

interface SuspendedModalProps {
  onClose?: () => void;
}

const SuspendedModal: React.FC<SuspendedModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const t: any = {
    title: {
      en: "Account Suspended",
      ar: "تم تعليق الحساب",
    },
    message: {
      en: "Your account has been suspended due to violations of our platform rules. Please contact our support team for further assistance.",
      ar: "تم تعليق حسابك بسبب انتهاك قواعد المنصة. يرجى التواصل مع فريق الدعم لمزيد من المساعدة.",
    },
    guidelinesTitle: {
      en: "⚠️ Cautionary Guidelines:",
      ar: "⚠️ إرشادات هامة:",
    },
    guidelines: {
      en: [
        "Use the same device consistently. It’s best to avoid frequently switching devices.",
        "Do not share your account with others.",
        "Avoid using VPNs or proxies to mask your location.",
        "Respect the platform rules and terms of service.",
        "Do not create multiple accounts for the same user.",
      ],
      ar: [
        "استخدم نفس الجهاز باستمرار. من الأفضل تجنب التبديل المتكرر بين الأجهزة.",
        "لا تشارك حسابك مع الآخرين.",
        "تجنب استخدام VPN أو البروكسي لإخفاء موقعك.",
        "احترم قواعد وشروط استخدام المنصة.",
        "لا تقم بإنشاء حسابات متعددة لنفس المستخدم.",
      ],
    },
    contactBtn: {
      en: "Contact Support",
      ar: "تواصل مع الدعم",
    },
    closeBtn: {
      en: "Close",
      ar: "إغلاق",
    },
  };

  const dir = language === "ar" ? "rtl" : "ltr";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 overflow-hidden">
      <div
        className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg max-w-md w-full"
        dir={dir}
      >
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          {t.title[language]}
        </h2>
        <p className="text-sm text-gray-700 dark:text-gray-200 mb-4">
          {t.message[language]}
        </p>
        <div className="border-t border-gray-300 dark:border-gray-700 pt-4 mt-4">
          <h3 className="text-sm font-semibold mb-2">
            {t.guidelinesTitle[language]}
          </h3>
          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
            {t.guidelines[language].map((item: any, index: any) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="mt-6 text-right space-x-2" dir={dir}>
          <button
            onClick={() => navigate("/contact")}
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-800 transition-colors text-sm mx-4"
          >
            {t.contactBtn[language]}
          </button>
          <button
            onClick={onClose}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors text-sm"
          >
            {t.closeBtn[language]}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuspendedModal;
