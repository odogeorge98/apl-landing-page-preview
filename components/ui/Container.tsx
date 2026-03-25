import { cn } from '@/lib/utils'
import React from 'react'

const Container = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <div className={cn('w-full px-5 md:px-10 mx-auto', className)}>
        {children}
    </div>
  )
}

export default Container