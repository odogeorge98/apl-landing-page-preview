"use client";

import React, { useState } from 'react'
import { MainLayout } from '@/components/layout/dashboard'
import { Container, SelectAltInput } from '@/components/ui'
import { SearchIcon } from '@/components/ui/Icons'
import { ConversionsTable } from '@/components/ui/tables'
import { conversionsData } from '@/lib/data'
import Pagination from '@/components/ui/Pagination'
import { cn } from '@/lib/utils'

const tableHeaders = [
  {
    label: "Company Name",
    key: "companyName"
  },
  {
    label: "Agent",
    key: "agent"
  },
  {
    label: "Date",
    key: "date"
  },
  {
    label: "Rating",
    key: "rating"
  },
  {
    label: "",
    key: "action"
  }
]

const page = () => {
  const [isEmpty, setIsEmpty] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRating, setSelectedRating] = useState("All rating")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  
  const filteredData = conversionsData.filter(item => {
    const matchesSearch = item.companyName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.agent.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRating = selectedRating === "All rating" || 
                          (selectedRating === "5 star rating" && item.rating === 5) ||
                          (selectedRating === "4 star rating" && item.rating === 4) ||
                          (selectedRating === "3 star rating" && item.rating === 3) ||
                          (selectedRating === "2 star rating" && item.rating === 2) ||
                          (selectedRating === "1 star rating" && item.rating === 1)
    return matchesSearch && matchesRating
  })
  
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = filteredData.slice(startIndex, endIndex)

  const handlers = {
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
      setItemsPerPage(Number(e.target.value))
      setCurrentPage(1)
    },
    getStatusBadgeClass(status: string) {
      if (status === "Active" || status === "Successful") {
        return "bg-[#E8F5E9] text-[#2E7D32]"
      } else if (status === "Failed") {
        return "bg-[#FFEBEE] text-[#C62828]"
      }
      return "bg-gray-100 text-gray-600"
    }
  }

  // Calculate stats
  const totalConversions = conversionsData.length
  const successfulConversions = conversionsData.filter(item => item.rating >= 4).length
  const failedConversions = conversionsData.filter(item => item.rating <= 3).length

  return (
    <MainLayout>
      <div className='max-w-[1440px] mx-auto pt-36 pb-20'>
        <Container>
          <div className='w-full mb-6'>
            <h1 className='text-[18px] md:text-[28px] font-semibold text-[#212121] mb-6'>Conversions</h1>
            
            {/* Stats Cards */}
            <div className='w-full flex flex-col md:flex-row gap-4 mb-6'>
              <div className='flex-1 bg-white rounded-[12px] p-6'>
                <div className='flex flex-col gap-2'>
                  <span className='text-sm text-[#5E6775]'>Total Conversions</span>
                  <span className='text-2xl font-semibold text-[#212121]'>{totalConversions.toLocaleString()}</span>
                </div>
              </div>
              <div className='flex-1 bg-white rounded-[12px] p-6'>
                <div className='flex flex-col gap-2'>
                  <span className='text-sm text-[#5E6775]'>Successful Conversions</span>
                  <div className='flex items-center gap-2'>
                    <span className='text-2xl font-semibold text-[#212121]'>{successfulConversions.toLocaleString()}</span>
                    <span className='text-xs text-[#5E6775]'>★ 4-5 stars</span>
                  </div>
                </div>
              </div>
              <div className='flex-1 bg-white rounded-[12px] p-6'>
                <div className='flex flex-col gap-2'>
                  <span className='text-sm text-[#5E6775]'>Failed Conversions</span>
                  <div className='flex items-center gap-2'>
                    <span className='text-2xl font-semibold text-[#212121]'>{failedConversions.toLocaleString()}</span>
                    <span className='text-xs text-[#5E6775]'>★ 1-3 stars</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className='w-full flex flex-col md:flex-row gap-4 mb-6'>
              <div className='flex-1 relative'>
                <SearchIcon
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-[#5E6775] w-5 h-5 pointer-events-none'
                />
                <input
                  type="text"
                  placeholder="Search by company or agent names"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full px-4 py-2 pl-10 pr-4 border border-[#D5D9DE] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#5F3DF4] focus:border-transparent text-sm'
                />
              </div>
              <div className='w-full md:w-[150px]'>
                <SelectAltInput 
                  options={['All rating', '5 star rating', '4 star rating', '3 star rating', '2 star rating', '1 star rating']} 
                  isEmpty={isEmpty} 
                  value={selectedRating}
                  onChange={(e) => setSelectedRating(e.target.value)}
                />
              </div>
            </div>

            {/* Table */}
            <div className='w-full bg-white rounded-[12px] p-6'>
              <div className='hidden md:block'>
                <ConversionsTable 
                  tableData={paginatedData} 
                  tableHeaders={tableHeaders}
                />
              </div>

              {/* Mobile Card View */}
              <div className='flex gap-4 flex-col md:hidden'>
                {
                  paginatedData.map((data, i) => {
                    return (
                      <div key={i} className='w-full flex flex-col gap-4 py-6 px-4 rounded-[8px] shadow-[0_4px_12px_0_#21212112]'>
                        <div className='flex justify-between items-start'>
                          <p className='text-[#5E6775] text-sm'>Company Name</p>
                          <p className='text-[#212121] text-sm font-medium'>{data.companyName}</p>
                        </div>
                        <div className='flex justify-between items-start'>
                          <p className='text-[#5E6775] text-sm'>Agent</p>
                          <p className='text-[#212121] text-sm font-medium'>{data.agent}</p>
                        </div>
                        <div className='flex justify-between items-start'>
                          <p className='text-[#5E6775] text-sm'>Date</p>
                          <p className='text-[#212121] text-sm font-medium'>{data.date}</p>
                        </div>
                        <div className='flex justify-between items-start'>
                          <p className='text-[#5E6775] text-sm'>Rating</p>
                          <div className='flex items-center gap-1'>
                            <span className='text-[#FFD700]'>★</span>
                            <span className='text-sm text-[#212121] font-medium'>{data.rating} stars</span>
                          </div>
                        </div>
                        <button
                          className='w-full px-4 py-2 bg-transparent border border-[#5F3DF4] text-[#5F3DF4] text-sm font-medium rounded-lg text-center hover:bg-[#F7F7F7] transition-colors shadow-sm mt-2'
                          onClick={() => { /* handle action */ }}
                        >
                          Action
                        </button>
                      </div>
                    )
                  })
                }
                <div className='mt-5'>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    setCurrentPage={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    onChange={handlers.onChange}
                    totalData={filteredData.length}
                  />
                </div>
              </div>
            </div>
            
            <div className='w-full mt-6 hidden md:block'>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onChange={handlers.onChange}
                totalData={filteredData.length}
              />
            </div>
          </div>
        </Container>
      </div>
    </MainLayout>
  )
}

export default page

