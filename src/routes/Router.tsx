import { createBrowserRouter, Outlet } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import RoleBasedRoute from "./RoleBasedRoute";
import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/SignUp";
import StudentDashboard from "../pages/Student/Dashboard";
import TeacherDashboard from "../pages/Teacher/Dashboard";
import NotFound from "../pages/shared/NotFound";
import Unauthorized from "../pages/Unauthorized";
import PublicLayout from "../layouts/PublicLayout";
import LandingPage from "../pages/LandingPage";
import { AuthProvider } from "../context/AuthContext";
import ProtectedLayout from "../layouts/ProtectedLayout";
import { CreateCourses } from "../pages/Teacher/CreateCoursePage";
import { ManageCourses } from "../pages/Teacher/ManageCoursesPage";
import { CourseProvider } from "../context/CourseContext"; // Import CourseProvider
import { useCourseContext } from "../context/CourseContext"; // Import useCourseContext
import { useNavigate } from "react-router-dom";
import { NewCourse } from "../types";

// RootLayout wraps the entire app with AuthProvider and CourseProvider
const RootLayout = () => {
  return (
    <AuthProvider>
      <CourseProvider>
        <Outlet />
      </CourseProvider>
    </AuthProvider>
  );
};

// Wrapper component for CreateCourses to handle props
const CreateCoursesWrapper = () => {
  const navigate = useNavigate();
  const { addCourse } = useCourseContext(); // Use CourseContext

  const handleSubmit = (newCourse: NewCourse) => {
    addCourse(newCourse); // Add the new course to the global state
    navigate("/edit-courses"); // Navigate to EditCourses after creation
  };

  const handleCancel = () => {
    navigate("/teacher-dashboard"); // Navigate back to teacher dashboard
  };

  return <CreateCourses onSubmit={handleSubmit} onCancel={handleCancel} />;
};

// Wrapper component for EditCourses to handle props
const EditCoursesWrapper = () => {
  return <ManageCourses />;
};

// Public routes (no authentication required)
const publicRoutes = [
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      {
        path: "signup",
        element: <Signup setIsLogin={(isLogin) => console.log(isLogin)} />,
      },
      {
        path: "login",
        element: <Login setIsLogin={(isLogin) => console.log(isLogin)} />,
      },
      { path: "unauthorized", element: <Unauthorized /> },
    ],
  },
];

// Protected routes (authentication and role-based access required)
const protectedRoutes = [
  {
    element: <PrivateRoute />, // Protect all routes inside
    children: [
      {
        element: <ProtectedLayout />, // Public layout wrapper
        children: [
          {
            element: <RoleBasedRoute role="student" />, // Role check
            children: [
              { path: "student-dashboard", element: <StudentDashboard /> },
            ],
          },
          {
            element: <RoleBasedRoute role="teacher" />, // Role check
            children: [
              { path: "teacher-dashboard", element: <TeacherDashboard /> },
              // Add teacher-specific routes here
              {
                path: "create-course",
                element: <CreateCoursesWrapper />, // Wrapper to handle props
              },
              {
                path: "edit-courses",
                element: <EditCoursesWrapper />, // Wrapper to handle props
              },
            ],
          },
        ],
      },
    ],
  },
];

// Router configuration
const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      ...publicRoutes, // Public routes
      ...protectedRoutes, // Protected routes
      { path: "*", element: <NotFound /> }, // 404 route
    ],
  },
]);

export default router;
