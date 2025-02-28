import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { Link, useNavigate } from "react-router-dom";
import { postFetch } from "../../utils/apiCall";
import { useAuth } from "../../context/AuthContext"; // Import AuthContext

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
  const { login } = useAuth(); // Use login function from AuthContext
  const [identifier, setIdentifier] = useState(""); // Email or Phone Number
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    // Determine if input is an email or phone number
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const isPhone = /^\d{10}$/.test(identifier.replace(/^0/, "")); // Remove leading zero and check 10 digits

    if (!isEmail && !isPhone) {
      alert("Please enter a valid email or phone number.");
      setLoading(false);
      return;
    }

    const payload = isEmail
      ? { email: identifier, password }
      : { phoneNumber: identifier.replace(/^0/, ""), password };

    try {
      const result: LoginResponse = await postFetch<LoginResponse>(
        "/user/login",
        payload
      );

      if (result.success && result.data) {
        const { token, role } = result.data;
        login(token, role);
        navigate(`/${role.toLowerCase()}-dashboard`);
      } else {
        alert(result.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-12 max-w-md mx-auto flex flex-col items-center justify-center">
      <div className="p-10 border-2 rounded-lg border-accent">
        <h1
          className={`text-3xl font-bold mb-8 text-center ${
            theme === "light" ? "text-primary" : "text-secondary"
          }`}
        >
          Welcome Back!
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Email or Phone"
              required
              className={`w-full mt-1 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary ${
                theme === "light"
                  ? "border-primary bg-white text-primary"
                  : "border-primary-dark bg-background-dark text-primary-dark"
              }`}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>

          <div>
            <input
              placeholder="Password"
              type="password"
              required
              className={`w-full mt-1 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary ${
                theme === "light"
                  ? "border-primary bg-white text-primary"
                  : "border-primary-dark bg-background-dark text-primary-dark"
              }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              theme === "light"
                ? "bg-primary text-white hover:bg-primary-dark"
                : "bg-primary-dark text-white hover:bg-primary"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <p
            className={`text-center ${
              theme === "light" ? "text-slate" : "text-text-dark/80"
            }`}
          >
            Don't have an account?
            <Link
              to={"/signup"}
              onClick={() => setIsLogin(false)}
              className={`font-semibold ml-2 ${
                theme === "light"
                  ? "text-primary hover:text-primary-dark"
                  : "text-primary-dark hover:text-primary"
              }`}
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
