import { useState, useEffect } from "react";
import {
  FaChalkboardTeacher,
  FaUserGraduate,
  FaCheck,
  FaSpinner,
  FaWhatsapp,
  FaSms,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
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
  >("sms");

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
        .matches(/^\+964\d{10}$/, "Must be 10 digits without country code")
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

  // Unified OTP sending function
  const sendOtp = async (payload: {
    email?: string;
    phoneNumber?: string;
    method?: "whatsapp" | "sms";
  }) => {
    setIsSendingOtp(true);
    try {
      const result = await postFetch<OtpResponse>(
        "/user/sendOTP?for=createUser",
        payload
      );

      if (result.success) {
        setCountdown(60);
        if (payload.email) setEmailOtpSent(true);
        if (payload.phoneNumber) setPhoneOtpSent(true);
        toast.success(`OTP sent to ${payload.email ? "email" : "phone"}!`);
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

  // Updated phone OTP handler
  const handleSendPhoneOtp = async () => {
    if (!formik.values.phoneNumber) return toast.error("Phone number required");
    await sendOtp({
      phoneNumber: formik.values.phoneNumber,
      method: verificationMethod,
    });
  };

  // Unified verification handler
  const verifyOtp = async (type: "email" | "phone") => {
    setIsVerifying(true);
    try {
      const endpoint =
        type === "email" ? "/user/verifyOtp" : "/user/verifyPhoneOtp";
      const payload =
        type === "email"
          ? { email: formik.values.email, otp: formik.values.emailOtp }
          : {
              phoneNumber: formik.values.phoneNumber,
              otp: formik.values.phoneOtp,
            };

      const result = await postFetch<OtpResponse>(endpoint, payload);

      if (result.success) {
        if (type === "email") {
          setEmailVerified(true);
          setCurrentStep("phone");
        } else {
          setPhoneVerified(true);
          setCurrentStep("password");
        }
        toast.success(`${type} verified!`);
      }
    } catch (error) {
      toast.error("Invalid OTP");
    } finally {
      setIsVerifying(false);
    }
  };

  // Fix phone number input handling
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 11);
    formik.setFieldValue("phoneNumber", value);
  };

  // Fix countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown((prev) => prev - 1), 100);
      return () => clearInterval(timer);
    }
  }, [countdown]);
  return (
    <div className="my-4 max-w-md mx-auto p-6 border-2 border-accent rounded-xl">
      <Toaster position="top-right" />
      <h1
        className={`text-3xl font-bold mb-8 text-center ${
          theme === "light" ? "text-primary" : "text-secondary"
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
                  formik.values.role === "student"
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
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  formik.values.role === "teacher"
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
          // Email verification step
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
                onClick={handleSendEmailOtp}
                disabled={countdown > 0 || isSendingOtp}
                className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 ${
                  countdown > 0 || isSendingOtp
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
          </motion.div>
        ) : currentStep === "phone" ? (
          // Phone verification step
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
                value={formik.values.phoneNumber.replace(/^\+964/, "")}
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
                className={`flex-1 p-2 rounded-md transition-colors ${
                  verificationMethod === "whatsapp"
                    ? "bg-blue-400 shadow-md"
                    : "bg-transparent"
                }`}
                onClick={() => setVerificationMethod("whatsapp")}
              >
                <FaWhatsapp className="inline-block mr-2" /> WhatsApp
              </button>
              <button
                className={`flex-1 p-2 rounded-md transition-colors ${
                  verificationMethod === "sms"
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
                className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 ${
                  countdown > 0 || isSendingOtp
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
          </motion.div>
        ) : (
          // Password step (keep same)
          <motion.form
            key="password-step"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onSubmit={formik.handleSubmit}
            className="space-y-4"
          >
            {/* Password fields (keep same) */}
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
