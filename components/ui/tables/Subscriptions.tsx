"use client";

import React, { useState } from 'react'
import { ITable } from '@/lib/interfaces'
import { cn } from '@/lib/utils'
import { ElipsisVerticalIcon } from '../Icons'
import ActionCard from '../ActionCard';

const Subscriptions = ({ tableHeaders, tableData, className }: ITable) => {
    const [selectedRow, setSelectedRow] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    const handlers = {
        handleSelected(item: any) {
            setIsOpen(!isOpen);
            setSelectedRow(() => (isOpen ? null : item));
        },

        getStatusBadgeClass(status: string) {
            if (status === "Active") {
                return "bg-[#F0FDF4] text-[#0E5831]";
            } else if (status === "Trial") {
                return "bg-[#F7F7F7] text-[#5E6775]";
            } else if (status === "Expired") {
                return "bg-[#FDF0F0] text-[#CB1616]";
            }
            return "bg-[#F7F7F7] text-[#5E6775]";
        },

        getActionItems(data: any) {
            return [
                {
                    actionText: "View history",
                    loadingText: "loading...",
                    link: true,
                    href: `/business/subscriptions/${data.organizationId}`
                }
            ]
        }
    }

    return (
        <div className='overflow-x-auto'>
            <table className='table-fixed md:table-auto w-full min-w-[1000px] border-collapse'>
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
                            <td className='py-4'>{data.organizationName}</td>
                            <td className='py-4'>{data.subscriptionType}</td>
                            <td className='py-4'>{data.nextBillingDate}</td>
                            <td className='py-4'>
                                <span className={cn('w-max py-1 px-2 rounded-full text-xs font-medium', handlers.getStatusBadgeClass(data.status))}>
                                    {data.status}
                                </span>
                            </td>
                            <td className='relative py-4'>
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

export default Subscriptions






