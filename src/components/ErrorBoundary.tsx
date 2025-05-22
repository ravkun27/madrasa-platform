import { Component, ErrorInfo, ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("🔥 ErrorBoundary caught an error:", error);
    console.error("📝 Error info:", errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  renderFallback() {
    return (
      this.props.fallback || (
        <div style={styles.fallbackContainer}>
          <h2>😬 Oops! Something went wrong.</h2>
          {this.state.error && (
            <pre style={styles.errorText}>{this.state.error.message}</pre>
          )}
          <button style={styles.retryButton} onClick={this.handleRetry}>
            🔄 Retry
          </button>
        </div>
      )
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderFallback();
    }

    return this.props.children;
  }
}

const styles = {
  fallbackContainer: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    padding: "2rem",
    textAlign: "center" as const,
    backgroundColor: "#fdf2f2",
    color: "#b91c1c",
    fontFamily: "sans-serif",
  },
  retryButton: {
    marginTop: "1rem",
    padding: "0.5rem 1rem",
    backgroundColor: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
  },
  errorText: {
    marginTop: "0.5rem",
    background: "#fee2e2",
    padding: "0.5rem",
    borderRadius: "0.25rem",
    whiteSpace: "pre-wrap" as const,
    maxWidth: "80%",
  },
};

export default ErrorBoundary;
