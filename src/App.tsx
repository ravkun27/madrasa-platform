import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import LoadingScreen from "./components/LoadingScreen";
import { ThemeProvider } from "./context/ThemeContext";
import router from "./router/AppRouter";
import { Suspense } from "react";

import "./App.css";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Enable smooth scrolling globally
    document.documentElement.style.scrollBehavior = "smooth";

    // Simulate loading delay (e.g., fetching data, initializing app)
    const timer = setTimeout(() => setLoading(false), 2000);

    // Cleanup function to clear the timeout if the component unmounts
    return () => clearTimeout(timer);
  }, []);

  // Render the loading screen while the app is loading
  if (loading) {
    return <LoadingScreen />;
  }

  // Render the main app content once loading is complete
  return (
    <ThemeProvider>
      <Suspense fallback={<LoadingScreen />}>
        <RouterProvider router={router} />
      </Suspense>
    </ThemeProvider>
  );
}

export default App;
