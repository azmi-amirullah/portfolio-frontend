'use client';

import { Component, ReactNode } from 'react';
import { MdErrorOutline, MdRefresh } from 'react-icons/md';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className='min-h-[60vh] flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-200 p-8'>
          <div className='p-4 bg-red-50 rounded-full mb-4'>
            <MdErrorOutline size={48} className='text-red-600' />
          </div>
          <h2 className='text-xl font-bold text-gray-900 mb-2'>
            Something went wrong
          </h2>
          <p className='text-gray-500 mb-6 text-center max-w-md'>
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={this.handleRetry}
            className='flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors'
          >
            <MdRefresh size={20} />
            Try Again
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre className='mt-6 p-4 bg-gray-100 rounded-lg text-xs text-red-600 max-w-full overflow-auto'>
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
