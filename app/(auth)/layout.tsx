import React, { Suspense } from 'react'
import { AuthLoading } from '@/components/ui/LoadingSpinner'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<AuthLoading />}>
      {children}
    </Suspense>
  )
}