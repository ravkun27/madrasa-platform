import { useState, FormEvent, useEffect } from "react";
import { FaChalkboardTeacher, FaUserGraduate } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { postFetch } from "../../utils/apiCall";

// Define the expected response type for the signup API
interface SignupResponse {
  success: boolean;
  data: {
    token: string;
  };
  message?: string;
}

// Define the expected response type for the OTP API
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
    role: "",
    otp: "",
  });
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Send OTP handler
  const handleSendOtp = async () => {
    if (!formData.email) {
      alert("Please enter your email first");
      return;
    }

    setIsLoading(true);
    try {
      const result = await postFetch<OtpResponse>(
        "/user/sendOTP?for=createUser",
        {
          email: formData.email,
        }
      );

      if (result.success) {
        setIsOtpSent(true);
        setCountdown(60); // 60 seconds countdown
        alert("OTP sent to your email!");
      } else {
        throw new Error(result.message || "Failed to send OTP");
      }
    } catch (error: any) {
      alert(error.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  // Form submission handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (formData.otp.length !== 4) {
      alert("Please enter a 4-digit OTP");
      return;
    }

    try {
      const result = await postFetch<SignupResponse>("/user/signup", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        otp: formData.otp,
      });
      if (!result?.success) {
        throw new Error(result?.message || "Signup failed. Please try again.");
      }

      if (result.success && result.data.token) {
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("role", formData.role);

        navigate("/login");
      } else {
        throw new Error(result.message || "Signup failed. Please try again.");
      }
    } catch (error: any) {
      alert(error.message || "Signup failed. Please try again.");
    }
  };

  return (
    <div className="my-4 max-w-md mx-auto p-6 border-2 border-accent rounded-xl">
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
                    <h3 className="font-semibold">Teacher</h3>
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
              <input
                type="email"
                placeholder="Email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isLoading || countdown > 0}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  countdown > 0 || isLoading
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-primary hover:bg-primary/90 text-white"
                }`}
              >
                {countdown > 0 ? `${countdown}s` : "Send OTP"}
              </button>
            </div>

            <input
              type="number"
              placeholder="Enter 4-digit OTP"
              required
              value={formData.otp}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  otp: e.target.value.replace(/\D/g, "").slice(0, 4), // Limits to 4 digits
                })
              }
              maxLength={4}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />

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

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg transition-colors ${
                isLoading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90 text-white"
              }`}
            >
              {isLoading ? "Creating..." : "Create Account"}
            </button>
            <div className="flex gap-2 justify-center ">
              <p className="text-text dark:text-text-dark">
                Already have Account?
              </p>
              <Link to={"/login"} className="font-bold text-primary">
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
