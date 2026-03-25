"use client"

import React, { useState } from 'react'
import { Modal } from '../../Modal'

interface ICreatePermissionModal {
    open: boolean
    setTrigger: (open: boolean) => void
}

const CreatePermission = ({ open, setTrigger }: ICreatePermissionModal) => {
    const [permissionName, setPermissionName] = useState("")
    
    const handlers = {
        onClose() {
            setTrigger(false)
            setPermissionName("")
        },
        onCreate() {
            // Handle create permission logic here
            console.log("Creating permission:", permissionName)
            handlers.onClose()
        }
    }

    return (
        <Modal
            size="md"
            open={open}
            onOpenChange={() => handlers.onClose()}
            title="Create a permission"
            headerTitleCss="text-left text-[16px] font-semibold"
            headerCss="text-left mt-0"
        >
            <div className='w-full flex flex-col gap-6 mt-6'>
                <div className='flex flex-col gap-2'>
                    <label className='text-sm font-medium text-[#212121]'>Permission Name</label>
                    <input
                        type="text"
                        placeholder="Enter the name of this permission"
                        value={permissionName}
                        onChange={(e) => setPermissionName(e.target.value)}
                        className='w-full px-4 py-2 border border-[#D5D9DE] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#5F3DF4] focus:border-transparent text-sm text-[#212121] placeholder:text-[#9CA3AF]'
                    />
                </div>
                
                <div className='w-full flex flex-col md:flex-row gap-2 mt-2'>
                    <button 
                        className='w-full px-6 py-3 border border-[#D5D9DE] text-[#5E6775] rounded-[8px] cursor-pointer hover:bg-[#F7F7F7] transition-colors text-sm font-medium bg-white'
                        onClick={() => handlers.onClose()}
                    >
                        Cancel
                    </button>
                    <button 
                        className='w-full px-6 py-3 bg-[#5F3DF4] text-white rounded-[8px] cursor-pointer hover:bg-[#4d2fd4] transition-colors text-sm font-medium'
                        onClick={() => handlers.onCreate()}
                    >
                        Create Permission
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default CreatePermission

