import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { Link, useNavigate } from "react-router-dom";
import { postFetch } from "../../utils/apiCall";
import { useAuth } from "../../context/AuthContext";
import { FaSpinner } from "react-icons/fa";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

type LoginResponse = {
  success: boolean;
  data?: {
    token: string;
    role: string;
  };
  message?: string;
};

const AdminLogin = () => {
  const { theme } = useTheme();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const isPhone = /^\d{10}$/.test(identifier.replace(/^0/, ""));

    if (!isEmail && !isPhone) {
      toast.error("Please enter a valid email or phone number");
      setLoading(false);
      return;
    }

    const payload = isEmail
      ? { email: identifier, password }
      : { phoneNumber: identifier.replace(/^0/, ""), password };

    try {
      const result = await postFetch<LoginResponse>("/admin/login", payload);

      if (result.success && result.data) {
        const { token, role } = result.data;
        login(token, role);
        navigate(`/admin/dashboard`);
      } else {
        // toast.error(result.message || "Invalid credentials");
      }
    } catch (error) {
      // toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Theme-based styles
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
          Admin Login! 👋
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className={`text-sm font-medium ${currentTheme.text}`}>
              Email or Phone Number
            </label>
            <input
              type="text"
              placeholder="e.g. john@example.com or 9123456789"
              required
              className={`w-full p-3 rounded-lg border ${
                currentTheme.border
              } focus:ring-2 focus:ring-primary focus:border-transparent ${
                currentTheme.inputBg
              } transition-all`}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className={`text-sm font-medium ${currentTheme.text}`}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              required
              className={`w-full p-3 rounded-lg border ${
                currentTheme.border
              } focus:ring-2 focus:ring-primary focus:border-transparent ${
                currentTheme.inputBg
              } transition-all`}
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
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </motion.button>
        </form>
        <motion.div className="flex items-center justify-between mt-2">
          <div className="text-sm">
            <Link
              to="/forgot-password"
              className={`font-medium bg-primary/10 text-primary hover:bg-primary/20 hover:underline`}
            >
              Forgot password?
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
