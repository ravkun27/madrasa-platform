import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import LandingPage from "./components/LandingPage";
import "./App.css";
// import AuthPage from "./components/AuthPage"; // Create this component
import { useTheme } from "./context/ThemeContext";

function App() {
  const { theme } = useTheme();

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          {/* <Route path="/auth" element={<AuthPage />} /> */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
