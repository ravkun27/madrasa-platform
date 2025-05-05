import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { Link, useNavigate } from "react-router-dom";
import { postFetch } from "../../utils/apiCall";
import { useAuth } from "../../context/AuthContext";
import {
  FaSpinner,
  FaUserShield,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useLanguage } from "../../context/LanguageContext";

type LoginResponse = {
  success: boolean;
  data?: {
    token: string;
    role: string;
  };
  message?: string;
};

const Login = ({ setIsLogin }: { setIsLogin: (isLogin: boolean) => void }) => {
  const { theme } = useTheme();
  const { login } = useAuth();
  const { language } = useLanguage();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.5,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  const translations = {
    en: {
      welcomeBack: "Welcome Back!",
      emailOrPhone: "Email or Phone Number",
      emailOrPhonePlaceholder: "Enter your email or phone number",
      password: "Password",
      passwordPlaceholder: "Enter your password",
      signIn: "Sign In",
      signingIn: "Signing In...",
      noAccount: "Don't have an account?",
      createAccount: "Create account",
      invalidInput: "Please enter a valid email or phone number",
      errorOccurred: "Something went wrong.",
      forgotPassword: "Forgot password?",
      adminLogin: "Admin Login",
    },
    ar: {
      welcomeBack: "مرحبًا بعودتك!",
      emailOrPhone: "البريد الإلكتروني أو رقم الهاتف",
      emailOrPhonePlaceholder: "أدخل بريدك الإلكتروني أو رقم هاتفك",
      password: "كلمة المرور",
      passwordPlaceholder: "أدخل كلمة المرور",
      signIn: "تسجيل الدخول",
      signingIn: "جارٍ تسجيل الدخول...",
      noAccount: "ليس لديك حساب؟",
      createAccount: "إنشاء حساب",
      invalidInput: "يرجى إدخال بريد إلكتروني أو رقم هاتف صالح",
      errorOccurred: "حدث خطأ ما.",
      forgotPassword: "نسيت كلمة المرور؟",
      adminLogin: "دخول المسؤول",
    },
  };

  const t = translations[language];

  // Check if there's stored credentials
  useEffect(() => {
    const storedIdentifier = localStorage.getItem("remembered_identifier");
    if (storedIdentifier) {
      setIdentifier(storedIdentifier);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    const trimmed = identifier.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    const isPhone = /^\d{10}$/.test(trimmed.replace(/^0/, ""));

    if (!isEmail && !isPhone) {
      toast.error(t.invalidInput);
      setLoading(false);
      return;
    }

    if (!isEmail && !isPhone) {
      toast.error(t.invalidInput);
      setLoading(false);
      return;
    }

    const payload = isEmail
      ? { email: identifier, password }
      : { phoneNumber: identifier.replace(/^0/, ""), password };

    try {
      const result = await postFetch<LoginResponse>("/user/login", payload);

      if (result.success && result.data) {
        const { token, role } = result.data;

        // Handle "remember me" option
        if (rememberMe) {
          localStorage.setItem("remembered_identifier", identifier);
        } else {
          localStorage.removeItem("remembered_identifier");
        }

        login(token, role);

        // Redirect with a slight delay for better UX
        setTimeout(() => {
          navigate(`/${role.toLowerCase()}-dashboard`);
        }, 1000);
      }
    } catch (error: any) {
      const errorMessage = error.message || t.errorOccurred;
      console.error(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Dynamic styles based on theme
  const isDark = theme === "dark";
  const primaryColor = isDark ? "text-secondary" : "text-primary";
  const primaryBgColor = isDark ? "bg-secondary" : "bg-primary";
  const hoverBgColor = isDark ? "hover:bg-secondary/90" : "hover:bg-primary/90";
  const inputBgColor = isDark ? "bg-gray-800" : "bg-white";
  const cardBgColor = isDark ? "bg-gray-900" : "bg-white";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const labelColor = isDark ? "text-gray-300" : "text-gray-700";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-background/90">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className={`relative w-full max-w-md p-6 sm:p-8 rounded-2xl shadow-2xl ${cardBgColor} border ${borderColor}`}
      >
        {/* Admin Login Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/admin/login")}
          aria-label="Admin Login"
          className={`absolute top-2 right-2 flex items-center gap-2 px-2 py-1 rounded-md ${
            isDark
              ? "bg-gray-800 hover:bg-gray-700 text-secondary"
              : "bg-gray-100 hover:bg-gray-200 text-primary"
          } transition-all duration-300 shadow-md`}
        >
          <FaUserShield className="text-base" />
          <span className="hidden sm:inline text-xs font-medium">
            {t.adminLogin}
          </span>
        </motion.button>

        {/* Title */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1
            className={`text-2xl sm:text-3xl font-bold text-center ${textColor}`}
          >
            {t.welcomeBack}
          </h1>
          <div className="w-16 h-1 mx-auto mt-3 rounded-full bg-gradient-to-r from-primary to-secondary"></div>
        </motion.div>

        <form onSubmit={handleLogin} className="space-y-5">
          <motion.div variants={itemVariants} className="space-y-2">
            <label
              className={`text-sm font-medium flex items-center gap-2 ${labelColor}`}
            >
              <FaEnvelope className="text-xs" />
              {t.emailOrPhone}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={t.emailOrPhonePlaceholder}
                required
                className={`w-full p-3 pl-4 rounded-lg border ${borderColor} focus:ring-2 focus:ring-primary/50 focus:border-primary ${inputBgColor} ${textColor} transition-all`}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <label
              className={`text-sm font-medium flex items-center gap-2 ${labelColor}`}
            >
              <FaLock className="text-xs" />
              {t.password}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t.passwordPlaceholder}
                required
                className={`w-full p-3 pl-4 pr-10 rounded-lg border ${borderColor} focus:ring-2 focus:ring-primary/50 focus:border-primary ${inputBgColor} ${textColor} transition-all`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none`}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between"
          >
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className={`font-medium ${primaryColor} hover:underline`}
              >
                {t.forgotPassword}
              </Link>
            </div>
          </motion.div>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-lg font-semibold ${primaryBgColor} text-white ${hoverBgColor} transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                {t.signingIn}
              </>
            ) : (
              t.signIn
            )}
          </motion.button>

          <motion.div variants={itemVariants} className="text-center mt-6">
            <p className={`text-sm ${labelColor}`}>
              {t.noAccount}{" "}
              <Link
                to="/signup"
                onClick={() => setIsLogin(false)}
                className={`font-semibold ${primaryColor} hover:underline transition-colors`}
              >
                {t.createAccount}
              </Link>
            </p>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
