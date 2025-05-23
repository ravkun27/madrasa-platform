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
  const [showIosInstallPrompt, setShowIosInstallPrompt] = useState(false);

  const isIos = () => {
    return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  };

  const isInStandaloneMode = () =>
    "standalone" in window.navigator && window.navigator.standalone;

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";

    const timer = setTimeout(() => setLoading(false), 2000);
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault(); // Stop the default prompt
      setDeferredPrompt(e); // Save the event
      setShowInstallPrompt(true); // Show your custom install UI
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
  useEffect(() => {
    const isIosDevice = isIos();
    const isStandalone = isInStandaloneMode();
    const alreadyInstalled = localStorage.getItem("iosAppInstalled");

    if (isIosDevice && !isStandalone && !alreadyInstalled) {
      setShowIosInstallPrompt(true);
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt(); // ✅ This is allowed, because it's inside a user click
      const choiceResult = await deferredPrompt.userChoice;
      console.log("User choice", choiceResult.outcome);
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }
  const handleDismissIosPrompt = () => {
    setShowIosInstallPrompt(false);
    localStorage.setItem("iosAppInstalled", "true");
  };

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
                  padding: "10px 20px",
                  background: "#000",
                  color: "#fff",
                  borderRadius: "8px",
                  zIndex: 1000,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  // Responsive placement
                  bottom: window.innerWidth > 768 ? "20px" : "auto",
                  top: window.innerWidth <= 768 ? "60px" : "auto",
                  right: "20px",
                }}
              >
                Install App
              </button>
            )}
            {showIosInstallPrompt && (
              <div
                style={{
                  position: "fixed",
                  bottom: window.innerWidth > 768 ? "20px" : "auto",
                  top: window.innerWidth <= 768 ? "20px" : "auto",
                  right: "20px",
                  transform: "translateX(-50%)",
                  padding: "12px 16px",
                  background: "#000",
                  color: "#fff",
                  borderRadius: "8px",
                  zIndex: 1000,
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span>
                  To install the app, tap <strong>Share</strong> then{" "}
                  <strong>Add to Home Screen</strong>
                </span>
                <button
                  onClick={handleDismissIosPrompt}
                  style={{
                    marginLeft: "8px",
                    background: "transparent",
                    color: "#fff",
                    border: "none",
                    fontSize: "16px",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </Suspense>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
