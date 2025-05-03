import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { Link, useNavigate } from "react-router-dom";
import { postFetch } from "../../utils/apiCall";
import { useAuth } from "../../context/AuthContext";
import { FaSpinner } from "react-icons/fa";
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
  const navigate = useNavigate();

  const translations = {
    en: {
      welcomeBack: "Welcome Back! 👋",
      emailOrPhone: "Email or Phone Number",
      emailOrPhonePlaceholder: "e.g. john@example.com or 9123456789",
      password: "Password",
      passwordPlaceholder: "••••••••",
      signIn: "Sign In",
      signingIn: "Signing In...",
      noAccount: "Don't have an account?",
      createAccount: "Create account",
      invalidInput: "Please enter a valid email or phone number",
      errorOccurred: "Something went wrong.",
    },
    ar: {
      welcomeBack: "مرحبًا بعودتك! 👋",
      emailOrPhone: "البريد الإلكتروني أو رقم الهاتف",
      emailOrPhonePlaceholder: "مثال: john@example.com أو 9123456789",
      password: "كلمة المرور",
      passwordPlaceholder: "••••••••",
      signIn: "تسجيل الدخول",
      signingIn: "جارٍ تسجيل الدخول...",
      noAccount: "ليس لديك حساب؟",
      createAccount: "إنشاء حساب",
      invalidInput: "يرجى إدخال بريد إلكتروني أو رقم هاتف صالح",
      errorOccurred: "حدث خطأ ما.",
    },
  };

  const t = translations[language];

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const isPhone = /^\d{10}$/.test(identifier.replace(/^0/, ""));

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
        login(token, role);
        navigate(`/${role.toLowerCase()}-dashboard`);
      }
    } catch (error: any) {
      const errorMessage = error.message || t.errorOccurred;
      console.error(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const themeStyles = {
    light: {
      bg: "bg-white",
      text: "text-primary",
      border: "border-primary",
      inputBg: "bg-gray-50",
    },
    dark: {
      bg: "bg-gray-800",
      text: "text-secondary",
      border: "border-secondary",
      inputBg: "bg-gray-700",
    },
  };

  const currentTheme = themeStyles[theme];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-md p-8 rounded-2xl shadow-xl ${currentTheme.bg} ${currentTheme.border} border-2`}
      >
        <h1
          className={`text-3xl font-bold mb-8 text-center ${currentTheme.text}`}
        >
          {t.welcomeBack}
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className={`text-sm font-medium ${currentTheme.text}`}>
              {t.emailOrPhone}
            </label>
            <input
              type="text"
              placeholder={t.emailOrPhonePlaceholder}
              required
              className={`w-full p-3 rounded-lg border ${currentTheme.border} focus:ring-2 focus:ring-primary focus:border-transparent ${currentTheme.inputBg} transition-all`}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className={`text-sm font-medium ${currentTheme.text}`}>
              {t.password}
            </label>
            <input
              type="password"
              placeholder={t.passwordPlaceholder}
              required
              className={`w-full p-3 rounded-lg border ${currentTheme.border} focus:ring-2 focus:ring-primary focus:border-transparent ${currentTheme.inputBg} transition-all`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-lg font-semibold ${
              theme === "light"
                ? "bg-primary text-white hover:bg-primary/90"
                : "bg-secondary text-white hover:bg-secondary/90"
            } transition-colors flex items-center justify-center gap-2 ${
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

          <div className="text-center mt-4">
            <span className={`text-sm ${currentTheme.text}`}>
              {t.noAccount}{" "}
              <Link
                to="/signup"
                onClick={() => setIsLogin(false)}
                className={`font-semibold underline ${
                  theme === "light"
                    ? "text-primary hover:text-primary/80"
                    : "text-secondary hover:text-secondary/80"
                } transition-colors`}
              >
                {t.createAccount}
              </Link>
            </span>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
