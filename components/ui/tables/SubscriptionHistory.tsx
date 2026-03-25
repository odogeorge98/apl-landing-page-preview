"use client";

import React from 'react'
import { ITable } from '@/lib/interfaces'

const SubscriptionHistory = ({ tableHeaders, tableData }: ITable) => {
    return (
        <div className='overflow-x-auto'>
            <table className='w-full border-collapse'>
                <thead>
                    <tr className='border-b border-[#E4E4E4]'>
                        {tableHeaders.map(header => (
                            <th
                                key={header.key}
                                className="sticky top-0 bg-white z-10 text-start text-sm py-4 px-4 font-semibold text-[#212121]"
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
                        className="text-[#5E6775] text-sm border-b border-[#E4E4E4] last:border-b-0 hover:bg-gray-50/50"
                        >
                            <td className='py-4 px-4'>{data.dateTime}</td>
                            <td className='py-4 px-4'>{data.activityType}</td>
                            <td className='py-4 px-4'>{data.description}</td>
                            <td className='py-4 px-4'>{data.amount}</td>
                            <td className='py-4 px-4'>{data.performedBy}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default SubscriptionHistory

