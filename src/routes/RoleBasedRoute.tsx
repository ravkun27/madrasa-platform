import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
type RoleBasedRouteProps = {
  role: string;
  children?: React.ReactNode;
};
const RoleBasedRoute = ({ role, children }: RoleBasedRouteProps) => {
  const { user } = useAuth();

  if (user?.role !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? children : <Outlet />;
};

export default RoleBasedRoute;
