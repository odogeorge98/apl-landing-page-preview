"use client";

import React, { useState } from 'react'
import { ITable } from '@/lib/interfaces'
import { getStatusColor } from '@/lib/utils'
import { ElipsisVerticalIcon, EyeOpenIcon, TrashIcon } from '../Icons'
import ActionCard from '../ActionCard';


const statusColor = [
    {
        status: "active",
        color: "success"
    },
    {
        status: "deleted",
        color: "danger"
    },
    {
        status: "suspended",
        color: "warning"
    },
    {
        status: "ended",
        color: "neutral"
    }
]


const Organizations = ({ tableHeaders, tableData, className }: ITable) => {
    const [selectedRow, setSelectedRow] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    const handlers = {
        handleStatus(status: string){
            return statusColor.find(item => item.status === status.toLowerCase())?.color as string
        },

        handleSelected(item: any) {
            setIsOpen(!isOpen);
            setSelectedRow(() => (isOpen ? null : item));
        },

        getActionItems(data: any){
            return [
                {
                    icon: EyeOpenIcon,
                    // state: isResending?.(data.email),
                    // trigger: () => handlers.handleResend(data.email),
                    color: "#212121",
                    actionText: "View Details",
                    loadingText: "loading...",
                    link: true,
                    href: `/dashboard/organizations/${data.id}`
                },
                {
                    icon: TrashIcon,
                    // state: isDeleting?.(data.id),
                    // trigger: () => handlers.handleDelete(data.id),
                    color: "#D00416",
                    actionText: "Delete Org.",
                    loadingText: "Loading..."
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
                            <td className='py-4'>{data.name}</td>
                            <td className='py-4'>{data.industry}</td>
                            <td className='py-4'>{data.tier}</td>
                            <td className={'py-4'}>
                                <span 
                                className={'w-max p-2 rounded-2xl text-xs font-medium'}
                                style={{
                                    backgroundColor: getStatusColor(handlers.handleStatus(data.status))?.bgColor,
                                    color: getStatusColor(handlers.handleStatus(data.status))?.textColor
                                }}
                                >{data.status}</span>
                            </td>
                            <td className='w-auto md:w-[300px] py-4'>
                                {data.onboardingDate}
                            </td>
                            <td>
                                {data.lastActive}
                            </td>
                            <td>
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

export default Organizations