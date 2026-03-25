import React from 'react'
import { FallbackProps } from 'react-error-boundary'
import { Button } from './Button'

export const ErrorFallback: React.FC<FallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  const handleGoHome = () => {
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto h-24 w-24 text-red-400 mb-4">
            <svg 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              className="w-full h-full"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600 mb-4">
            We encountered an unexpected error. Please try refreshing the page or go back to the homepage.
          </p>
          
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
              <summary className="cursor-pointer text-red-800 font-medium">
                Error Details (Development)
              </summary>
              <pre className="mt-2 text-xs text-red-700 overflow-auto max-h-40">
                {error.message}
                {error.stack && '\n\n' + error.stack}
              </pre>
            </details>
          )}
        </div>

        <div className="space-y-3">
          <Button
            onClick={resetErrorBoundary}
            className="w-full"
            size="lg"
          >
            Try Again
          </Button>
          <Button
            onClick={handleGoHome}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Go to Homepage
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ErrorFallback