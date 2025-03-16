import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

type AuthContextType = {
  user: { role: string } | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, role: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ role: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      setUser({ role });
      setIsAuthenticated(true);
      switch (role.toLowerCase()) {
        case "teacher":
          navigate("/teacher-dashboard");
          break;
        case "student":
          navigate("/student-dashboard");
          break;
        case "superadmin":
        case "generaladmin":
          navigate("/admin/dashboard");
          break;
        default:
          navigate("/"); // Fallback to landing page for unknown roles
      }
    } else {
      console.log("No valid token or role found in localStorage");
      setUser(null);
      setIsAuthenticated(false);
    }

    setLoading(false);
  }, []);

  const login = (token: string, role: string) => {
    if (!token || !role) {
      console.error("Invalid login attempt: Missing token or role");
      return;
    }

    const normalizedRole = role.toLowerCase().trim();
    localStorage.setItem("token", token);
    localStorage.setItem("role", normalizedRole);
    setUser({ role: normalizedRole });
    setIsAuthenticated(true);
    setLoading(false); // Ensure loading is updated
    console.log("User logged in:", { role: normalizedRole });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false); // Ensure loading state is updated
    console.log("User logged out");

    navigate("/login"); // Redirect after logout
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
