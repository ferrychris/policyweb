import React, { Component, type ReactNode, type ErrorInfo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { cn } from '../lib/utils';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  children: ReactNode;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    children: null
  };

  constructor(props: Props) {
    super(props);
    this.state.children = props.children;
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center">
          <div
            className={cn(
              "bg-white dark:bg-dark-card rounded-lg shadow-lg p-8 max-w-lg w-full mx-4",
              "text-center border-2 border-red-500 dark:border-red-400"
            )}
          >
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="text-red-500 dark:text-red-400 text-4xl mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-heading mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-dark-text mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className={cn(
                "bg-gradient-to-r from-indigo-600 to-purple-600 text-white",
                "py-3 px-8 rounded-lg font-medium hover:opacity-90 transition-colors"
              )}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.state.children;
  }
}

export { ErrorBoundary };
