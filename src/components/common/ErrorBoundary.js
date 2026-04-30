import React from 'react';
import { AlertCircle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full border border-red-500">
            <div className="flex items-center mb-4 text-red-500">
              <AlertCircle className="w-6 h-6 mr-3" />
              <h2 className="text-xl font-bold">發生錯誤</h2>
            </div>
            
            <p className="text-gray-300 mb-4">
              {this.state.error ? this.state.error.toString() : '發生未知錯誤'}
            </p>

            {this.state.errorInfo && (
              <details className="mb-4 bg-gray-900 rounded p-3">
                <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-200">
                  錯誤詳情
                </summary>
                <pre className="text-xs text-gray-500 mt-2 overflow-auto max-h-40">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              重新載入頁面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
