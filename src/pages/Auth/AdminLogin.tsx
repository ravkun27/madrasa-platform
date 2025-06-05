import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { Link, useNavigate } from "react-router-dom";
import { patchFetch, postFetch } from "../../utils/apiCall";
import { useAuth } from "../../context/AuthContext";
import {
  FaSpinner,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaShieldAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

type LoginResponse = {
  success: boolean;
  data?: {
    token: string;
    role: string;
    sessionId?: string;
  };
  message?: string;
};

type LoginStep = "credentials" | "setup2fa" | "verify2fa";

const AdminLogin = () => {
  const { theme } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Flow states
  const [currentStep, setCurrentStep] = useState<LoginStep>("credentials");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>();
  const [qrCode, setQrCode] = useState<string | null>(null);

  // Validation helpers
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone: string) =>
    /^\d{10}$/.test(phone.replace(/^0/, ""));
  const isValidAuthCode = (code: string) => /^\d{6}$/.test(code);

  const validateCredentials = () => {
    if (!identifier.trim()) {
      toast.error("Please enter your email or phone number");
      return false;
    }

    if (!isValidEmail(identifier) && !isValidPhone(identifier)) {
      toast.error(
        "Please enter a valid email address or 10-digit phone number"
      );
      return false;
    }

    if (!password.trim()) {
      toast.error("Please enter your password");
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }

    return true;
  };

  const handleCredentialsSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateCredentials()) return;

    setLoading(true);

    try {
      const isEmail = isValidEmail(identifier);
      const payload = isEmail
        ? { email: identifier.trim(), password }
        : { phoneNumber: identifier.replace(/^0/, "").trim(), password };

      const result = await postFetch<LoginResponse>("/admin/login", payload, {
        showToast: false,
      });

      if (!result.success) {
        toast.error(result.message || "Invalid credentials. Please try again.");
        return;
      }

      if (!result.data) {
        toast.error("Login failed. Please try again.");
        return;
      }
      if (result.success && result.data.token && result.data.role) {
        login(result.data.token, result.data.role); // make sure this stores the token
      }

      const is2FAEnabled = result.data?.sessionId;
      if (!is2FAEnabled) {
        // Setup 2FA for first time
        const setupRes: any = await patchFetch(
          "/admin/auth/2fa/setup",
          {},
          {
            showToast: false,
          }
        );

        if (!setupRes.success) {
          toast.error(
            setupRes.message || "Failed to setup 2FA. Please try again."
          );
          return;
        }

        setQrCode(setupRes.data?.qrCode || null);
        setCurrentStep("setup2fa");
        toast.success("Please scan the QR code with your authenticator app");
      } else {
        // User already has 2FA, go to verification
        setSessionId(result.data.sessionId);
        setCurrentStep("verify2fa");
        toast.success("Please enter your 2FA code");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!authCode.trim()) {
      toast.error("Please enter the 6-digit authentication code");
      return;
    }

    if (!isValidAuthCode(authCode)) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);

    try {
      let result;

      if (currentStep === "setup2fa") {
        // First time 2FA setup
        result = await patchFetch<LoginResponse>(
          "/admin/auth/2fa/verify",
          {
            code: authCode.trim(),
          },
          {
            showToast: false,
          }
        );
      } else {
        // Regular 2FA verification
        localStorage.removeItem("token");
        result = await patchFetch<LoginResponse>(
          "/admin/2fa-login",
          {
            code: authCode.trim(),
            sessionId,
          },
          {
            skipAuth: true,
            showToast: false,
          }
        );
      }

      if (!result.success) {
        toast.error(
          result.message || "Invalid authentication code. Please try again."
        );
        return;
      }

      if (!result.data) {
        toast.error("Authentication failed. Please try again.");
        return;
      }

      // Successful login
      login(result.data.token, result.data.role);
      toast.success("Welcome back! Redirecting to dashboard...");

      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1000);
    } catch (error: any) {
      console.error("2FA verification error:", error);
      toast.error(error.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentStep("credentials");
    setQrCode(null);
    setAuthCode("");
    setSessionId(undefined);
    setIdentifier("");
    setPassword("");
    setShowPassword(false);
  };

  const handleBack = () => {
    if (currentStep === "verify2fa") {
      setCurrentStep("credentials");
      setAuthCode("");
    } else if (currentStep === "setup2fa") {
      setCurrentStep("credentials");
      setQrCode(null);
      setAuthCode("");
    }
  };

  // Theme-based styles
  const themeStyles = {
    light: {
      bg: "bg-white",
      text: "text-gray-800",
      border: "border-gray-300",
      inputBg: "bg-gray-50",
      buttonPrimary: "bg-blue-600 hover:bg-blue-700",
      buttonSecondary: "bg-gray-100 hover:bg-gray-200 text-gray-700",
    },
    dark: {
      bg: "bg-gray-800",
      text: "text-gray-100",
      border: "border-gray-600",
      inputBg: "bg-gray-700",
      buttonPrimary: "bg-blue-600 hover:bg-blue-700",
      buttonSecondary: "bg-gray-700 hover:bg-gray-600 text-gray-200",
    },
  };

  const styles = themeStyles[theme];

  const renderCredentialsForm = () => (
    <form onSubmit={handleCredentialsSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className={`text-sm font-medium ${styles.text}`}>
          Email or Phone Number
        </label>
        <input
          type="text"
          placeholder="e.g. admin@example.com or 9123456789"
          required
          className={`w-full p-3 rounded-lg border ${styles.border} focus:ring-2 focus:ring-blue-500 focus:border-transparent ${styles.inputBg} ${styles.text} transition-all`}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <label className={`text-sm font-medium ${styles.text}`}>Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            required
            className={`w-full p-3 pr-12 rounded-lg border ${styles.border} focus:ring-2 focus:ring-blue-500 focus:border-transparent ${styles.inputBg} ${styles.text} transition-all`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <button
            type="button"
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${styles.text} hover:text-blue-500`}
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
        type="submit"
        disabled={loading}
        className={`w-full py-3.5 rounded-lg font-semibold text-white ${styles.buttonPrimary} transition-colors flex items-center justify-center gap-2 ${
          loading ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        {loading ? (
          <>
            <FaSpinner className="animate-spin" />
            Signing In...
          </>
        ) : (
          "Sign In"
        )}
      </motion.button>
    </form>
  );

  const render2FASetup = () => (
    <div className="space-y-4">
      <div className="text-center">
        <FaShieldAlt className={`mx-auto mb-2 text-4xl ${styles.text}`} />
        <h2 className={`text-xl font-semibold mb-2 ${styles.text}`}>
          Setup Two-Factor Authentication
        </h2>
        <p className={`text-sm ${styles.text} opacity-75`}>
          Scan the QR code below with your authenticator app (Google
          Authenticator)
        </p>
      </div>

      {qrCode && (
        <div className="flex justify-center">
          <div className="p-1 bg-white rounded-lg">
            <img
              src={qrCode}
              alt="QR Code for 2FA Setup"
              className="w-48 h-48"
            />
          </div>
        </div>
      )}

      <form onSubmit={handle2FASubmit} className="space-y-4">
        <div className="space-y-2">
          <label className={`text-sm font-medium ${styles.text}`}>
            Enter 6-digit code from your authenticator app
          </label>
          <input
            type="text"
            placeholder="123456"
            required
            maxLength={6}
            className={`w-full p-3 rounded-lg border ${styles.border} focus:ring-2 focus:ring-blue-500 focus:border-transparent ${styles.inputBg} ${styles.text} transition-all text-center text-lg tracking-widest`}
            value={authCode}
            onChange={(e) => setAuthCode(e.target.value.replace(/\D/g, ""))}
            disabled={loading}
          />
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleBack}
            disabled={loading}
            className={`flex-1 py-3 rounded-lg font-medium ${styles.buttonSecondary} transition-colors flex items-center justify-center gap-2`}
          >
            <FaArrowLeft />
            Back
          </motion.button>

          <motion.button
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            type="submit"
            disabled={loading || authCode.length !== 6}
            className={`flex-1 py-3 rounded-lg font-semibold text-white ${styles.buttonPrimary} transition-colors flex items-center justify-center gap-2 ${
              loading || authCode.length !== 6
                ? "opacity-70 cursor-not-allowed"
                : ""
            }`}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify & Complete Setup"
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );

  const render2FAVerification = () => (
    <div className="space-y-6">
      <div className="text-center">
        <FaShieldAlt className={`mx-auto mb-2 text-4xl ${styles.text}`} />
        <h2 className={`text-xl font-semibold mb-2 ${styles.text}`}>
          Two-Factor Authentication
        </h2>
        <p className={`text-sm ${styles.text} opacity-75`}>
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      <form onSubmit={handle2FASubmit} className="space-y-4">
        <div className="space-y-2">
          <label className={`text-sm font-medium ${styles.text}`}>
            Authentication Code
          </label>
          <input
            type="text"
            placeholder="123456"
            required
            maxLength={6}
            className={`w-full p-3 rounded-lg border ${styles.border} focus:ring-2 focus:ring-blue-500 focus:border-transparent ${styles.inputBg} ${styles.text} transition-all text-center text-lg tracking-widest`}
            value={authCode}
            onChange={(e) => setAuthCode(e.target.value.replace(/\D/g, ""))}
            disabled={loading}
            autoFocus
          />
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleBack}
            disabled={loading}
            className={`flex-1 py-3 rounded-lg font-medium ${styles.buttonSecondary} transition-colors flex items-center justify-center gap-2`}
          >
            <FaArrowLeft />
            Back
          </motion.button>

          <motion.button
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            type="submit"
            disabled={loading || authCode.length !== 6}
            className={`flex-1 py-3 rounded-lg font-semibold text-white ${styles.buttonPrimary} transition-colors flex items-center justify-center gap-2 ${
              loading || authCode.length !== 6
                ? "opacity-70 cursor-not-allowed"
                : ""
            }`}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify & Sign In"
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case "credentials":
        return "Admin Login";
      case "setup2fa":
        return "Setup 2FA";
      case "verify2fa":
        return "Enter 2FA Code";
      default:
        return "Admin Login";
    }
  };
  return (
    <div
      className={`min-h-screen flex items-center justify-center p-2 ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`w-full max-w-lg p-4 rounded-2xl shadow-xl ${styles.bg} ${styles.border} border`}
      >
        <h1 className={`text-3xl font-bold mb-4 text-center ${styles.text}`}>
          {getStepTitle()}
        </h1>

        {currentStep === "credentials" && renderCredentialsForm()}
        {currentStep === "setup2fa" && render2FASetup()}
        {currentStep === "verify2fa" && render2FAVerification()}

        {currentStep === "credentials" && (
          <div className="flex items-center justify-between mt-6">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        )}

        {currentStep !== "credentials" && (
          <div className="mt-6 text-center">
            <button
              onClick={handleReset}
              className="text-sm text-blue-600 hover:text-blue-500 hover:underline transition-colors"
              disabled={loading}
            >
              Start over
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminLogin;
