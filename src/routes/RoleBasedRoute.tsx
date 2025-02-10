import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "../components/LoadingScreen";

type RoleBasedRouteProps = {
  role: string; // Allow single role or multiple roles
  children?: React.ReactNode;
};

const RoleBasedRoute = ({ role, children }: RoleBasedRouteProps) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has the required role(s)
  const hasAccess = Array.isArray(role)
    ? role.includes(user?.role) // Check if user role is in the allowed roles array
    : user?.role === role; // Direct comparison for single role

  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? children : <Outlet />;
};

export default RoleBasedRoute;
