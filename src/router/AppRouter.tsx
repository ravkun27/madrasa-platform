import { createBrowserRouter } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import LandingPage from "../pages/LandingPage";
import AuthPage from "../pages/AuthPage";
import NotFoundPage from "../pages/PageNotFound";

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/auth",
        element: <AuthPage />,
      },
    ],
  },
  {
    element: <DashboardLayout />,
    children: [
      // Future authenticated routes
      // { path: '/dashboard', element: <DashboardPage /> }
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;
