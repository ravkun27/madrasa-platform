import { useState, FormEvent, useEffect } from "react";
import {
  FaChalkboardTeacher,
  FaUserGraduate,
  FaCheck,
  FaSpinner,
  FaEye,
  FaEyeSlash,
  FaWhatsapp,
  FaComment,
  FaTelegram,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { postFetch } from "../../utils/apiCall";
import { toast } from "react-hot-toast";

interface SignupResponse {
  success: boolean;
  data: {
    token: string;
    role: string;
  };
  message?: string;
}

interface OtpResponse {
  success: boolean;
  message?: string;
  data?: {
    optId?: string;
  };
}

const Signup = ({ setIsLogin }: { setIsLogin: (isLogin: boolean) => void }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    otp: "",
    phoneNumber: "",
    phoneOtp: "",
    TelegramOrWhatsapp: "",
  });
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isPhoneOtpSent, setIsPhoneOtpSent] = useState(false);
  const [isPhoneOtpVerified, setIsPhoneOtpVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [phoneCountdown, setPhoneCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [phoneOtpId, setPhoneOtpId] = useState("");
  const [verificationMethod, setVerificationMethod] = useState<
    "whatsapp" | "sms"
  >("whatsapp");

  const handleSendOtp = async (payload: {
    email?: string;
    phoneNumber?: string;
    method?: "whatsapp" | "sms";
  }) => {
    if (payload.phoneNumber && !payload.method) {
      toast.error("Please select a method (WhatsApp or SMS) for phone OTP.");
      return;
    }

    setIsSendingOtp(true);
    try {
      const result = await postFetch<OtpResponse>(
        "/user/sendOTP?for=createUser",
        {
          ...payload,
          phoneNumber: payload.phoneNumber?.replace(/^0/, ""),
        }
      );

      if (result.success) {
        const receivedOtpId = result.data?.optId || "";

        if (payload.phoneNumber && receivedOtpId) {
          setPhoneOtpId(receivedOtpId);
        }

        setCountdown(10);
        if (payload.email) setIsOtpSent(true);
        if (payload.phoneNumber) setIsPhoneOtpSent(true);
        toast.success(`OTP sent to ${payload.email ? "email" : "phone"}!`);
      } else {
        toast.error(result.message || "Failed to send OTP");
      }
    } catch (error) {
      toast.error("Failed to send OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (formData.otp.length !== 4) {
      toast.error("Please enter a 4-digit OTP");
      return;
    }

    setIsLoading(true);
    setIsVerifyingOtp(true);
    try {
      const result = await postFetch<OtpResponse>("/user/verifyOtp", {
        email: formData.email,
        otp: formData.otp,
      });

      if (result.success) {
        setIsOtpVerified(true);
        toast.success("OTP verified successfully!");
      } else {
        throw new Error(result.message || "OTP verification failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
      setIsVerifyingOtp(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (formData.phoneOtp.length !== 4) {
      toast.error("Please enter a 4-digit OTP");
      return;
    }

    setIsLoading(true);
    setIsVerifyingOtp(true);
    try {
      const result = await postFetch<OtpResponse>("/user/verifyOtp", {
        phoneNumber: formData.phoneNumber,
        otp: formData.phoneOtp,
        optId: phoneOtpId, // Include OTP ID for phone verification
      });

      if (result.success) {
        setIsPhoneOtpVerified(true);
        toast.success("Phone OTP verified successfully!");
      } else {
        throw new Error(result.message || "Phone OTP verification failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
      setIsVerifyingOtp(false);
    }
  };

  // const handleResendOtp = async (type: "email" | "phone") => {
  //   if (type === "email") {
  //     await handleSendEmailOtp();
  //   } else {
  //     await handleSendPhoneOtp();
  //   }
  // }

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (phoneCountdown > 0) {
      const timer = setInterval(
        () => setPhoneCountdown((prev) => prev - 1),
        1000
      );
      return () => clearInterval(timer);
    }
  }, [phoneCountdown]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      const result = await postFetch<SignupResponse>("/user/signup", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phoneNumber,
        password: formData.password,
        role: formData.role,
        otp: formData.otp,
        TelegramOrWhatsapp: formData.TelegramOrWhatsapp,
      });

      if (result.success && result.data) {
        const { token, role } = result.data;
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        navigate(`/${role.toLowerCase()}-dashboard`);
      } else {
        toast.error(result.message || "Signup failed. Please try again.");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center">
      <div className="max-w-md mx-auto p-6 border-2 border-accent rounded-xl">
        <h1
          className={`text-3xl font-bold mb-8 text-center ${
            theme === "light" ? "text-primary" : "text-secondary"
          }`}
        >
          Create Account
        </h1>

        <AnimatePresence mode="wait">
          {!formData.role ? (
            <motion.div
              key="role-selection"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-6"
            >
              <h2
                className={`text-lg ${
                  theme === "light" ? "text-gray-600" : "text-gray-300"
                }`}
              >
                Select your role
              </h2>
              <div className="flex flex-col gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    formData.role === "student"
                      ? "border-2 border-primary bg-primary/10"
                      : "border border-gray-200 hover:border-primary"
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, role: "student" }))
                  }
                >
                  <div className="flex items-center gap-3">
                    <FaUserGraduate className="text-primary text-xl" />
                    <div>
                      <h3 className="font-semibold text-text dark:text-text-dark">
                        Student
                      </h3>
                      <p className="text-sm text-gray-500">
                        Join courses and learn
                      </p>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    formData.role === "teacher"
                      ? "border-2 border-secondary bg-secondary/10"
                      : "border border-gray-200 hover:border-secondary"
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, role: "teacher" }))
                  }
                >
                  <div className="flex items-center gap-3">
                    <FaChalkboardTeacher className="text-secondary text-xl" />
                    <div>
                      <h3 className="font-semibold text-text dark:text-text-dark">
                        Teacher
                      </h3>
                      <p className="text-sm text-gray-500">
                        Create and manage courses
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="signup-form"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="space-y-4">
                {/* Name Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    required
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    required
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Email & OTP */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      placeholder="Email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      disabled={isOtpVerified}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-75"
                    />
                    {isOtpVerified && (
                      <FaCheck className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSendOtp({ email: formData.email })}
                    disabled={countdown > 0 || isOtpVerified}
                    className={`w-full sm:w-32 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      countdown > 0 || isSendingOtp || isOtpVerified
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-primary hover:bg-primary/90 text-white"
                    }`}
                  >
                    {isSendingOtp ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Sending...
                      </>
                    ) : countdown > 0 ? (
                      `${countdown}s`
                    ) : (
                      "Send OTP"
                    )}
                  </button>
                </div>

                {/* OTP Verification */}
                {isOtpSent && !isOtpVerified && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        placeholder="Enter 4-digit OTP"
                        required
                        value={formData.otp}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            otp: e.target.value.replace(/\D/g, "").slice(0, 4),
                          })
                        }
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={isLoading || isOtpVerified || isVerifyingOtp}
                      className={`w-full sm:w-32 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                        isLoading || isOtpVerified || isVerifyingOtp
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-primary hover:bg-primary/90 text-white"
                      }`}
                    >
                      {isVerifyingOtp ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify"
                      )}
                    </button>
                  </div>
                )}
                {/* Phone Number & OTP Section */}
                {/* {isOtpVerified && !isPhoneOtpVerified && ( */}
                <>
                  <div className="space-y-4">
                    {/* OTP Method Selection */}
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Choose verification method:
                      </p>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setVerificationMethod("whatsapp")}
                          className={`flex-1 p-2 rounded-lg border-2 transition-colors text-text flex items-center justify-center gap-2 ${
                            verificationMethod === "whatsapp"
                              ? "border-green-500 bg-green-500/10"
                              : "border-gray-200 hover:border-green-500"
                          }`}
                        >
                          <FaWhatsapp className="text-green-500 text-xl" />
                          WhatsApp
                        </button>
                        <button
                          type="button"
                          onClick={() => setVerificationMethod("sms")}
                          className={`flex-1 p-2 rounded-lg border-2 transition-colors text-text flex items-center justify-center gap-2 ${
                            verificationMethod === "sms"
                              ? "border-blue-500 bg-blue-500/10"
                              : "border-gray-200 hover:border-blue-500"
                          }`}
                        >
                          <FaComment className="text-blue-500 text-xl" />
                          SMS
                        </button>
                      </div>
                    </div>
                    {/* Phone Number Input */}
                    <div className="flex flex-col sm:flex-row gap-2 items-center">
                      <div className="relative flex-1">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 text-gray-500">
                          <span>+964</span>
                        </div>
                        <input
                          type="text"
                          placeholder="Phone Number"
                          required
                          value={formData.phoneNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              phoneNumber: e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 15),
                            })
                          }
                          className="w-full p-3 pl-16 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!verificationMethod) {
                            toast.error("Please select a verification method");
                            return;
                          }
                          handleSendOtp({
                            phoneNumber: formData.phoneNumber,
                            method: verificationMethod as "whatsapp" | "sms",
                          });
                        }}
                        disabled={phoneCountdown > 0 || isPhoneOtpVerified}
                        className={`w-full sm:w-32 px-4 py-2 rounded-lg transition-colors text-text flex items-center justify-center gap-2 ${
                          phoneCountdown > 0 ||
                          isSendingOtp ||
                          isPhoneOtpVerified
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-primary hover:bg-primary/90 text-white"
                        }`}
                      >
                        {isSendingOtp ? (
                          <>
                            <FaSpinner className="animate-spin" />
                            Sending...
                          </>
                        ) : phoneCountdown > 0 ? (
                          `${phoneCountdown}s`
                        ) : (
                          "Send OTP"
                        )}
                      </button>
                    </div>

                    {/* Communication Preference */}
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Preferred communication method:
                      </p>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              TelegramOrWhatsapp: "telegram",
                            })
                          }
                          className={`flex-1 p-2 rounded-lg border-2 transition-colors text-text flex items-center justify-center gap-2 ${
                            formData.TelegramOrWhatsapp === "telegram"
                              ? "border-blue-500 bg-blue-500/10"
                              : "border-gray-200 hover:border-blue-500"
                          }`}
                        >
                          <FaTelegram className="text-blue-500 text-xl" />
                          Telegram
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              TelegramOrWhatsapp: "whatsapp",
                            })
                          }
                          className={`flex-1 p-2 rounded-lg border-2 transition-colors flex text-text items-center justify-center gap-2 ${
                            formData.TelegramOrWhatsapp === "whatsapp"
                              ? "border-green-500 bg-green-500/10"
                              : "border-gray-200 hover:border-green-500"
                          }`}
                        >
                          <FaWhatsapp className="text-green-500 text-xl" />
                          WhatsApp
                        </button>
                      </div>
                    </div>

                    {/* Phone OTP Verification */}
                    {isPhoneOtpSent && !isPhoneOtpVerified && (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            placeholder="Enter 4-digit OTP"
                            required
                            value={formData.phoneOtp}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                phoneOtp: e.target.value
                                  .replace(/\D/g, "")
                                  .slice(0, 4),
                              })
                            }
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleVerifyPhoneOtp}
                          disabled={
                            isLoading || isPhoneOtpVerified || isVerifyingOtp
                          }
                          className={`w-full sm:w-32 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                            isLoading || isPhoneOtpVerified || isVerifyingOtp
                              ? "bg-gray-300 cursor-not-allowed"
                              : "bg-primary hover:bg-primary/90 text-white"
                          }`}
                        >
                          {isVerifyingOtp ? (
                            <>
                              <FaSpinner className="animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            "Verify"
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </>
                {/* )} */}

                {/* Password Fields */}
                {isPhoneOtpVerified && (
                  <>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        required
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary transition-colors"
                      >
                        {showPassword ? (
                          <FaEyeSlash size={20} />
                        ) : (
                          <FaEye size={20} />
                        )}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary transition-colors"
                      >
                        {showPassword ? (
                          <FaEyeSlash size={20} />
                        ) : (
                          <FaEye size={20} />
                        )}
                      </button>
                    </div>
                  </>
                )}

                {/* Submit Button */}
                {isPhoneOtpVerified && (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      isSubmitting
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-primary hover:bg-primary/90 text-white"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                )}
              </div>

              <div className="flex gap-2 justify-center">
                <p className="text-text dark:text-text-dark">
                  Already have Account?
                </p>
                <Link
                  to={"/login"}
                  onClick={() => setIsLogin(false)}
                  className="font-bold text-primary"
                >
                  Sign In
                </Link>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Signup;
