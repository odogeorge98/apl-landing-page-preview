'use client'

import React from 'react'
import { ErrorBoundary } from "react-error-boundary"
import { ErrorFallback } from "@/components/ui/ErrorFallback"

interface ErrorBoundaryWrapperProps {
  children: React.ReactNode
}

export function ErrorBoundaryWrapper({ children }: ErrorBoundaryWrapperProps) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error("Global error caught:", error, errorInfo);
        // TO DO: Add error monitoring service here (e.g., Sentry)
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundaryWrapper