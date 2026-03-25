import React from 'react'
import { Container } from '../ui'
import Logo from '../sections/Logo'
import { FacebookIcon, InstagramIcon, LinkedInIcon, TwitterIcon } from '../ui/Icons'
import Link from 'next/link'

const navigations = [
    {
        section: "Quick Links",
        navLinks: [
            {
                name: "Home",
                path: "/"
            },
            {
                name: "About Us",
                path: "/"
            },
            {
                name: "Blog",
                path: "/"
            }
        ]
    },
    {
        section: "Products",
        navLinks: [
            {
                name: "Integrations",
                path: "/"
            },
            {
                name: "Pricings",
                path: "/"
            }
        ]
    },
    {
        section: "Support",
        navLinks: [
            {
                name: "Help",
                path: "/"
            },
            {
                name: "FAQ",
                path: "/"
            },
            {
                name: "Contact",
                path: "/"
            }
        ]
    },
    {
        section: "Legal",
        navLinks: [
            {
                name: "Privacy Policy",
                path: "/"
            },
            {
                name: "Terms & Conditions",
                path: "/"
            },
            {
                name: "License",
                path: "/"
            }
        ]
    }
]

const socialIcons = [
    {
        icon: <FacebookIcon size={20} />
    },
    {
        icon: <InstagramIcon size={20} />
    },
    {
        icon: <TwitterIcon size={18} />
    },
    {
        icon: <LinkedInIcon size={18} />
    }
]
const Footer = () => {
  return (
    <footer className='py-10 md:pt-28 md:pb-10'>
        <Container>
            <div className='w-full flex flex-col md:flex-row gap-10 border-b border-y-[#1E1E1E99] pb-12 border-t md:border-t-0'>
                <div className='w-full md:w-[40%] flex flex-col gap-4 mt-10 md:mt-0'>
                    <Logo variant="onLight" className="justify-start" />
                    <p className='text-[#1A1A1ACC] max-w-xs'>
                        PEPP Cruise admin: manage rides, drivers, payments, and platform operations.
                    </p>
                </div>

                <div className='grid grid-cols-2 gap-10 md:grid-cols-4 w-[100%] md:w-[70%]'>
                    {
                        navigations.map(item => (
                            <div key={item.section} className='flex flex-col'>
                                <h5 className='text-xl font-semibold'>{item.section}</h5>
                                <ul className='flex flex-col gap-4 mt-5'>
                                    {
                                        item.navLinks.map(({ name, path }) => (
                                            <li key={name} className='text-sm'>
                                                <Link href={path}>{name}</Link>
                                            </li>
                                        ))
                                    }
                                </ul>
                            </div>
                        ))
                    }
                </div>
            </div>
            <div className='w-full flex flex-col md:flex-row justify-between mt-5 md:mt-10'>
                <div>
                    <p>{new Date().getFullYear()} PEPP Cruise. All rights reserved</p>
                </div>
                <div className='mt-5 md:mt-0 flex gap-4'>
                    {
                        socialIcons.map((item, idx) => (
                            <div key={`icon-${idx}`} className='size-[30px] flex justify-center items-center rounded-full bg-[#5E3DF4]'>{item.icon}</div>
                        ))
                    }
                </div>
            </div>

        </Container>
    </footer>
  )
}

export default Footer