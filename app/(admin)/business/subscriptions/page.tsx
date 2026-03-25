"use client";

import React, { useState, useMemo, useEffect } from 'react'
import { MainLayout } from '@/components/layout/dashboard'
import { Container, SelectAltInput } from '@/components/ui'
import { SubscriptionsTable } from '@/components/ui/tables'
import Pagination from '@/components/ui/Pagination'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useSubscriptions } from '@/lib/hooks/subscription/use-subscriptions'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const tableHeaders = [
  {
    label: "Organization Name",
    key: "organizationName"
  },
  {
    label: "Subscription Type",
    key: "subscriptionType"
  },
  {
    label: "Next Billing Date",
    key: "nextBillingDate"
  },
  {
    label: "Status",
    key: "status"
  },
  {
    label: "Action",
    key: "action"
  }
]

const page = () => {
  const [isEmpty, setIsEmpty] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("All Type")
  const [selectedStatus, setSelectedStatus] = useState("All Status")
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined)
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType, selectedStatus, selectedMonth, selectedYear]);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  const months = [
    { label: "All Months", value: undefined },
    { label: "January", value: 1 },
    { label: "February", value: 2 },
    { label: "March", value: 3 },
    { label: "April", value: 4 },
    { label: "May", value: 5 },
    { label: "June", value: 6 },
    { label: "July", value: 7 },
    { label: "August", value: 8 },
    { label: "September", value: 9 },
    { label: "October", value: 10 },
    { label: "November", value: 11 },
    { label: "December", value: 12 },
  ];

  const { data: subscriptionsResponse, isLoading } = useSubscriptions({
    page: currentPage,
    limit: itemsPerPage,
    status: selectedStatus !== "All Status" ? selectedStatus : undefined,
    subscriptionType: selectedType !== "All Type" ? selectedType : undefined,
    month: selectedMonth,
    year: selectedYear,
    search: searchQuery || undefined,
  });

  const subscriptions = subscriptionsResponse?.data?.subscriptions || [];
  const totalPages = subscriptionsResponse?.data?.pagination?.totalPages || 1;

  const tableData = useMemo(() => {
    return subscriptions.map(sub => ({
      id: sub.id,
      organizationId: sub.organization.id,
      organizationName: sub.organization.name,
      subscriptionType: sub.subscriptionPlan.name,
      nextBillingDate: new Date(sub.endDate).toLocaleDateString(),
      status: sub.status,
    }));
  }, [subscriptions]);

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

  return (
    <MainLayout>
      <div className='max-w-[1440px] mx-auto pt-36 pb-20'>
        <Container>
          <div className='w-full mb-6'>
            <h1 className='text-[18px] md:text-[28px] font-semibold mb-6'>Subscriptions</h1>
            
            <div className='flex flex-col md:flex-row gap-4'>
              <div className='flex-1 relative'>
                <input
                  type="text"
                  placeholder="Search by organization name"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
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
                <SelectAltInput 
                  options={['All Type', 'Starter Plan', 'Professional Plan', 'Enterprise Plan']} 
                  isEmpty={isEmpty}
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div className='w-full md:w-[150px]'>
                <SelectAltInput 
                  options={['All Status', 'ACTIVE', 'SUSPENDED', 'EXPIRED', 'CANCELLED']} 
                  isEmpty={isEmpty}
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div className='w-full md:w-[150px]'>
                <SelectAltInput 
                  options={months.map(m => m.label)} 
                  isEmpty={isEmpty}
                  value={selectedMonth ? months.find(m => m.value === selectedMonth)?.label || 'All Months' : 'All Months'}
                  onChange={(e) => {
                    const month = months.find(m => m.label === e.target.value);
                    setSelectedMonth(month?.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div className='w-full md:w-[150px]'>
                <SelectAltInput 
                  options={['All Years', ...years.map(y => y.toString())]} 
                  isEmpty={isEmpty}
                  value={selectedYear ? selectedYear.toString() : 'All Years'}
                  onChange={(e) => {
                    setSelectedYear(e.target.value === 'All Years' ? undefined : parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          </div>

          <div className='w-full'>
            {isLoading ? (
              <div className='flex justify-center items-center min-h-[400px]'>
                <LoadingSpinner />
              </div>
            ) : (
              <>
            {/* Desktop Table */}
            <div className='hidden md:block'>
                  <SubscriptionsTable tableData={tableData} tableHeaders={tableHeaders} />
            </div>

            {/* Mobile Card View */}
            <div className='flex flex-col gap-4 md:hidden'>
              {
                    tableData.map((data, i) => (
                  <div 
                    key={i} 
                    className='w-full bg-white rounded-[12px] p-6 shadow-[0_4px_12px_0_#21212112] flex flex-col gap-4'
                  >
                    {/* Organization Name */}
                    <h3 className='text-base font-semibold text-[#212121]'>{data.organizationName}</h3>
                    
                    {/* Subscription Type */}
                    <div className='flex justify-between items-center'>
                      <span className='text-sm text-[#5E6775]'>Subscription Type</span>
                      <span className='text-sm text-[#212121] font-medium'>{data.subscriptionType}</span>
                    </div>
                    
                    {/* Next Billing Date */}
                    <div className='flex justify-between items-center'>
                      <span className='text-sm text-[#5E6775]'>Next Billing Date</span>
                      <span className='text-sm text-[#212121] font-medium'>{data.nextBillingDate}</span>
                    </div>
                    
                    {/* Status */}
                    <div className='flex justify-between items-center'>
                      <span className='text-sm text-[#5E6775]'>Status</span>
                      <span className={cn('w-max py-1 px-2 rounded-full text-xs font-medium', getStatusBadgeClass(data.status))}>
                        {data.status}
                      </span>
                    </div>
                    
                    {/* View History Button */}
                    <Link
                      href={`/business/subscriptions/${data.organizationId}`}
                      className='w-full mt-2 px-4 py-3 border border-[#5F3DF4] text-[#5F3DF4] text-sm font-medium rounded-[8px] text-center hover:bg-[#F7F7F7] transition-colors'
                    >
                      View history
                    </Link>
                  </div>
                ))
              }
            </div>

            <Pagination
              currentPage={currentPage}
                  totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onChange={handlers.onChange}
                  totalData={subscriptionsResponse?.data?.pagination?.totalItems || 0}
            />
              </>
            )}
          </div>
        </Container>
      </div>
    </MainLayout>
  )
}

export default page
