'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

/** Shared Nugi Innovations shell for authentication pages. */
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
        'auth-page-shell w-full min-h-[100dvh] flex flex-col lg:flex-row font-sans text-white ',
        className,
      )}
    >
      {/* Left: branding + form + (mobile hero) + footer */}
      <div
        className={cn(
          'relative flex w-full flex-col lg:w-[44%] lg:max-w-[540px] lg:shrink-0',
          'min-h-0 lg:min-h-[100dvh]',
          '[background:radial-gradient(ellipse_90%_60%_at_0%_0%,rgba(245,197,66,0.10)_0%,transparent_55%),#101d49]',
        )}
      >
        <div className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10 lg:px-12 lg:py-12 xl:pl-16 xl:pr-10">
          <Link
            href="/"
            className="mb-8 flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white p-2.5 shadow-sm lg:mb-10"
            aria-label="Nugi Innovations home"
          >
            <Image
              src="/ni-logo.svg"
              alt="Nugi Innovations"
              width={150}
              height={65}
              priority
              className="h-full w-full object-contain"
            />
          </Link>
          <div className="w-full max-w-md">{children}</div>
        </div>

        {/* Mobile / tablet: hero between form and footer */}
        <div className="relative mx-0 min-h-[220px] w-full shrink-0 overflow-hidden bg-[#101d49] px-6 py-8 lg:hidden">
          <div aria-hidden="true" className="absolute -right-12 -top-14 size-48 rounded-full bg-[#f5c542]/10 blur-2xl" />
          <p className="relative text-xs font-semibold uppercase tracking-[0.18em] text-[#f5c542]">
            Learn. Build. Innovate.
          </p>
          <h2 className="relative mt-3 max-w-sm text-2xl font-bold leading-tight text-white">
            Build skills. <span className="text-[#f5c542]">Shape the future.</span>
          </h2>
          <p className="relative mt-2 max-w-md text-sm leading-6 text-white/70">
            Your learning and training hub for practical skills and career growth.
          </p>
        </div>

        <footer className="mt-auto px-6 pb-8 pt-6 sm:px-10 lg:px-12 xl:px-16 lg:pt-8">
          <Link href="/" className="flex size-12 items-center justify-center rounded-xl bg-white p-1.5 shadow-sm" aria-label="Nugi Innovations home">
            <Image
              src="/ni-logo.svg"
              alt="Nugi Innovations"
              width={114}
              height={65}
              className="h-full w-full object-contain"
            />
          </Link>
          <p className="mt-3 text-left text-xs text-white/40">
            © {year} All rights reserved
          </p>
        </footer>
      </div>

      {/* Desktop right: Nugi brand panel */}
      <div className="relative hidden min-h-[100dvh] w-full flex-1 overflow-hidden bg-[#101d49] lg:block">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_15%,rgba(245,197,66,0.14),transparent_35%),linear-gradient(145deg,#172a60_0%,#101d49_58%,#0b1538_100%)]" />
        <div aria-hidden="true" className="absolute -right-24 -top-24 size-[30rem] rounded-full border border-white/[0.08]" />
        <div aria-hidden="true" className="absolute -right-8 -top-8 size-[22rem] rounded-full border border-white/[0.08]" />
        <div className="relative flex min-h-[100dvh] flex-col justify-center px-10 py-16 xl:px-20">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full border border-[#f5c542]/30 bg-[#f5c542]/10 px-4 py-2 text-sm font-semibold text-[#ffdf78]">
              Your next chapter starts here
            </span>
            <h2 className="mt-8 text-5xl font-bold leading-[1.12] tracking-tight text-white xl:text-6xl">
              Build skills.
              <br />
              <span className="text-[#f5c542]">Shape the future.</span>
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/70">
              Welcome to your learning and training hub. Access programmes, learning resources, and practical technology skills in one place.
            </p>
            <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
                <p className="font-semibold text-white">Practical learning</p>
                <p className="mt-2 text-sm leading-6 text-white/60">Build confidence through hands-on training and real-world skills.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
                <p className="font-semibold text-white">Career development</p>
                <p className="mt-2 text-sm leading-6 text-white/60">Prepare for new opportunities in technology and beyond.</p>
              </div>
            </div>
          </div>
          <p className="mt-12 text-xs font-medium tracking-wide text-white/40">
            Nugi Innovations · Learn with purpose.
          </p>
        </div>
      </div>
    </section>
  )
}

export default AuthPagesWrapper
