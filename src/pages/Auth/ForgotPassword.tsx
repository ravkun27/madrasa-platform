import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { postFetch, patchFetch } from "../../utils/apiCall";
import {
  FaSpinner,
  FaArrowLeft,
  FaEnvelope,
  FaPhone,
  // FaWhatsapp,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useLanguage } from "../../context/LanguageContext";

type SendOTPResponse = {
  success: boolean;
  data?: {
    optId?: string;
  };
  message?: string;
};

type ResetPasswordResponse = {
  success: boolean;
  message?: string;
};

enum Steps {
  SEND_OTP = 1,
  VERIFY_OTP = 2,
  RESET_PASSWORD = 3,
  SUCCESS = 4,
}

type ContactMethod = "email" | "phone";

const ForgotPassword = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<Steps>(Steps.SEND_OTP);
  const [contactMethod, setContactMethod] = useState<ContactMethod>("email");
  const [email, setEmail] = useState("");
  const [phoneNumber, _setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [optId, setOptId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
    exit: { y: -10, opacity: 0, transition: { duration: 0.2 } },
  };

  // Translations
  const translations = {
    en: {
      forgotPassword: "Forgot Password",
      resetPassword: "Reset Password",
      verifyOTP: "Verify OTP",
      createNewPassword: "Create New Password",
      success: "Success",
      emailOrPhone: "Choose contact method",
      email: "Email",
      phone: "Phone",
      emailPlaceholder: "Enter your email address",
      phonePlaceholder: "Enter your phone number with WhatsApp",
      whatsappRequired: "Number must have WhatsApp to receive OTP",
      whatsapp: "WhatsApp",
      sendOTP: "Send OTP",
      resendOTP: "Resend OTP",
      resendIn: "Resend in",
      seconds: "seconds",
      otpSent: "OTP sent to your",
      enterOTP: "Enter the 4-digit OTP",
      verify: "Verify",
      enterNewPassword: "Enter your new password",
      confirmNewPassword: "Confirm your new password",
      passwordPlaceholder: "Enter new password",
      confirmPasswordPlaceholder: "Confirm new password",
      passwordNotMatch: "Passwords do not match",
      passwordMinLength: "Password must be at least 6 characters",
      continue: "Continue",
      back: "Back",
      goToLogin: "Go to Login",
      resetSuccessful: "Password Reset Successful",
      resetSuccessMessage:
        "Your password has been reset successfully. You can now log in with your new password.",
      invalidEmail: "Please enter a valid email address",
      invalidPhone: "Please enter a valid phone number",
      invalidOTP: "Please enter the complete OTP",
      backToLogin: "Back to Login",
      otpExpired: "OTP expired. Please request a new one.",
      errorOccurred: "Something went wrong. Please try again.",
    },
    ar: {
      forgotPassword: "نسيت كلمة المرور",
      resetPassword: "إعادة تعيين كلمة المرور",
      verifyOTP: "التحقق من رمز OTP",
      createNewPassword: "إنشاء كلمة مرور جديدة",
      success: "نجاح",
      emailOrPhone: "اختر طريقة الاتصال",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      emailPlaceholder: "أدخل عنوان بريدك الإلكتروني",
      phonePlaceholder: "أدخل رقم هاتفك مع واتساب",
      whatsappRequired: "يجب أن يكون الرقم مسجلاً في واتساب لاستلام رمز OTP",
      whatsapp: "واتساب",
      sendOTP: "إرسال رمز OTP",
      resendOTP: "إعادة إرسال رمز OTP",
      resendIn: "إعادة إرسال خلال",
      seconds: "ثانية",
      otpSent: "تم إرسال رمز OTP إلى",
      enterOTP: "أدخل رمز OTP المكون من 4 أرقام",
      verify: "تحقق",
      enterNewPassword: "أدخل كلمة المرور الجديدة",
      confirmNewPassword: "تأكيد كلمة المرور الجديدة",
      passwordPlaceholder: "أدخل كلمة المرور الجديدة",
      confirmPasswordPlaceholder: "تأكيد كلمة المرور الجديدة",
      passwordNotMatch: "كلمات المرور غير متطابقة",
      passwordMinLength: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
      continue: "استمرار",
      back: "رجوع",
      goToLogin: "الذهاب إلى تسجيل الدخول",
      resetSuccessful: "تم إعادة تعيين كلمة المرور بنجاح",
      resetSuccessMessage:
        "تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.",
      invalidEmail: "يرجى إدخال عنوان بريد إلكتروني صالح",
      invalidPhone: "يرجى إدخال رقم هاتف صالح",
      invalidOTP: "يرجى إدخال رمز OTP كاملاً",
      backToLogin: "العودة إلى تسجيل الدخول",
      otpExpired: "انتهت صلاحية رمز OTP. يرجى طلب رمز جديد.",
      errorOccurred: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
    },
  };

  const t = translations[language];

  // Countdown for resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
    } else {
      setResendDisabled(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resendCountdown]);

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.charAt(0);
    }

    // Only allow digits
    if (value && !/^\d+$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  // Handle OTP input backspace
  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && index > 0 && !otp[index]) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  // Handle sending OTP
  const handleSendOTP = async () => {
    setLoading(true);

    // Validation
    if (contactMethod === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error(t.invalidEmail);
        setLoading(false);
        return;
      }
    } else {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(phoneNumber.replace(/^0/, ""))) {
        toast.error(t.invalidPhone);
        setLoading(false);
        return;
      }
    }

    try {
      const payload =
        contactMethod === "email"
          ? { email }
          : { phoneNumber: phoneNumber.replace(/^0/, ""), method: "whatsapp" };

      const result = await postFetch<SendOTPResponse>(
        "/user/sendOTP?for=forgetPassword",
        payload
      );

      if (result.success) {
        // Store optId if present (for phone number flow)
        if (result.data?.optId) {
          setOptId(result.data.optId);
        }

        // Set resend countdown
        setResendDisabled(true);
        setResendCountdown(30);

        toast.success(`OTP sent to your ${contactMethod}!`);
        setCurrentStep(Steps.VERIFY_OTP);
      } else {
        toast.error(result.message || t.errorOccurred);
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle verifying OTP
  const handleVerifyOTP = () => {
    // Validation
    if (otp.some((digit) => digit === "")) {
      toast.error(t.invalidOTP);
      return;
    }

    // Move to reset password step
    setCurrentStep(Steps.RESET_PASSWORD);
  };

  // Handle password reset
  const handleResetPassword = async () => {
    setLoading(true);

    // Validation
    if (password.length < 6) {
      toast.error(t.passwordMinLength);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t.passwordNotMatch);
      setLoading(false);
      return;
    }

    try {
      const otpValue = otp.join("");

      const payload =
        contactMethod === "email"
          ? { email, password, otp: otpValue }
          : {
              phoneNumber: phoneNumber.replace(/^0/, ""),
              password,
              optId,
              otp: otpValue,
            };

      const result = await patchFetch<ResetPasswordResponse>(
        "/user/password",
        payload
      );

      if (result.success) {
        toast.success(result.message || t.resetSuccessful);
        setCurrentStep(Steps.SUCCESS);
      } else {
        toast.error(result.message || t.errorOccurred);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || t.errorOccurred);
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = () => {
    handleSendOTP();
  };

  // Handle go back
  const handleGoBack = () => {
    if (currentStep > Steps.SEND_OTP) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate("/login");
    }
  };

  // Get step title
  const getStepTitle = () => {
    switch (currentStep) {
      case Steps.SEND_OTP:
        return t.forgotPassword;
      case Steps.VERIFY_OTP:
        return t.verifyOTP;
      case Steps.RESET_PASSWORD:
        return t.createNewPassword;
      case Steps.SUCCESS:
        return t.success;
      default:
        return t.forgotPassword;
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field: "password" | "confirmPassword") => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  // Dynamic styles based on theme
  const isDark = theme === "dark";
  const primaryColor = isDark ? "text-secondary" : "text-primary";
  const primaryBgColor = isDark ? "bg-secondary" : "bg-primary";
  const hoverBgColor = isDark ? "hover:bg-secondary/90" : "hover:bg-primary/90";
  const secondaryBgColor = isDark ? "bg-gray-800" : "bg-gray-100";
  const inputBgColor = isDark ? "bg-gray-800" : "bg-white";
  const cardBgColor = isDark ? "bg-gray-900" : "bg-white";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const labelColor = isDark ? "text-gray-300" : "text-gray-700";
  const mutedTextColor = isDark ? "text-gray-400" : "text-gray-500";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-background/90">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className={`relative w-full max-w-md p-6 sm:p-8 rounded-2xl shadow-2xl ${cardBgColor} border ${borderColor}`}
      >
        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGoBack}
          aria-label="Go back"
          className={`absolute top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-full ${
            isDark
              ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          } transition-all duration-300`}
        >
          <FaArrowLeft className="text-sm" />
        </motion.button>

        {/* Title */}
        <motion.div variants={itemVariants} className="mb-8 pt-4">
          <h1
            className={`text-2xl sm:text-3xl font-bold text-center ${textColor}`}
          >
            {getStepTitle()}
          </h1>
          <div className="w-16 h-1 mx-auto mt-3 rounded-full bg-gradient-to-r from-primary to-secondary"></div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Step 1: Send OTP */}
          {currentStep === Steps.SEND_OTP && (
            <motion.div
              key="step1"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={containerVariants}
              className="space-y-5"
            >
              {/* Contact Method Selection */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className={`text-sm font-medium ${labelColor}`}>
                  {t.emailOrPhone}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setContactMethod("email")}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                      contactMethod === "email"
                        ? `border-primary ${primaryBgColor} text-white`
                        : `${borderColor} ${secondaryBgColor} ${textColor}`
                    }`}
                  >
                    <FaEnvelope /> {t.email}
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactMethod("phone")}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                      contactMethod === "phone"
                        ? `border-primary ${primaryBgColor} text-white`
                        : `${borderColor} ${secondaryBgColor} ${textColor}`
                    }`}
                  >
                    <FaPhone /> {t.phone}
                  </button>
                </div>
              </motion.div>

              {/* Email/Phone Input */}
              <motion.div variants={itemVariants} className="space-y-2">
                {contactMethod === "email" ? (
                  <>
                    <label className={`text-sm font-medium ${labelColor}`}>
                      {t.email}
                    </label>
                    <input
                      type="email"
                      placeholder={t.emailPlaceholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={`w-full p-3 rounded-lg border ${borderColor} focus:ring-2 focus:ring-primary focus:border-primary ${inputBgColor} ${textColor} transition-all`}
                    />
                  </>
                ) : (
                  <>
                    {/* <label className={`text-sm font-medium ${labelColor}`}>
                      {t.phone}
                    </label>
                    <input
                      type="tel"
                      placeholder={t.phonePlaceholder}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      className={`w-full p-3 rounded-lg border ${borderColor} focus:ring-2 focus:ring-primary focus:border-primary ${inputBgColor} ${textColor} transition-all`}
                    /> */}
                    <div className="w-full flex items-center justify-between rounded-lg bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 px-4 py-3 text-sm font-medium">
                      ⚠️ This feature is coming soon. Verification method
                      selection will be available in a future update.
                    </div>
                  </>
                )}
              </motion.div>

              {/* WhatsApp Notice (only for phone) */}
              {/* {contactMethod === "phone" && (
                <motion.div variants={itemVariants} className="space-y-2">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300">
                    <FaWhatsapp className="text-lg flex-shrink-0" />
                    <span className="text-sm">{t.whatsappRequired}</span>
                  </div>
                </motion.div>
              )} */}

              {/* Submit Button */}
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSendOTP}
                disabled={loading}
                className={`w-full py-3.5 rounded-lg font-semibold ${primaryBgColor} text-white ${hoverBgColor} transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    {t.sendOTP}...
                  </>
                ) : (
                  t.sendOTP
                )}
              </motion.button>
            </motion.div>
          )}

          {/* Step 2: Verify OTP */}
          {currentStep === Steps.VERIFY_OTP && (
            <motion.div
              key="step2"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={containerVariants}
              className="space-y-5"
            >
              <motion.p
                variants={itemVariants}
                className={`text-center ${mutedTextColor}`}
              >
                {t.otpSent} {contactMethod === "email" ? email : phoneNumber}
              </motion.p>

              <motion.div variants={itemVariants} className="space-y-2">
                <label
                  className={`text-sm font-medium block text-center ${labelColor}`}
                >
                  {t.enterOTP}
                </label>
                <div className="flex justify-center gap-3 mt-3">
                  {[0, 1, 2, 3].map((index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={otp[index]}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className={`w-14 h-14 text-center text-xl font-bold rounded-lg border ${borderColor} focus:ring-2 focus:ring-primary focus:border-primary ${inputBgColor} ${textColor} transition-all`}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Resend OTP */}
              <motion.div variants={itemVariants} className="text-center">
                {resendDisabled ? (
                  <p className={`text-sm ${mutedTextColor}`}>
                    {t.resendIn}{" "}
                    <span className="font-semibold">{resendCountdown}</span>{" "}
                    {t.seconds}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className={`text-sm font-medium ${primaryColor} hover:underline`}
                  >
                    {t.resendOTP}
                  </button>
                )}
              </motion.div>

              {/* Verify Button */}
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleVerifyOTP}
                className={`w-full py-3.5 rounded-lg font-semibold ${primaryBgColor} text-white ${hoverBgColor} transition-all duration-300 flex items-center justify-center gap-2 shadow-lg`}
              >
                {t.verify}
              </motion.button>
            </motion.div>
          )}

          {/* Step 3: Reset Password */}
          {currentStep === Steps.RESET_PASSWORD && (
            <motion.div
              key="step3"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={containerVariants}
              className="space-y-5"
            >
              {/* New Password */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label
                  className={`text-sm font-medium flex items-center gap-2 ${labelColor}`}
                >
                  <FaLock className="text-xs" />
                  {t.enterNewPassword}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={t.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`w-full p-3 rounded-lg border ${borderColor} focus:ring-2 focus:ring-primary focus:border-primary ${inputBgColor} ${textColor} transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("password")}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none`}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </motion.div>

              {/* Confirm Password */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label
                  className={`text-sm font-medium flex items-center gap-2 ${labelColor}`}
                >
                  <FaLock className="text-xs" />
                  {t.confirmNewPassword}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t.confirmPasswordPlaceholder}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={`w-full p-3 rounded-lg border ${borderColor} focus:ring-2 focus:ring-primary focus:border-primary ${inputBgColor} ${textColor} transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirmPassword")}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none`}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </motion.div>

              {/* Reset Button */}
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleResetPassword}
                disabled={loading}
                className={`w-full py-3.5 rounded-lg font-semibold ${primaryBgColor} text-white ${hoverBgColor} transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    {t.resetPassword}...
                  </>
                ) : (
                  t.resetPassword
                )}
              </motion.button>
            </motion.div>
          )}

          {/* Step 4: Success */}
          {currentStep === Steps.SUCCESS && (
            <motion.div
              key="step4"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={containerVariants}
              className="space-y-5"
            >
              <motion.div
                variants={itemVariants}
                className="flex flex-col items-center gap-4"
              >
                <div
                  className={`w-16 h-16 ${primaryBgColor} rounded-full flex items-center justify-center`}
                >
                  <svg
                    className="w-8 h-8 text-white"
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
                <h2 className={`text-xl font-bold ${textColor}`}>
                  {t.resetSuccessful}
                </h2>
                <p className={`text-center ${mutedTextColor}`}>
                  {t.resetSuccessMessage}
                </p>
              </motion.div>

              {/* Go to Login Button */}
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/login")}
                className={`w-full py-3.5 rounded-lg font-semibold ${primaryBgColor} text-white ${hoverBgColor} transition-all duration-300 flex items-center justify-center gap-2 shadow-lg`}
              >
                {t.goToLogin}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
