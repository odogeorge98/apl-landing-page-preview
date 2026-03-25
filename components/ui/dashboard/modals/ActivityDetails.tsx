"use client"

import React from 'react'
import { Modal } from '../../Modal'

interface IActivityDetailsModal {
    open: boolean
    setTrigger: (open: boolean) => void
    activity?: {
        id: string
        dateTime: string
        activity: string
        description: string
        ipAddress: string
        performedOn: string
        category?: string
        performedBy?: string
        fullDescription?: string
    }
}

const ActivityDetails = ({ open, setTrigger, activity }: IActivityDetailsModal) => {
    if (!activity) return null

    const handlers = {
        onClose() {
            setTrigger(false)
        }
    }

    // Format date for display
    const formatDateTime = (dateTime: string) => {
        // Convert "2025-02-10 09:42" to "Feb 10, 2025 · 9:42 AM" format
        try {
            const [datePart, timePart] = dateTime.split(' ')
            const [year, month, day] = datePart.split('-').map(Number)
            const [hours, minutes] = timePart.split(':').map(Number)
            
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            const monthName = months[month - 1]
            const ampm = hours >= 12 ? 'PM' : 'AM'
            const displayHours = hours % 12 || 12
            const displayMinutes = minutes.toString().padStart(2, '0')
            
            return `${monthName} ${day}, ${year} · ${displayHours}:${displayMinutes} ${ampm}`
        } catch {
            return dateTime
        }
    }

    return (
        <Modal
            size="md"
            open={open}
            onOpenChange={() => handlers.onClose()}
            title="Activity details"
            headerTitleCss="text-left text-[16px] font-semibold text-[#212121]"
            headerCss="text-left mt-0"
        >
            <div className='w-full flex flex-col gap-6 mt-6'>
                {/* Event Title */}
                <h2 className='text-xl font-semibold text-[#212121]'>{activity.activity}</h2>

                {/* Key Information */}
                <div className='w-full grid grid-cols-1 md:grid-cols-3 gap-6'>
                    <div className='flex flex-col gap-2'>
                        <span className='text-sm text-[#5E6775]'>Category</span>
                        <span className='text-sm text-[#212121] font-medium'>{activity.category || 'N/A'}</span>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <span className='text-sm text-[#5E6775]'>Performed By</span>
                        <span className='text-sm text-[#212121] font-medium'>{activity.performedBy || 'N/A'}</span>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <span className='text-sm text-[#5E6775]'>Date & Time</span>
                        <span className='text-sm text-[#212121] font-medium'>{formatDateTime(activity.dateTime)}</span>
                    </div>
                </div>

                {/* Description Section */}
                <div className='w-full bg-[#F6F7F8] rounded-[8px] p-4'>
                    <div className='flex flex-col gap-2'>
                        <span className='text-sm text-[#5E6775]'>Description</span>
                        <p className='text-sm text-[#212121]'>
                            {activity.fullDescription || activity.description}
                        </p>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default ActivityDetails

