import { ReactNode, useState } from "react";
import { toast } from "react-hot-toast";
import { FiEdit, FiMail, FiPhone, FiUser, FiArrowRight } from "react-icons/fi";
import { FaTelegram, FaWhatsapp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { postFetch, patchFetch } from "../utils/apiCall";
import { useLanguage } from "../context/LanguageContext";

const ProfileSection = ({ userData, setUserData }: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const [editState, setEditState] = useState({
    field: "",
    isEditing: false,
    value: "",
  });

  const [otpState, setOtpState] = useState({
    otpId: "",
    otpCode: "",
    isOTPSent: false,
    otpMethod: "whatsapp",
  });
  const { language } = useLanguage();
  const translations = {
    en: {
      profileSection: {
        title: "Profile Information",
        description:
          "Manage your personal information and communication preferences",
        name: "Name",
        email: "Email Address",
        phone: "Phone Number",
        contactMethod: "Preferred Contact Method",
        edit: "Edit",
        saveChanges: "Save Changes",
        cancel: "Cancel",
        saving: "Saving...",
        sendingVerification: "Sending...",
        sendVerification: "Send Verification",
        codeSentTo: "Code sent to",
        verificationCode: "Verification Code",
        verificationSuccess: "Verification code sent",
        updateSuccess: "Profile updated successfully",
        updateFailed: "Update failed",
      },
      common: {
        notSet: "Not set",
        fullName: "Full Name",
        enterEmail: "Enter your email",
        enterPhone: "Enter your phone number",
        enterFullName: "Enter your full name",
        enterVerificationCode: "Enter verification code",
      },
      contactMethod: {
        telegram: "Telegram",
        whatsapp: "WhatsApp",
      },
    },
    ar: {
      profileSection: {
        title: "معلومات الملف الشخصي",
        description: "إدارة معلوماتك الشخصية وتفضيلات الاتصال",
        name: "الاسم",
        email: "عنوان البريد الإلكتروني",
        phone: "رقم الهاتف",
        contactMethod: "طريقة الاتصال المفضلة",
        edit: "تعديل",
        saveChanges: "حفظ التغييرات",
        cancel: "إلغاء",
        sendingVerification: "إرسال...",
        sendVerification: "إرسال التحقق",
        saving: "جارٍ الحفظ...",
        codeSentTo: "تم إرسال الرمز إلى",
        verificationCode: "رمز التحقق",
        verificationSuccess: "تم إرسال رمز التحقق",
        updateSuccess: "تم تحديث الملف الشخصي بنجاح",
        updateFailed: "فشل التحديث",
      },
      common: {
        notSet: "غير مضبوط",
        fullName: "الاسم الكامل",
        enterEmail: "أدخل بريدك الإلكتروني",
        enterPhone: "أدخل رقم هاتفك",
        enterFullName: "أدخل اسمك الكامل",
        enterVerificationCode: "أدخل رمز التحقق",
      },
      contactMethod: {
        telegram: "تيليجرام",
        whatsapp: "واتساب",
      },
    },
  };

  const t = translations[language];

  const startEditing = (field: any, currentValue: any) => {
    setEditState({
      field,
      isEditing: true,
      value: currentValue || "",
    });
    setOtpState({
      otpId: "",
      otpCode: "",
      isOTPSent: false,
      otpMethod: "whatsapp",
    });
  };

  const cancelEditing = () => {
    setEditState({
      field: "",
      isEditing: false,
      value: "",
    });
    setOtpState({
      otpId: "",
      otpCode: "",
      isOTPSent: false,
      otpMethod: "whatsapp",
    });
  };

  const handleSendOTP = async () => {
    try {
      setIsLoading(true);
      let endpoint =
        "/user/send_OTP_for_updateMailOrPhone?for=updateMailOrPhone";
      let payload = {};

      if (editState.field === "phone") {
        payload = {
          phoneNumber: editState.value,
          method: otpState.otpMethod,
        };
      } else if (editState.field === "email") {
        payload = { email: editState.value };
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

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      let payload = {};
      let endpoint = "";

      switch (editState.field) {
        case "name":
          endpoint = "/user";
          payload = {
            firstName: editState.value.split(" ")[0],
            lastName: editState.value.split(" ")[1] || "",
          };
          break;

        case "phone":
        case "email":
          endpoint = "/user/phone_or_email";
          if (editState.field === "phone" || /^\d+$/.test(editState.value)) {
            payload = {
              phoneNumber: editState.value,
              otpId: otpState.otpId,
              otp: otpState.otpCode,
            };
          } else {
            payload = {
              email: editState.value,
              otp: otpState.otpCode,
            };
          }
          break;

        case "contactMethod":
          endpoint = "/user";
          payload = {
            TelegramOrWhatsapp: editState.value,
          };
          break;
      }

      const result: any = await patchFetch(endpoint, payload);

      if (result.success) {
        toast.success("Profile updated successfully");

        // Update local state
        const updatedData = { ...userData };
        switch (editState.field) {
          case "name":
            updatedData.name = editState.value;
            break;
          case "phone":
            updatedData.phone = editState.value;
            break;
          case "email":
            updatedData.email = editState.value;
            break;
          case "contactMethod":
            updatedData.contactMethod = editState.value;
            break;
        }

        setUserData(updatedData);
        cancelEditing();
      }
    } catch (error: any) {
      toast.error(error.message || "Update failed");
    } finally {
      setIsLoading(false);
    }
  };

  const renderFieldContent = (
    field: keyof typeof userData, // e.g. "name" | "email" | "phone" | "contactMethod"
    label: string,
    icon: ReactNode,
    value: string
  ) => {
    const isEditing = editState.field === field && editState.isEditing;

    return (
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
          {icon}
        </div>

        <div className="flex-grow min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            {label}
          </p>
          <p className="font-medium text-gray-900 dark:text-white truncate">
            {value || "Not set"}
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={() => startEditing(field, value)}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            aria-label={`Edit ${label.toLowerCase()}`}
          >
            <FiEdit className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  };

  const renderEditForm = (field: any) => {
    if (editState.field !== field || !editState.isEditing) return null;

    const getFormContent = () => {
      switch (field) {
        case "name":
          return (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t.profileSection.name}
                </label>
                <input
                  type="text"
                  id="name"
                  value={editState.value}
                  onChange={(e) =>
                    setEditState((prev) => ({ ...prev, value: e.target.value }))
                  }
                  placeholder={t.common.enterFullName}
                  className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelEditing}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  {t.profileSection.cancel}
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isLoading
                    ? t.profileSection.saving
                    : t.profileSection.saveChanges}
                </button>
              </div>
            </div>
          );

        case "email":
        case "phone":
          return (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor={field}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {field === "email"
                    ? t.profileSection.email
                    : t.profileSection.phone}
                </label>
                <input
                  type={field === "email" ? "email" : "tel"}
                  id={field}
                  value={editState.value}
                  onChange={(e) =>
                    setEditState((prev) => ({ ...prev, value: e.target.value }))
                  }
                  placeholder={
                    field === "email"
                      ? t.common.enterEmail
                      : t.common.enterPhone
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              {otpState.isOTPSent ? (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="otp"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {t.profileSection.verificationCode}
                    </label>
                    <input
                      type="text"
                      id="otp"
                      value={otpState.otpCode}
                      onChange={(e) =>
                        setOtpState((prev) => ({
                          ...prev,
                          otpCode: e.target.value,
                        }))
                      }
                      placeholder={t.common.enterVerificationCode}
                      className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {field === "email"
                        ? t.profileSection.codeSentTo.replace(
                            "{editState.value}",
                            editState.value
                          )
                        : t.profileSection.codeSentTo.replace(
                            "{editState.value}",
                            `WhatsApp (${editState.value})`
                          )}
                    </p>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={cancelEditing}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      {t.profileSection.cancel}
                    </button>
                    <button
                      onClick={handleUpdate}
                      disabled={isLoading || !otpState.otpCode.trim()}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {isLoading
                        ? t.profileSection.saving
                        : t.profileSection.saveChanges}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end gap-3">
                  <button
                    onClick={cancelEditing}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    {t.profileSection.cancel}
                  </button>
                  <button
                    onClick={handleSendOTP}
                    disabled={isLoading || !editState.value.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading
                      ? t.profileSection.sendingVerification
                      : t.profileSection.sendVerification}
                    {!isLoading && <FiArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>
          );

        case "contactMethod":
          return (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.profileSection.contactMethod}
                </label>
                <div className="mt-2 flex gap-4">
                  <label
                    className={`
                        flex items-center gap-2 p-3 rounded-lg border cursor-pointer
                        ${
                          editState.value === "telegram"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600"
                            : "border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }
                      `}
                  >
                    <input
                      type="radio"
                      name="contactMethod"
                      value="telegram"
                      checked={editState.value === "telegram"}
                      onChange={() =>
                        setEditState((prev) => ({ ...prev, value: "telegram" }))
                      }
                      className="sr-only"
                    />
                    <FaTelegram className="text-blue-500 w-5 h-5" />
                    <span className="font-medium">
                      {t.contactMethod.telegram}
                    </span>
                  </label>

                  <label
                    className={`
                        flex items-center gap-2 p-3 rounded-lg border cursor-pointer
                        ${
                          editState.value === "whatsapp"
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-600"
                            : "border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }
                      `}
                  >
                    <input
                      type="radio"
                      name="contactMethod"
                      value="whatsapp"
                      checked={editState.value === "whatsapp"}
                      onChange={() =>
                        setEditState((prev) => ({ ...prev, value: "whatsapp" }))
                      }
                      className="sr-only"
                    />
                    <FaWhatsapp className="text-green-500 w-5 h-5" />
                    <span className="font-medium">
                      {t.contactMethod.whatsapp}
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelEditing}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  {t.profileSection.cancel}
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isLoading
                    ? t.profileSection.saving
                    : t.profileSection.saveChanges}
                </button>
              </div>
            </div>
          );

        default:
          return null;
      }
    };
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className="mt-4 bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        {getFormContent()}
      </motion.div>
    );
  };
  const renderField = (
    field: keyof typeof userData, // e.g. "name" | "email" | "phone" | "contactMethod"
    label: string,
    icon: ReactNode,
    value: string
  ) => {
    return (
      <div className="py-4">
        {renderFieldContent(field, label, icon, value)}
        <AnimatePresence>{renderEditForm(field)}</AnimatePresence>
      </div>
    );
  };

  return (
    <section className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <FiUser className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          {t.profileSection.title}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t.profileSection.description}
        </p>
      </div>

      <div className="p-4 sm:p-6">
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {renderField(
            "name",
            t.profileSection.name,
            <FiUser className="w-5 h-5" />,
            userData.name
          )}

          {renderField(
            "email",
            t.profileSection.email,
            <FiMail className="w-5 h-5" />,
            userData.email
          )}

          {renderField(
            "phone",
            t.profileSection.phone,
            <FiPhone className="w-5 h-5" />,
            userData.phone
          )}

          {renderField(
            "contactMethod",
            t.profileSection.contactMethod,
            userData.contactMethod === "telegram" ? (
              <FaTelegram className="w-5 h-5" />
            ) : (
              <FaWhatsapp className="w-5 h-5" />
            ),
            userData.contactMethod === "telegram"
              ? t.contactMethod.telegram
              : t.contactMethod.whatsapp
          )}
        </div>
      </div>
    </section>
  );
};

export default ProfileSection;
