import { cn } from '@/lib/utils'
import React from 'react'

const Headers = ({
  leadingText,
  subText,
  leadingTextClass,
  subTextClass,
  authDark,
}: {
  leadingText: string
  subText: string
  leadingTextClass?: string
  subTextClass?: string
  /** PEPP Cruise auth screens (dark landing) */
  authDark?: boolean
}) => {
  return (
    <>
        <h1 className={cn(
          'text-[28px] text-center',
          authDark ? 'font-semibold text-white' : 'font-medium',
          leadingTextClass,
        )}>{leadingText}</h1>
        <p className={cn(
          'text-[16px] text-center',
          authDark ? 'text-white/55' : 'text-[#555555]',
          subTextClass,
        )}>{subText}</p>
    </>
  )
}

export default Headers