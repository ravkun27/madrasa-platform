import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { Link, useNavigate } from "react-router-dom";
import { postFetch } from "../../utils/apiCall";

type LoginResponse = {
  success: boolean;
  data: {
    token: string;
    role: string;
  };
};

const Login = ({ setIsLogin }: { setIsLogin: (isLogin: boolean) => void }) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission

    try {
      const result: LoginResponse = await postFetch<LoginResponse>(
        "/user/login",
        { email, password }
      );

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
        alert("Invalid credentials");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Something went wrong. Please try again.");
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
              type="email"
              placeholder="Email"
              required
              className={`w-full mt-1 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary ${
                theme === "light"
                  ? "border-primary bg-white text-primary"
                  : "border-primary-dark bg-background-dark text-primary-dark"
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            }`}
          >
            Sign In
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
