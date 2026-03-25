"use client";

import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import React from 'react'

const NotFound = () => {
  return (
    <>
        <section className="relative min-h-screen lg:pt-5">
            {/* Background Layer */}
            <div className="absolute top-32 lg:top-0 inset-0 bg-[url('/assets/backgrounds/herobg.svg')] bg-cover bg-center bg-no-repeat -z-10" />

            <div className="relative z-10">
                <h1 className="font-black leading-20 lg:leading-normal text-[64px] lg:text-[96px] text-center tracking-wider lg:mt-10">404</h1>
                <p className="font-medium leading-9 lg:leading-none mt-2 lg:mt-0 text-[28px] lg:text-[56px] text-center max-w-2xs lg:max-w-none mx-auto">This PEPP Cruise page is not here</p>
                <p className="mt-2 lg:mt-5 text-zinc-500 max-w-xs lg:text-[20px] lg:max-w-[650px] text-center mx-auto">
                    Don't worry, it happens to the best of us. 
                    The page you're looking for isn't here, 
                    but you can always head back home.
                </p>
                <div className="flex justify-center items-center mt-8">
                    <Button variant="default" size="xl" className="cursor-pointer w-[90%] md:w-[max-content] h-[auto] py-[9px] rounded-lg">
                            Go Back Home
                    </Button>
                </div>
                <div className="flex justify-center items-center mt-10 lg:mt-20 mb-[70px]">
                    <picture>
                        {/* Desktop */}
                        <source
                        media="(min-width: 768px)" 
                        srcSet="/assets/404/robotDesktop.svg"
                        />
                            {/* Mobile (default fallback) */}
                        <img
                        src="/assets/404/robotMobile.svg"
                        alt="Robot Image"
                        />
                    </picture>
                </div>
            </div>
            <footer className="bg-zinc-900 py-6">
                <div className="w-[90%] lg:w-6xl mx-auto flex flex-col lg:flex-row justify-center lg:justify-between items-center lg:items-center gap-4 py-6 md:py-4">
                    <div className="text-[15px] text-zinc-300">
                        © {new Date().getFullYear()} PEPP Cruise. All Rights Reserved.
                    </div>
                    <div className="flex flex-col md:flex-row text-zinc-500 items-start md:items-center gap-6 md:gap-8 text-sm">
                        <Link href="#" className="hover:text-white transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="#" className="hover:text-white transition-colors">
                            Terms of Service
                        </Link>
                        <Link href="#" className="hover:text-white transition-colors">
                            Cookie Policy
                        </Link>
                    </div>
                </div>
            </footer>
        </section>
    </>
  )
}

export default NotFound;