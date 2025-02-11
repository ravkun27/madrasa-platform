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
      console.log("Token and role found in localStorage:", { token, role });
      setUser({ role });
      setIsAuthenticated(true);
    } else {
      console.log("No valid token or role found in localStorage");
      setUser(null);
      setIsAuthenticated(false);
    }

    setLoading(false); // Immediately set loading to false after checking
  }, []);

  const login = (token: string, role: string) => {
    const normalizedRole = role.toLowerCase();
    localStorage.setItem("token", token);
    localStorage.setItem("role", normalizedRole);
    setUser({ role: normalizedRole });
    setIsAuthenticated(true);
    console.log("User logged in:", { role: normalizedRole });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
    setIsAuthenticated(false);
    navigate("/login");
    console.log("User logged out");
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
