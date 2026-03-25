"use client"

import React from 'react'
import { Container } from '@/components/ui'
import { ArrowLeftIcon } from '@/components/ui/Icons'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const Content = ({ meeting }: any) => {
    if (!meeting) {
        return (
            <div className='max-w-[1440px] mx-auto pt-36 pb-20'>
                <Container>
                    <div className='text-center py-20'>
                        <p className='text-[#5E6775]'>Meeting not found</p>
                    </div>
                </Container>
            </div>
        )
    }

    const getStatusBadgeClass = (status: string) => {
        if (status === "Scheduled") {
            return "bg-[#FBF3E9] text-[#C17B1F]";
        } else if (status === "Missed") {
            return "bg-[#F7F7F7] text-[#5E6775]";
        } else if (status === "Completed") {
            return "bg-[#F0FDF4] text-[#0E5831]";
        } else if (status === "Canceled") {
            return "bg-[#FDF0F0] text-[#CB1616]";
        }
        return "bg-[#F7F7F7] text-[#5E6775]";
    }

    const getMeetingTypeBadgeClass = (type: string) => {
        if (type === "Demo") {
            return "bg-[#EEF2FF] text-[#5F3DF4]";
        } else if (type === "Feedback") {
            return "bg-[#EEF2FF] text-[#3B82F6]";
        } else if (type === "Support") {
            return "bg-[#EEF2FF] text-[#06B6D4]";
        } else if (type === "Complaint") {
            return "bg-[#FDF0F0] text-[#CB1616]";
        } else if (type === "Onboarding") {
            return "bg-[#FBF3E9] text-[#C17B1F]";
        } else if (type === "Custom") {
            return "bg-[#FDF0F0] text-[#EC4899]";
        }
        return "bg-[#EEF2FF] text-[#5F3DF4]";
    }

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <svg
                key={i}
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill={i < rating ? "#FFD700" : "none"}
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#FFD700]"
            >
                <path
                    d="M10 1L12.5 7.5L19.5 8.5L14.5 13L16 20L10 16.5L4 20L5.5 13L0.5 8.5L7.5 7.5L10 1Z"
                    fill={i < rating ? "#FFD700" : "none"}
                    stroke="#FFD700"
                    strokeWidth="1.5"
                />
            </svg>
        ))
    }

    return (
        <div className='max-w-[1440px] mx-auto pt-36 pb-20'>
            <Container>
                <Link 
                    className='inline-flex gap-1 cursor-pointer mb-6'
                    href={'/dashboard/meetings'}
                >
                    <ArrowLeftIcon className='text-[#5E6775] w-6 h-6' />
                    <span className='text-[#5E6775]'>Back</span>
                </Link>

                <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                    <div className='lg:col-span-2'>
                        <div className='w-full p-6 border border-[#D5D9DE] rounded-2xl'>
                            <h2 className='text-base md:text-xl text-[#212121] font-bold mb-6'>Meeting Details</h2>
                            
                            <div className='flex flex-col gap-4'>
                                <div className='flex justify-between items-center'>
                                    <span className='text-sm text-[#5E6775]'>Meeting Type</span>
                                    <span className={cn('w-max py-1 px-3 rounded-lg text-sm font-medium', getMeetingTypeBadgeClass(meeting.meetingType || meeting.reason))}>
                                        {meeting.meetingType || meeting.reason}
                                    </span>
                                </div>
                                
                                <div className='flex justify-between items-center'>
                                    <span className='text-sm text-[#5E6775]'>Lead name</span>
                                    <span className='text-sm text-[#212121] font-medium'>{meeting.leadName}</span>
                                </div>
                                
                                <div className='flex justify-between items-center'>
                                    <span className='text-sm text-[#5E6775]'>Meeting ID</span>
                                    <span className='text-sm text-[#212121] font-medium'>{meeting.id}</span>
                                </div>
                                
                                <div className='flex justify-between items-center'>
                                    <span className='text-sm text-[#5E6775]'>Status</span>
                                    <span className={cn('w-max py-1 px-3 rounded-lg text-sm font-medium', getStatusBadgeClass(meeting.status))}>
                                        {meeting.status}
                                    </span>
                                </div>
                                
                                <div className='flex justify-between items-center'>
                                    <span className='text-sm text-[#5E6775]'>Date</span>
                                    <span className='text-sm text-[#212121] font-medium'>{meeting.date || meeting.dateTime}</span>
                                </div>
                                
                                <div className='flex justify-between items-center'>
                                    <span className='text-sm text-[#5E6775]'>Scheduled Time</span>
                                    <span className='text-sm text-[#212121] font-medium'>{meeting.scheduledTime || meeting.dateTime}</span>
                                </div>
                                
                                {meeting.actualDuration && (
                                    <div className='flex justify-between items-center'>
                                        <span className='text-sm text-[#5E6775]'>Actual Duration</span>
                                        <span className='text-sm text-[#212121] font-medium'>{meeting.actualDuration}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className='lg:col-span-1 flex flex-col gap-6'>
                        <div className='w-full p-6 border border-[#D5D9DE] rounded-2xl'>
                            <div className='flex items-center gap-2 mb-6'>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" fill="#0069FF"/>
                                    <path d="M10 8C10 7.44772 10.4477 7 11 7H13C13.5523 7 14 7.44772 14 8V16C14 16.5523 13.5523 17 13 17H11C10.4477 17 10 16.5523 10 16V8Z" fill="white"/>
                                    <path d="M16 6L18 4M18 4L20 6M18 4V2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M8 6L6 4M6 4L4 6M6 4V2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <h2 className='text-base md:text-xl text-[#212121] font-bold'>Synced with Calendly</h2>
                            </div>
                            
                            <div className='flex flex-col gap-4 mb-6'>
                                <div className='flex justify-between items-center'>
                                    <span className='text-sm text-[#5E6775]'>Calendly Event ID</span>
                                    <span className='text-sm text-[#212121] font-medium'>{meeting.calendlyEventId || "EVT_adf123vbg"}</span>
                                </div>
                                
                                <div className='flex justify-between items-center'>
                                    <span className='text-sm text-[#5E6775]'>Last Synced</span>
                                    <span className='text-sm text-[#212121] font-medium'>{meeting.lastSynced || "2 minutes ago"}</span>
                                </div>
                            </div>
                            
                            <button className='w-full py-3 px-4 bg-[#5F3DF4] text-white rounded-lg font-medium hover:bg-[#4d2fd1] transition-colors'>
                                Open in Calendly
                            </button>
                        </div>

                        <div className='w-full p-6 border border-[#D5D9DE] rounded-2xl'>
                            <h2 className='text-base md:text-xl text-[#212121] font-bold mb-6'>Meeting Feedback</h2>
                            
                            <div className='flex flex-col gap-6'>
                                <div>
                                    <span className='text-xs text-[#5E6775] uppercase tracking-wide'>Organization Rating</span>
                                    <div className='flex items-center gap-2 mt-2'>
                                        {renderStars(meeting.organizationRating || 5)}
                                        <span className='text-sm text-[#212121] font-medium ml-1'>{meeting.organizationRating || 5.0}</span>
                                    </div>
                                </div>
                                
                                {meeting.feedback && (
                                    <div>
                                        <div className='w-full p-4 bg-[#F7F7F7] rounded-lg'>
                                            <p className='text-sm text-[#212121]'>{meeting.feedback}</p>
                                        </div>
                                    </div>
                                )}
                                
                                <div>
                                    <span className='text-xs text-[#5E6775] uppercase tracking-wide mb-4 block'>Agent Performance</span>
                                    
                                    <div className='flex flex-col gap-4'>
                                        <div className='flex justify-between items-center'>
                                            <span className='text-sm text-[#5E6775]'>Meeting Outcome</span>
                                            <span className='text-sm text-[#212121] font-medium'>{meeting.meetingOutcome || "N/A"}</span>
                                        </div>
                                        
                                        <div className='flex justify-between items-center'>
                                            <span className='text-sm text-[#5E6775]'>Rate the Agent's Performance</span>
                                            <div className='flex items-center gap-1'>
                                                {renderStars(1).slice(0, 1)}
                                                <span className='text-sm text-[#212121] font-medium ml-1'>{meeting.agentPerformance || 5} stars</span>
                                            </div>
                                        </div>
                                        
                                        <div className='flex justify-between items-center'>
                                            <span className='text-sm text-[#5E6775]'>Was the lead qualified correctly</span>
                                            <span className='text-sm text-[#212121] font-medium'>{meeting.leadQualifiedCorrectly || "N/A"}</span>
                                        </div>
                                        
                                        <div className='flex justify-between items-center'>
                                            <span className='text-sm text-[#5E6775]'>Did the lead understand the value</span>
                                            <span className='text-sm text-[#212121] font-medium'>{meeting.leadUnderstoodValue || "N/A"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    )
}

export default Content

