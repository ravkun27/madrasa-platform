import { useState, FormEvent, useEffect } from "react";
import {
  FaChalkboardTeacher,
  FaUserGraduate,
  FaCheck,
  FaSpinner,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { postFetch } from "../../utils/apiCall";
import { toast, Toaster } from "react-hot-toast";

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
    TelegramOrWhatsapp: "",
  });
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendOtp = async () => {
    if (!formData.email) {
      toast.error("Please enter your email first");
      return;
    }

    setIsLoading(true);
    setIsSendingOtp(true);
    try {
      const result = await postFetch<OtpResponse>(
        "/user/sendOTP?for=createUser",
        { email: formData.email }
      );

      if (result.success) {
        setIsOtpSent(true);
        setCountdown(60);
        toast.success("OTP sent to your email!");
      } else {
        throw new Error(result.message || "Failed to send OTP");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
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

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      try {
        const result = await postFetch<SignupResponse>("/user/signup", {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          TelegramOrWhatsapp: formData.TelegramOrWhatsapp || undefined,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          role: formData.role,
          otp: formData.otp,
        });

        if (result.success && result.data) {
          const { token, role } = result.data;
          console.log("User Data:", result.data);

          localStorage.setItem("token", token);
          localStorage.setItem("role", role);

          // Normalize role to lowercase for consistency
          const normalizedRole = role.toLowerCase();

          // Redirect based on role
          switch (normalizedRole) {
            case "student":
              navigate("/student-dashboard");
              break;
            case "teacher":
              navigate("/teacher-dashboard");
              break;
            default:
              navigate("/dashboard"); // Fallback dashboard
              break;
          }
        } else {
          toast.error("Invalid credentials");
        }
      } catch (error) {
        console.error("Login failed:", error);
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="my-4 max-w-md mx-auto p-6 border-2 border-accent rounded-xl">
      <Toaster position="top-right" reverseOrder={false} />

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
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                required
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                placeholder="Last Name"
                required
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex gap-2">
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
              {/* Send OTP button */}
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={countdown > 0}
                className={`w-32 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  countdown > 0 || isSendingOtp
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-primary hover:bg-primary/90 text-white"
                } ${isOtpVerified ? "hidden" : ""}`}
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

            {isOtpSent && !isOtpVerified && (
              <div className="flex gap-2">
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
                  {isOtpVerified && (
                    <FaCheck className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" />
                  )}
                </div>
                {/* Verify OTP button */}
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isLoading || isOtpVerified || isVerifyingOtp}
                  className={`w-32 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
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

            {isOtpVerified && (
              <>
                <input
                  type="password"
                  placeholder="Password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
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
                        .slice(0, 10),
                    })
                  }
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <select
                  value={formData.TelegramOrWhatsapp}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      TelegramOrWhatsapp: e.target.value,
                    })
                  }
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select an option (Optional)</option>
                  <option value="telegram">Telegram</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </>
            )}

            {isOtpVerified && (
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

            <div className="flex gap-2 justify-center ">
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
  );
};

export default Signup;
