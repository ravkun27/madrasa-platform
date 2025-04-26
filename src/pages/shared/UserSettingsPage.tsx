import { useState, useEffect } from "react";
import {
  getFetch,
  deleteFetch,
  patchFetch,
  postFetch,
} from "../../utils/apiCall";
import { toast } from "react-hot-toast";
import {
  FiEdit,
  FiLock,
  FiMail,
  FiPhone,
  FiTrash2,
  FiUser,
  FiLogOut,
  FiCheck,
  FiX,
  FiChevronLeft,
  FiSettings,
} from "react-icons/fi";
import { FaTelegram, FaWhatsapp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

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
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    name: "",
    email: "",
    phone: "",
    contactMethod: "telegram",
  });

  const [editState, setEditState] = useState({
    field: "",
    isEditing: false,
    value: "",
    showOptions: false,
  });

  const [otpState, setOtpState] = useState({
    otpId: "",
    otpCode: "",
    isOTPSent: false,
    otpMethod: "whatsapp",
    passwordVerificationMethod: "email", // New state for password verification method
  });

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

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        setIsLoading(true);
        try {
          const result: any = await getFetch("/user");
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
          toast.error("Failed to load user data");
        } finally {
          setIsLoading(false);
        }
      };

      if (isOpen) {
        document.body.style.overflow = "hidden";
        fetchUserData();
      }

      return () => {
        document.body.style.overflow = "auto";
      };
    }
  }, [isOpen]);

  // Add this function to handle verification method change
  const handleVerificationMethodChange = (method: string) => {
    if (editState.field === "password") {
      setOtpState((prev) => ({ ...prev, passwordVerificationMethod: method }));
    }
  };

  const handleFieldHover = (field: string) => {
    // Only allow hover state if no field is being edited
    if (!editState.isEditing) {
      setEditState((prev) => ({
        ...prev,
        field,
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

  const startEditing = (field: string, currentValue: string) => {
    setEditState({
      field,
      isEditing: true,
      value: currentValue,
      showOptions: false,
    });
    setOtpState({
      otpId: "",
      otpCode: "",
      isOTPSent: false,
      otpMethod: "whatsapp",
      passwordVerificationMethod: "email",
    });
  };

  const cancelEditing = () => {
    setEditState({
      field: "",
      isEditing: false,
      value: "",
      showOptions: false,
    });
    setOtpState({
      otpId: "",
      otpCode: "",
      isOTPSent: false,
      otpMethod: "whatsapp",
      passwordVerificationMethod: "email",
    });
  };

  // Modified handleSendOTP function
  const handleSendOTP = async () => {
    try {
      let endpoint = "";
      let payload: any = {};

      if (editState.field === "password") {
        endpoint = "/user/sendOTP?for=forgetPassword";
        const verificationMethod = otpState.passwordVerificationMethod;

        if (verificationMethod === "email" && userData.email) {
          payload = { email: userData.email };
        } else if (verificationMethod === "phone" && userData.phone) {
          payload = {
            phoneNumber: userData.phone,
            otpMethod: "whatsapp", // Default to SMS for password reset via phone
          };
        } else {
          toast.error("No valid verification method available");
          return;
        }
      } else if (editState.field === "phone") {
        endpoint = "/user/send_OTP_for_updateMailOrPhone?for=updateMailOrPhone";
        payload = {
          phoneNumber: editState.value,
          method: otpState.otpMethod,
        };
      } else if (editState.field === "email") {
        endpoint = "/user/send_OTP_for_updateMailOrPhone?for=updateMailOrPhone";
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
    }
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      let payload: {
        phoneNumber?: string;
        email?: string;
        password?: string;
        otp?: string;
        otpId?: string;
        [key: string]: any;
      } = {};
      let endpoint = "";
      let method = "PATCH";

      // Determine endpoint and payload based on what field is being edited
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
            // It's a phone number
            payload = {
              phoneNumber: editState.value,
              otpId: otpState.otpId,
              otp: otpState.otpCode,
            };
          } else {
            // It's an email
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

        case "password":
          endpoint = "/user/password";
          method = "PATCH";
          payload = {
            password: editState.value,
            optId: otpState.otpId,
            otp: otpState.otpCode,
          };
          // Add contact info for verification
          if (otpState.passwordVerificationMethod === "phone")
            payload.phoneNumber = userData.phone;
          if (otpState.passwordVerificationMethod === "email")
            payload.email = userData.email;
          break;
      }

      const result: any = await (method === "PATCH" ? patchFetch : postFetch)(
        endpoint,
        payload
      );

      if (result.success) {
        toast.success("Update successful");

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

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      onClose();
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete your account? This action cannot be undone."
      )
    ) {
      setIsLoading(true);
      try {
        await deleteFetch("/user");
        logout();
        toast.success("Account deleted successfully");
        onClose();
        navigate("/");
      } catch (error) {
        toast.error("Account deletion failed");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderField = (
    field: string,
    label: string,
    icon: React.ReactNode,
    currentValue: string
  ) => {
    const isActive = editState.field === field && editState.isEditing;
    const isHovered =
      editState.field === field &&
      editState.showOptions &&
      !editState.isEditing;

    return (
      <div
        className={`relative p-4 rounded-lg transition-all ${
          isActive ? "bg-blue-50 dark:bg-blue-900/20" : ""
        }`}
        onMouseEnter={() => handleFieldHover(field)}
        onMouseLeave={handleFieldLeave}
      >
        <div className="flex items-end justify-between">
          <div className="flex items-end gap-3">
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              {icon}
            </div>
            <div className="flex-grow">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {label}
              </p>
              <div className="text-gray-800 dark:text-gray-200 mt-1">
                {isActive ? (
                  <input
                    type={field === "password" ? "password" : "text"}
                    value={editState.value}
                    onChange={(e) =>
                      setEditState((prev) => ({
                        ...prev,
                        value: e.target.value,
                      }))
                    }
                    className="w-full bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                    placeholder={`Enter your ${label.toLowerCase()}`}
                  />
                ) : field === "password" ? (
                  "••••••••"
                ) : (
                  <span className="font-medium">
                    {currentValue || "Not set"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {isActive ? (
            <div className="flex flex-shrink-0 gap-2 ml-4">
              {otpState.isOTPSent || field === "name" ? (
                <>
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={handleUpdate}
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
                  {["phone", "email", "password"].includes(field) && (
                    <motion.button
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      onClick={handleSendOTP}
                      className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending..." : "Verify"}
                    </motion.button>
                  )}
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
              {isHovered && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => startEditing(field, currentValue)}
                  className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 rounded-full"
                >
                  <FiEdit className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>
          )}
        </div>

        {isActive && (otpState.isOTPSent || field === "password") && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-800"
          >
            <div className="flex flex-col gap-3">
              {/* Verification method selector */}
              {(field === "password" || field === "phone") && (
                <div className="w-full">
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    {field === "password"
                      ? "Verify via:"
                      : "Please Check your WhatsApp"}
                  </span>
                  <div className="inline-flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                    {field === "password" && (
                      <>
                        {userData.email && (
                          <button
                            onClick={() =>
                              handleVerificationMethodChange("email")
                            }
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                              otpState.passwordVerificationMethod === "email"
                                ? "bg-blue-600 text-white shadow"
                                : "text-gray-600 dark:text-gray-300"
                            }`}
                          >
                            Email
                          </button>
                        )}
                        {userData.phone && (
                          <button
                            onClick={() =>
                              handleVerificationMethodChange("phone")
                            }
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                              otpState.passwordVerificationMethod === "phone"
                                ? "bg-blue-600 text-white shadow"
                                : "text-gray-600 dark:text-gray-300"
                            }`}
                          >
                            Phone
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
              {/* OTP Input and Send Button */}
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Enter OTP code"
                  value={otpState.otpCode}
                  onChange={(e) =>
                    setOtpState((prev) => ({
                      ...prev,
                      otpCode: e.target.value,
                    }))
                  }
                  className="flex-1 text-sm p-2 rounded border bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {!otpState.isOTPSent && (
                  <button
                    onClick={handleSendOTP}
                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send OTP"}
                  </button>
                )}
              </div>

              {/* OTP Sent Message */}
              {otpState.isOTPSent && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  OTP sent to{" "}
                  {field === "email"
                    ? editState.value
                    : field === "password"
                      ? otpState.passwordVerificationMethod === "email"
                        ? userData.email
                        : `via ${otpState.otpMethod} to ${userData.phone}`
                      : `${"WhatsApp"} to ${editState.value}`}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  const renderContactMethodSelector = () => {
    const isActive = editState.field === "contactMethod" && editState.isEditing;
    const isHovered =
      editState.field === "contactMethod" &&
      editState.showOptions &&
      !editState.isEditing;

    return (
      <div
        className={`relative p-4 rounded-lg transition-all ${
          isActive ? "bg-blue-50 dark:bg-blue-900/20" : ""
        }`}
        onMouseEnter={() => handleFieldHover("contactMethod")}
        onMouseLeave={handleFieldLeave}
      >
        <div className="flex items-end justify-between">
          <div className="flex items-end gap-3">
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              {userData.contactMethod === "telegram" ? (
                <FaTelegram className="text-blue-500 w-5 h-5" />
              ) : (
                <FaWhatsapp className="text-green-500 w-5 h-5" />
              )}
            </div>
            <div className="flex-grow">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Preferred Contact Method
              </p>
              <div className="text-gray-800 dark:text-gray-200 mt-2">
                {isActive ? (
                  <div className="relative inline-flex bg-gray-100 dark:bg-gray-800 p-1 rounded-full shadow-inner w-full sm:w-auto">
                    {["telegram", "whatsapp"].map((option) => {
                      const isSelected = editState.value === option;
                      const Icon =
                        option === "telegram" ? FaTelegram : FaWhatsapp;
                      const label =
                        option === "telegram" ? "Telegram" : "WhatsApp";
                      const color =
                        option === "telegram"
                          ? "text-blue-500"
                          : "text-green-500";

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            setEditState((prev) => ({ ...prev, value: option }))
                          }
                          className={`relative z-10 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200
              ${isSelected ? "bg-white dark:bg-gray-900 shadow" : "text-gray-500 dark:text-gray-300"}
            `}
                        >
                          <Icon className={color} />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <span className="font-medium flex items-center gap-2">
                    {userData.contactMethod === "telegram" ? (
                      <>
                        <FaTelegram className="text-blue-500" /> Telegram
                      </>
                    ) : (
                      <>
                        <FaWhatsapp className="text-green-500" /> WhatsApp
                      </>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>

          {isActive ? (
            <div className="flex flex-shrink-0 gap-2 ml-4">
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={handleUpdate}
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
            </div>
          ) : (
            <AnimatePresence>
              {isHovered && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  onClick={() =>
                    startEditing(
                      "contactMethod",
                      userData.contactMethod || "telegram"
                    )
                  }
                  className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 rounded-full"
                >
                  <FiEdit className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <motion.div
              variants={slideInVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full sm:w-96 md:w-[32rem] bg-white dark:bg-gray-900 shadow-xl overflow-y-auto flex flex-col h-full"
            >
              {/* Top Sticky Header */}
              <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                  {/* Close Button */}
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

                  {/* Account Settings (only if logged in) */}
                  {user && (
                    <div className="flex justify-center gap-12">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-base font-semibold">
                        <FiSettings className="w-5 h-5" />
                        <span>Account Settings</span>
                      </div>
                      <Link
                        to={`/${user.role}-dashboard`}
                        className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors text-center"
                        onClick={onClose}
                      >
                        Go to Dashboard
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Nav Links (centered, only on mobile) */}
              <div className="flex-1 flex flex-col justify-center items-center gap-8 px-8 md:hidden">
                <Link
                  to="/courses"
                  className="text-text text-2xl font-semibold hover:text-primary transition"
                  onClick={onClose}
                >
                  Courses
                </Link>
                <Link
                  to="/about"
                  className="text-text text-2xl font-semibold hover:text-primary transition"
                  onClick={onClose}
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="text-text text-2xl font-semibold hover:text-primary transition"
                  onClick={onClose}
                >
                  Contact
                </Link>
              </div>

              {isLoading && !editState.isEditing ? (
                <div className="flex-1 flex items-end justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : user ? (
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-6">
                    <section className="bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                          <FiUser className="w-5 h-5 text-blue-500" />
                          Profile Information
                        </h2>
                      </div>
                      <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {renderField(
                          "name",
                          "Name",
                          <FiUser className="w-5 h-5 text-gray-500" />,
                          userData.name
                        )}
                        {renderField(
                          "email",
                          "Email",
                          <FiMail className="w-5 h-5 text-gray-500" />,
                          userData.email
                        )}
                        {renderField(
                          "phone",
                          "Phone",
                          <FiPhone className="w-5 h-5 text-gray-500" />,
                          userData.phone
                        )}
                        {renderContactMethodSelector()}
                      </div>
                    </section>

                    <section className="bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                          <FiLock className="w-5 h-5 text-blue-500" />
                          Security
                        </h2>
                      </div>
                      <div>
                        {renderField(
                          "password",
                          "Password",
                          <FiLock className="w-5 h-5 text-gray-500" />,
                          ""
                        )}
                      </div>
                    </section>

                    <section className="mt-8">
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800/50">
                        <h3 className="text-base font-semibold text-red-600 dark:text-red-400 mb-4">
                          Account Management
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <motion.button
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={handleLogout}
                            className="flex justify-center items-center gap-2 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
                          >
                            <FiLogOut className="w-4 h-4" />
                            Log Out
                          </motion.button>
                          <motion.button
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={handleDeleteAccount}
                            className="flex justify-center items-center gap-2 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            disabled={isLoading}
                          >
                            <FiTrash2 className="w-4 h-4" />
                            {isLoading ? "Processing..." : "Delete Account"}
                          </motion.button>
                        </div>
                        <p className="text-xs text-red-500 dark:text-red-400 mt-3">
                          Warning: Deleting your account is permanent and cannot
                          be undone.
                        </p>
                      </div>
                    </section>
                  </div>
                </div>
              ) : (
                <>
                  <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-gray-900 shadow-lg z-50 px-6 py-4 space-y-4">
                    <Link
                      to="/login"
                      className="block bg-secondary text-white px-4 py-2 rounded-lg text-center font-medium"
                      onClick={onClose}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="block bg-primary-gradient text-white px-4 py-2 rounded-lg text-center font-medium"
                      onClick={onClose}
                    >
                      Sign Up
                    </Link>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UserSettingsPage;
