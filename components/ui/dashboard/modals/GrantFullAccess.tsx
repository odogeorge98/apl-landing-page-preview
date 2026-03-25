"use client"

import React from 'react'
import { Modal } from '../../Modal'
import { AlertIcon } from '../../Icons'

interface IGrantFullAccessModal {
    open: boolean
    setTrigger: (open: boolean) => void
    onConfirm: () => void
}

const GrantFullAccess = ({ open, setTrigger, onConfirm }: IGrantFullAccessModal) => {
    const handlers = {
        onClose() {
            setTrigger(false)
        },
        onConfirm() {
            onConfirm()
            setTrigger(false)
        }
    }

    return (
        <Modal
            size="md"
            open={open}
            onOpenChange={() => handlers.onClose()}
            title="Grant Full Access?"
            headerTitleCss="text-center text-[16px] font-semibold text-[#212121]"
            headerCss="text-center mt-0"
        >
            <div className='w-full flex flex-col gap-6 mt-6 items-center'>
                {/* Warning Icon */}
                <div className='size-[60px] bg-[#FBF3E9] rounded-full flex justify-center items-center'>
                    <AlertIcon className='text-[#C17B1F]' />
                </div>

                {/* Description */}
                <p className='text-sm text-[#5E6775] text-center'>
                    This will give this user complete access to all features and settings. Are you sure you want to continue?
                </p>

                {/* Buttons */}
                <div className='w-full flex flex-col md:flex-row gap-2'>
                    <button 
                        className='w-full px-6 py-3 border border-[#D5D9DE] text-[#5E6775] rounded-[8px] cursor-pointer hover:bg-[#F7F7F7] transition-colors text-sm font-medium bg-white'
                        onClick={() => handlers.onClose()}
                    >
                        Cancel
                    </button>
                    <button 
                        className='w-full px-6 py-3 bg-[#5F3DF4] text-white rounded-[8px] cursor-pointer hover:bg-[#4d2fd4] transition-colors text-sm font-medium'
                        onClick={() => handlers.onConfirm()}
                    >
                        Grant Full Access
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default GrantFullAccess

