import React from 'react'
import { ArrowUpIcon } from './Icons'
import Link from 'next/link'

const CTA = ({ btnText, path }: { btnText: string, path?: string }) => {
  return (
    <Link href={path || '#'} className='w-full md:w-max bg-[#5E3DF4] text-white py-2 px-3 rounded-md inline-flex justify-center gap-1 cursor-pointer'>
        <span className='text-base'>{btnText}</span>
        <span className='mt-1'><ArrowUpIcon /></span>
    </Link>
  )
}

export default CTA