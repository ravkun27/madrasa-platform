import { FaCheck, FaSpinner } from "react-icons/fa";
import { useLanguage } from "../context/LanguageContext";

const translations = {
  en: {
    emailPlaceholder: "Email",
    sendOtp: "Send OTP",
    sending: "Sending...",
    resendIn: (s: number) => `Resend in ${s}s`,
    otpPlaceholder: "Enter 4-digit OTP",
    verifying: "Verifying...",
    verify: "Verify",
    notReceived: "Didn't receive the code? Check your spam or junk folder.",
    resendCode: "Resend code",
    success: "Email verified successfully",
  },
  ar: {
    emailPlaceholder: "البريد الإلكتروني",
    sendOtp: "إرسال الرمز",
    sending: "جاري الإرسال...",
    resendIn: (s: number) => `أعد الإرسال خلال ${s} ثانية`,
    otpPlaceholder: "أدخل رمز التحقق المكون من 4 أرقام",
    verifying: "جارٍ التحقق...",
    verify: "تحقق",
    notReceived: "لم يصلك الرمز؟ تحقق من مجلد الرسائل غير المرغوب فيها.",
    resendCode: "إعادة إرسال الرمز",
    success: "تم التحقق من البريد الإلكتروني بنجاح",
  },
};

export const EmailVerification = ({
  email,
  setEmail,
  isOtpSent,
  isOtpVerified,
  isSendingOtp,
  countdown,
  onSendOtp,
  onVerifyOtp,
  otp,
  setOtp,
  isVerifyingOtp,
}: {
  email: string;
  setEmail: (value: string) => void;
  isOtpSent: boolean;
  isOtpVerified: boolean;
  isSendingOtp: boolean;
  countdown: number;
  onSendOtp: () => void;
  onVerifyOtp: () => void;
  otp: string;
  setOtp: (value: string) => void;
  isVerifyingOtp: boolean;
}) => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="space-y-5">
      {/* Email Input Section */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="email"
            placeholder={t.emailPlaceholder}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isOtpVerified}
            className="w-full p-3.5 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 disabled:bg-gray-50 disabled:opacity-75"
            aria-label="Email address"
          />
          {isOtpVerified && (
            <FaCheck className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-green-500 text-lg" />
          )}
        </div>
        {!isOtpVerified && (
          <button
            type="button"
            onClick={onSendOtp}
            disabled={
              countdown > 0 || isSendingOtp || isOtpVerified || !email.trim()
            }
            className={`w-full sm:w-36 px-4 py-3.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium ${
              countdown > 0 || isSendingOtp || isOtpVerified || !email.trim()
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-primary hover:bg-primary/90 active:bg-primary/95 text-white shadow-sm hover:shadow"
            }`}
          >
            {isSendingOtp ? (
              <>
                <FaSpinner className="animate-spin text-base" />
                <span>{t.sending}</span>
              </>
            ) : countdown > 0 ? (
              <span className="font-medium">{t.resendIn(countdown)}</span>
            ) : (
              <span>{t.sendOtp}</span>
            )}
          </button>
        )}
      </div>

      {/* OTP Verification Section */}
      {isOtpSent && !isOtpVerified && (
        <div className="flex flex-col gap-3 mt-1 pt-4 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={t.otpPlaceholder}
                required
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                className="w-full p-3.5 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-center tracking-widest text-lg"
                aria-label="Verification code"
              />
            </div>
            <button
              type="button"
              onClick={onVerifyOtp}
              disabled={isVerifyingOtp || otp.length !== 4}
              className={`w-full sm:w-36 px-4 py-3.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium ${
                isVerifyingOtp || otp.length !== 4
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90 active:bg-primary/95 text-white shadow-sm hover:shadow"
              }`}
            >
              {isVerifyingOtp ? (
                <>
                  <FaSpinner className="animate-spin text-base" />
                  <span>{t.verifying}</span>
                </>
              ) : (
                <span>{t.verify}</span>
              )}
            </button>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <p className="text-sm text-gray-500 mt-1">{t.notReceived}</p>
            {countdown === 0 && isOtpSent && !isOtpVerified && (
              <button
                type="button"
                onClick={onSendOtp}
                disabled={isSendingOtp}
                className="text-sm text-primary hover:text-primary/80 font-medium mt-2 sm:mt-0"
              >
                {t.resendCode}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Success Message */}
      {isOtpVerified && (
        <div className="flex items-center gap-2 text-green-600 px-4 py-2.5 bg-green-50 rounded-lg mt-2 text-sm font-medium">
          <FaCheck className="text-base" />
          <span>{t.success}</span>
        </div>
      )}
    </div>
  );
};
