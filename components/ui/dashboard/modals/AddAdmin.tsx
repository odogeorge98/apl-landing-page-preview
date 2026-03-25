"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Modal } from '../../Modal'
import { SelectAltInput } from '@/components/ui'
import { useInviteAdmin } from '@/lib/hooks/admin/use-invite-admin'
import { useRoles } from '@/lib/hooks/admin/use-roles'
import { showValidationError } from '@/lib/utils/error-handler'
import * as yup from 'yup'

interface IAddAdminModal {
    open: boolean
    setTrigger: (open: boolean) => void
}

const AddAdmin = ({ open, setTrigger }: IAddAdminModal) => {
    const [email, setEmail] = useState("")
    const [selectedRoleId, setSelectedRoleId] = useState("")
    const [error, setError] = useState<string>("")
    const [roleError, setRoleError] = useState<string>("")

    const { data: rolesResponse, isLoading: rolesLoading } = useRoles()
    const { mutate: inviteAdmin, isPending: isInviting } = useInviteAdmin({
        onSuccess: () => {
            handlers.onClose()
        },
    })

    const roles = rolesResponse?.roles || []

    // Map roles to options for SelectAltInput (array of role names)
    const roleOptions = useMemo(() => {
        return roles.map(role => role.name)
    }, [roles])

    // Find selected role name from selectedRoleId
    const selectedRoleName = useMemo(() => {
        if (!selectedRoleId) return "Select a role"
        const role = roles.find(r => r.id === selectedRoleId)
        return role?.name || "Select a role"
    }, [selectedRoleId, roles])

    const handlers = {
        onClose() {
            setTrigger(false)
            setEmail("")
            setSelectedRoleId("")
            setError("")
            setRoleError("")
        },
        async onInvite(e?: React.FormEvent) {
            if (e) {
                e.preventDefault()
            }

            // Reset errors
            setError("")
            setRoleError("")

            // Validation
            const schema = yup.object({
                email: yup
                    .string()
                    .email("Please enter a valid email address")
                    .required("Email is required"),
                roleId: yup
                    .string()
                    .required("Role is required"),
            })

            try {
                await schema.validate({ email, roleId: selectedRoleId }, { abortEarly: false })
                
                // Invite admin
                inviteAdmin({
                    email,
                    roleId: selectedRoleId,
                })
            } catch (validationError) {
                if (validationError instanceof yup.ValidationError) {
                    validationError.inner.forEach((err) => {
                        if (err.path === 'email') {
                            setError(err.message)
                        } else if (err.path === 'roleId') {
                            setRoleError(err.message)
                        }
                    })
                    showValidationError({
                        email: validationError.inner.find(e => e.path === 'email')?.message || '',
                        roleId: validationError.inner.find(e => e.path === 'roleId')?.message || '',
                    })
                }
            }
        }
    }

    return (
        <Modal
            size="md"
            open={open}
            onOpenChange={() => handlers.onClose()}
            title="Add an Admin"
            headerTitleCss="text-left text-[16px] font-semibold text-[#212121]"
            headerCss="text-left mt-0"
        >
            <form onSubmit={handlers.onInvite} className='w-full flex flex-col gap-6 mt-6'>
                {/* Email Input */}
                <div className='flex flex-col gap-2'>
                    <label className='text-sm font-medium text-[#212121]'>
                        Email Address <span className='text-red-500'>*</span>
                    </label>
                    <input
                        type="email"
                        placeholder="Enter email address"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value)
                            setError("")
                        }}
                        className={`
                            w-full px-4 py-2 border rounded-[8px] 
                            focus:outline-none focus:ring-2 focus:ring-[#5F3DF4] focus:border-transparent 
                            text-sm text-[#212121] placeholder:text-[#9CA3AF] bg-white
                            ${error ? 'border-red-500' : 'border-[#D5D9DE]'}
                        `}
                    />
                    {error && (
                        <p className='text-sm text-red-500'>{error}</p>
                    )}
                </div>

                {/* Role Selection */}
                <div className='flex flex-col gap-2'>
                    <label className='text-sm font-medium text-[#212121]'>
                        Role <span className='text-red-500'>*</span>
                    </label>
                    <SelectAltInput
                        isEmpty={rolesLoading || roles.length === 0}
                        options={rolesLoading ? ["Loading roles..."] : roleOptions.length > 0 ? roleOptions : ["No roles available"]}
                        value={selectedRoleName}
                        onChange={(e) => {
                            const selectedName = e.target.value
                            // Find the role ID from the selected name
                            const selectedRole = roles.find(r => r.name === selectedName)
                            if (selectedRole) {
                                setSelectedRoleId(selectedRole.id)
                                setRoleError("")
                            }
                        }}
                        className={roleError ? 'border-red-500' : ''}
                    />
                    {roleError && (
                        <p className='text-sm text-red-500'>{roleError}</p>
                    )}
                    {roles.length === 0 && !rolesLoading && (
                        <p className='text-sm text-[#9CA3AF]'>
                            No roles available. Please create a role first.
                        </p>
                    )}
                </div>

                {/* Buttons */}
                <div className='w-full flex flex-col sm:flex-row gap-3 mt-2'>
                    <button
                        type="button"
                        onClick={() => handlers.onClose()}
                        disabled={isInviting}
                        className='w-full px-6 py-3 border border-[#D5D9DE] text-[#5E6775] rounded-[8px] text-sm font-medium hover:bg-[#F7F7F7] transition-colors bg-white disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!email || !selectedRoleId || isInviting || rolesLoading}
                        className='w-full px-6 py-3 bg-[#5F3DF4] text-white rounded-[8px] text-sm font-medium hover:bg-[#4d2fd4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        {isInviting ? "Inviting..." : "Send Invite"}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

export default AddAdmin

