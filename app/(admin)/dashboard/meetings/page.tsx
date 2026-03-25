"use client";

import React, { Fragment, useState } from 'react'
import { MainLayout } from '@/components/layout/dashboard'
import { Container, SelectAltInput } from '@/components/ui'
import { ArrowUpIcon } from '@/components/ui/Icons'
import { cn } from '@/lib/utils'
import { MeetingsTable } from '@/components/ui/tables'
import { meetingsData } from '@/lib/data'
import StatCard from '@/components/sections/StatCards'
import Pagination from '@/components/ui/Pagination'
import Link from 'next/link'

const stats = [
  {
    title: "Total Meetings Booked",
    emptyBalance: "0",
    nonEmptyBalance: "35",
    emptyPercentage: "0%",
    nonEmptyPercentage: "5%",
    direction: "progress",
    icon: ArrowUpIcon,
    showIcon: true,
    suffix: " vs last month"
  },
  {
    title: "Incoming Meetings",
    emptyBalance: "0",
    nonEmptyBalance: "20",
    emptyPercentage: "0%",
    nonEmptyPercentage: "Next 30 days",
    direction: "progress",
    icon: ArrowUpIcon,
    showIcon: false,
    suffix: ""
  },
  {
    title: "Missed Meetings",
    emptyBalance: "0",
    nonEmptyBalance: "5",
    emptyPercentage: "0%",
    nonEmptyPercentage: "2.6% miss rate",
    direction: "decline",
    icon: ArrowUpIcon,
    showIcon: false,
    suffix: ""
  },
  {
    title: "Cancelled Meetings",
    emptyBalance: "0",
    nonEmptyBalance: "10",
    emptyPercentage: "0%",
    nonEmptyPercentage: "6.8% cancellation rate",
    direction: "decline",
    icon: ArrowUpIcon,
    showIcon: false,
    suffix: ""
  }
]

const meetingCategories = [
  {
    name: "Demo",
    count: 5,
    percentage: 20,
    color: "#5F3DF4"
  },
  {
    name: "Feedback",
    count: 10,
    percentage: 40,
    color: "#3B82F6"
  },
  {
    name: "Support",
    count: 50,
    percentage: 60,
    color: "#06B6D4"
  },
  {
    name: "Complaint",
    count: 5,
    percentage: 20,
    color: "#CB1616"
  },
  {
    name: "Onboarding",
    count: 5,
    percentage: 20,
    color: "#C17B1F"
  },
  {
    name: "Custom",
    count: 5,
    percentage: 20,
    color: "#EC4899"
  }
]

const tableHeaders = [
  {
    label: "Lead Name",
    key: "leadName"
  },
  {
    label: "Reason for Meeting",
    key: "reason"
  },
  {
    label: "Meeting Status",
    key: "status"
  },
  {
    label: "Date/Time",
    key: "dateTime"
  },
  {
    label: "Action",
    key: "action"
  }
]

const page = () => {
  const [isEmpty, setIsEmpty] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedReason, setSelectedReason] = useState("All reasons")
  const [selectedStatus, setSelectedStatus] = useState("All status")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  
  const totalPages = Math.ceil(meetingsData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = meetingsData.slice(startIndex, endIndex)

  const handlers = {
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
      setItemsPerPage(Number(e.target.value))
      setCurrentPage(1)
    }
  }

  return (
    <MainLayout>
      <div className='max-w-[1440px] mx-auto pt-36 pb-20'>
        <Container>
          <div className='w-full flex justify-between items-center'>
            <h1 className='text-[18px] md:text-[28px] font-semibold'>Meetings</h1>
            <div className='flex gap-2'>
              <div className='w-[150px] md:w-auto'>
                <SelectAltInput options={['Last month', 'Last 30 days', 'Last 60 days', 'Last 90 days', 'Last 1 year']} isEmpty={isEmpty} />
              </div>
              <button type='button' className='w-max py-2 px-3 rounded-sm cursor-pointer bg-[#5F3DF3] text-white inline-flex items-center gap-2'>
                <span>Export</span>
                <ArrowUpIcon className="text-white" size={16} />
              </button>
            </div>
          </div>

          <div className='mt-[20px] md:mt-10'>
            <div className='w-full flex flex-col md:flex-row gap-4'>
              {
                stats.map(item => {
                  const Icon = item.icon
                  return (
                    <Fragment key={item.title}>
                      <StatCard item={item} isEmpty={isEmpty} Icon={Icon} />
                    </Fragment>
                  )
                })
              }
            </div>

            <div className='w-full mt-6 p-6 border border-[#D5D9DE] rounded-2xl'>
              <h2 className='text-base md:text-xl text-[#212121] font-bold mb-6'>Meeting Categories</h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {
                  meetingCategories.map((category, index) => (
                    <div key={index} className='flex flex-col gap-2'>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-[#5E6775]'>{category.name}</span>
                        <span className='text-sm text-[#5E6775]'>{category.count} meetings ({category.percentage}%)</span>
                      </div>
                      <div className='w-full h-[30px] bg-[#F1F5F9] rounded-2xl relative overflow-hidden'>
                        <div 
                          className='h-full rounded-l-2xl relative flex items-center justify-end pr-2'
                          style={{ 
                            width: '20%',
                            backgroundColor: category.color
                          }}
                        >
                          <span className='text-sm text-white font-medium'>
                            20%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>

            <div className='w-full mt-6'>
              <h2 className='text-base md:text-xl text-[#212121] font-bold mb-6'>List of Meetings</h2>
              
              <div className='flex flex-col md:flex-row gap-4 mb-6'>
                <div className='flex-1 relative'>
                  <input
                    type="text"
                    placeholder="Search by lead name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='w-full px-4 py-2 pl-10 border border-[#D5D9DE] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#5F3DF4] focus:border-transparent'
                  />
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 20 20" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className='absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5E6775]'
                  >
                    <path 
                      d="M14.1667 14.1667L17.5 17.5M2.5 9.16667C2.5 10.9348 3.20238 12.6305 4.45262 13.8807C5.70286 15.131 7.39856 15.8333 9.16667 15.8333C10.9348 15.8333 12.6305 15.131 13.8807 13.8807C15.131 12.6305 15.8333 10.9348 15.8333 9.16667C15.8333 7.39856 15.131 5.70286 13.8807 4.45262C12.6305 3.20238 10.9348 2.5 9.16667 2.5C7.39856 2.5 5.70286 3.20238 4.45262 4.45262C3.20238 5.70286 2.5 7.39856 2.5 9.16667Z" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className='w-full md:w-[150px]'>
                  <SelectAltInput options={['All reasons', 'Demo', 'Feedback', 'Support', 'Complaint', 'Onboarding', 'Custom']} isEmpty={isEmpty} />
                </div>
                <div className='w-full md:w-[150px]'>
                  <SelectAltInput options={['All status', 'Scheduled', 'Missed', 'Completed', 'Canceled']} isEmpty={isEmpty} />
                </div>
              </div>

              <div className='hidden md:block'>
                <MeetingsTable tableData={paginatedData} tableHeaders={tableHeaders} />
                <Pagination
                  currentPage={currentPage}
                  totalPages={99}
                  setCurrentPage={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  onChange={handlers.onChange}
                  totalData={meetingsData.length}
                />
              </div>
              <div className='mt-5 block md:hidden'>
                <div className='flex flex-col gap-5'>
                  {
                    paginatedData.map((data, idx) => (
                      <div key={idx} className='w-full flex flex-col gap-4 bg-white shadow-[0_4px_12px_0_#21212112] p-4 rounded-lg'>
                        <div className='w-full flex justify-between text-sm'>
                          <p className='text-[#212121] font-medium'>Lead Name</p>
                          <p className='text-[#212121]'>{data.leadName}</p>
                        </div>
                        <div className='w-full flex justify-between text-sm'>
                          <p className='text-[#212121] font-medium'>Reason for Meeting</p>
                          <p className='text-[#212121]'>{data.reason}</p>
                        </div>
                        <div className='w-full flex justify-between items-center text-sm'>
                          <p className='text-[#212121] font-medium'>Meeting Status</p>
                          <span className={cn('w-max py-1 px-2 rounded-full text-xs font-medium',
                            data.status === "Scheduled" && "bg-[#FBF3E9] text-[#C17B1F]",
                            data.status === "Missed" && "bg-[#F7F7F7] text-[#5E6775]",
                            data.status === "Completed" && "bg-[#F0FDF4] text-[#0E5831]",
                            data.status === "Canceled" && "bg-[#FDF0F0] text-[#CB1616]"
                          )}>{data.status}</span>
                        </div>
                        <div className='w-full flex justify-between text-sm'>
                          <p className='text-[#212121] font-medium'>Date/Time</p>
                          <p className='text-[#212121]'>{data.dateTime}</p>
                        </div>
                        <Link
                          href={`/dashboard/meetings/${data.id}`}
                          className='w-full px-4 py-2 bg-transparent text-[#5F3DF4] text-sm font-medium rounded-lg text-center hover:bg-[#F7F7F7] transition-colors shadow-sm mt-2'
                        >
                          View details
                        </Link>
                      </div>
                    ))
                  }
                </div>
                <div className='mt-5'>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={99}
                    setCurrentPage={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    onChange={handlers.onChange}
                    totalData={meetingsData.length}
                  />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </MainLayout>
  )
}

export default page
