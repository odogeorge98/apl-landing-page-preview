"use client";

import React, { useState, useMemo, useEffect } from 'react'
import { MainLayout } from '@/components/layout/dashboard'
import { Container, SelectAltInput } from '@/components/ui'
import { SearchIcon } from '@/components/ui/Icons'
import { cn } from '@/lib/utils'
import { ConversationsTable } from '@/components/ui/tables'
import Pagination from '@/components/ui/Pagination'
import Link from 'next/link'
import { useConversations } from '@/lib/hooks/conversation/use-conversations'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const tableHeaders = [
  {
    label: "Date",
    key: "date"
  },
  {
    label: "Lead Email",
    key: "email"
  },
  {
    label: "Qualification Status",
    key: "qualificationStatus"
  },
  {
    label: "Meeting Status",
    key: "meetingStatus"
  },
  {
    label: "Lead Score",
    key: "leadScore"
  },
  {
    label: "Action",
    key: "action"
  }
]

const page = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedQualificationStatus, setSelectedQualificationStatus] = useState("Qualification status")
  const [selectedMeetingStatus, setSelectedMeetingStatus] = useState("Meeting status")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    setCurrentPage(1);
  }, []);

  const getQualificationStatusValue = (status: string): string | undefined => {
    if (status === "Qualification status") return undefined;
    const statusMap: Record<string, string> = {
      "Qualified": "qualified",
      "Not qualified": "not qualified",
      "Pending": "pending",
    };
    return statusMap[status] || status.toLowerCase();
  };

  const getMeetingStatusValue = (status: string): string | undefined => {
    if (status === "Meeting status") return undefined;
    const statusMap: Record<string, string> = {
      "Active": "active",
      "Deleted": "deleted",
      "Suspended": "suspended",
      "Ended": "ended",
    };
    return statusMap[status] || status.toLowerCase();
  };

  const { data: conversationsResponse, isLoading } = useConversations({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery || undefined,
    qualificationStatus: getQualificationStatusValue(selectedQualificationStatus),
    meetingStatus: getMeetingStatusValue(selectedMeetingStatus),
  });

  const conversations = conversationsResponse?.data?.conversations || [];
  const totalPages = conversationsResponse?.data?.pagination?.totalPages || 1;

  const tableData = useMemo(() => {
    return conversations.map(conv => ({
      id: conv.id,
      date: new Date(conv.date).toLocaleDateString(),
      email: conv.leadEmail,
      qualificationStatus: conv.qualificationStatus,
      meetingStatus: conv.meetingStatus,
      leadScore: conv.leadScore,
    }));
  }, [conversations]);

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
          <div className='w-full mb-6'>
            {/* Header with Title, Search and Filters */}
            <div className='w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
              <h1 className='text-[18px] md:text-[28px] font-semibold text-[#212121]'>Conversations</h1>
              
              <div className='flex flex-col md:flex-row gap-4'>
                <div className='flex-1 relative'>
                  <SearchIcon
                    className='absolute left-3 top-1/2 -translate-y-1/2 text-[#5E6775] w-5 h-5 pointer-events-none'
                  />
                  <input
                    type="text"
                    placeholder="Search by lead email"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className='w-full px-4 py-3 pl-10 pr-4 border border-[#D5D9DE] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#5F3DF4] focus:border-transparent text-sm'
                  />
                </div>
                <div className='w-full md:w-[180px]'>
                  <SelectAltInput 
                    options={['Qualification status', 'Qualified', 'Not qualified', 'Pending']} 
                    isEmpty={false} 
                    value={selectedQualificationStatus}
                    onChange={(e) => {
                      setSelectedQualificationStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <div className='w-full md:w-[180px]'>
                  <SelectAltInput 
                    options={['Meeting status', 'Active', 'Deleted', 'Suspended', 'Ended']} 
                    isEmpty={false} 
                    value={selectedMeetingStatus}
                    onChange={(e) => {
                      setSelectedMeetingStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className='flex justify-center items-center min-h-[400px]'>
                <LoadingSpinner />
              </div>
            ) : (
              <>
            {/* Desktop Table */}
            <div className='hidden md:block w-full bg-white rounded-[8px] overflow-hidden'>
              <ConversationsTable 
                    tableData={tableData} 
                tableHeaders={tableHeaders} 
              />
            </div>

            {/* Mobile Card View */}
            <div className='flex flex-col gap-4 md:hidden'>
                  {tableData.map((data, index) => {
                const getQualificationStatusBadgeClass = (status: string) => {
                  if (status === "Qualified") {
                    return "bg-[#F0FDF4] text-[#0E5831]";
                  } else if (status === "Not qualified") {
                    return "bg-[#FDF0F0] text-[#CB1616]";
                  } else if (status === "Pending") {
                    return "bg-[#FBF3E9] text-[#C17B1F]";
                  }
                  return "bg-[#F7F7F7] text-[#5E6775]";
                };

                const getMeetingStatusBadgeClass = (status: string) => {
                  if (status === "Active") {
                    return "bg-[#F0FDF4] text-[#0E5831]";
                  } else if (status === "Deleted") {
                    return "bg-[#FDF0F0] text-[#CB1616]";
                  } else if (status === "Suspended" || status === "Ended") {
                    return "bg-[#FBF3E9] text-[#C17B1F]";
                  }
                  return "bg-[#F7F7F7] text-[#5E6775]";
                };

                return (
                  <div key={index} className='w-full bg-white rounded-[8px] p-4 border border-[#E4E4E4]'>
                    <div className='flex flex-col gap-3'>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-[#5E6775]'>Date</span>
                        <span className='text-sm text-[#212121] font-medium'>{data.date}</span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-[#5E6775]'>Lead Email</span>
                        <span className='text-sm text-[#212121] font-medium'>{data.email}</span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-[#5E6775]'>Qualification Status</span>
                        <span className={cn('w-max py-1 px-2 rounded-full text-xs font-medium', getQualificationStatusBadgeClass(data.qualificationStatus))}>
                          {data.qualificationStatus}
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-[#5E6775]'>Meeting Status</span>
                        <span className={cn('w-max py-1 px-2 rounded-full text-xs font-medium', getMeetingStatusBadgeClass(data.meetingStatus))}>
                          {data.meetingStatus}
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-[#5E6775]'>Lead Score</span>
                        <span className='text-sm text-[#212121] font-medium'>{data.leadScore}</span>
                      </div>
                      <Link 
                        href={`/dashboard/conversations/${data.id || '1'}`}
                        className='w-full mt-2 py-2 border border-[#5F3DF4] text-[#5F3DF4] rounded-[8px] text-sm font-medium hover:bg-[#F7F7F7] transition-colors text-center block'
                      >
                        View conversation
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className='w-full mt-6'>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onChange={handlers.onChange}
                    totalData={conversationsResponse?.data?.pagination?.totalItems || 0}
              />
            </div>
              </>
            )}
          </div>
        </Container>
      </div>
    </MainLayout>
  )
}

export default page
