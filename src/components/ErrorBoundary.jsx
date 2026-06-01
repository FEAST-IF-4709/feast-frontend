import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-feast-bg flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center shadow-sm">
            <AlertTriangle className="w-16 h-16 text-feast-beetroot mx-auto mb-4" />
            <h1 className="font-jakarta text-2xl font-bold text-feast-dark mb-2">
              Terjadi Kesalahan
            </h1>
            <p className="font-vietnam text-feast-dark-secondary mb-6">
              Aplikasi mengalami error yang tidak terduga. Mohon refresh halaman.
            </p>
            <button
              onClick={this.handleReset}
              className="bg-feast-sunset hover:bg-feast-sunset-dark text-white rounded-full px-6 py-3 font-vietnam inline-flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Halaman
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
