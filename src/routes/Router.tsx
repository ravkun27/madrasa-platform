import { createBrowserRouter, Outlet } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import RoleBasedRoute from "./RoleBasedRoute";
import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/SignUp";
import StudentDashboard from "../pages/Student/Dashboard";
import TeacherDashboard from "../pages/Teacher/Dashboard";
import AdminDashboard from "../pages/Admin/Dashboard";
import NotFound from "../pages/shared/NotFound";
import Unauthorized from "../pages/Unauthorized";
import PublicLayout from "../layouts/PublicLayout";
import LandingPage from "../pages/LandingPage";
import { AuthProvider } from "../context/AuthContext";
import ProtectedLayout from "../layouts/ProtectedLayout";
import ManageCoursesPage from "../pages/Teacher/ManageCoursesPage";
import { CourseProvider } from "../context/CourseContext"; // Import CourseProvider
import UserSettingsPage from "../pages/shared/UserSettingsPage";
import { useState } from "react";
import CoursesPage from "../pages/CoursesPage";
import AdminLayout from "../layouts/AdminLayout";
import AdminLogin from "../pages/Auth/AdminLogin";
import AboutUs from "../pages/AboutusPage";
import { CoursePage } from "../pages/Student/CoursePage";
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

// Wrapper component for EditCourses to handle props
const EditCoursesWrapper = () => {
  return <ManageCoursesPage />;
};

const UserSettingsWrapper = () => {
  const [isOpen, setIsOpen] = useState(true);

  return <UserSettingsPage isOpen={isOpen} onClose={() => setIsOpen(false)} />;
};

// Public routes (no authentication required)
const publicRoutes = [
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "courses", element: <CoursesPage /> },
      { path: "about", element: <AboutUs /> },
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
          { path: "user-settings", element: <UserSettingsWrapper /> },

          {
            element: <RoleBasedRoute role="student" />, // Role check
            children: [
              { path: "student-dashboard", element: <StudentDashboard /> },
              { path: "/course/:courseId", element: <CoursePage /> },
            ],
          },
          {
            element: <RoleBasedRoute role="teacher" />, // Role check
            children: [
              { path: "teacher-dashboard", element: <TeacherDashboard /> },
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

const adminRoutes = [
  {
    path: "admin",
    element: <AdminLayout />,
    children: [
      {
        path: "login",
        element: <AdminLogin />,
      },
      {
        element: <PrivateRoute />, // Protect admin pages
        children: [{ path: "dashboard", element: <AdminDashboard /> }],
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
      ...adminRoutes,
      { path: "*", element: <NotFound /> }, // 404 route
    ],
  },
]);

export default router;
