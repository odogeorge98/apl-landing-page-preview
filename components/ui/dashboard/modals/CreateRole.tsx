"use client"

import React, { useState } from 'react'
import { Modal } from '../../Modal'
import { SearchIcon } from '../../Icons'
import { cn } from '@/lib/utils'
import GrantFullAccess from './GrantFullAccess'
import { useCreateRole } from '@/lib/hooks/admin/use-create-role'
import { showValidationError } from '@/lib/utils/error-handler'
import * as yup from 'yup'

interface ICreateRoleModal {
    open: boolean
    setTrigger: (open: boolean) => void
}

const permissions = [
    "Dashboard Access",
    "Manage Agents",
    "View/Edit Conversations",
    "Manage Lead Data",
    "Manage Billing",
    "Dashboard Access"
]

const CreateRole = ({ open, setTrigger }: ICreateRoleModal) => {
    const [roleName, setRoleName] = useState("")
    const [roleDescription, setRoleDescription] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set())
    const [showGrantFullAccessModal, setShowGrantFullAccessModal] = useState(false)
    const [errors, setErrors] = useState<{
        name?: string;
        description?: string;
    }>({})
    
    const { mutate: createRole, isPending: isCreating } = useCreateRole({
        onSuccess: () => {
            handlers.onClose()
        },
    })
    
    const filteredPermissions = permissions.filter(permission =>
        permission.toLowerCase().includes(searchQuery.toLowerCase())
    )
    
    const handlers = {
        onClose() {
            setTrigger(false)
            setRoleName("")
            setRoleDescription("")
            setSearchQuery("")
            setSelectedPermissions(new Set())
            setErrors({})
        },
        async onAddRole() {
            setErrors({})
            
            // Validation
            const schema = yup.object({
                name: yup
                    .string()
                    .min(2, "Role name must be at least 2 characters")
                    .required("Role name is required"),
                description: yup.string().optional(),
            })

            try {
                await schema.validate({ name: roleName, description: roleDescription }, { abortEarly: false })
                
                // Convert selected permissions to object format
                const permissionsObject: Record<string, boolean> = {}
                permissions.forEach(permission => {
                    permissionsObject[permission] = selectedPermissions.has(permission)
                })
                
                // Create role
                createRole({
                    name: roleName,
                    description: roleDescription || undefined,
                    permissions: permissionsObject,
                })
            } catch (validationError) {
                if (validationError instanceof yup.ValidationError) {
                    const validationErrors: {
                        name?: string;
                        description?: string;
                    } = {}
                    validationError.inner.forEach((err) => {
                        if (err.path) {
                            validationErrors[err.path as keyof typeof validationErrors] = err.message
                        }
                    })
                    setErrors(validationErrors)
                    showValidationError(validationErrors)
                }
            }
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
        <Modal
            size="lg"
            open={open}
            onOpenChange={() => handlers.onClose()}
            title="Add a role"
            headerTitleCss="text-left text-[16px] font-semibold text-[#212121]"
            headerCss="text-left mt-0"
        >
            <form onSubmit={(e) => { e.preventDefault(); handlers.onAddRole(); }} className='w-full flex flex-col gap-6 mt-6'>
                {/* Role Name Input */}
                <div className='flex flex-col gap-2'>
                    <label className='text-sm font-medium text-[#212121]'>
                        Role Name <span className='text-red-500'>*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Enter role name"
                        value={roleName}
                        onChange={(e) => {
                            setRoleName(e.target.value)
                            setErrors({ ...errors, name: undefined })
                        }}
                        className={cn(
                            'w-full px-4 py-2 border rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#5F3DF4] focus:border-transparent text-sm text-[#212121] placeholder:text-[#9CA3AF]',
                            errors.name ? 'border-red-500' : 'border-[#D5D9DE]'
                        )}
                    />
                    {errors.name && (
                        <p className='text-sm text-red-500'>{errors.name}</p>
                    )}
                </div>

                {/* Role Description Input */}
                <div className='flex flex-col gap-2'>
                    <label className='text-sm font-medium text-[#212121]'>
                        Description <span className='text-[#9CA3AF] text-xs'>(Optional)</span>
                    </label>
                    <textarea
                        placeholder="Enter role description"
                        value={roleDescription}
                        onChange={(e) => {
                            setRoleDescription(e.target.value)
                            setErrors({ ...errors, description: undefined })
                        }}
                        rows={3}
                        className={cn(
                            'w-full px-4 py-2 border rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#5F3DF4] focus:border-transparent text-sm text-[#212121] placeholder:text-[#9CA3AF] resize-none',
                            errors.description ? 'border-red-500' : 'border-[#D5D9DE]'
                        )}
                    />
                    {errors.description && (
                        <p className='text-sm text-red-500'>{errors.description}</p>
                    )}
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
                                className='w-full px-4 py-2 pl-10 pr-4 border border-[#D5D9DE] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#5F3DF4] focus:border-transparent text-sm text-[#212121] placeholder:text-[#9CA3AF]'
                            />
                        </div>
                        <button
                            onClick={handlers.onGrantFullAccessClick}
                            className='px-4 py-2 border border-[#5F3DF4] text-[#5F3DF4] text-sm font-medium rounded-[8px] hover:bg-[#F7F7F7] transition-colors whitespace-nowrap'
                        >
                            Grant full access
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
                        type="button"
                        className='w-full px-6 py-3 border border-[#D5D9DE] text-[#5E6775] rounded-[8px] cursor-pointer hover:bg-[#F7F7F7] transition-colors text-sm font-medium bg-white disabled:opacity-50 disabled:cursor-not-allowed'
                        onClick={() => handlers.onClose()}
                        disabled={isCreating}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        className='w-full px-6 py-3 bg-[#5F3DF4] text-white rounded-[8px] cursor-pointer hover:bg-[#4d2fd4] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                        disabled={!roleName || isCreating}
                    >
                        {isCreating ? "Creating..." : "Add role"}
                    </button>
                </div>
            </form>

            {/* Grant Full Access Confirmation Modal */}
            <GrantFullAccess
                open={showGrantFullAccessModal}
                setTrigger={setShowGrantFullAccessModal}
                onConfirm={handlers.onGrantFullAccessConfirm}
            />
        </Modal>
    )
}

export default CreateRole


