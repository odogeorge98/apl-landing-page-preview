"use client";

import React, { useState } from 'react'
import { MainLayout } from '@/components/layout/dashboard'
import { Container } from '@/components/ui'
import { ArrowLeftIcon, ChevronDownIcon } from '@/components/ui/Icons'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const voicePhases = [
  {
    name: "Greeting Phase",
    icon: "👋",
    timeRange: "0:00 - 0:30",
    messageCount: 2,
    messages: [
      {
        sender: "AI Agent - Sarah",
        senderType: "agent",
        timestamp: "(0:03)",
        content: "Hi Sarah! Thanks for taking my call. I'm Sarah from SONA. I see you downloaded our enterprise guide. How can I help you today?"
      },
      {
        sender: "Sarah Mitchell",
        senderType: "user",
        timestamp: "(0:12)",
        content: "Hi Sarah! Yes, we're exploring solutions to automate our outbound sales process. We're a 50-person SaaS company."
      }
    ]
  },
  {
    name: "Discovery Phase",
    icon: "🔍",
    timeRange: "0:30 - 2:15",
    messageCount: 5,
    messages: []
  },
  {
    name: "Assessment & Guidance Phase",
    icon: "☑️",
    timeRange: "2:15 - 3:20",
    messageCount: 3,
    messages: []
  },
  {
    name: "Qualification Phase",
    icon: "✅",
    timeRange: "3:20 - 4:32",
    messageCount: 4,
    messages: [],
    qualified: true
  },
  {
    name: "Scheduling Phase",
    icon: "📅",
    timeRange: "4:32 - 5:30",
    messageCount: 3,
    messages: []
  }
]

const conversationPhases = [
  {
    name: "Greeting Phase",
    icon: "👋",
    messageCount: 3,
    messages: [
      {
        sender: "AI Agent - Sarah",
        senderType: "agent",
        timestamp: "Thu, Jan 18 • 2:00 PM",
        content: "Hi there! 👋\nI'm Sarah, your AI sales assistant. I can help you learn more about our product, answer questions, and even book a demo with our team.\nWould you like to continue in chat or voice?",
        icon: "📹"
      },
      {
        sender: "Sarah Mitchell",
        senderType: "user",
        timestamp: "Thu, Jan 18 • 2:00 PM",
        content: "Chat is fine"
      },
      {
        sender: "AI Agent - Sarah",
        senderType: "agent",
        timestamp: "Thu, Jan 18 • 2:00 PM",
        content: "Chat is alright then",
        icon: "📹"
      }
    ]
  },
  {
    name: "Discovery Phase",
    icon: "🔍",
    messageCount: 7,
    messages: [
      {
        sender: "AI Agent - Sarah",
        senderType: "agent",
        timestamp: "Thu, Jan 18 • 2:00 PM",
        content: "Before we continue, could you share your work email so I can keep you updated and send any follow-ups?",
        icon: "📹"
      },
      {
        sender: "Sarah Mitchell",
        senderType: "user",
        timestamp: "Thu, Jan 18 • 2:00 PM",
        content: "sarah@devworks.io"
      },
      {
        sender: "AI Agent - Sarah",
        senderType: "agent",
        timestamp: "Thu, Jan 18 • 2:00 PM",
        content: "Thanks, Jane! I've saved your email! To help me understand better, could you tell me a little about your Organization?",
        icon: "📹"
      },
      {
        sender: "Sarah Mitchell",
        senderType: "user",
        timestamp: "Thu, Jan 18 • 2:00 PM",
        content: "We're DevTech Solutions, about 50 people, SaaS industry."
      },
      {
        sender: "AI Agent - Sarah",
        senderType: "agent",
        timestamp: "Thu, Jan 18 • 2:00 PM",
        content: "Thanks for sharing! And what are you mainly interested in exploring today?",
        icon: "📹"
      },
      {
        sender: "Sarah Mitchell",
        senderType: "user",
        timestamp: "Thu, Jan 18 • 2:00 PM",
        content: "We're looking at AI for lead qualification"
      },
      {
        sender: "AI Agent - Sarah",
        senderType: "agent",
        timestamp: "Thu, Jan 18 • 2:00 PM",
        content: "Perfect, thanks!",
        icon: "📹"
      }
    ]
  },
  {
    name: "Assessment & Guidance Phase",
    icon: "☑️",
    messageCount: 3,
    messages: [
      {
        sender: "AI Agent - Sarah",
        senderType: "agent",
        timestamp: "Thu, Jan 18 • 2:00 PM",
        content: "Based on what you've shared, I think our solution would be a great fit for DevTech Solutions.",
        icon: "📹"
      },
      {
        sender: "Sarah Mitchell",
        senderType: "user",
        timestamp: "Thu, Jan 18 • 2:00 PM",
        content: "That sounds interesting. Can you tell me more?"
      },
      {
        sender: "AI Agent - Sarah",
        senderType: "agent",
        timestamp: "Thu, Jan 18 • 2:00 PM",
        content: "Absolutely! Our AI-powered lead qualification system can help you streamline your sales process.",
        icon: "📹"
      }
    ]
  },
  {
    name: "Qualification Phase",
    icon: "✅",
    messageCount: 4,
    messages: [
      {
        sender: "AI Agent - Sarah",
        senderType: "agent",
        timestamp: "Thu, Jan 18 • 2:00 PM",
        content: "To better understand your needs, what's your budget range?",
        icon: "📹"
      },
      {
        sender: "Sarah Mitchell",
        senderType: "user",
        timestamp: "Thu, Jan 18 • 2:00 PM",
        content: "We're looking at around ₦5,000-8,000 monthly"
      },
      {
        sender: "AI Agent - Sarah",
        senderType: "agent",
        timestamp: "Thu, Jan 18 • 2:00 PM",
        content: "Great! And what's your timeline for implementation?",
        icon: "📹"
      },
      {
        sender: "Sarah Mitchell",
        senderType: "user",
        timestamp: "Thu, Jan 18 • 2:00 PM",
        content: "We're hoping to get started in the next 2-3 weeks"
      }
    ]
  },
  {
    name: "Scheduling Phase",
    icon: "📅",
    messageCount: 5,
    messages: [
      {
        sender: "AI Agent - Sarah",
        senderType: "agent",
        timestamp: "Thu, Jan 18 • 2:00 PM",
        content: "Since you're a great fit, would you like to schedule a demo with our team?",
        icon: "📹"
      },
      {
        sender: "Sarah Mitchell",
        senderType: "user",
        timestamp: "Thu, Jan 18 • 2:00 PM",
        content: "Yes, i would love that"
      },
      {
        sender: "AI Agent - Sarah",
        senderType: "agent",
        timestamp: "Thu, Jan 18 • 2:00 PM",
        content: "Awesome!",
        content2: "Here are the available slots this week:",
        slots: [
          "Tuesday, Mar 18 - 11:00 AM",
          "Wednesday, Mar 19 - 3:00 PM",
          "Thursday, Mar 20 - 10:00 AM"
        ],
        content3: "Which time works best for you?",
        icon: "📹"
      },
      {
        sender: "Sarah Mitchell",
        senderType: "user",
        timestamp: "Thu, Jan 18 • 2:00 PM",
        content: "Tuesday, Mar 18 - 11:00 AM"
      },
      {
        sender: "AI Agent - Sarah",
        senderType: "agent",
        timestamp: "Thu, Jan 18 • 2:00 PM",
        content: "Looking forward to speaking with you",
        icon: "📹"
      }
    ],
    meetingDetails: {
      date: "Thursday, January 18, 2025",
      time: "2:00 PM - 2:30 PM EST"
    }
  }
]

const Page = () => {
  const params = useParams()
  const conversationId = params?.id as string
  const [activeTab, setActiveTab] = useState("text")
  const [note, setNote] = useState("")
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set())

  const togglePhase = (phaseName: string) => {
    const newSet = new Set(expandedPhases)
    if (newSet.has(phaseName)) {
      newSet.delete(phaseName)
    } else {
      newSet.add(phaseName)
    }
    setExpandedPhases(newSet)
  }

  return (
    <MainLayout>
      <div className='w-full bg-[#FAF9FF] min-h-screen pt-36 pb-20'>
        <div className='max-w-[1440px] mx-auto'>
          <Container>
            {/* Back Button */}
            <Link
              className='inline-flex gap-1 cursor-pointer items-center mb-6'
              href={'/dashboard/conversations'}
            >
              <ArrowLeftIcon className='text-[#5E6775] w-6 h-6' />
              <span className='text-[#5E6775]'>Back</span>
            </Link>

            {/* Lead Information Card with Gradient */}
            <div className='w-full bg-gradient-to-b from-[#EAE5FF] to-[#FFFFFF] rounded-[12px] p-4 md:p-6 mb-6'>
              <div className='flex gap-3 md:gap-4'>
                <div className='flex items-center'>
                  <svg width="40" height="40" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 md:w-[40px] md:h-[40px]">
                    <rect width="29" height="29" rx="7.25" fill="#B43DF4"/>
                    <path d="M19.1654 20.5V19.1667C19.1654 18.4594 18.8844 17.7811 18.3843 17.281C17.8842 16.781 17.2059 16.5 16.4987 16.5H12.4987C11.7915 16.5 11.1132 16.781 10.6131 17.281C10.113 17.7811 9.83203 18.4594 9.83203 19.1667V20.5M17.1654 11.1667C17.1654 12.6394 15.9715 13.8333 14.4987 13.8333C13.0259 13.8333 11.832 12.6394 11.832 11.1667C11.832 9.69391 13.0259 8.5 14.4987 8.5C15.9715 8.5 17.1654 9.69391 17.1654 11.1667Z" stroke="white" strokeWidth="1.35938" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className='flex flex-col gap-1.5 md:gap-2 flex-1'>
                  <h1 className='text-lg md:text-2xl font-bold text-[#212121]'>Sarah Mitchell</h1>
                  <div className='flex items-center gap-2'>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.66667 2.66667H13.3333C14.2538 2.66667 15 3.41286 15 4.33333V11.6667C15 12.5871 14.2538 13.3333 13.3333 13.3333H2.66667C1.74619 13.3333 1 12.5871 1 11.6667V4.33333C1 3.41286 1.74619 2.66667 2.66667 2.66667Z" stroke="#8B7355" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15 4.33333L8 9L1 4.33333" stroke="#8B7355" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className='text-xs md:text-sm text-[#5E6775]'>sarah.mitchell@techcorp.com</span>
                  </div>
                  <div className='flex flex-wrap gap-2 mt-1 md:mt-2'>
                    <span className='w-max py-1 px-2 md:px-3 rounded-full text-xs font-medium bg-[#F0FDF4] text-[#0E5831] flex items-center gap-1'>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 3L4.5 8.5L2 6" stroke="#0E5831" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Qualified
                    </span>
                    <span className='w-max py-1 px-2 md:px-3 rounded-full text-xs font-medium bg-[#F0FDF4] text-[#0E5831] flex items-center gap-1'>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 3L4.5 8.5L2 6" stroke="#0E5831" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Meeting scheduled
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Container>

          {/* Tabs */}
          <Container>
            <div className='w-full bg-white rounded-[8px] p-2 flex mb-6'>
                <div className='flex items-center gap-2 bg-gray-100 rounded-[8px]'>
                <button
                onClick={() => setActiveTab("text")}
                className={cn(
                  'px-4 py-2 text-sm rounded-[8px] transition-all',
                  activeTab === "text"
                    ? 'text-[#212121] bg-white font-semibold shadow-sm'
                    : 'text-[#5E6775] bg-[#F7F7F7] font-medium'
                )}
              >
                Text Transcript
              </button>
              <button
                onClick={() => setActiveTab("voice")}
                className={cn(
                  'px-4 py-2 text-sm rounded-[8px] transition-all',
                  activeTab === "voice"
                    ? 'text-[#212121] bg-white font-semibold shadow-sm'
                    : 'text-[#5E6775] bg-[#F7F7F7] font-medium'
                )}
              >
                Voice Transcript
              </button>
                </div>
            </div>
          </Container>

          <Container>

            <div className='w-full flex flex-col lg:flex-row gap-4 md:gap-6'>
              {/* Main Content */}
              <div className='w-full lg:w-[calc(100%-400px)] flex flex-col gap-4 md:gap-6'>

              {/* Conversation Phases */}
              <div className='w-full flex flex-col gap-4'>
                {(activeTab === "voice" ? voicePhases : conversationPhases).map((phase, index) => {
                  const isExpanded = expandedPhases.has(phase.name)
                  return (
                    <div key={index} className='w-full bg-white rounded-[8px] p-3 md:p-4'>
                      <button
                        onClick={() => togglePhase(phase.name)}
                        className='w-full flex items-center justify-between'
                      >
                        <div className='flex items-center gap-2 md:gap-3'>
                          <div className='w-8 h-8 md:w-10 md:h-10 bg-[#5F3DF4] rounded-[8px] flex items-center justify-center text-white text-sm md:text-lg flex-shrink-0'>
                            {phase.icon}
                          </div>
                          <div className='flex flex-col'>
                            <span className='text-xs md:text-sm font-medium text-[#212121]'>{phase.name}</span>
                            {activeTab === "voice" && 'timeRange' in phase && (
                              <span className='text-xs text-[#5E6775]'>{phase.timeRange}</span>
                            )}
                          </div>
                          {activeTab === "voice" && 'qualified' in phase && phase.qualified && (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#5F3DF4]">
                              <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <div className='flex items-center gap-2 md:gap-3'>
                          <span className='text-xs md:text-sm text-[#5E6775] hidden md:inline'>{phase.messageCount} messages</span>
                          <ChevronDownIcon
                            className={cn(
                              'w-4 h-4 md:w-5 md:h-5 text-[#5E6775] transition-transform flex-shrink-0',
                              isExpanded && 'rotate-180'
                            )}
                          />
                        </div>
                      </button>
                      
                      {isExpanded && phase.messages && (
                        <div className='mt-4 pt-4'>
                          {/* Audio Waveform - Only for Voice Transcript, on top of Greeting Phase when expanded */}
                          {activeTab === "voice" && phase.name === "Greeting Phase" && (
                            <div className='w-full mb-4 p-4 bg-white border-[1px] border-[#E4E4E4] rounded-[8px]'>
                              {/* Waveform visualization - Mirrored */}
                              <div className='w-full h-24 mb-4 flex items-center justify-center gap-0.5 relative'>
                                {Array.from({ length: 200 }).map((_, i) => {
                                  // Realistic waveform pattern with variation
                                  const baseHeights = [
                                    12, 28, 8, 45, 18, 35, 15, 52, 22, 40, 16, 48, 25, 38, 20, 55, 30, 42, 24, 50,
                                    14, 32, 10, 46, 19, 36, 13, 49, 21, 39, 17, 44, 26, 37, 23, 51, 29, 41, 27, 47,
                                    11, 33, 9, 43, 18, 34, 12, 48, 20, 40, 15, 45, 24, 38, 22, 52, 28, 42, 26, 50
                                  ]
                                  const height = baseHeights[i % baseHeights.length] + (Math.random() * 4 - 2)
                                  const isPlayed = i < 67 // First third (approximately)
                                  const isOrangeMarker = [15, 32, 48, 65, 82, 98, 115, 132, 148, 165, 182].includes(i)
                                  
                                  let backgroundColor
                                  let opacity = 1
                                  if (isOrangeMarker) {
                                    backgroundColor = '#C17B1F'
                                  } else if (isPlayed) {
                                    backgroundColor = '#5F3DF4'
                                    opacity = 1
                                  } else {
                                    backgroundColor = '#5F3DF4'
                                    opacity = 0.4
                                  }
                                  
                                  const barHeight = Math.max(4, Math.min(60, height))
                                  
                                  return (
                                    <div
                                      key={i}
                                      className='flex-1 relative'
                                      style={{
                                        minWidth: '1.5px',
                                        height: '100%'
                                      }}
                                    >
                                      {/* Top bar - extending upward from center */}
                                      <div
                                        className='absolute left-0 right-0 rounded-t'
                                        style={{
                                          height: `${barHeight}%`,
                                          backgroundColor: backgroundColor,
                                          opacity: opacity,
                                          bottom: '50%',
                                          transform: 'translateY(0)'
                                        }}
                                      />
                                      {/* Bottom bar - extending downward from center (mirrored) */}
                                      <div
                                        className='absolute left-0 right-0 rounded-b'
                                        style={{
                                          height: `${barHeight}%`,
                                          backgroundColor: backgroundColor,
                                          opacity: opacity,
                                          top: '50%',
                                          transform: 'translateY(0)'
                                        }}
                                      />
                                    </div>
                                  )
                                })}
                              </div>
                              
                              {/* Audio Player Controls */}
                              <div className='w-full flex items-center gap-3 mb-4'>
                                {/* Play Button - Purple square with more rounded corners (squircle-like) */}
                                <button className='w-12 h-12 bg-[#5F3DF4] rounded-[12px] flex items-center justify-center flex-shrink-0 hover:bg-[#4d2fd4] transition-colors shadow-[0_2px_4px_0_rgba(95,61,244,0.2)]'>
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6 4L12 8L6 12V4Z" fill="white"/>
                                  </svg>
                                </button>
                                
                                {/* Progress Bar */}
                                <div className='flex-1 relative h-2'>
                                  <div className='w-full h-full bg-[#E4E4E4] rounded-full overflow-hidden'>
                                    <div className='h-full bg-[#5F3DF4] rounded-full' style={{ width: '42%' }} />
                                  </div>
                                  <div className='absolute top-1/2 left-[42%] -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-[#5F3DF4] rounded-full border-2 border-white' />
                                </div>
                                
                                {/* Time Display */}
                                <span className='text-sm text-[#212121] font-medium whitespace-nowrap'>2:20 / 5:30</span>
                                
                                {/* Speed Selector - White rectangular button */}
                                <div className='relative'>
                                  <button className='px-3 py-1.5 bg-white border border-[#E4E4E4] rounded-[6px] flex items-center gap-2 text-sm text-[#212121] font-medium hover:bg-[#F7F7F7] transition-colors'>
                                    <span>1.0X</span>
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M3 4.5L6 7.5L9 4.5" stroke="#212121" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </button>
                                </div>
                                
                                {/* Volume Button - White rectangular button */}
                                <button className='w-10 h-10 bg-white border border-[#E4E4E4] rounded-[6px] flex items-center justify-center hover:bg-[#F7F7F7] transition-colors'>
                                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10.5 1.5L6 6H2.25C1.83579 6 1.5 6.33579 1.5 6.75V11.25C1.5 11.6642 1.83579 12 2.25 12H6L10.5 16.5V1.5Z" fill="#212121"/>
                                    <path d="M12.75 4.5C13.5784 4.5 14.25 5.17157 14.25 6C14.25 6.82843 13.5784 7.5 12.75 7.5" stroke="#212121" strokeWidth="1.5" strokeLinecap="round"/>
                                    <path d="M13.5 3C15.1569 3 16.5 4.34315 16.5 6C16.5 7.65685 15.1569 9 13.5 9" stroke="#212121" strokeWidth="1.5" strokeLinecap="round"/>
                                  </svg>
                                </button>
                              </div>
                              
                              {/* Call Details - Two separate lines */}
                              <div className='flex flex-col gap-2 text-sm text-[#5E6775]'>
                                <div className='flex items-center gap-2'>
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2Z" stroke="#5F3DF4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M8 5V8L10 9" stroke="#5F3DF4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  <span>Call Duration: 5m 30s</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2H4C3.44772 2 3 2.44772 3 3V13C3 13.5523 3.44772 14 4 14H12C12.5523 14 13 13.5523 13 13V3C13 2.44772 12.5523 2 12 2Z" stroke="#5F3DF4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M11 1V3" stroke="#5F3DF4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M5 1V3" stroke="#5F3DF4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M3 6H13" stroke="#5F3DF4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  <span>Oct 9, 2025 · 10:24 AM</span>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className='w-full bg-white rounded-[8px] p-4'>
                            <div className='flex flex-col gap-4'>
                              {phase.messages.map((message, msgIndex) => (
                                <div
                                  key={msgIndex}
                                  className={cn(
                                    'flex gap-3',
                                    message.senderType === 'user' ? 'justify-end' : 'justify-start'
                                  )}
                                >
                                  <div
                                    className={cn(
                                      'rounded-[8px] p-3 text-sm text-[#212121] flex flex-col gap-1 max-w-[70%] relative',
                                      message.senderType === 'agent'
                                        ? 'bg-[#F7F6FE] border border-[#5F3DF4]'
                                        : 'bg-[#F7F7F7] border border-[#E4E4E4]'
                                    )}
                                  >
                                    {/* Timestamp in top right corner - only for voice */}
                                    {activeTab === "voice" && (
                                      <span className='absolute top-2 right-2 text-xs text-[#5E6775]'>{message.timestamp}</span>
                                    )}
                                    
                                    <div className='flex items-center gap-2'>
                                      {message.senderType === 'agent' && (
                                        <div className='w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0'>
                                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                                            <rect width="20" height="20" rx="5" fill="#5F3DF4"/>
                                            <path d="M10.0013 7.91634V5.83301H7.91797M4.79297 11.0413H5.83464M14.168 11.0413H15.2096M11.5638 10.5205V11.5622M8.4388 10.5205V11.5622M6.8763 7.91634H13.1263C13.7016 7.91634 14.168 8.38271 14.168 8.95801V13.1247C14.168 13.7 13.7016 14.1663 13.1263 14.1663H6.8763C6.30101 14.1663 5.83464 13.7 5.83464 13.1247V8.95801C5.83464 8.38271 6.30101 7.91634 6.8763 7.91634Z" stroke="white" strokeWidth="0.9375" strokeLinecap="round" strokeLinejoin="round"/>
                                          </svg>
                                        </div>
                                      )}
                                      {message.senderType === 'user' && (
                                        <div className='w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0'>
                                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                                            <rect width="20" height="20" rx="5" fill="#B43DF4"/>
                                            <path d="M13.6471 14.6875V13.6458C13.6471 13.0933 13.4276 12.5634 13.0369 12.1727C12.6462 11.782 12.1163 11.5625 11.5638 11.5625H8.4388C7.88627 11.5625 7.35636 11.782 6.96566 12.1727C6.57496 12.5634 6.35547 13.0933 6.35547 13.6458V14.6875M12.0846 7.39583C12.0846 8.54643 11.1519 9.47917 10.0013 9.47917C8.85071 9.47917 7.91797 8.54643 7.91797 7.39583C7.91797 6.24524 8.85071 5.3125 10.0013 5.3125C11.1519 5.3125 12.0846 6.24524 12.0846 7.39583Z" stroke="white" strokeWidth="0.9375" strokeLinecap="round" strokeLinejoin="round"/>
                                          </svg>
                                        </div>
                                      )}
                                      <span className='text-xs font-medium text-[#212121]'>{message.sender}</span>
                                      {activeTab !== "voice" && (
                                        <>
                                          <span className='text-xs text-[#5E6775]'>•</span>
                                          <span className='text-xs text-[#5E6775]'>{message.timestamp}</span>
                                        </>
                                      )}
                                    </div>
                                    {message.content && <p className='leading-relaxed'>{message.content}</p>}
                                    {'content2' in message && message.content2 && <p className='leading-relaxed mt-1'>{message.content2}</p>}
                                    {'slots' in message && message.slots && (
                                      <div className='mt-2 bg-white rounded-[8px] p-3'>
                                        <ul className='list-disc list-inside space-y-1 text-sm'>
                                          {message.slots.map((slot: string, idx: number) => (
                                            <li key={idx} className='text-[#212121]'>{slot}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    {'content3' in message && message.content3 && <p className='leading-relaxed mt-2'>{message.content3}</p>}
                                    {!('content2' in message) && !('slots' in message) && !('content3' in message) && message.content && (
                                      <p className='leading-relaxed'>{message.content}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                              {phase.name === "Scheduling Phase" && 'meetingDetails' in phase && phase.meetingDetails && (
                                <div className='mt-4 p-4 bg-white rounded-[8px] border border-[#E4E4E4]'>
                                  <div className='flex items-start gap-3'>
                                    <div className='flex items-center justify-center flex-shrink-0'>
                                      <svg width="41" height="41" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[41px] h-[41px]">
                                        <rect width="41" height="41" rx="8" fill="#169F56"/>
                                        <path d="M24.5 21.5L29.723 24.982C29.7983 25.0321 29.8858 25.0608 29.9761 25.0652C30.0664 25.0695 30.1563 25.0492 30.236 25.0065C30.3157 24.9639 30.3824 24.9003 30.4289 24.8228C30.4754 24.7452 30.5 24.6564 30.5 24.566V16.37C30.5 16.282 30.4768 16.1956 30.4328 16.1194C30.3887 16.0433 30.3253 15.9801 30.2491 15.9363C30.1728 15.8925 30.0863 15.8696 29.9983 15.8699C29.9103 15.8702 29.824 15.8937 29.748 15.938L24.5 19M12.5 14.5H22.5C23.6046 14.5 24.5 15.3954 24.5 16.5V24.5C24.5 25.6046 23.6046 26.5 22.5 26.5H12.5C11.3954 26.5 10.5 25.6046 10.5 24.5V16.5C10.5 15.3954 11.3954 14.5 12.5 14.5Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    </div>
                                    <div className='flex-1 flex flex-col gap-3'>
                                      <div className='flex items-center gap-2'>
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0">
                                          <rect width="20" height="20" rx="5" fill="#5F3DF4"/>
                                          <path d="M10.0013 7.91634V5.83301H7.91797M4.79297 11.0413H5.83464M14.168 11.0413H15.2096M11.5638 10.5205V11.5622M8.4388 10.5205V11.5622M6.8763 7.91634H13.1263C13.7016 7.91634 14.168 8.38271 14.168 8.95801V13.1247C14.168 13.7 13.7016 14.1663 13.1263 14.1663H6.8763C6.30101 14.1663 5.83464 13.7 5.83464 13.1247V8.95801C5.83464 8.38271 6.30101 7.91634 6.8763 7.91634Z" stroke="white" strokeWidth="0.9375" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        <span className='text-sm text-[#212121]'>{phase.meetingDetails.date}</span>
                                      </div>
                                      <div className='flex items-center gap-2'>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0">
                                          <path d="M8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2Z" stroke="#212121" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                          <path d="M8 5V8L10 9" stroke="#212121" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        <span className='text-sm text-[#212121]'>{phase.meetingDetails.time}</span>
                                      </div>
                                      <div className='flex items-center gap-2'>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0">
                                          <path d="M2.66667 2.66667H13.3333C14.2538 2.66667 15 3.41286 15 4.33333V11.6667C15 12.5871 14.2538 13.3333 13.3333 13.3333H2.66667C1.74619 13.3333 1 12.5871 1 11.6667V4.33333C1 3.41286 1.74619 2.66667 2.66667 2.66667Z" stroke="#5F3DF4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                          <path d="M15 4.33333L8 9L1 4.33333" stroke="#5F3DF4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        <span className='text-sm text-[#5F3DF4] underline'>View Chat Summary</span>
                                      </div>
                                      <div className='flex items-center gap-2'>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0">
                                          <path d="M6.66667 3.33333H4C3.26362 3.33333 2.66667 3.93029 2.66667 4.66667V11.3333C2.66667 12.0697 3.26362 12.6667 4 12.6667H6.66667" stroke="#5F3DF4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                          <path d="M8 3.33333H12C12.7364 3.33333 13.3333 3.93029 13.3333 4.66667V11.3333C13.3333 12.0697 12.7364 12.6667 12 12.6667H8" stroke="#5F3DF4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                          <path d="M5.33333 8H10.6667" stroke="#5F3DF4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        <span className='text-sm text-[#5F3DF4] underline'>Join Zoom Meeting</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Sidebar */}
            <div className='w-full lg:w-[380px] flex flex-col gap-4 md:gap-6'>
              {/* Key Metrics */}
              <div className='w-full bg-white rounded-[8px] p-4 md:p-6'>
                <h3 className='text-xs md:text-sm font-semibold text-[#212121] mb-3 md:mb-4'>Key metrics</h3>
                <div className='flex flex-col gap-4'>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-[#5E6775]'>Lead score</span>
                    <span className='text-sm font-semibold text-[#5F3DF4]'>12/100</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-[#5E6775]'>Qualification score</span>
                    <span className='w-max py-1 px-2 rounded-full text-xs font-medium bg-[#F0FDF4] text-[#0E5831]'>
                      ✓ Qualified
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-[#5E6775]'>Engagement score</span>
                    <span className='text-sm font-semibold text-[#212121]'>High</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-[#5E6775]'>Meeting booked</span>
                    <span className='text-sm font-semibold text-[#212121]'>Yes</span>
                  </div>
                </div>
              </div>

              {/* BANT Qualification */}
              <div className='w-full bg-white rounded-[8px] p-4 md:p-6'>
                <h3 className='text-xs md:text-sm font-semibold text-[#212121] mb-3 md:mb-4'>BANT qualification</h3>
                <div className='flex flex-col gap-4'>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-[#5E6775]'>Budget</span>
                    <span className='text-sm font-medium text-[#212121]'>₦5,000-8,000/monthly</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-[#5E6775]'>Authority</span>
                    <span className='text-sm font-medium text-[#212121]'>VP sales</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-[#5E6775]'>Need</span>
                    <span className='text-sm font-medium text-[#212121]'>Confirmed</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-[#5E6775]'>Timeline</span>
                    <span className='text-sm font-medium text-[#212121]'>2-3 weeks</span>
                  </div>
                </div>
              </div>

              {/* Call Analytics - Only for Voice Transcript */}
              {activeTab === "voice" && (
                <div className='w-full bg-white rounded-[8px] p-4 md:p-6'>
                  <h3 className='text-xs md:text-sm font-semibold text-[#212121] mb-3 md:mb-4'>Call analytics</h3>
                  <div className='flex flex-col gap-4'>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm text-[#5E6775]'>Talk ratio</span>
                      <span className='text-sm font-medium text-[#212121]'>AI 48% : Lead 52%</span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm text-[#5E6775]'>Speaking speed</span>
                      <span className='text-sm font-medium text-[#212121]'>Normal</span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm text-[#5E6775]'>Energy level</span>
                      <span className='text-sm font-medium text-[#212121]'>High</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Moments - Only for Voice Transcript */}
              {activeTab === "voice" && (
                <div className='w-full bg-white rounded-[8px] p-4 md:p-6'>
                  <h3 className='text-xs md:text-sm font-semibold text-[#212121] mb-3 md:mb-4'>Key moments</h3>
                  <div className='flex flex-col gap-3'>
                    <div className='flex gap-3 p-3 bg-[#FEFAF6] rounded-[8px]'>
                      <div className='w-1 bg-[#C17B1F] rounded-full flex-shrink-0' />
                      <div className='flex flex-col gap-1 flex-1'>
                        <span className='text-sm text-[#5E6775]'>0:30</span>
                        <span className='text-sm text-[#212121] font-semibold'>Budget discussion</span>
                      </div>
                    </div>
                    <div className='flex gap-3 p-3 bg-[#FEFAF6] rounded-[8px]'>
                      <div className='w-1 bg-[#C17B1F] rounded-full flex-shrink-0' />
                      <div className='flex flex-col gap-1 flex-1'>
                        <span className='text-sm text-[#5E6775]'>1:45</span>
                        <span className='text-sm text-[#212121] font-semibold'>Strong interest signal</span>
                      </div>
                    </div>
                    <div className='flex gap-3 p-3 bg-[#FEFAF6] rounded-[8px]'>
                      <div className='w-1 bg-[#C17B1F] rounded-full flex-shrink-0' />
                      <div className='flex flex-col gap-1 flex-1'>
                        <span className='text-sm text-[#5E6775]'>2:30</span>
                        <span className='text-sm text-[#212121] font-semibold'>Authority confirmed</span>
                      </div>
                    </div>
                    <div className='flex gap-3 p-3 bg-[#FEFAF6] rounded-[8px]'>
                      <div className='w-1 bg-[#C17B1F] rounded-full flex-shrink-0' />
                      <div className='flex flex-col gap-1 flex-1'>
                        <span className='text-sm text-[#5E6775]'>3:15</span>
                        <span className='text-sm text-[#212121] font-semibold'>Budget discussion</span>
                      </div>
                    </div>
                    <div className='flex gap-3 p-3 bg-[#FEFAF6] rounded-[8px]'>
                      <div className='w-1 bg-[#C17B1F] rounded-full flex-shrink-0' />
                      <div className='flex flex-col gap-1 flex-1'>
                        <span className='text-sm text-[#5E6775]'>5:12</span>
                        <span className='text-sm text-[#212121] font-semibold'>Meeting scheduled</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Company Information */}
              <div className='w-full bg-white rounded-[8px] p-4 md:p-6'>
                <h3 className='text-xs md:text-sm font-semibold text-[#212121] mb-3 md:mb-4'>Company information</h3>
                <div className='flex flex-col gap-4'>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-[#5E6775]'>Company</span>
                    <span className='text-sm font-medium text-[#212121]'>DevTech Solutions</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-[#5E6775]'>Industry</span>
                    <span className='text-sm font-medium text-[#212121]'>SaaS</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-[#5E6775]'>Company size</span>
                    <span className='text-sm font-medium text-[#212121]'>50 employees</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-[#5E6775]'>AI Agent</span>
                    <span className='text-sm font-medium text-[#212121]'>Sarah</span>
                  </div>
                </div>
              </div>

              {/* Manual Action */}
              <div className='w-full bg-white rounded-[8px] p-4 md:p-6'>
                <h3 className='text-xs md:text-sm font-semibold text-[#212121] mb-3 md:mb-4'>Manual action</h3>
                <div className='flex flex-col gap-4'>
                  <button className='w-full px-4 py-3 bg-[#5F3DF4] text-white rounded-[8px] font-medium text-sm hover:bg-[#4d2fd4] transition-colors'>
                    Compose Email
                  </button>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add internal note about lead...."
                    className='w-full px-4 py-3 border border-[#D5D9DE] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#5F3DF4] focus:border-transparent text-sm text-[#212121] placeholder:text-[#9CA3AF] resize-none min-h-[100px]'
                  />
                  <button className='w-full px-4 py-3 border border-[#5F3DF4] text-[#5F3DF4] rounded-[8px] font-medium text-sm hover:bg-[#F7F7F7] transition-colors'>
                    Save Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Container>
        </div>
      </div>
    </MainLayout>
  )
}

export default Page

