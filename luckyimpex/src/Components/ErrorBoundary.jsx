import React from "react";
import "./ErrorBoundary.css";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an uncaught error:", error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = "/";
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary-container">
                    <div className="error-boundary-card">
                        <div className="error-boundary-icon">⚠️</div>
                        <h1 className="error-boundary-title">Something went wrong</h1>
                        <p className="error-boundary-message">
                            An unexpected error occurred while rendering this page. We apologize for the inconvenience.
                        </p>
                        {process.env.NODE_ENV === "development" && this.state.error && (
                            <pre className="error-boundary-stack">{this.state.error.toString()}</pre>
                        )}
                        <div className="error-boundary-actions">
                            <button className="error-boundary-btn btn-primary" onClick={this.handleReload}>
                                Reload Page
                            </button>
                            <button className="error-boundary-btn btn-secondary" onClick={this.handleGoHome}>
                                Go to Homepage
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
