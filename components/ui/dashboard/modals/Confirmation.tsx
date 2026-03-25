"use client"

import React from 'react'
import { Modal } from '../../Modal'
import { IModal } from '@/lib/interfaces/organisation'
import { AlertIcon } from '../../Icons'

const Confirmation = ({ open, setTrigger, handlers, organizationName, isDeleting }: IModal) => {
    
    const r = {
        onClose(){
            // Close modal
            setTrigger(false);
        },
    }
  return (
    <Modal
    size="md"
    open={open}
    onOpenChange={() => r.onClose()}
    title='Confirmation'
    headerTitleCss='hidden'
    >
        <div className='w-full flex flex-col gap-6 justify-center items-center'>
            <div className='size-[60px] bg-[#FBF3E9] rounded-full flex justify-center items-center'>
                <AlertIcon className='text-[#C17B1F]' />
            </div>
            <div className='flex flex-col gap-3 text-center'>
                <p className='text-base font-medium'>Delete Organization?</p>
                <p className='text-sm text-[#5E6775] text-center'>
                    Are you sure you want to permanently delete <span className='font-bold text-[#212121]'>{organizationName || 'this organization'}?</span> This action cannot be undone and all associated data will be lost
                </p>
            </div>
            <div className='w-full flex flex-col md:flex-row gap-2'>
                <button 
                className='w-full py-3 border border-[#5E6775] text-[#5E6775] rounded-[8px] cursor-pointer hover:shadow-2xl text-sm disabled:opacity-50 disabled:cursor-not-allowed'
                onClick={() => r.onClose()}
                disabled={isDeleting}
                >
                    Cancel
                </button>
                <button 
                className='w-full py-3 bg-[#CB1616] text-white rounded-[8px] cursor-pointer hover:shadow-2xl text-sm disabled:opacity-50 disabled:cursor-not-allowed'
                onClick={() => handlers?.handleDeleteOrganization?.()}
                disabled={isDeleting}
                >
                    {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                </button>
            </div>
        </div>
    </Modal>
  )
}

export default Confirmation