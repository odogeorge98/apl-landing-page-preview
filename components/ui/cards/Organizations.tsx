"use client"

import React, { useState } from 'react'
import { ElipsisVerticalIcon, EyeOpenIcon, TrashIcon } from '../Icons'
import { getStatusColor } from '@/lib/utils'
import ActionCard from '../ActionCard';
import { organizationsData } from '@/lib/data';


interface IData {
    data: {
        name: string;
        industry: string;
        tier: string;
        status: string;
        onboardingDate: string;
        lastActive: string;
    }[]
}
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

const Organizations = ({ data }: IData) => {

    const [selectedRow, setSelectedRow] = useState<any>(null);
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
    <div className='w-full flex flex-col gap-6 mt-6 md:hidden'>
        {
            data.map((item, index) => (
                <div 
                className='w-full flex flex-col gap-5 border-0.5 border-[#F7F7F7] shadow-[0_4px_12px_0_#21212112] p-4 rounded-md'
                key={index}
                >
                    <div className='w-full flex justify-between text-base'>
                        <p className='text-[#212121] font-bold'>{item.name}</p>
                        <span>
                            <ElipsisVerticalIcon
                                className="cursor-pointer text-[#5E6775]"
                                click={() => handlers.handleSelected(item)}
                            />
                            {
                                selectedRow && isOpen && data.indexOf(selectedRow) === index && (
                                    <ActionCard
                                    actionItems={handlers.getActionItems(item)}
                                    onClose={() => handlers.handleSelected(item)}
                                    data={item}
                                    />
                                )
                            }
                        </span>
                    </div>
                    <div className='w-full flex justify-between text-sm'>
                        <p className='text-[#212121]'>Industry</p>
                        <p className='text-[#5E6775]'>{item.industry}</p>
                    </div>
                    <div className='w-full flex justify-between text-sm'>
                        <p className='text-[#212121]'>Sub Tier</p>
                        <p className='text-[#5E6775]'>{item.tier}</p>
                    </div>
                    <div className='w-full flex justify-between text-sm'>
                        <p className='text-[#212121]'>Account Status</p>
                        <div className='text-[#5E6775]'>
                            <span 
                            className='w-max p-2 rounded-full'
                            style={{
                                backgroundColor: getStatusColor(handlers.handleStatus(item.status))?.bgColor,
                                color: getStatusColor(handlers.handleStatus(item.status))?.textColor
                            }}
                            >
                                {item.status}
                            </span>
                        </div>
                    </div>
                    <div className='w-full flex justify-between text-sm'>
                        <p className='text-[#212121]'>Onboarded</p>
                        <p className='text-[#5E6775]'>{item.onboardingDate}</p>
                    </div>
                    <div className='w-full flex justify-between text-sm'>
                        <p className='text-[#212121]'>Last Actvie</p>
                        <p className='text-[#5E6775]'>{item.lastActive}</p>
                    </div>
                </div>
            ))
        }
    </div>
  )
}

export default Organizations