"use client";

import React, { useState } from 'react'
import { ITable } from '@/lib/interfaces'
import { ElipsisVerticalIcon } from '../Icons'
import ActionCard from '../ActionCard';

interface IConversionsTable extends ITable {
    onViewDetails?: (data: any) => void
}

const Conversions = ({ tableHeaders, tableData, className, onViewDetails }: IConversionsTable) => {
    const [selectedRow, setSelectedRow] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    const handlers = {
        handleSelected(item: any) {
            setIsOpen(!isOpen);
            setSelectedRow(() => (isOpen ? null : item));
        },

        getActionItems(data: any) {
            return [
                {
                    actionText: "View details",
                    loadingText: "loading...",
                    link: false,
                    trigger: () => {
                        if (onViewDetails) {
                            onViewDetails(data)
                        }
                        handlers.handleSelected(data)
                    }
                }
            ]
        }
    }

    return (
        <div className='overflow-x-auto w-full max-w-full'>
            <table className='table-fixed md:table-auto w-full max-w-full border-collapse bg-white'>
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
                        className="border-b border-[#E4E4E4] text-[#5E6775] text-sm hover:bg-gray-50/50 last:border-b-0"
                        >
                            <td className='py-4 px-4'>{data.companyName}</td>
                            <td className='py-4 px-4'>{data.agent}</td>
                            <td className='py-4 px-4'>{data.date}</td>
                            <td className='py-4 px-4'>
                                <div className='flex items-center gap-1'>
                                    <span className='text-[#FFD700]'>★</span>
                                    <span className='text-sm text-[#212121]'>{data.rating} stars</span>
                                </div>
                            </td>
                            <td className='relative py-4 px-4'>
                                <ElipsisVerticalIcon
                                className="cursor-pointer text-[#5E6775]"
                                click={() => handlers.handleSelected(data)}
                                />
                                {selectedRow &&
                                isOpen &&
                                tableData.indexOf(selectedRow) === index && (
                                    <ActionCard 
                                    actionItems={handlers.getActionItems(data)}
                                    onClose={() => handlers.handleSelected(data)}
                                    data={data}
                                    />
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default Conversions

