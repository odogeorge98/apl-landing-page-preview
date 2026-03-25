import { ITable } from '@/lib/interfaces'
import React from 'react'

const Activities = ({ tableHeaders, tableData }: ITable) => {
  return (
    <div className='overflow-x-auto bg-white'>
        <table className='w-full border-collapse bg-white'>
            <thead>
                <tr className='border-b border-zinc-300'>
                    {tableHeaders.map(header => (
                        <th
                            key={header.key}
                            className="sticky top-0 bg-white z-10 text-start text-sm py-4"
                        >
                            {header.label}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {tableData.map((data, index) => (
                    <tr 
                    key={index}
                    className="border-b border-zinc-300 text-[#5E6775] text-sm hover:bg-gray-100/60 cursor-pointer"
                    >
                        <td className='py-4'>{data.actor}</td>
                        <td className='py-4'>{data.action}</td>
                        <td className='py-4'>{data.description}</td>
                        <td>{data.date}</td>
                    </tr>
                ))}
            </tbody>

        </table>
    </div>
  )
}

export default Activities