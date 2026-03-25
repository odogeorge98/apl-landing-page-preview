"use client";

import React, { useState } from 'react'
import { ITable } from '@/lib/interfaces'
import { cn } from '@/lib/utils'
import { ElipsisVerticalIcon } from '../Icons'
import ActionCard from '../ActionCard';
import Modals from '../dashboard/modals';

const Admins = ({ tableHeaders, tableData, className }: ITable) => {
    const [selectedRow, setSelectedRow] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [showResendModal, setShowResendModal] = useState(false);
    const [showRevokeModal, setShowRevokeModal] = useState(false);
    const [showReactivationModal, setShowReactivationModal] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<any>(null);

    const handlers = {
        handleSelected(item: any) {
            setIsOpen(!isOpen);
            setSelectedRow(() => (isOpen ? null : item));
        },

        getStatusBadgeClass(status: string) {
            if (status === "Active") {
                return "bg-[#F0FDF4] text-[#0E5831]";
            } else if (status === "Pending Invite") {
                return "bg-[#FBF3E9] text-[#C17B1F]";
            } else if (status === "Inactive") {
                return "bg-[#F7F7F7] text-[#5E6775]";
            }
            return "bg-[#F7F7F7] text-[#5E6775]";
        },

        onResendInvite(data: any) {
            setSelectedAdmin(data);
            setShowResendModal(true);
            setIsOpen(false);
            setSelectedRow(null);
        },

        onRevokeInvite(data: any) {
            setSelectedAdmin(data);
            setShowRevokeModal(true);
            setIsOpen(false);
            setSelectedRow(null);
        },

        onReactivate(data: any) {
            setSelectedAdmin(data);
            setShowReactivationModal(true);
            setIsOpen(false);
            setSelectedRow(null);
        },

        handleResendConfirm() {
            // Handle resend invite logic here
            console.log("Resending invite to:", selectedAdmin?.email);
            setSelectedAdmin(null);
        },

        handleRevokeConfirm() {
            // Handle revoke invite logic here
            console.log("Revoking invite for:", selectedAdmin?.email);
            setSelectedAdmin(null);
        },

        handleReactivationConfirm() {
            // Handle reactivation logic here
            console.log("Reactivating user:", selectedAdmin?.email);
            setSelectedAdmin(null);
        },

        getActionItems(data: any) {
            const items: any[] = [];

            // Add View Activity Logs for all statuses
            items.push({
                actionText: "View Activity Logs",
                loadingText: "Loading...",
                link: true,
                href: `/business/roles/${data.id}/activity-logs`
            });

            if (data.status === "Pending Invite") {
                items.push(
                    {
                        actionText: "Resend Invite",
                        loadingText: "Resending...",
                        trigger: () => handlers.onResendInvite(data),
                        color: "#212121"
                    },
                    {
                        actionText: "Revoke Invite",
                        loadingText: "Revoking...",
                        trigger: () => handlers.onRevokeInvite(data),
                        color: "#212121"
                    }
                );
            } else if (data.status === "Inactive") {
                items.push({
                    actionText: "Reactivate user",
                    loadingText: "Reactivating...",
                    trigger: () => handlers.onReactivate(data),
                    color: "#212121"
                });
            } else if (data.status === "Active") {
                items.push({
                    actionText: "View Details",
                    loadingText: "Loading...",
                    link: true,
                    href: `/business/roles/${data.id}`
                });
            }

            return items;
        }
    }

    return (
        <>
            <div className='overflow-x-auto w-full max-w-full'>
                <table className='table-fixed md:table-auto w-full max-w-full border-collapse'>
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
                                <td className='py-4'>{data.email}</td>
                                <td className='py-4'>{data.role}</td>
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

            {/* Modals */}
            <Modals.ResendInvitation
                open={showResendModal}
                setTrigger={setShowResendModal}
                onConfirm={handlers.handleResendConfirm}
            />
            <Modals.RevokeInvitation
                open={showRevokeModal}
                setTrigger={setShowRevokeModal}
                onConfirm={handlers.handleRevokeConfirm}
            />
            <Modals.ConfirmReactivation
                open={showReactivationModal}
                setTrigger={setShowReactivationModal}
                onConfirm={handlers.handleReactivationConfirm}
            />
        </>
    )
}

export default Admins
