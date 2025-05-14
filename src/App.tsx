import { useEffect, useState, Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import LoadingScreen from "./components/LoadingScreen";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import router from "./routes/Router";
import "./App.css";
import ErrorBoundary from "./components/ErrorBoundary";
import { Toaster } from "react-hot-toast";

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";

    const timer = setTimeout(() => setLoading(false), 2000);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      clearTimeout(timer);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <Suspense fallback={<LoadingScreen />}>
            <Toaster position="top-center" toastOptions={{ duration: 1500 }} />
            <RouterProvider router={router} />
            {showInstallPrompt && (
              <button
                onClick={handleInstallClick}
                style={{
                  position: "fixed",
                  bottom: "20px",
                  right: "20px",
                  padding: "10px 20px",
                  background: "#000",
                  color: "#fff",
                  borderRadius: "8px",
                  zIndex: 1000,
                }}
              >
                Install App
              </button>
            )}
          </Suspense>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
