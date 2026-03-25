import { ITable } from '@/lib/interfaces';
import { cn, getStatusColor } from '@/lib/utils';
import React, { useState } from 'react'
import { ForwardIcon, TrashIcon } from '../Icons';

interface IData {
    data: {
        id: string;
        email: string;
        role: string;
        orgRole: string;
        status: string;
        createdAt: string;
        expiresAt: string;
    }[]
}

interface InvitesTableProps extends ITable {
  onResend?: (email: string) => void;
  onDelete?: (id: string) => void;
  isResending?: (email: string) => boolean;
  isDeleting?: (id: string) => boolean;
}

const statusColor = [
    {
        status: "accepted",
        color: "success"
    },
    {
        status: "rejected",
        color: "danger"
    },
    {
        status: "pending",
        color: "warning"
    },
    {
        status: "ended",
        color: "neutral"
    }
]
const Invitations = ({ data }: IData) => {
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
    
        // handleResend(email: string){
        //     onResend?.(email);
        // },
    
        // handleDelete(id: string){
        //     onDelete?.(id);
        // },
    
        getActionItems(data: any){
            return [
            {
                icon: ForwardIcon,
                // state: isResending?.(data.email),
                // trigger: () => handlers.handleResend(data.email),
                color: "#212121",
                actionText: "Resend",
                loadingText: "Resending..."
            },
            {
                icon: TrashIcon,
                // state: isDeleting?.(data.id),
                // trigger: () => handlers.handleDelete(data.id),
                color: "#D00416",
                actionText: "Cancel & Delete",
                loadingText: "Deleting..."
            }
            ]
        }

        // handleSelected(item: any) {
        //     setIsOpen(!isOpen);
        //     setSelectedRow(() => (isOpen ? null : item));
        // },

        // getActionItems(){
        //     return [
        //         {
        //             icon: EyeOpenIcon,
        //             // state: isResending?.(data.email),
        //             // trigger: () => handlers.handleResend(data.email),
        //             color: "#212121",
        //             actionText: "View Details",
        //             loadingText: "loading..."
        //         },
        //         {
        //             icon: TrashIcon,
        //             // state: isDeleting?.(data.id),
        //             // trigger: () => handlers.handleDelete(data.id),
        //             color: "#D00416",
        //             actionText: "Delete Org.",
        //             loadingText: "Loading..."
        //         }
        //     ]
        // }
    }

    return (
        <div className='mt-5 block md:hidden'>
            <div className='flex flex-col gap-5'>
                {
                    data.map((item: any, index: React.Key) => (
                    <div key={index} className='w-full flex flex-col gap-3 border-0.5 border-[#F7F7F7] shadow-[0_4px_12px_0_#21212112] p-4 rounded-md'>
                        <div className='w-full flex justify-between text-sm'>
                        <p className='text-[#212121]'>Date Added</p>
                        <p className='text-[#5E6775]'>{item.createdAt}</p>
                        </div>
                        <div className='w-full flex justify-between text-sm'>
                        <p className='text-[#212121]'>Role</p>
                        <p className='text-[#5E6775]'>{item.role}</p>
                        </div>
                        <div className='w-full flex justify-between text-sm'>
                        <p className='text-[#212121]'>Org. Role</p>
                        <p className='text-[#5E6775]'>{item.orgRole}</p>
                        </div>
                        <div className='w-full flex justify-between text-sm'>
                        <p className='text-[#212121]'>Email</p>
                        <p className='text-[#5E6775]'>{item.email}</p>
                        </div>
                        <div className='w-full flex justify-between items-center text-sm'>
                        <p className='text-[#212121]'>Status</p>
                        <span 
                        // className={cn('w-max p-2 rounded-2xl text-xs font-medium',
                        //     data.status === "success" && "bg-[#F0FDF4] text-[#0E5831]",
                        //     data.status === "info" && "bg-[#EEF2FF] text-[#2A239F]",
                        //     data.status === "warning" && "bg-[#FBF3E9] text-[#C17B1F]",
                        //     data.status === "danger" && "bg-[#FDF0F0] text-[#CB1616]"
                        // )}
                        className={"w-max p-2 rounded-2xl text-xs font-medium"}
                        style={{
                            backgroundColor: getStatusColor(handlers.handleStatus(item.status))?.bgColor,
                            color: getStatusColor(handlers.handleStatus(item.status))?.textColor
                        }}
                        >
                            {item.status}
                        </span>
                        </div>
                        <div className='w-full flex justify-between text-sm'>
                        <p className='text-[#212121]'>Date Expired</p>
                        <p className='text-[#5E6775]'>{item.expiresAt}</p>
                        </div>
                    </div>
                    ))
                }
            </div>
        </div>
    )
}

export default Invitations