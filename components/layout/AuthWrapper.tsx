'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

/**
 * PEPP Cruise admin auth shell: form on the left, laptop hero on the right (desktop).
 * Assets: /assets/peppcruise_logo.png, peppcruise_logo_faded.png, login-page-landing.png
 */
const AuthPagesWrapper = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  const year = new Date().getFullYear()

  return (
    <section
      className={cn(
        'login-page-landing w-full min-h-[100dvh] flex flex-col lg:flex-row font-sans text-white ',
        className,
      )}
    >
      {/* Left: branding + form + (mobile hero) + footer */}
      <div
        className={cn(
          'relative flex w-full flex-col lg:w-[44%] lg:max-w-[540px] lg:shrink-0',
          'min-h-0 lg:min-h-[100dvh]',
          '[background:radial-gradient(ellipse_90%_60%_at_0%_0%,rgba(255,255,255,0.045)_0%,transparent_55%),#0e0b16]',
        )}
      >
        <div className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10 lg:px-12 lg:py-12 xl:pl-16 xl:pr-10">
          <Link
            href="/"
            className="peppcruise_logo mb-8 block w-max lg:mb-10"
            aria-label="PEPP Cruise Admin Home"
          >
            <Image
              src="/assets/peppcruise_logo.png"
              alt="PEPP Cruise"
              width={150}
              height={50}
              priority
              className="h-8 w-auto sm:h-11"
            />
          </Link>
          <div className="w-full max-w-md">{children}</div>
        </div>

        {/* Mobile / tablet: hero between form and footer */}
        <div className="relative mx-0 min-h-[220px] w-full shrink-0 lg:hidden">
          <Image
            src="/assets/login-page-landing.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        <footer className="mt-auto px-6 pb-8 pt-6 sm:px-10 lg:px-12 xl:px-16 lg:pt-8">
          <Link href="/" className="peppcruise_logo_faded inline-block" aria-label="PEPP Cruise">
            <Image
              src="/assets/peppcruise_logo_faded.png"
              alt=""
              width={180}
              height={40}
              className="h-8 w-auto opacity-80"
            />
          </Link>
          <p className="mt-3 text-left text-xs text-white/40">
            © {year} All rights reserved
          </p>
        </footer>
      </div>

      {/* Desktop right: laptop mockup */}
      <div className="relative hidden min-h-[100dvh] w-full flex-1 overflow-hidden lg:block">
        <Image
          src="/assets/login-page-landing.png"
          alt=""
          fill
          priority
          sizes="60vw"
          className="object-cover object-center"
        />
      </div>
    </section>
  )
}

export default AuthPagesWrapper
