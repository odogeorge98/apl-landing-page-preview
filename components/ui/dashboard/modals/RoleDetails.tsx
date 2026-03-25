"use client"

import React, { useState } from 'react'
import { Modal } from '../../Modal'
import { SearchIcon } from '../../Icons'
import { cn } from '@/lib/utils'

interface IRoleDetailsModal {
    open: boolean
    setTrigger: (open: boolean) => void
    role?: {
        name: string
        usersAssigned: number
        permissionsIncluded: number
        createdBy: string
        dateCreated: string
        permissions?: Array<{
            name: string
            status: 'Active' | 'Inactive'
        }>
    }
    onEditRole?: () => void
}

const RoleDetails = ({ open, setTrigger, role, onEditRole }: IRoleDetailsModal) => {
    const [searchQuery, setSearchQuery] = useState("")

    if (!role) return null

    const handlers = {
        onClose() {
            setTrigger(false)
            setSearchQuery("")
        }
    }

    const filteredPermissions = (role.permissions || []).filter(permission =>
        permission.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <Modal
            size="4xl"
            open={open}
            onOpenChange={() => handlers.onClose()}
            title="Role Details"
            headerTitleCss="text-left text-[16px] font-semibold text-[#212121]"
            headerCss="text-left mt-0"
            className="max-h-[90vh] flex flex-col"
        >
            <div className='w-full flex flex-col gap-6 mt-6 overflow-y-auto max-h-[calc(90vh-120px)] pr-2'>
                {/* Subtitle */}
                <p className='text-sm text-[#5E6775]'>
                    Here's a full breakdown of this role and its assigned permissions
                </p>

                {/* Role Header with Gradient */}
                <div className='w-full relative rounded-[8px] overflow-hidden min-h-[180px]'>
                    <div className='bg-gradient-to-b from-[#5F3DF4] via-[#6B47F5] to-[#8B6FF5] p-6 min-h-[180px] flex flex-col justify-between'>
                        <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-4'>
                            <div className='flex flex-col gap-4 flex-1'>
                                <h2 className='text-2xl font-bold text-white'>{role.name}</h2>
                                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                                    <div className='flex flex-col gap-1'>
                                        <span className='text-xs text-white/80 uppercase tracking-wide'>USERS ASSIGNED</span>
                                        <span className='text-lg font-semibold text-white'>{role.usersAssigned}</span>
                                    </div>
                                    <div className='flex flex-col gap-1'>
                                        <span className='text-xs text-white/80 uppercase tracking-wide'>PERMISSIONS INCLUDED</span>
                                        <span className='text-lg font-semibold text-white'>{role.permissionsIncluded}</span>
                                    </div>
                                    <div className='flex flex-col gap-1'>
                                        <span className='text-xs text-white/80 uppercase tracking-wide'>CREATED BY</span>
                                        <span className='text-lg font-semibold text-white'>{role.createdBy}</span>
                                    </div>
                                    <div className='flex flex-col gap-1'>
                                        <span className='text-xs text-white/80 uppercase tracking-wide'>DATE CREATED</span>
                                        <span className='text-lg font-semibold text-white'>{role.dateCreated}</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                    if (onEditRole) {
                                        onEditRole()
                                    }
                                }}
                                className='px-6 py-3 bg-white text-[#5F3DF4] rounded-[8px] font-medium text-sm hover:bg-gray-50 transition-colors whitespace-nowrap self-start md:self-auto'
                            >
                                Edit Role
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search and Edit Role Button */}
                <div className='flex flex-col md:flex-row gap-4 items-start md:items-center'>
                    <div className='flex-1 relative w-full'>
                        <SearchIcon
                            className='absolute left-3 top-1/2 -translate-y-1/2 text-[#5E6775] w-5 h-5 pointer-events-none'
                        />
                        <input
                            type="text"
                            placeholder="Search by permission name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='w-full px-4 py-3 pl-10 pr-4 border border-[#D5D9DE] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#5F3DF4] focus:border-transparent text-sm text-[#212121] placeholder:text-[#9CA3AF]'
                        />
                    </div>
                    <button 
                        onClick={() => {
                            if (onEditRole) {
                                onEditRole()
                            }
                        }}
                        className='px-6 py-3 bg-[#5F3DF4] text-white rounded-[8px] font-medium text-sm hover:bg-[#4d2fd4] transition-colors whitespace-nowrap w-full md:w-auto'
                    >
                        Edit Role
                    </button>
                </div>

                {/* Permissions Table */}
                <div className='w-full'>
                    <table className='w-full'>
                        <thead>
                            <tr>
                                <th className='text-left text-sm font-semibold text-[#212121] py-3 px-4'>Permission Name</th>
                                <th className='text-left text-sm font-semibold text-[#212121] py-3 px-4'>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPermissions.map((permission, index) => (
                                <tr key={index} className='border-b border-[#E4E4E4]'>
                                    <td className='py-3 px-4 text-sm text-[#212121]'>{permission.name}</td>
                                    <td className='py-3 px-4'>
                                        <span className={cn(
                                            'w-max py-1 px-2 rounded-full text-xs font-medium',
                                            permission.status === 'Active' 
                                                ? 'bg-[#F0FDF4] text-[#0E5831]' 
                                                : 'bg-[#F7F7F7] text-[#5E6775]'
                                        )}>
                                            {permission.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Modal>
    )
}

export default RoleDetails

