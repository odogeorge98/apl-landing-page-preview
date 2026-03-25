import React from 'react'
import Image from 'next/image'
import Link from "next/link";
import { cn } from '@/lib/utils'

type LogoProps = {
  /** Auth (dark): PNG assets. onLight: same asset, inverted for white headers. */
  variant?: 'default' | 'faded' | 'onLight'
  className?: string
}

const Logo = ({ variant = 'default', className }: LogoProps) => {
  const faded = variant === 'faded'
  const onLight = variant === 'onLight'

  const src = faded
    ? '/assets/peppcruise_logo_faded.png'
    : '/assets/peppcruise_logo.png'

  return (
    <div
      className={cn(
        'flex justify-center items-center',
        faded ? 'peppcruise_logo_faded' : onLight ? '' : 'peppcruise_logo',
        className,
      )}
    >
      <Link
        href="/"
        className={cn(
          'flex items-center select-none',
          faded && 'opacity-80 hover:opacity-100 transition-opacity',
        )}
        aria-label="PEPP Cruise Admin Home"
      >
        <Image
          src={src}
          alt="PEPP Cruise"
          width={200}
          height={48}
          className={cn(
            'h-9 w-auto sm:h-10',
            onLight && 'brightness-0',
          )}
        />
      </Link>
    </div>
  )
}

export default Logo
