import React from 'react'
import { Modal } from '../../Modal'
import { IModal } from '@/lib/interfaces/organisation'
import { AlertIcon, CircleCheck } from '../../Icons'

const Confirmation = ({ open, setTrigger }: IModal) => {

    const handlers = {
        onClose(){
            // Close modal
            setTrigger(false);
        }
    }
  return (
    <Modal
    size="md"
    open={open}
    onOpenChange={() => handlers.onClose()}
    title='Alert'
    headerTitleCss='hidden'
    >
        <div className='w-full flex flex-col gap-6 justify-center items-center'>
            <div className='size-[60px] bg-[#F0FDF4] rounded-full flex justify-center items-center'>
                <CircleCheck className='text-[#169F56]' size={24} />
            </div>
            <div className='flex flex-col gap-3 text-center'>
                <p className='text-base font-medium'>Organization Deleted</p>
                <p className='text-sm text-[#5E6775] text-center'>
                    Acme Corp has been permanently removed from the system. All related data and agents have been deleted.
                </p>
            </div>
            <div className='w-full'>
                <button 
                className='w-full text-white bg-[#5F3DF4] rounded-[8px] py-3 cursor-pointer hover:shadow-2xl'
                onClick={() => handlers.onClose()}
                >
                    Back to list
                </button>
            </div>
        </div>
    </Modal>
  )
}

export default Confirmation