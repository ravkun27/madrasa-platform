import { useState } from "react";
import { FiCheck, FiEdit, FiLock, FiX } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { postFetch, patchFetch } from "../utils/apiCall";
import { useLanguage } from "../context/LanguageContext";

interface SecuritySectionProps {
  userData: {
    email: string;
    phone: string;
  };
}

const SecuritySection = ({ userData }: SecuritySectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [editState, setEditState] = useState({
    isEditing: false,
    value: "",
    showOptions: false,
  });

  const [otpState, setOtpState] = useState({
    otpId: "",
    otpCode: "",
    isOTPSent: false,
    verificationMethod: "email", // Default to email verification
  });
  const { language } = useLanguage();
  const translations = {
    en: {
      security: "Security",
      password: "Password",
      editPassword: "Enter your new password",
      verify: "Verify",
      cancel: "Cancel",
      sendOTP: "Sending...",
      verifyVia: "Verify via:",
      email: "Email",
      phone: "Phone",
      passwordRequirements: "Password requirements:",
      requirement1: "At least 6 characters long",
      requirement2: "Contains a mix of letters and numbers (recommended)",
      requirement3: "Includes special characters (recommended)",
      otpSentTo: "OTP sent to",
      viaWhatsApp: "via WhatsApp to",
      otpCodePlaceholder: "Enter OTP code",
      updatePasswordSuccess: "Password updated successfully",
      updatePasswordFailed: "Password update failed",
      noValidVerificationMethod: "No valid verification method available",
      enterNewPassword: "Please enter a new password",
      passwordTooShort: "Password must be at least 6 characters long",
      enterVerificationCode: "Please enter the verification code",
    },
    ar: {
      security: "الأمان",
      password: "كلمة المرور",
      editPassword: "أدخل كلمة المرور الجديدة",
      verify: "تحقق",
      cancel: "إلغاء",
      sendOTP: "جاري الإرسال...",
      verifyVia: "التحقق عبر:",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      passwordRequirements: "متطلبات كلمة المرور:",
      requirement1: "يجب أن تتكون من 6 أحرف على الأقل",
      requirement2: "تحتوي على مزيج من الحروف والأرقام (مستحسن)",
      requirement3: "تتضمن رموز خاصة (مستحسن)",
      otpSentTo: "تم إرسال الرمز إلى",
      viaWhatsApp: "عبر واتساب إلى",
      otpCodePlaceholder: "أدخل رمز OTP",
      updatePasswordSuccess: "تم تحديث كلمة المرور بنجاح",
      updatePasswordFailed: "فشل في تحديث كلمة المرور",
      noValidVerificationMethod: "لا توجد طريقة تحقق صالحة متاحة",
      enterNewPassword: "يرجى إدخال كلمة مرور جديدة",
      passwordTooShort: "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل",
      enterVerificationCode: "يرجى إدخال رمز التحقق",
    },
  };

  const t = translations[language];

  // Button animation variants
  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  const handleFieldHover = () => {
    // Only allow hover state if not editing
    if (!editState.isEditing) {
      setEditState((prev) => ({
        ...prev,
        showOptions: true,
      }));
    }
  };

  const handleFieldLeave = () => {
    // Only update hover state if not editing
    if (!editState.isEditing) {
      setEditState((prev) => ({
        ...prev,
        showOptions: false,
      }));
    }
  };

  const startEditing = () => {
    setEditState({
      isEditing: true,
      value: "",
      showOptions: false,
    });
    setOtpState({
      otpId: "",
      otpCode: "",
      isOTPSent: false,
      verificationMethod: "email",
    });
  };

  const cancelEditing = () => {
    setEditState({
      isEditing: false,
      value: "",
      showOptions: false,
    });
    setOtpState({
      otpId: "",
      otpCode: "",
      isOTPSent: false,
      verificationMethod: "email",
    });
  };

  const handleVerificationMethodChange = (method: string) => {
    setOtpState((prev) => ({ ...prev, verificationMethod: method }));
  };

  const handleSendOTP = async () => {
    try {
      setIsLoading(true);
      const endpoint = "/user/sendOTP?for=forgetPassword";
      let payload: any = {};

      if (otpState.verificationMethod === "email" && userData.email) {
        payload = { email: userData.email };
      } else if (otpState.verificationMethod === "phone" && userData.phone) {
        payload = {
          phoneNumber: userData.phone,
          otpMethod: "whatsapp", // Default to WhatsApp for password reset via phone
        };
      } else {
        toast.error(t.noValidVerificationMethod);
        setIsLoading(false);
        return;
      }

      const result: any = await postFetch(endpoint, payload);

      if (result.success) {
        setOtpState((prev) => ({
          ...prev,
          otpId: result.otpId || result.data?.otpId,
          isOTPSent: true,
        }));
        toast.success("Verification code sent");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!editState.value) {
      toast.error(t.enterNewPassword);
      return;
    }

    if (editState.value.length < 6) {
      toast.error(t.passwordTooShort);
      return;
    }

    if (!otpState.otpCode) {
      toast.error(t.enterVerificationCode);
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = "/user/password";
      const payload = {
        password: editState.value,
        optId: otpState.otpId,
        otp: otpState.otpCode,
        ...(otpState.verificationMethod === "phone"
          ? { phoneNumber: userData.phone }
          : { email: userData.email }),
      };

      const result: any = await patchFetch(endpoint, payload);

      if (result.success) {
        toast.success(t.updatePasswordSuccess);
        cancelEditing();
      }
    } catch (error: any) {
      toast.error(error.message || t.updatePasswordFailed);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FiLock className="w-5 h-5 text-blue-500" />
          {t.security}
        </h2>
      </div>

      <div
        className={`relative p-4 rounded-lg transition-all ${
          editState.isEditing ? "bg-blue-50 dark:bg-blue-900/20" : ""
        }`}
        onMouseEnter={handleFieldHover}
        onMouseLeave={handleFieldLeave}
      >
        <div className="flex items-end justify-between">
          <div className="flex items-end gap-3">
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <FiLock className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-grow">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t.password}
              </p>
              <div className="text-gray-800 dark:text-gray-200 mt-1">
                {editState.isEditing ? (
                  <input
                    type="password"
                    value={editState.value}
                    onChange={(e) =>
                      setEditState((prev) => ({
                        ...prev,
                        value: e.target.value,
                      }))
                    }
                    className="w-full bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                    placeholder={t.editPassword}
                  />
                ) : (
                  <span className="font-medium">••••••••</span>
                )}
              </div>
            </div>
          </div>

          {editState.isEditing ? (
            <div className="flex flex-shrink-0 gap-2 ml-4">
              {otpState.isOTPSent ? (
                <>
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={handleUpdatePassword}
                    className="p-2 bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-800/50 rounded-full"
                    disabled={isLoading}
                  >
                    <FiCheck className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={cancelEditing}
                    className="p-2 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-800/50 rounded-full"
                  >
                    <FiX className="w-5 h-5" />
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={handleSendOTP}
                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? t.sendOTP : t.verify}
                  </motion.button>
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={cancelEditing}
                    className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 rounded-full"
                  >
                    <FiX className="w-5 h-5" />
                  </motion.button>
                </>
              )}
            </div>
          ) : (
            <AnimatePresence>
              {editState.showOptions && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  onClick={startEditing}
                  className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 rounded-full"
                >
                  <FiEdit className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>
          )}
        </div>

        {editState.isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-800"
          >
            <div className="flex flex-col gap-3">
              {/* Verification method selector */}
              <div className="w-full">
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t.verifyVia}
                </span>
                <div className="inline-flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                  {userData.email && (
                    <button
                      onClick={() => handleVerificationMethodChange("email")}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        otpState.verificationMethod === "email"
                          ? "bg-blue-600 text-white shadow"
                          : "text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {t.email}
                    </button>
                  )}
                  {userData.phone && (
                    <button
                      onClick={() => handleVerificationMethodChange("phone")}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        otpState.verificationMethod === "phone"
                          ? "bg-blue-600 text-white shadow"
                          : "text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {t.phone}
                    </button>
                  )}
                </div>
              </div>

              {/* Password requirements */}
              {!otpState.isOTPSent && (
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mt-1">
                  <p>{t.passwordRequirements}:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>{t.requirement1}</li>
                    <li>{t.requirement2}</li>
                    <li>{t.requirement3}</li>
                  </ul>
                </div>
              )}

              {otpState.isOTPSent && (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col w-full">
                      <span className="block text-xs text-gray-500 dark:text-gray-400">
                        {t.otpSentTo}{" "}
                        <span className="font-semibold">
                          {otpState.verificationMethod === "phone"
                            ? t.viaWhatsApp + " " + userData.phone
                            : userData.email}
                        </span>
                      </span>
                      <input
                        type="text"
                        placeholder={t.otpCodePlaceholder}
                        value={otpState.otpCode}
                        onChange={(e) =>
                          setOtpState({ ...otpState, otpCode: e.target.value })
                        }
                        className="mt-1 px-3 py-2 w-full rounded-md border dark:border-gray-700 dark:bg-gray-800"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default SecuritySection;
