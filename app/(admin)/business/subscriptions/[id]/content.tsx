"use client";

import React, { useState, useMemo, useEffect } from 'react'
import { Container, SelectAltInput } from '@/components/ui'
import { ArrowLeftIcon, SearchIcon } from '@/components/ui/Icons'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { SubscriptionHistoryTable } from '@/components/ui/tables'
import Pagination from '@/components/ui/Pagination'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

type HistoryDataItem = {
  dateTime: string;
  activityType: string;
  description: string;
  amount: string;
  performedBy: string;
}

const Content = ({ subscription, organizationSubscriptions, isLoadingHistory }: any) => {
  const [isEmpty, setIsEmpty] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedFilter]);

  const historyData = useMemo(() => {
    if (!organizationSubscriptions || organizationSubscriptions.length === 0) return [];
    return organizationSubscriptions.map((sub: any) => ({
      dateTime: new Date(sub.createdAt).toLocaleString(),
      activityType: sub.status === 'ACTIVE' ? 'Subscription Activated' : 
                    sub.status === 'SUSPENDED' ? 'Subscription Suspended' :
                    sub.status === 'EXPIRED' ? 'Subscription Expired' :
                    sub.status === 'CANCELLED' ? 'Subscription Cancelled' : 'Subscription Updated',
      description: `${sub.subscriptionPlan.name} - ${sub.status}`,
      amount: sub.subscriptionPlan.currency === 'NAIRA' 
        ? `₦${sub.subscriptionPlan.priceNaira.toLocaleString()}` 
        : `$${sub.subscriptionPlan.priceUsd.toLocaleString()}`,
      performedBy: subscription.organizationName,
    }));
  }, [organizationSubscriptions, subscription]);

  const performedByOptions = useMemo(() => {
    const unique = Array.from(new Set(historyData.map((item: any) => item.performedBy))) as string[];
    return ["All", ...unique];
  }, [historyData]);

  const filteredHistory = historyData.filter((item: any) => {
    const matchesSearch = item.activityType.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = selectedFilter === "All" || item.performedBy === selectedFilter
    return matchesSearch && matchesFilter
  })

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = filteredHistory.slice(startIndex, endIndex)

  const handlers = {
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
      setItemsPerPage(Number(e.target.value))
      setCurrentPage(1)
    }
  }

  const getStatusBadgeClass = (status: string) => {
    if (status === "Active") {
      return "bg-[#F0FDF4] text-[#0E5831]";
    } else if (status === "Trial") {
      return "bg-[#F7F7F7] text-[#5E6775]";
    } else if (status === "Expired") {
      return "bg-[#FDF0F0] text-[#CB1616]";
    }
    return "bg-[#F7F7F7] text-[#5E6775]";
  }

  if (!subscription) {
    return (
      <div className='max-w-[1440px] mx-auto pt-36 pb-20'>
        <Container>
          <div className='text-center py-20'>
            <p className='text-[#5E6775]'>Subscription not found</p>
          </div>
        </Container>
      </div>
    )
  }

  const tableHeaders = [
    {
      label: "Date & Time",
      key: "dateTime"
    },
    {
      label: "Activity Type",
      key: "activityType"
    },
    {
      label: "Description",
      key: "description"
    },
    {
      label: "Amount",
      key: "amount"
    },
    {
      label: "Performed By",
      key: "performedBy"
    }
  ]

  return (
    <div className='max-w-[1440px] mx-auto pt-36 pb-20'>
      <Container>
        <Link
          className='inline-flex gap-1 cursor-pointer items-center mb-6'
          href={'/business/subscriptions'}
        >
          <ArrowLeftIcon className='text-[#5E6775] w-6 h-6' />
          <span className='text-[#5E6775]'>Back</span>
        </Link>

        {/* Header with Title, Search and Filter */}
        <div className='w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
          <h1 className='text-[18px] md:text-[28px] font-semibold text-[#212121]'>Subscription History</h1>
          
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='flex-1 relative'>
              <SearchIcon
                className='absolute left-3 top-1/2 -translate-y-1/2 text-[#5E6775] w-5 h-5 pointer-events-none'
              />
              <input
                type="text"
                placeholder="Search by activity type"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className='w-full h-10 px-4 pl-10 pr-4 border border-[#D5D9DE] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#5F3DF4] focus:border-transparent text-sm'
              />
            </div>
            <div className='w-full md:w-[150px]'>
              <SelectAltInput 
                options={performedByOptions} 
                isEmpty={isEmpty} 
                value={selectedFilter}
                onChange={(e) => {
                  setSelectedFilter(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>

        {/* Subscription Details Section */}
        <div className='w-full mb-6'>
          <div className='flex flex-col md:flex-row gap-6'>
            {/* Organization Name */}
            <div className='flex flex-col gap-2'>
              <span className='text-sm text-[#5E6775]'>Organization Name</span>
              <span className='text-sm text-[#212121] font-medium'>{subscription.organizationName}</span>
            </div>
            
            {/* Current Plan */}
            <div className='flex flex-col gap-2 md:border-l md:border-[#E4E4E4] md:pl-6'>
              <span className='text-sm text-[#5E6775]'>Current Plan</span>
              <span className='text-sm text-[#212121] font-medium'>{subscription.currentPlan || subscription.subscriptionType}</span>
            </div>
            
            {/* Status */}
            <div className='flex flex-col gap-2 md:border-l md:border-[#E4E4E4] md:pl-6'>
              <span className='text-sm text-[#5E6775]'>Status</span>
              <span className={cn('w-max py-1 px-2 rounded-full text-xs font-medium', getStatusBadgeClass(subscription.status))}>
                {subscription.status}
              </span>
            </div>
          </div>
        </div>

        <div className='w-full bg-white rounded-[12px] p-6'>
          {isLoadingHistory ? (
            <div className='flex justify-center items-center min-h-[300px]'>
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className='hidden md:block'>
                <SubscriptionHistoryTable tableData={paginatedData} tableHeaders={tableHeaders} />
              </div>
          
          {/* Mobile Card View */}
          <div className='flex gap-4 flex-col md:hidden'>
            {
              paginatedData.map((data: HistoryDataItem, i: number) => {
                return (
                  <div key={i} className='w-full flex flex-col gap-4 py-6 px-4 rounded-[8px] shadow-[0_4px_12px_0_#21212112]'>
                    <div className='flex justify-between items-start'>
                      <p className='text-[#5E6775] text-sm'>Date & Time</p>
                      <p className='text-[#212121] text-sm font-medium'>{data.dateTime}</p>
                    </div>
                    <div className='flex justify-between items-start'>
                      <p className='text-[#5E6775] text-sm'>Activity Type</p>
                      <p className='text-[#212121] text-sm font-medium'>{data.activityType}</p>
                    </div>
                    <div className='flex justify-between items-start'>
                      <p className='text-[#5E6775] text-sm'>Description</p>
                      <p className='text-[#212121] text-sm font-medium'>{data.description}</p>
                    </div>
                    <div className='flex justify-between items-start'>
                      <p className='text-[#5E6775] text-sm'>Amount</p>
                      <p className='text-[#212121] text-sm font-medium'>{data.amount}</p>
                    </div>
                    <div className='flex justify-between items-start'>
                      <p className='text-[#5E6775] text-sm'>Performed By</p>
                      <p className='text-[#212121] text-sm font-medium'>{data.performedBy}</p>
                    </div>
                  </div>
                )
              })
            }
          </div>
            </>
          )}
        </div>
        
        {!isLoadingHistory && (
          <div className='w-full mt-6'>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onChange={handlers.onChange}
              totalData={filteredHistory.length}
            />
          </div>
        )}
      </Container>
    </div>
  )
}

export default Content

