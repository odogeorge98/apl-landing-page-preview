"use client"

import React, { useState, useEffect } from 'react'
import { Modal } from '../../Modal'

interface IEditPermissionModal {
    open: boolean
    setTrigger: (open: boolean) => void
    permission?: {
        id: string
        name: string
        status: string
        lastUpdated: string
    }
    onSave?: (permission: { id: string, name: string }) => void
}

const EditPermission = ({ open, setTrigger, permission, onSave }: IEditPermissionModal) => {
    const [permissionName, setPermissionName] = useState("")

    useEffect(() => {
        if (permission) {
            setPermissionName(permission.name)
        }
    }, [permission])

    const handlers = {
        onClose() {
            setTrigger(false)
            setPermissionName("")
        },
        onSave() {
            if (permission && onSave) {
                onSave({
                    id: permission.id,
                    name: permissionName
                })
            }
            handlers.onClose()
        }
    }

    return (
        <Modal
            size="md"
            open={open}
            onOpenChange={() => handlers.onClose()}
            title="Edit permission"
            headerTitleCss="text-left text-[16px] font-semibold text-[#212121]"
            headerCss="text-left mt-0"
        >
            <div className='w-full flex flex-col gap-6 mt-6'>
                {/* Permission Name Input */}
                <div className='flex flex-col gap-2'>
                    <label className='text-sm font-semibold text-[#212121]'>Permission Name</label>
                    <input
                        type="text"
                        value={permissionName}
                        onChange={(e) => setPermissionName(e.target.value)}
                        className='w-full px-4 py-3 border border-[#D5D9DE] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#5F3DF4] focus:border-transparent text-sm text-[#212121]'
                        placeholder="Enter permission name"
                    />
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
                        onClick={() => handlers.onSave()}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default EditPermission

