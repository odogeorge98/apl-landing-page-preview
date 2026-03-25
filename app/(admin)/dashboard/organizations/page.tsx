"use client"

import { MainLayout } from '@/components/layout/dashboard'
import StatCard from '@/components/sections/StatCards'
import { Container, SelectAltInput } from '@/components/ui'
import { ArrowDownIcon, ArrowUpIcon, BadgeIcon, DownloadIcon, SearchIcon } from '@/components/ui/Icons'
import { cn, downloadExcel } from '@/lib/utils'
import React, { Fragment, useState } from 'react'
import { InvitesTable, OrganizationsTable } from '@/components/ui/tables'
import { organizationsData } from '@/lib/data'
import Pagination from '@/components/ui/Pagination'
import { useInvitations, useResendInvite, useDeleteInvite } from "@/lib/hooks/organization/use-invitations";
import { useOrganizationsDashboard } from "@/lib/hooks/organization/use-organizations";
import { transformInvitationsToTableData } from '@/lib/utils/orgInvitation'
import { InvitationsMobileCard, OrganizationsMobileCard } from '@/components/ui/cards'
import Modals from "@/components/ui/dashboard/modals"
import { useMemo, useEffect } from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const invitesTableHeaders = [
  {
    label: "Email",
    key: "email",
  },
  {
    label: "Role",
    key: "role",
  },
  {
    label: "Org Role",
    key: "orgRole",
  },
  {
    label: "Status",
    key: "status",
  },
  {
    label: "Created Date",
    key: "createdAt",
  },
  {
    label: "Expires At",
    key: "expiresAt",
  },
  // {
  //   label: "Action",
  //   key: "action"
  // }
];

const tableHeaders = [
  {
    label: "Organization Name",
    key: "name"
  },
  {
    label: "Industry",
    key: "industry"
  },
  {
    label: "Sub Tier",
    key: "tier"
  },
  {
    label: "Account Status",
    key: "status"
  },
  {
    label: "Onboarded Date",
    key: "onboardingDate"
  },
  {
    label: "Last Active",
    key: "lastActive"
  },
  {
    label: "Action",
    key: "action"
  }
]

const page = () => {
  const [activeState, setActiveState] = useState('list')
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [triggerInviteModal, setTriggerInviteModal] = useState(false)
  const [status, setStatus] = useState<string>('')
  const [invitationStatus, setInvitationStatus] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [dateFilter, setDateFilter] = useState<string>('Last 30 days')

  useEffect(() => {
    setCurrentPage(1);
  }, [status, invitationStatus, searchQuery]);

  // Fetch organizations - used for both stats cards and table when activeState is 'list'
  // NO PERIOD PARAMETER - period is handled on backend for stats calculation
  const {
    data: organizationsResponse,
    isLoading: isLoadingOrganizations,
  } = useOrganizationsDashboard({
    page: activeState === 'list' ? currentPage : 1,
    limit: activeState === 'list' ? itemsPerPage : 1,
    status: activeState === 'list' ? (status || undefined) : undefined,
    search: activeState === 'list' ? (searchQuery || undefined) : undefined,
  });

  const organizations = organizationsResponse?.data?.organizations || [];
  const totalPages = organizationsResponse?.data?.pagination?.totalPages || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const stats = useMemo(() => {
    const statsData = organizationsResponse?.data?.statistics;
    if (!statsData) {
      return [
        {
          title: "Total Organizations Onboarded",
          emptyBalance: "0",
          nonEmptyBalance: "0",
          emptyPercentage: "0%",
          nonEmptyPercentage: "0%",
          direction: "progress",
          icon: ArrowUpIcon
        },
        {
          title: "Total Active Organizations",
          emptyBalance: "0",
          nonEmptyBalance: "0",
          emptyPercentage: "0%",
          nonEmptyPercentage: "0%",
          direction: "progress",
          icon: ArrowUpIcon
        },
        {
          title: "Total Inactive Organizations",
          emptyBalance: "0",
          nonEmptyBalance: "0",
          emptyPercentage: "0%",
          nonEmptyPercentage: "0%",
          direction: "progress",
          icon: ArrowDownIcon
        }
      ];
    }

    const statistics = organizationsResponse.data.statistics;
    const formatNumber = (num: number) => num.toLocaleString();
    const formatPercentage = (change: number) => `${change >= 0 ? '' : ''}${Math.abs(change)}%`;

    return [
      {
        title: "Total Organizations Onboarded",
        emptyBalance: "0",
        nonEmptyBalance: formatNumber(statistics.totalOrganizationsOnboarded.value),
        emptyPercentage: "0%",
        nonEmptyPercentage: formatPercentage(statistics.totalOrganizationsOnboarded.change),
        direction: statistics.totalOrganizationsOnboarded.isPositive ? "progress" : "decline",
        icon: statistics.totalOrganizationsOnboarded.isPositive ? ArrowUpIcon : ArrowDownIcon
      },
      {
        title: "Total Active Organizations",
        emptyBalance: "0",
        nonEmptyBalance: formatNumber(statistics.totalActiveOrganizations.value),
        emptyPercentage: "0%",
        nonEmptyPercentage: formatPercentage(statistics.totalActiveOrganizations.change),
        direction: statistics.totalActiveOrganizations.isPositive ? "progress" : "decline",
        icon: statistics.totalActiveOrganizations.isPositive ? ArrowUpIcon : ArrowDownIcon
      },
      {
        title: "Total Inactive Organizations",
        emptyBalance: "0",
        nonEmptyBalance: formatNumber(statistics.totalInactiveOrganizations.value),
        emptyPercentage: "0%",
        nonEmptyPercentage: formatPercentage(statistics.totalInactiveOrganizations.change),
        direction: statistics.totalInactiveOrganizations.isPositive ? "progress" : "decline",
        icon: statistics.totalInactiveOrganizations.isPositive ? ArrowUpIcon : ArrowDownIcon
      }
    ];
  }, [organizationsResponse]); 

  // Only fetch invitations when activeState is 'invites'
  const {
    data: invitationsResponse,
    isLoading: isLoadingInvitations,
    error,
  } = useInvitations({
    page: currentPage,
    limit: itemsPerPage,
    status: activeState === 'invites' && invitationStatus ? invitationStatus.toUpperCase() : undefined,
  }, {
    enabled: activeState === 'invites'
  });

    const tableData = invitationsResponse?.data?.invitations
        ? transformInvitationsToTableData(invitationsResponse.data.invitations)
        : [];
  
    // Use API pagination data
    const totalInvitationPages = invitationsResponse?.data?.pagination?.totalPages || 1;
    const paginatedData = tableData;

    const resendInviteMutation = useResendInvite();
    const deleteInviteMutation = useDeleteInvite();

    /** End of Invitations pagination */

  const handlers = {
    handleActiveState(state: string){
      setActiveState(state)
      setCurrentPage(1)
    },

    onChange(e: React.ChangeEvent<HTMLSelectElement>) {
      setItemsPerPage(Number(e.target.value));
      setCurrentPage(1);
    },

    handleResendInvite(email: string){
      resendInviteMutation.mutate({ email });
    }, 

    handleDeleteInvite(id: string) {
      deleteInviteMutation.mutate(id);
    },

    isResending(email: string){
      return resendInviteMutation.isPending;
    },

    isDeleting(id: string){
      return deleteInviteMutation.isPending;
    }
  }

  return (
    <MainLayout>
        <div className='max-w-[1440px] mx-auto pt-36 pb-20'>
          <Container>
            <div className='w-full flex gap-2 justify-between'>
              <div className='flex items-center'>
                <h1 className='text-[18px] md:text-[28px] font-semibold'>Organizations</h1>
              </div>
              <div className='flex gap-2'>
                <div>
                  <SelectAltInput 
                    options={['Last Month', 'Last 30 days', 'Last 60 days', 'Last 90 days', 'Last 1 year']} 
                    isEmpty={false} 
                    className='p-2.5'
                    value={dateFilter}
                    onChange={(e) => {
                      setDateFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <div>
                  <button 
                    className='hidden md:inline-flex justify-center gap-1 py-2 px-3 border border-[#5F3DF4] rounded-[8px] cursor-pointer hover:shadow-2xl'
                    onClick={() => downloadExcel({ 
                      tableData: activeState === "list" ? organizationsData : paginatedData, 
                      tableHeaders: activeState === "list" ? tableHeaders : invitesTableHeaders, 
                      page: activeState 
                    })}
                  >
                    <span className='flex justify-center items-center'>
                      <DownloadIcon size={18} className='text-[#5F3DF4]' />
                    </span>
                    <span className='text-[#5F3DF4]'>Export</span>
                  </button>
                </div>
              </div>
            </div>
            {/* Only shows on mobile */}
            <div className='md:hidden flex flex-col gap-4 mt-[20px]'>
              <div>
                <button 
                  className='inline-flex w-full justify-center gap-1 py-2 px-3 border border-[#5F3DF4] rounded-[8px] cursor-pointer hover:shadow-2xl'
                  onClick={() => downloadExcel({ 
                    tableData: activeState === "list" ? organizationsData : paginatedData, 
                    tableHeaders: activeState === "list" ? tableHeaders : invitesTableHeaders, 
                    page: activeState 
                  })}
                >
                  <span className='flex justify-center items-center'>
                    <DownloadIcon size={18} className='text-[#5F3DF4]' />
                  </span>
                  <span className='text-[#5F3DF4]'>Export</span>
                </button>
              </div>
            </div>
            <div className='mt-[20px] md:mt-10'>
              {/* Stats Cards */}
              <div className='w-full flex flex-col md:flex-row gap-4'>
                {
                  stats.map(item => {
                    const Icon = item.icon
                    return (
                      <Fragment key={item.title}>
                        <StatCard item={item} isEmpty={false} Icon={Icon} />
                      </Fragment>
                    )
                  })
                }
              </div>

              {/* Filters */}
              <div className='w-full mt-8'>
                <div className='flex flex-col md:flex-row justify-between'>
                  {/* Switches */}
                  <div className={cn(
                    'bg-[#F7F7F8] text-sm flex text-[#5E6775] w-max h-[46px]',
                    activeState === "list" ? "rounded-r-sm" : "rounded-l-sm"
                    )}>
                    <div className={cn(
                      'h-[46px] px-2 md:px-8 cursor-pointer transition-all duration-200 ease-in-out whitespace-nowrap flex items-center justify-center',
                      activeState === 'list' && 'bg-white text-[#212121] rounded-sm shadow-[0_4px_8px_0_#21212114] px-6 font-medium')}
                      onClick={() => handlers.handleActiveState("list")}
                      >
                      <p className="whitespace-nowrap">Organization List</p>
                    </div>
                    <div className={cn(
                      'h-[46px] px-2 md:px-8 cursor-pointer transition-all duration-200 ease-in-out whitespace-nowrap flex items-center justify-center',
                      activeState === 'invites' && 'bg-white text-[#212121] rounded-sm shadow-[0_4px_8px_0_#21212114] px-6 font-medium')}
                      onClick={() => handlers.handleActiveState("invites")}
                      >
                      <p className="whitespace-nowrap">Organization Invites</p>
                    </div>
                  </div>
                  {/* Dropdown */}
                  <div className='flex md:flex-row gap-4'>
                    <div 
                    className='w-full md:w-[350px] flex justify-between items-center border py-3 md:py-0 px-2 rounded-sm mt-10 md:mt-0'
                    >
                      <span>
                        <SearchIcon className='text-[#5E6775]' />
                      </span>
                      <input
                      placeholder='Search by organization name, industry'
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "w-full px-2 py-0 rounded-lg",
                        "focus:outline-none",
                        "placeholder:text-[#5E6775]"
                      )}
                      />
                    </div>
                    <div className='flex gap-4'>
                      {activeState === 'list' ? (
                        <SelectAltInput 
                          options={['All', 'ACTIVE', 'SUSPENDED']} 
                          isEmpty={false} 
                          className='h-[46px] py-0 px-3 sm:w-full'
                          value={status || 'All'}
                          onChange={(e) => {
                            setStatus(e.target.value === 'All' ? '' : e.target.value.toUpperCase());
                            setCurrentPage(1);
                          }}
                        />
                      ) : (
                        <SelectAltInput 
                          options={['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED']} 
                          isEmpty={false} 
                          className='h-[46px] py-0 px-3 sm:w-full'
                          value={invitationStatus}
                          onChange={(e) => {
                            setInvitationStatus(e.target.value === 'All' ? '' : e.target.value.toUpperCase());
                            setCurrentPage(1);
                          }}
                        />
                      )}
                      <button
                        onClick={() => setTriggerInviteModal(true)}
                        className='w-full md:w-[200px] h-[46px] px-4 rounded-sm text-sm font-medium transition-colors flex items-center justify-center whitespace-nowrap bg-[#5F3DF4] text-white hover:bg-[#4d2fd4] cursor-pointer'
                      >
                        Invite Organisation
                      </button>
                    </div>
                    {/* <div>
                      <SelectAltInput options={['Status', 'Active', 'Suspended', 'Deleted', 'Ended']} isEmpty={isEmpty} className='p-3' />
                    </div> */}
                    {/* <div>
                      <SelectAltInput options={['Subscription Tier', 'Basic', 'Pro', 'Enterprise']} isEmpty={isEmpty} className='md:w-[200px] p-3' />
                    </div> */}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="w-full bg-white rounded-xl p-0 md:p-5">
                <Fragment>
                      <div className='hidden md:block mt-5'>
                        {
                          isLoadingOrganizations && activeState === "list" ? (
                            <div className='flex justify-center items-center min-h-[200px]'>
                              <LoadingSpinner />
                            </div>
                          ) : isLoadingInvitations && activeState === "invites" ? (
                            <div className='flex justify-center items-center min-h-[200px]'>
                              <LoadingSpinner />
                            </div>
                          ) : activeState === "list" ? (
                            organizations.length > 0 ? (
                              <OrganizationsTable 
                                tableData={organizations.map(org => ({
                                  name: org.organizationName,
                                  industry: org.industry,
                                  tier: org.subTier,
                                  status: org.accountStatus,
                                  onboardingDate: new Date(org.onboardedDate).toLocaleDateString(),
                                  lastActive: new Date(org.lastActive).toLocaleDateString(),
                                  id: org.id,
                                }))} 
                                tableHeaders={tableHeaders} 
                              />
                            ) : (
                              <div className='flex justify-center items-center min-h-[200px]'>
                                <p className='text-[#5E6775]'>No organizations found</p>
                              </div>
                            )
                          ) : (
                            paginatedData.length > 0 ? (
                              <InvitesTable
                                tableHeaders={invitesTableHeaders}
                                tableData={paginatedData}
                                className="w-[100%]"
                                onResend={handlers.handleResendInvite}
                                onDelete={handlers.handleDeleteInvite}
                                isResending={handlers.isResending}
                                isDeleting={handlers.isDeleting}
                              />
                            ) : (
                              <div className='flex justify-center items-center min-h-[200px]'>
                                <p className='text-[#5E6775]'>No invitations found</p>
                              </div>
                            )
                          )
                        }
                        {((activeState === "list" && organizations.length > 0) || (activeState === "invites" && paginatedData.length > 0)) && (
                          <Pagination
                            currentPage={currentPage}
                            totalPages={activeState === "list" ? totalPages : totalInvitationPages}
                            setCurrentPage={setCurrentPage}
                            itemsPerPage={itemsPerPage}
                            onChange={(e) => handlers.onChange(e)}
                            totalData={activeState === "list" ? (organizationsResponse?.data?.pagination?.totalItems || 0) : (invitationsResponse?.data?.pagination?.totalItems || 0)}
                          />
                        )}
                      </div>

                      {/* This only shows on mobile */}
                      {
                        activeState === "list" ? 
                        (organizations.length > 0 ? (
                          <OrganizationsMobileCard data={organizations.map(org => ({
                            name: org.organizationName,
                            industry: org.industry,
                            tier: org.subTier,
                            status: org.accountStatus,
                            onboardingDate: new Date(org.onboardedDate).toLocaleDateString(),
                            lastActive: new Date(org.lastActive).toLocaleDateString(),
                            id: org.id,
                          }))} />
                        ) : (
                          <div className='flex justify-center items-center min-h-[200px]'>
                            <p className='text-[#5E6775]'>No organizations found</p>
                          </div>
                        )) : 
                        (paginatedData.length > 0 ? (
                          <InvitationsMobileCard data={paginatedData} />
                        ) : (
                          <div className='flex justify-center items-center min-h-[200px]'>
                            <p className='text-[#5E6775]'>No invitations found</p>
                          </div>
                        ))
                      }
                </Fragment>
              </div>
            </div>
          </Container>
        </div>
        {/* Invite Organization Modal */}
        <Modals.Invite
          open={triggerInviteModal}
          setTrigger={setTriggerInviteModal}
        />
    </MainLayout>
  )
}

export default page