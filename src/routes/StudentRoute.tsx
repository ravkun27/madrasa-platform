import { Navigate, Outlet } from "react-router-dom";

const StudentRoute = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // If user is not authenticated or not a student, redirect to login
  if (!token || role !== "student") {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default StudentRoute;
