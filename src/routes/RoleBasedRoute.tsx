import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "../components/LoadingScreen";

type RoleBasedRouteProps = {
  role: string;
  children?: React.ReactNode;
};

const RoleBasedRoute = ({ role, children }: RoleBasedRouteProps) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Case-insensitive comparison
  const hasAccess = user?.role.toLowerCase() === role.toLowerCase();
  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? children : <Outlet />;
};

export default RoleBasedRoute;
