import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onVerify: () => void;
  isVerified: boolean;
  isVerifying: boolean;
}

const translations = {
  en: {
    label: "Verification Code",
    placeholder: "Enter 4-digit OTP",
    error: "Please enter a valid 4-digit code",
    verify: "Verify Code",
    verifying: "Verifying...",
    verified: "Verified",
    resend: "Resend Code",
    resendIn: (s: number) => `Resend in ${s}s`,
  },
  ar: {
    label: "رمز التحقق",
    placeholder: "أدخل رمز التحقق المكون من 4 أرقام",
    error: "يرجى إدخال رمز صحيح مكون من 4 أرقام",
    verify: "تحقق من الرمز",
    verifying: "جارٍ التحقق...",
    verified: "تم التحقق",
    resend: "إعادة إرسال الرمز",
    resendIn: (s: number) => `إعادة الإرسال خلال ${s}ث`,
  },
};

export default function OtpInput({
  value,
  onChange,
  onVerify,
  isVerified,
  isVerifying,
}: OtpInputProps) {
  const [showError, setShowError] = useState(false);
  const [timer, setTimer] = useState(0);
  const { language } = useLanguage();
  const t = translations[language];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, "").slice(0, 4);
    onChange(input);
    if (showError) setShowError(false);
  };

  const handleLocalVerify = () => {
    if (value.length !== 4) {
      setShowError(true);
      return;
    }
    onVerify();
  };

  const handleResend = () => {
    setTimer(30);
    onChange("");
    setShowError(false);
  };

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="otp-input"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t.label}
          </label>

          <div className="relative">
            <input
              id="otp-input"
              type="text"
              placeholder={t.placeholder}
              value={value}
              onChange={handleChange}
              className={`w-full p-4 text-lg text-center tracking-widest border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all
                ${showError ? "border-red-500 ring-1 ring-red-500" : "border-gray-300 dark:border-gray-600"}
                ${isVerified ? "border-green-500 bg-green-50 dark:bg-green-900/10" : "dark:bg-gray-800 dark:text-white"}`}
              disabled={isVerified}
            />

            {isVerified && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg
                  className="w-6 h-6 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </div>

          {showError && <p className="text-sm text-red-500 mt-1">{t.error}</p>}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleLocalVerify}
            disabled={isVerifying || isVerified || value.length !== 4}
            className={`flex-1 p-3 rounded-lg font-medium flex items-center justify-center transition-all
              ${
                isVerifying || isVerified || value.length !== 4
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              }`}
          >
            {isVerifying ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t.verifying}
              </>
            ) : isVerified ? (
              t.verified
            ) : (
              t.verify
            )}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={timer > 0}
            className={`px-3 py-3 rounded-lg font-medium transition-all whitespace-nowrap
              ${
                timer > 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
          >
            {timer > 0 ? t.resendIn(timer) : t.resend}
          </button>
        </div>
      </div>
    </div>
  );
}
