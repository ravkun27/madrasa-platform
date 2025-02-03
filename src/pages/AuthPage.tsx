import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { FaChalkboardTeacher, FaUserGraduate, FaGoogle } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

const AuthPage = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState<
    "student" | "teacher" | null
  >(
    new URLSearchParams(location.search).get("role") as
      | "student"
      | "teacher"
      | null
  );
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission with selectedRole
    console.log({ ...formData, role: selectedRole });
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const roleCardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${
        theme === "light"
          ? "bg-gradient-to-br from-white to-light-teal"
          : "bg-gradient-to-br from-gray-900 to-gray-800"
      }`}
    >
      <motion.div
        className={`w-full max-w-md rounded-2xl p-8 shadow-xl ${
          theme === "light" ? "bg-white" : "bg-background-dark"
        }`}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <h1
          className={`text-3xl font-bold mb-8 ${
            theme === "light" ? "text-accent" : "text-text-dark"
          }`}
        >
          {isLogin ? "Welcome Back!" : "Get Started"}
        </h1>

        {!selectedRole ? (
          <motion.div className="space-y-6">
            <h2
              className={`text-lg mb-6 ${
                theme === "light" ? "text-slate" : "text-text-dark/80"
              }`}
            >
              Select your role to continue
            </h2>

            <motion.div
              className={`cursor-pointer p-6 rounded-xl transition-all border-2 ${
                theme === "light"
                  ? "hover:border-primary"
                  : "hover:border-primary-dark"
              } ${
                selectedRole === "student"
                  ? theme === "light"
                    ? "border-primary bg-primary/10"
                    : "border-primary-dark bg-primary-dark/10"
                  : "border-transparent"
              }`}
              onClick={() => setSelectedRole("student")}
              variants={roleCardVariants}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-lg ${
                    theme === "light" ? "bg-primary/20" : "bg-primary-dark/20"
                  }`}
                >
                  <FaUserGraduate
                    className={`text-2xl ${
                      theme === "light" ? "text-primary" : "text-primary-dark"
                    }`}
                  />
                </div>
                <div>
                  <h3
                    className={`font-semibold ${
                      theme === "light" ? "text-accent" : "text-text-dark"
                    }`}
                  >
                    Student
                  </h3>
                  <p
                    className={`text-sm ${
                      theme === "light" ? "text-slate" : "text-text-dark/80"
                    }`}
                  >
                    Join courses and start learning
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className={`cursor-pointer p-6 rounded-xl transition-all border-2 ${
                theme === "light"
                  ? "hover:border-secondary"
                  : "hover:border-secondary-dark"
              } ${
                selectedRole === "teacher"
                  ? theme === "light"
                    ? "border-secondary bg-secondary/10"
                    : "border-secondary-dark bg-secondary-dark/10"
                  : "border-transparent"
              }`}
              onClick={() => setSelectedRole("teacher")}
              variants={roleCardVariants}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-lg ${
                    theme === "light"
                      ? "bg-secondary/20"
                      : "bg-secondary-dark/20"
                  }`}
                >
                  <FaChalkboardTeacher
                    className={`text-2xl ${
                      theme === "light"
                        ? "text-secondary"
                        : "text-secondary-dark"
                    }`}
                  />
                </div>
                <div>
                  <h3
                    className={`font-semibold ${
                      theme === "light" ? "text-accent" : "text-text-dark"
                    }`}
                  >
                    Teacher
                  </h3>
                  <p
                    className={`text-sm ${
                      theme === "light" ? "text-slate" : "text-text-dark/80"
                    }`}
                  >
                    {isLogin
                      ? "Manage your courses"
                      : "Create and manage courses"}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label
                  className={`block text-sm font-medium ${
                    theme === "light" ? "text-slate" : "text-text-dark/80"
                  }`}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  className={`w-full mt-1 p-3 rounded-lg border ${
                    theme === "light"
                      ? "border-light-teal bg-white"
                      : "border-primary-dark bg-background-dark"
                  }`}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
            )}

            <div>
              <label
                className={`block text-sm font-medium ${
                  theme === "light" ? "text-slate" : "text-text-dark/80"
                }`}
              >
                Email
              </label>
              <input
                type="email"
                required
                className={`w-full mt-1 p-3 rounded-lg border ${
                  theme === "light"
                    ? "border-light-teal bg-white"
                    : "border-primary-dark bg-background-dark"
                }`}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${
                  theme === "light" ? "text-slate" : "text-text-dark/80"
                }`}
              >
                Password
              </label>
              <input
                type="password"
                required
                className={`w-full mt-1 p-3 rounded-lg border ${
                  theme === "light"
                    ? "border-light-teal bg-white"
                    : "border-primary-dark bg-background-dark"
                }`}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            {selectedRole === "teacher" && !isLogin && (
              <div
                className={`p-4 rounded-lg ${
                  theme === "light" ? "bg-amber-50" : "bg-background-dark/50"
                }`}
              >
                <p
                  className={`text-sm ${
                    theme === "light" ? "text-slate" : "text-text-dark/80"
                  }`}
                >
                  Note: Teacher accounts require admin approval before creating
                  courses.
                </p>
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                selectedRole === "student"
                  ? theme === "light"
                    ? "bg-primary text-white hover:bg-primary-dark"
                    : "bg-primary-dark text-white hover:bg-primary"
                  : theme === "light"
                  ? "bg-secondary text-white hover:bg-secondary-dark"
                  : "bg-secondary-dark text-white hover:bg-secondary"
              }`}
            >
              {isLogin ? "Sign In" : "Create Account"}
            </button>

            <div className="flex items-center gap-4">
              <hr
                className={`flex-1 ${
                  theme === "light"
                    ? "border-light-teal"
                    : "border-primary-dark"
                }`}
              />
              <span
                className={`text-sm ${
                  theme === "light" ? "text-slate" : "text-text-dark/80"
                }`}
              >
                or continue with
              </span>
              <hr
                className={`flex-1 ${
                  theme === "light"
                    ? "border-light-teal"
                    : "border-primary-dark"
                }`}
              />
            </div>

            <button
              type="button"
              className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                theme === "light"
                  ? "bg-white border border-light-teal text-slate hover:bg-gray-50"
                  : "bg-background-dark border border-primary-dark text-text-dark hover:bg-background-dark/80"
              }`}
            >
              <FaGoogle className="text-lg" />
              Google
            </button>

            <p
              className={`text-center ${
                theme === "light" ? "text-slate" : "text-text-dark/80"
              }`}
            >
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className={`font-semibold ${
                  selectedRole === "student"
                    ? theme === "light"
                      ? "text-primary hover:text-primary-dark"
                      : "text-primary-dark hover:text-primary"
                    : theme === "light"
                    ? "text-secondary hover:text-secondary-dark"
                    : "text-secondary-dark hover:text-secondary"
                }`}
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default AuthPage;
