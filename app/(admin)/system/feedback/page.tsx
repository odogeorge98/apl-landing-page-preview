"use client";

import React, { useState, useMemo, useEffect } from 'react'
import { MainLayout } from '@/components/layout/dashboard'
import { Container, SelectAltInput } from '@/components/ui'
import { SearchIcon, ElipsisVerticalIcon } from '@/components/ui/Icons'
import { FeedbackTable } from '@/components/ui/tables'
import { feedbackData } from '@/lib/data'
import Pagination from '@/components/ui/Pagination'
import Modals from '@/components/ui/dashboard/modals'
import { useFeedbacks } from '@/lib/hooks/feedback/use-feedbacks'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ActionCard from '@/components/ui/ActionCard'

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

const organizationTableHeaders = [
  {
    label: "Organization Name",
    key: "organizationName"
  },
  {
    label: "Feedback Type",
    key: "feedbackType"
  },
  {
    label: "Subject",
    key: "subject"
  },
  {
    label: "Date",
    key: "date"
  },
  {
    label: "",
    key: "action"
  }
]

const OrganizationFeedbackTable = ({ tableHeaders, tableData, onViewDetails }: any) => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const handlers = {
    handleSelected(item: any) {
      setIsOpen(!isOpen);
      setSelectedRow(() => (isOpen ? null : item));
    },

    getActionItems(data: any) {
      return [
        {
          actionText: "View details",
          loadingText: "loading...",
          link: false,
          trigger: () => {
            if (onViewDetails) {
              onViewDetails(data)
            }
            handlers.handleSelected(data)
          }
        }
      ]
    },
  }

  return (
    <div className='overflow-x-auto w-full max-w-full'>
      <table className='table-fixed md:table-auto w-full max-w-full border-collapse bg-white'>
        <thead>
          <tr className='border-b border-[#E4E4E4]'>
            {tableHeaders.map((header: any) => (
              <th
                key={header.key}
                className="sticky top-0 bg-white z-10 text-start text-sm py-4 px-4 font-semibold text-[#212121]"
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((data: any, index: number) => (
            <tr 
              key={index}
              className="border-b border-[#E4E4E4] text-[#5E6775] text-sm hover:bg-gray-50/50 last:border-b-0"
            >
              <td className='py-4 px-4'>{data.organizationName}</td>
              <td className='py-4 px-4'>
                <span className='px-2 py-1 rounded-full text-xs font-medium bg-[#EEF2FF] text-[#2A239F]'>
                  {data.feedbackType || 'N/A'}
                </span>
              </td>
              <td className='py-4 px-4'>{data.subject || 'N/A'}</td>
              <td className='py-4 px-4'>{data.date}</td>
              <td className='relative py-4 px-4'>
                <ElipsisVerticalIcon
                  className="cursor-pointer text-[#5E6775]"
                  click={() => handlers.handleSelected(data)}
                />
                {selectedRow &&
                isOpen &&
                tableData.indexOf(selectedRow) === index && (
                  <ActionCard 
                    actionItems={handlers.getActionItems(data)}
                    onClose={() => handlers.handleSelected(data)}
                    data={data}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const page = () => {
  const [feedbackType, setFeedbackType] = useState("Meeting")
  const [isEmpty, setIsEmpty] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRating, setSelectedRating] = useState("All rating")
  const [selectedFeedbackType, setSelectedFeedbackType] = useState("All Types")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null)

  useEffect(() => {
    setCurrentPage(1);
  }, [feedbackType]);

  const { data: organizationFeedbacksResponse, isLoading: isLoadingOrganization } = useFeedbacks({
    page: currentPage,
    limit: itemsPerPage,
    search: feedbackType === "Organization" ? (searchQuery || undefined) : undefined,
    feedbackType: feedbackType === "Organization" && selectedFeedbackType !== "All Types" ? selectedFeedbackType : undefined,
  });
  
  const meetingFilteredData = feedbackData.filter(item => {
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
  
  const meetingTotalPages = Math.ceil(meetingFilteredData.length / itemsPerPage)
  const meetingStartIndex = (currentPage - 1) * itemsPerPage
  const meetingEndIndex = meetingStartIndex + itemsPerPage
  const meetingPaginatedData = meetingFilteredData.slice(meetingStartIndex, meetingEndIndex)

  const organizationFeedbacks = organizationFeedbacksResponse?.data?.feedbacks || [];
  const organizationTotalPages = organizationFeedbacksResponse?.data?.pagination?.totalPages || 1;

  const organizationTableData = useMemo(() => {
    return organizationFeedbacks.map(feedback => ({
      id: feedback.id,
      organizationName: feedback.organization.name,
      feedbackType: feedback.feedbackType,
      subject: feedback.subject,
      message: feedback.message,
      date: new Date(feedback.createdAt).toLocaleDateString(),
      organization: feedback.organization,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt,
    }));
  }, [organizationFeedbacks]);

  const handlers = {
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
      setItemsPerPage(Number(e.target.value))
      setCurrentPage(1)
    }
  }

  const totalFeedback = feedbackType === "Meeting" 
    ? feedbackData.length 
    : (organizationFeedbacksResponse?.data?.pagination?.totalItems || 0);
  const positiveFeedback = feedbackType === "Meeting"
    ? feedbackData.filter(item => item.rating >= 4 && item.rating <= 6).length
    : 0;
  const negativeFeedback = feedbackType === "Meeting"
    ? feedbackData.filter(item => item.rating >= 1 && item.rating <= 3).length
    : 0;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        width="16"
        height="16"
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
    <MainLayout>
      <div className='max-w-[1440px] mx-auto pt-36 pb-20'>
        <Container>
          <div className='w-full mb-6'>
            <div className='w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
              <h1 className='text-[18px] md:text-[28px] font-semibold text-[#212121]'>Feedback</h1>
              <div className='w-full md:w-[200px]'>
                <SelectAltInput 
                  options={['Meeting', 'Organization']} 
                  isEmpty={false} 
                  value={feedbackType}
                  onChange={(e) => {
                    setFeedbackType(e.target.value);
                    setCurrentPage(1);
                    setSearchQuery("");
                    setSelectedRating("All rating");
                    setSelectedFeedbackType("All Types");
                  }}
                  className="h-[46px]"
                />
              </div>
            </div>
            
            {/* Stats Cards - Only show for Meeting feedback */}
            {feedbackType === "Meeting" && (
              <div className='w-full flex flex-col md:flex-row gap-4 mb-6'>
                <div className='flex-1 bg-white border border-[#E4E4E4] rounded-[12px] p-6'>
                  <div className='flex flex-col gap-2'>
                    <span className='text-sm text-[#5E6775]'>Total Feedback</span>
                    <span className='text-2xl font-semibold text-[#212121]'>{totalFeedback.toLocaleString()}</span>
                  </div>
                </div>
                <div className='flex-1 bg-white border border-[#E4E4E4] rounded-[12px] p-6'>
                  <div className='flex flex-col gap-2'>
                    <span className='text-sm text-[#5E6775]'>Positive Feedback</span>
                    <div className='flex items-center gap-2'>
                      <span className='text-2xl font-semibold text-[#212121]'>{positiveFeedback.toLocaleString()}</span>
                      <div className='flex items-center gap-1'>
                        <span className='text-[#FFD700] text-xs'>★</span>
                        <span className='text-xs text-[#5E6775]'>4-6 stars</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='flex-1 bg-white border border-[#E4E4E4] rounded-[12px] p-6'>
                  <div className='flex flex-col gap-2'>
                    <span className='text-sm text-[#5E6775]'>Negative Feedback</span>
                    <div className='flex items-center gap-2'>
                      <span className='text-2xl font-semibold text-[#212121]'>{negativeFeedback.toLocaleString()}</span>
                      <div className='flex items-center gap-1'>
                        <span className='text-[#FFD700] text-xs'>★</span>
                        <span className='text-xs text-[#5E6775]'>1-3 stars</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Search and Filter */}
            <div className='w-full flex flex-col md:flex-row gap-4 mb-6'>
              <div className='flex-1 relative'>
                <SearchIcon
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-[#5E6775] w-5 h-5 pointer-events-none'
                />
                <input
                  type="text"
                  placeholder={feedbackType === "Meeting" ? "Search by company or agent names" : "Search by organization, subject, or message"}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className='w-full h-[46px] px-4 pl-10 pr-4 border border-[#D5D9DE] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#5F3DF4] focus:border-transparent text-sm'
                />
              </div>
              {feedbackType === "Meeting" ? (
                <div className='w-full md:w-[200px]'>
                  <SelectAltInput 
                    options={['All rating', '5 star rating', '4 star rating', '3 star rating', '2 star rating', '1 star rating']} 
                    isEmpty={isEmpty} 
                    value={selectedRating}
                    onChange={(e) => {
                      setSelectedRating(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-[46px]"
                  />
                </div>
              ) : (
                <div className='w-full md:w-[200px]'>
                  <SelectAltInput 
                    options={['All Types', 'FEATURE_REQUEST', 'BUG_REPORT', 'GENERAL_FEEDBACK', 'OTHER']} 
                    isEmpty={isEmpty} 
                    value={selectedFeedbackType}
                    onChange={(e) => {
                      setSelectedFeedbackType(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-[46px]"
                  />
                </div>
              )}
            </div>

            {/* Table */}
            {feedbackType === "Meeting" ? (
              <>
                <div className='w-full bg-white p-6'>
                  <FeedbackTable 
                    tableData={meetingPaginatedData} 
                    tableHeaders={tableHeaders}
                    onViewDetails={(data) => {
                      setSelectedFeedback(data)
                      setShowFeedbackModal(true)
                    }}
                  />
                </div>
                
                <div className='w-full mt-6'>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={meetingTotalPages}
                    setCurrentPage={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    onChange={handlers.onChange}
                    totalData={meetingFilteredData.length}
                  />
                </div>
              </>
            ) : (
              <>
                {isLoadingOrganization ? (
                  <div className='w-full bg-white p-6 flex justify-center items-center min-h-[400px]'>
                    <LoadingSpinner />
                  </div>
                ) : (
                  <>
                    <div className='w-full bg-white p-6'>
                      <OrganizationFeedbackTable 
                        tableData={organizationTableData} 
                        tableHeaders={organizationTableHeaders}
                        onViewDetails={(data: any) => {
                          setSelectedFeedback(data)
                          setShowFeedbackModal(true)
                        }}
                      />
                    </div>
                    
                    <div className='w-full mt-6'>
                      <Pagination
                        currentPage={currentPage}
                        totalPages={organizationTotalPages}
                        setCurrentPage={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        onChange={handlers.onChange}
                        totalData={organizationFeedbacksResponse?.data?.pagination?.totalItems || 0}
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </Container>
      </div>

      {/* Feedback Detail Modal */}
      <Modals.FeedbackDetail 
        open={showFeedbackModal} 
        setTrigger={setShowFeedbackModal}
        feedback={selectedFeedback}
      />
    </MainLayout>
  )
}

export default page

