import { useState, useEffect } from "react";
import {
  FaChalkboardTeacher,
  FaUserGraduate,
  FaCheck,
  FaSpinner,
  FaWhatsapp,
  FaSms,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { data, Link, useNavigate } from "react-router-dom";
import { postFetch } from "../../utils/apiCall";
import { toast, Toaster } from "react-hot-toast";
import { useFormik } from "formik";
import * as Yup from "yup";

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
  const [currentStep, setCurrentStep] = useState<
    "role" | "email" | "phone" | "password"
  >("role");
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<
    "whatsapp" | "sms"
  >("whatsapp");
  const [phoneOtpId, setPhoneOtpId] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
      emailOtp: "",
      phoneOtp: "",
      phoneNumber: "",
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("Required"),
      lastName: Yup.string().required("Required"),
      email: Yup.string().email("Invalid email").required("Required"),
      password: Yup.string()
        .min(8, "Minimum 8 characters")
        .required("Required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Required"),
      phoneNumber: Yup.string()
        .matches(/^0?\d{10}$/, "Must be 10 digits after 0")
        .required("Required"),
    }),
    onSubmit: async (values) => {
      try {
        const result = await postFetch<SignupResponse>("/user/signup", {
          ...values,
          phoneNumber: values.phoneNumber.replace(/^0/, ""),
        });

        if (result.success && result.data) {
          localStorage.setItem("token", result.data.token);
          localStorage.setItem("role", result.data.role);
          navigate(`/${result.data.role.toLowerCase()}-dashboard`);
        }
      } catch (error) {
        toast.error("Signup failed. Please try again.");
      }
    },
  });

  // Updated sendOtp function - specifically handling the phoneOtpId properly
  const sendOtp = async (payload: {
    email?: string;
    phoneNumber?: string;
    method?: "whatsapp" | "sms";
  }) => {
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
        // Extract OTP ID from the response (handle both 'optId' and 'otpId')
        const receivedOtpId = result.data?.optId || "";

        if (payload.phoneNumber && receivedOtpId) {
          setPhoneOtpId(receivedOtpId); // Set the OTP ID for phone verification
        }

        setCountdown(10);
        if (payload.email) setEmailOtpSent(true);
        if (payload.phoneNumber) setPhoneOtpSent(true);
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
  const handleSendEmailOtp = async () => {
    if (!formik.values.email) return toast.error("Email required");
    await sendOtp({ email: formik.values.email });
  };

  const handleSendPhoneOtp = async () => {
    if (!formik.values.phoneNumber) return toast.error("Phone number required");
    await sendOtp({
      phoneNumber: formik.values.phoneNumber,
      method: verificationMethod,
    });
  };

  // Updated verifyOtp function - specifically for phone verification
  const verifyOtp = async (type: "email" | "phone") => {
    setIsVerifying(true);
    try {
      // Validate OTP ID for phone verification
      if (type === "phone" && !phoneOtpId) {
        toast.error("Verification session expired. Please request a new OTP.");
        setPhoneOtpSent(false); // Reset OTP sent state
        return;
      }

      const payload =
        type === "email"
          ? {
            email: formik.values.email,
            otp: formik.values.emailOtp,
          }
          : {
              phoneNumber: formik.values.phoneNumber.replace(/^0/, ""),
              otp: formik.values.phoneOtp,
              optId: phoneOtpId, // Include OTP ID for phone verification
            };

      const result = await postFetch<OtpResponse>("/user/verifyOtp", payload);

      if (result.success) {
        if (type === "email") {
          setEmailVerified(true);
          setCurrentStep("phone");
        } else {
          setPhoneVerified(true);
          setCurrentStep("password");
        }
        toast.success(`${type} verified!`);
      } else {
        toast.error(result.message || "Verification failed");
      }
    } catch (error) {
      console.error("Verification Error:", error);
      toast.error("Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async (type: "email" | "phone") => {
    if (type === "email") {
      await handleSendEmailOtp();
    } else {
      await handleSendPhoneOtp();
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 11); // Allow only digits and limit to 11 characters
    formik.setFieldValue("phoneNumber", value);
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  return (
    <div className="my-4 max-w-md mx-auto p-6 border-2 border-accent rounded-xl">
      <Toaster position="top-right" />
      <h1
        className={`text-3xl font-bold mb-8 text-center ${theme === "light" ? "text-primary" : "text-secondary"
          }`}
      >
        Create Account
      </h1>

      <AnimatePresence mode="wait">
        {currentStep === "role" ? (
          <motion.div
            key="role-selection"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-6"
          >
            <h2
              className={`text-lg ${theme === "light" ? "text-gray-600" : "text-gray-300"
                }`}
            >
              Select your role
            </h2>
            <div className="flex flex-col gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-lg cursor-pointer transition-all ${formik.values.role === "student"
                    ? "border-2 border-primary bg-primary/10"
                    : "border border-gray-200 hover:border-primary"
                  }`}
                onClick={() => {
                  formik.setFieldValue("role", "student");
                  setCurrentStep("email");
                }}
              >
                <div className="flex items-center gap-3">
                  <FaUserGraduate className="text-primary text-xl" />
                  <div>
                    <h3 className="font-semibold">Student</h3>
                    <p className="text-sm text-gray-500">
                      Join courses and learn
                    </p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-lg cursor-pointer transition-all ${formik.values.role === "teacher"
                    ? "border-2 border-secondary bg-secondary/10"
                    : "border border-gray-200 hover:border-secondary"
                  }`}
                onClick={() => {
                  formik.setFieldValue("role", "teacher");
                  setCurrentStep("email");
                }}
              >
                <div className="flex items-center gap-3">
                  <FaChalkboardTeacher className="text-secondary text-xl" />
                  <div>
                    <h3 className="font-semibold">Teacher</h3>
                    <p className="text-sm text-gray-500">
                      Create and manage courses
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : currentStep === "email" ? (
          <motion.div
            key="email-verification"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-4"
          >
            <div className="relative">
              <input
                type="email"
                placeholder="Email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {emailVerified && (
                <FaCheck className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" />
              )}
            </div>
            {emailOtpSent ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  name="emailOtp"
                  value={formik.values.emailOtp}
                  onChange={formik.handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={() => verifyOtp("email")}
                  disabled={isVerifying}
                  className="w-32 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center justify-center"
                >
                  {isVerifying ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    "Verify"
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={
                  currentStep === "email"
                    ? handleSendEmailOtp
                    : handleSendPhoneOtp
                }
                disabled={countdown > 0 || isSendingOtp}
                className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 ${countdown > 0 || isSendingOtp
                    ? "bg-gray-300"
                    : "bg-primary hover:bg-primary/90 text-white"
                  }`}
              >
                {isSendingOtp ? (
                  <FaSpinner className="animate-spin" />
                ) : countdown > 0 ? (
                  `Resend in ${countdown}s`
                ) : (
                  "Send OTP"
                )}
              </button>
            )}
            {emailOtpSent && (
              <button
                onClick={() => handleResendOtp("email")}
                disabled={countdown > 0 || isSendingOtp}
                className="text-sm text-primary hover:underline"
              >
                Resend OTP
              </button>
            )}
          </motion.div>
        ) : currentStep === "phone" ? (
          <motion.div
            key="phone-verification"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-4"
          >
            <div className="relative">
              <input
                type="number"
                placeholder="Phone Number"
                name="phoneNumber"
                value={formik.values.phoneNumber}
                onChange={handlePhoneNumberChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pl-16"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                +964
              </span>
              {phoneVerified && (
                <FaCheck className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" />
              )}
            </div>

            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg relative">
              <button
                className={`flex-1 p-2 rounded-md transition-colors ${verificationMethod === "whatsapp"
                    ? "bg-blue-400 shadow-md"
                    : "bg-transparent"
                  }`}
                onClick={() => setVerificationMethod("whatsapp")}
              >
                <FaWhatsapp className="inline-block mr-2" /> WhatsApp
              </button>
              <button
                className={`flex-1 p-2 rounded-md transition-colors ${verificationMethod === "sms"
                    ? "bg-blue-400 shadow-md"
                    : "bg-transparent"
                  }`}
                onClick={() => setVerificationMethod("sms")}
              >
                <FaSms className="inline-block mr-2" /> SMS
              </button>
            </div>

            {phoneOtpSent ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  name="phoneOtp"
                  value={formik.values.phoneOtp}
                  onChange={formik.handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={() => verifyOtp("phone")}
                  disabled={isVerifying}
                  className="w-32 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center justify-center"
                >
                  {isVerifying ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    "Verify"
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={handleSendPhoneOtp}
                disabled={countdown > 0 || isSendingOtp}
                className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 ${countdown > 0 || isSendingOtp
                    ? "bg-gray-300"
                    : "bg-primary hover:bg-primary/90 text-white"
                  }`}
              >
                {isSendingOtp ? (
                  <FaSpinner className="animate-spin" />
                ) : countdown > 0 ? (
                  `Resend in ${countdown}s`
                ) : (
                  "Send OTP"
                )}
              </button>
            )}
            {phoneOtpSent && (
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => handleResendOtp("phone")}
                  disabled={countdown > 0 || isSendingOtp}
                  className="text-sm text-primary hover:underline"
                >
                  Resend OTP
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.form
            key="password-step"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onSubmit={formik.handleSubmit}
            className="space-y-4"
          >
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                name="confirmPassword"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Sign Up
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="flex gap-2 justify-center mt-4">
        <p className="text-text dark:text-text-dark">Already have Account?</p>
        <Link
          to="/login"
          onClick={() => setIsLogin(false)}
          className="font-bold text-primary"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default Signup;
