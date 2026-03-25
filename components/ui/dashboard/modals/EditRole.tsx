"use client"

import React, { useState, useEffect } from 'react'
import { Modal } from '../../Modal'
import { SearchIcon } from '../../Icons'
import { cn } from '@/lib/utils'
import GrantFullAccess from './GrantFullAccess'

interface IEditRoleModal {
    open: boolean
    setTrigger: (open: boolean) => void
    role?: {
        id: string
        name: string
        permissions?: string[]
    }
    onSave?: (role: { id: string, name: string, permissions: string[] }) => void
}

const permissions = [
    "Dashboard Access",
    "Manage Agents",
    "View/Edit Conversations",
    "Manage Lead Data",
    "Manage Billing",
    "Dashboard Access"
]

const EditRole = ({ open, setTrigger, role, onSave }: IEditRoleModal) => {
    const [roleName, setRoleName] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set())
    const [showGrantFullAccessModal, setShowGrantFullAccessModal] = useState(false)
    
    useEffect(() => {
        if (role) {
            setRoleName(role.name)
            if (role.permissions) {
                setSelectedPermissions(new Set(role.permissions))
            }
        }
    }, [role])
    
    const filteredPermissions = permissions.filter(permission =>
        permission.toLowerCase().includes(searchQuery.toLowerCase())
    )
    
    const handlers = {
        onClose() {
            setTrigger(false)
            setRoleName("")
            setSearchQuery("")
            setSelectedPermissions(new Set())
        },
        onUpdateRole() {
            if (role && onSave) {
                onSave({
                    id: role.id,
                    name: roleName,
                    permissions: Array.from(selectedPermissions)
                })
            }
            handlers.onClose()
        },
        togglePermission(permission: string) {
            const newSet = new Set(selectedPermissions)
            if (newSet.has(permission)) {
                newSet.delete(permission)
            } else {
                newSet.add(permission)
            }
            setSelectedPermissions(newSet)
        },
        onGrantFullAccessClick() {
            setShowGrantFullAccessModal(true)
        },
        onGrantFullAccessConfirm() {
            const allPermissions = new Set(permissions)
            setSelectedPermissions(allPermissions)
        }
    }

    return (
        <>
            <Modal
                size="lg"
                open={open}
                onOpenChange={() => handlers.onClose()}
                title="Edit role"
                headerTitleCss="text-left text-[16px] font-semibold text-[#212121]"
                headerCss="text-left mt-0"
            >
                <div className='w-full flex flex-col gap-6 mt-6'>
                    {/* Role Name Input */}
                    <div className='flex flex-col gap-2'>
                        <label className='text-sm font-medium text-[#212121]'>Role</label>
                        <input
                            type="text"
                            placeholder="Enter the name of this role"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            className='w-full px-4 py-3 border border-[#D5D9DE] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#5F3DF4] focus:border-transparent text-sm text-[#212121] placeholder:text-[#9CA3AF]'
                        />
                    </div>

                    {/* Permission Search and Grant Full Access */}
                    <div className='flex flex-col gap-4'>
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
                                onClick={handlers.onGrantFullAccessClick}
                                className='px-4 py-2 border border-[#5F3DF4] text-[#5F3DF4] text-sm font-medium rounded-[8px] hover:bg-[#F7F7F7] transition-colors whitespace-nowrap'
                            >
                                Grant Full Access
                            </button>
                        </div>

                        {/* Permissions List */}
                        <div className='w-full max-h-[300px] overflow-y-auto border border-[#E4E4E4] rounded-[8px] p-4'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                {filteredPermissions.map((permission, index) => {
                                    const isSelected = selectedPermissions.has(permission)
                                    return (
                                        <div key={index} className='flex items-center justify-between p-3 rounded-[8px] hover:bg-[#F7F7F7] transition-colors'>
                                            <span className='text-sm text-[#212121]'>{permission}</span>
                                            <button
                                                onClick={() => handlers.togglePermission(permission)}
                                                className={cn(
                                                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5F3DF4] focus:ring-offset-2',
                                                    isSelected ? 'bg-[#5F3DF4]' : 'bg-[#D5D9DE]'
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                                                        isSelected ? 'translate-x-6' : 'translate-x-1'
                                                    )}
                                                />
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                    
                    {/* Footer Buttons */}
                    <div className='w-full flex flex-col md:flex-row gap-2 mt-2'>
                        <button 
                            className='w-full px-6 py-3 border border-[#D5D9DE] text-[#5E6775] rounded-[8px] cursor-pointer hover:bg-[#F7F7F7] transition-colors text-sm font-medium bg-white'
                            onClick={() => handlers.onClose()}
                        >
                            Cancel
                        </button>
                        <button 
                            className='w-full px-6 py-3 bg-[#5F3DF4] text-white rounded-[8px] cursor-pointer hover:bg-[#4d2fd4] transition-colors text-sm font-medium'
                            onClick={() => handlers.onUpdateRole()}
                        >
                            Update Role
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Grant Full Access Confirmation Modal */}
            <GrantFullAccess
                open={showGrantFullAccessModal}
                setTrigger={setShowGrantFullAccessModal}
                onConfirm={handlers.onGrantFullAccessConfirm}
            />
        </>
    )
}

export default EditRole

