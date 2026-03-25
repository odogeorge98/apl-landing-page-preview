"use client"

import React from 'react'
import { Modal } from '../../Modal'

interface Organization {
    id: string
    name: string
    email: string
}

interface MeetingFeedback {
    companyName: string
    agent: string
    date: string
    rating: number
    feedback?: string
    whatWentWell?: string
    whatWentWrong?: string
    aiSummary?: string
}

interface OrganizationFeedback {
    id: string
    organizationName: string
    feedbackType: string
    subject: string
    message: string
    date: string
    organization: Organization
    createdAt: string
    updatedAt: string
}

interface IFeedbackDetailModal {
    open: boolean
    setTrigger: (open: boolean) => void
    feedback?: MeetingFeedback | OrganizationFeedback
}

const FeedbackDetail = ({ open, setTrigger, feedback }: IFeedbackDetailModal) => {
    if (!feedback) return null

    // Check if it's organization feedback
    const isOrganizationFeedback = 'feedbackType' in feedback && 'organization' in feedback

    const handlers = {
        onClose() {
            setTrigger(false)
        }
    }

    const getFeedbackTypeBadgeClass = (type: string) => {
        switch (type) {
            case 'FEATURE_REQUEST':
                return 'bg-[#E8F4FD] text-[#0066CC]'
            case 'BUG_REPORT':
                return 'bg-[#FEE] text-[#CC0000]'
            case 'GENERAL_FEEDBACK':
                return 'bg-[#F0FDF4] text-[#0E5831]'
            case 'OTHER':
                return 'bg-[#F7F7F7] text-[#5E6775]'
            default:
                return 'bg-[#F7F7F7] text-[#5E6775]'
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating)
        
        return Array.from({ length: 5 }, (_, i) => {
            if (i < fullStars) {
                // Full star (filled yellow)
                return (
                    <svg
                        key={i}
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M10 1L12.5 7.5L19.5 8.5L14.5 13L16 20L10 16.5L4 20L5.5 13L0.5 8.5L7.5 7.5L10 1Z"
                            fill="#FFD700"
                            stroke="#FFD700"
                            strokeWidth="1.5"
                        />
                    </svg>
                )
            } else {
                // Empty star (outlined grey)
                return (
                    <svg
                        key={i}
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M10 1L12.5 7.5L19.5 8.5L14.5 13L16 20L10 16.5L4 20L5.5 13L0.5 8.5L7.5 7.5L10 1Z"
                            fill="none"
                            stroke="#D3D3D3"
                            strokeWidth="1.5"
                        />
                    </svg>
                )
            }
        })
    }

    // Render organization feedback view
    if (isOrganizationFeedback) {
        const orgFeedback = feedback as OrganizationFeedback
        return (
            <Modal
                size="xl"
                open={open}
                onOpenChange={() => handlers.onClose()}
                title="Organization Feedback Details"
                headerTitleCss="text-left text-[16px] font-semibold text-[#212121]"
                headerCss="text-left mt-0"
            >
                <div className='w-full flex flex-col gap-6 mt-6'>
                    {/* Organization Name */}
                    <h2 className='text-xl md:text-2xl font-semibold text-[#212121]'>{orgFeedback.organization.name}</h2>

                    {/* Details Row - Horizontal */}
                    <div className='w-full flex flex-col md:flex-row gap-6 md:gap-8'>
                        <div className='flex flex-col gap-2'>
                            <span className='text-sm text-[#5E6775]'>Organization Email</span>
                            <span className='text-sm text-[#212121] font-medium'>{orgFeedback.organization.email}</span>
                        </div>
                        
                        <div className='flex flex-col gap-2'>
                            <span className='text-sm text-[#5E6775]'>Feedback Type</span>
                            <span className={`text-xs font-medium py-1 px-2 rounded-full w-max ${getFeedbackTypeBadgeClass(orgFeedback.feedbackType)}`}>
                                {orgFeedback.feedbackType.replace(/_/g, ' ')}
                            </span>
                        </div>
                        
                        <div className='flex flex-col gap-2'>
                            <span className='text-sm text-[#5E6775]'>Created Date</span>
                            <span className='text-sm text-[#212121] font-medium'>{formatDate(orgFeedback.createdAt)}</span>
                        </div>
                    </div>

                    {/* Subject Box */}
                    <div className='w-full bg-[#F6F7F8] rounded-[8px] p-4'>
                        <div className='flex flex-col gap-2'>
                            <span className='text-sm text-[#5E6775]'>Subject</span>
                            <p className='text-sm text-[#212121] font-medium'>
                                {orgFeedback.subject}
                            </p>
                        </div>
                    </div>

                    {/* Message Box */}
                    <div className='w-full bg-[#F6F7F8] rounded-[8px] p-4'>
                        <div className='flex flex-col gap-2'>
                            <span className='text-sm text-[#5E6775]'>Message</span>
                            <p className='text-sm text-[#212121]'>
                                {orgFeedback.message}
                            </p>
                        </div>
                    </div>

                    {/* Additional Details */}
                    <div className='w-full flex flex-col md:flex-row gap-6 md:gap-8 border-t border-[#E5E7EB] pt-4'>
                        <div className='flex flex-col gap-2'>
                            <span className='text-sm text-[#5E6775]'>Last Updated</span>
                            <span className='text-sm text-[#212121] font-medium'>{formatDate(orgFeedback.updatedAt)}</span>
                        </div>
                    </div>
                </div>
            </Modal>
        )
    }

    // Render meeting feedback view (existing)
    const meetingFeedback = feedback as MeetingFeedback
    return (
        <Modal
            size="xl"
            open={open}
            onOpenChange={() => handlers.onClose()}
            title="Feedback"
            headerTitleCss="text-left text-[16px] font-semibold text-[#212121]"
            headerCss="text-left mt-0"
        >
            <div className='w-full flex flex-col gap-6 mt-6'>
                {/* Company Name */}
                <h2 className='text-xl md:text-2xl font-semibold text-[#212121]'>{meetingFeedback.companyName}</h2>

                {/* Details Row - Horizontal */}
                <div className='w-full flex flex-col md:flex-row gap-6 md:gap-8'>
                    <div className='flex flex-col gap-2'>
                        <span className='text-sm text-[#5E6775]'>Agent</span>
                        <span className='text-sm text-[#212121] font-medium'>{meetingFeedback.agent}</span>
                    </div>
                    
                    <div className='flex flex-col gap-2'>
                        <span className='text-sm text-[#5E6775]'>Date & Time</span>
                        <span className='text-sm text-[#212121] font-medium'>{meetingFeedback.date}</span>
                    </div>
                    
                    <div className='flex flex-col gap-2'>
                        <span className='text-sm text-[#5E6775]'>Rating</span>
                        <div className='flex items-center gap-1'>
                            {renderStars(meetingFeedback.rating)}
                        </div>
                    </div>
                </div>

                {/* Feedback Box */}
                <div className='w-full bg-[#F6F7F8] rounded-[8px] p-4'>
                <div className='flex flex-col gap-2'>
                    <span className='text-sm text-[#5E6775]'>Feedback</span>
                        <p className='text-sm text-[#212121]'>
                            {meetingFeedback.feedback || "The agent was very professional and explained the product clearly. We only needed more clarification around integrations, but overall a smooth experience."}
                        </p>
                    </div>
                </div>

                {/* What Went Well Box */}
                <div className='w-full bg-[#F6F7F8] rounded-[8px] p-4'>
                    <div className='flex flex-col gap-2'>
                        <span className='text-sm text-[#5E6775]'>What Went Well</span>
                        <p className='text-sm text-[#212121]'>
                            {meetingFeedback.whatWentWell || "Clear communication and fast response time."}
                        </p>
                    </div>
                </div>

                {/* What Went Wrong Box */}
                <div className='w-full bg-[#F6F7F8] rounded-[8px] p-4'>
                    <div className='flex flex-col gap-2'>
                        <span className='text-sm text-[#5E6775]'>What Went Wrong</span>
                        <p className='text-sm text-[#212121]'>
                            {meetingFeedback.whatWentWrong || "Integration explanation was not detailed enough."}
                        </p>
                    </div>
                </div>

                {/* AI Summary Box */}
                <div className='w-full bg-[#F6F7F8] rounded-[8px] p-4'>
                    <div className='flex flex-col gap-2'>
                        <span className='text-sm text-[#5E6775]'>AI Summary</span>
                        <p className='text-sm text-[#212121]'>
                            {meetingFeedback.aiSummary || "The customer had a positive experience overall. Key improvement area is deeper explanation of integrations. The lead is still warm and open to next steps."}
                        </p>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default FeedbackDetail
