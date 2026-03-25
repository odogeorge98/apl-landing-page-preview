"use client";

import React, { useState } from 'react'
import Logo from '../sections/Logo'
import { Container } from '../ui'
import CTA from '../ui/CTA'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils';
import Link from 'next/link';

const navItems = [
    //  {
    //     name: 'Home',
    //     path: '/'
    // },
    {
        name: 'About Us',
        path: '/about'
    },
    {
        name: 'Pricing',
        path: '#pricing'
    },
    {
        name: 'Testimonials',
        path: '#testimonials'
    }
]
const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <>
            <header className='sticky top-0 z-40 bg-transparent/50 backdrop-blur-lg py-5'>
                <Container>
                    <div className='flex items-center justify-between'>
                        <div>
                            <Logo />
                        </div>
                        <div className='hidden md:flex gap-4 items-center'>
                            <ul className='flex gap-10 items-center'>
                                {
                                    navItems.map(item => (
                                        <li key={item.name} className='text-testpink'>
                                            <Link href={item.path}>{item.name}</Link>
                                        </li>
                                    ))
                                }
                            </ul>
                        </div>
                        <div className='md:hidden size-10 relative cursor-pointer' onClick={() => setIsOpen(curr => !curr)}>
                            <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
                                <div className={cn('w-5 h-0.5 bg-gray-900 -translate-y-1 transition-all duration-500', isOpen && 'translate-y-0 rotate-45')}></div>
                            </div>
                            <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
                                <div className={cn('w-5 h-0.5 bg-gray-900 translate-y-1 transition-all duration-500', isOpen && 'translate-y-0 -rotate-45')}></div>
                            </div>
                            {/* <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
                                <div className={cn('w-5 h-0.5 bg-gray-900 translate-y-1 transition-all duration-500', isOpen && 'translate-y-0 -rotate-45')}></div>
                            </div> */}
                        </div>
                    </div>
                </Container>
            </header>
            <AnimatePresence>
                {
                    isOpen && (
                        <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: .5
                        }}
                        className="fixed size-full top-0 left-0 z-30 bg-white">
                            {/* Mobile nav */}
                            <div className="absolute inset-2 rounded-md bg-white mt-10 md:mt-28 z-0">
                                {/* <div className="absolute top-1/2 left-full -translate-x-1/2 -translate-y-1/2 -z-10">
                                    <Hexagon size={700} />
                                </div>
                                <div className="absolute top-1/2 left-full -translate-x-1/2 -translate-y-1/2 -z-10">
                                    <Hexagon size={1100} />
                                </div> */}
                                <div className="h-full flex gap-12 flex-col justify-center items-center">
                                    <nav className="flex flex-col items-center gap-10">
                                        {navItems.map(({ name, path }, navIndex) => (
                                            <motion.a 
                                            key={name} 
                                            href={path} 
                                            initial={{ opacity: 0, y: 24 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                duration: .5,
                                                ease: "linear",
                                                delay: .25 * navIndex
                                            }}
                                            onClick={() => setIsOpen(false)}
                                            >
                                                <span className="text-4xl md:text-5xl lg:6xl font-heading font-black text-zinc-500 hover:text-zinc-300 transition duration-300">{name}</span>
                                            </motion.a>
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        </motion.div>
                    )
                }
            </AnimatePresence>
        </>
    )
}

export default Navbar