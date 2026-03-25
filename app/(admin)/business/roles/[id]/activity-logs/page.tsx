"use client";

import React, { useState } from 'react'
import { MainLayout } from '@/components/layout/dashboard'
import { Container, SelectAltInput } from '@/components/ui'
import { ArrowLeftIcon, SearchIcon, ElipsisVerticalIcon } from '@/components/ui/Icons'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { adminUsersData, activityLogsData } from '@/lib/data'
import Pagination from '@/components/ui/Pagination'
import { useParams } from 'next/navigation'
import Modals from '@/components/ui/dashboard/modals'

const Page = () => {
  const params = useParams()
  const userId = params?.id as string
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDateRange, setSelectedDateRange] = useState("Date range")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showActivityDetailsModal, setShowActivityDetailsModal] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<any>(null)

  // Get user data
  const user = adminUsersData.find(admin => admin.id === userId)

  if (!user) {
    return (
      <MainLayout>
        <div className='max-w-[1440px] mx-auto pt-36 pb-20'>
          <Container>
            <div className='text-center py-20'>
              <p className='text-[#5E6775]'>User not found</p>
            </div>
          </Container>
        </div>
      </MainLayout>
    )
  }

  const filteredLogs = activityLogsData.filter(log => {
    const matchesSearch = log.activity.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = filteredLogs.slice(startIndex, endIndex)

  const handlers = {
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
      setItemsPerPage(Number(e.target.value))
      setCurrentPage(1)
    }
  }

  const getStatusBadgeClass = (status: string) => {
    if (status === "Active") {
      return "bg-[#F0FDF4] text-[#0E5831]";
    } else if (status === "Pending Invite") {
      return "bg-[#FBF3E9] text-[#C17B1F]";
    } else if (status === "Inactive") {
      return "bg-[#F7F7F7] text-[#5E6775]";
    }
    return "bg-[#F7F7F7] text-[#5E6775]";
  }

  return (
    <MainLayout>
      <div className='max-w-[1440px] mx-auto pt-36 pb-20'>
        <Container>
          {/* Back Button */}
          <Link
            className='inline-flex gap-1 cursor-pointer items-center mb-6'
            href={'/business/roles'}
          >
            <ArrowLeftIcon className='text-[#5E6775] w-6 h-6' />
            <span className='text-[#5E6775]'>Back</span>
          </Link>

          {/* Title */}
          <h1 className='text-[18px] md:text-[28px] font-semibold text-[#212121] mb-6'>Activity Logs</h1>

          {/* User Info */}
          <div className='w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
            <div className='flex flex-col gap-2'>
              <div className='flex items-center gap-3'>
                <span className='text-base md:text-lg font-semibold text-[#212121]'>{user.name}</span>
                <span className={cn('w-max py-1 px-2 rounded-full text-xs font-medium', getStatusBadgeClass(user.status))}>
                  {user.status}
                </span>
              </div>
              <span className='text-sm text-[#5E6775]'>{user.role}</span>
            </div>

            {/* Search and Date Range */}
            <div className='flex flex-col md:flex-row gap-4'>
              <div className='flex-1 relative'>
                <SearchIcon
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-[#5E6775] w-5 h-5 pointer-events-none'
                />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full px-4 py-3 pl-10 pr-4 border border-[#D5D9DE] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#5F3DF4] focus:border-transparent text-sm'
                />
              </div>
              <div className='w-full md:w-[150px]'>
                <SelectAltInput 
                  options={['Date range', 'Today', 'This Week', 'This Month', 'Last 3 Months']} 
                  isEmpty={false} 
                  value={selectedDateRange}
                  onChange={(e) => setSelectedDateRange(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className='hidden md:block w-full bg-white rounded-[8px] overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='w-full border-collapse'>
                <thead>
                  <tr className='border-b border-[#E4E4E4] bg-[#F7F7F7]'>
                    <th className='text-left text-sm font-semibold text-[#212121] py-3 px-4'>Date & Time</th>
                    <th className='text-left text-sm font-semibold text-[#212121] py-3 px-4'>Activity</th>
                    <th className='text-left text-sm font-semibold text-[#212121] py-3 px-4'>Description</th>
                    <th className='text-left text-sm font-semibold text-[#212121] py-3 px-4'>IP Address</th>
                    <th className='text-left text-sm font-semibold text-[#212121] py-3 px-4'>Performed On</th>
                    <th className='text-left text-sm font-semibold text-[#212121] py-3 px-4'>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((log, index) => (
                    <tr 
                      key={log.id}
                      className='border-b border-[#E4E4E4] text-[#5E6775] text-sm hover:bg-gray-50/50 last:border-b-0'
                    >
                      <td className='py-4 px-4'>{log.dateTime}</td>
                      <td className='py-4 px-4'>{log.activity}</td>
                      <td className='py-4 px-4'>{log.description}</td>
                      <td className='py-4 px-4'>{log.ipAddress}</td>
                      <td className='py-4 px-4'>{log.performedOn}</td>
                      <td className='relative py-4 px-4'>
                        <ElipsisVerticalIcon
                          className="cursor-pointer text-[#5E6775]"
                          click={() => {
                            setSelectedActivity(log)
                            setShowActivityDetailsModal(true)
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className='flex flex-col gap-4 md:hidden'>
            {paginatedData.map((log, index) => (
              <div key={log.id} className='w-full bg-white rounded-[8px] p-4 border border-[#E4E4E4]'>
                <div className='flex flex-col gap-3'>
                  <div className='flex justify-between items-start'>
                    <div className='flex flex-col gap-1'>
                      <span className='text-sm text-[#212121] font-medium'>{log.dateTime}</span>
                      <span className='text-sm text-[#212121] font-semibold'>{log.activity}</span>
                    </div>
                  </div>
                  <p className='text-sm text-[#5E6775]'>{log.description}</p>
                  <div className='flex justify-between items-center text-xs text-[#5E6775]'>
                    <span>IP: {log.ipAddress}</span>
                    <span>{log.performedOn}</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedActivity(log)
                      setShowActivityDetailsModal(true)
                    }}
                    className='w-full mt-2 py-2 border border-[#5F3DF4] text-[#5F3DF4] rounded-[8px] text-sm font-medium hover:bg-[#F7F7F7] transition-colors'
                  >
                    View details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className='w-full mt-6'>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onChange={handlers.onChange}
              totalData={filteredLogs.length}
            />
          </div>
        </Container>
      </div>

      {/* Activity Details Modal */}
      <Modals.ActivityDetails
        open={showActivityDetailsModal}
        setTrigger={setShowActivityDetailsModal}
        activity={selectedActivity}
      />
    </MainLayout>
  )
}

export default Page

