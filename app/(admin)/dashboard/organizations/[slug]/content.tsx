"use client"

import React, { Fragment, useState } from 'react'
import { Container, SelectAltInput } from '@/components/ui'
import { ArrowLeftIcon, BanIcon, BotIcon, BuildingIcon, CalendarIcon, CircleAlert, CircleCheck, EyeOpenIcon, SearchIcon, TrashIcon, TrendUpIcon, UsersIcon, WalletIcon } from '@/components/ui/Icons'
import { cn } from '@/lib/utils'
import { ActivitiesTable } from '@/components/ui/tables'
import Modals from "@/components/ui/dashboard/modals"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDeleteOrganization } from '@/lib/hooks/organization/use-organizations'

const Content = ({ organization, organizationId }: any) => {
    const router = useRouter()
    const deleteOrganizationMutation = useDeleteOrganization()
    const [triggerAgentsModal, setTriggerAgentsModal] = useState(false)
    const [triggerConfirmationModal, setTriggerConfirmationModal] = useState(false)
    const [triggerAlertModal, setTriggerAlertModal] = useState(false)

    const handlers = {
        handleAgentsModal(){
            setTriggerAgentsModal(true)
        },

        handleConfirmationModal(){
            setTriggerConfirmationModal(true)
        },

        handleAlertModal(){
            setTriggerAlertModal(true)
            setTimeout(() => setTriggerConfirmationModal(false), 500)
        },

        handleDeleteOrganization(){
            if (organizationId) {
                deleteOrganizationMutation.mutate(organizationId, {
                    onSuccess: () => {
                        setTriggerConfirmationModal(false)
                        setTimeout(() => {
                            router.push('/dashboard/organizations')
                        }, 1000)
                    }
                })
            }
        }
    }

    const header = organization?.header || {};
    const subscription = organization?.subscription || {};
    const agentsSummary = organization?.agentsSummary || {};
    const activityLog = organization?.activityLog || {};
    const activities = activityLog?.activities || [];

    const items = [
        {
            header: "Industry",
            content: header?.industry || "N/A",
            icon: BuildingIcon
        },
        {
            header: "Onboarded",
            content: header?.onboarded ? new Date(header.onboarded).toLocaleDateString() : "N/A",
            icon: CalendarIcon
        },
        {
            header: "Active Agents",
            content: `${header?.activeAgents || 0} Agents`,
            icon: UsersIcon
        },
        {
            header: "Status",
            content: header?.status || "N/A",
            icon: TrendUpIcon
        },
    ]

    const summary = [
        {
            header: 'Total Agents',
            count: String(agentsSummary?.totalAgents || 0),
            textColor: '#fff',
            bgColor: 'linear-gradient(180deg, #5F3DF4 0%, #833DF4 100%)',
            icon: CircleAlert
        },
        {
            header: 'Active Agents',
            count: String(agentsSummary?.activeAgents || 0),
            textColor: '#169F56',
            bgColor: '#F0FDF4',
            icon: CircleAlert
        },
        {
            header: 'Inactive Agents',
            count: String(agentsSummary?.inactiveAgents || 0),
            textColor: '#5E6775',
            bgColor: '#F7F7F7',
            icon: CircleAlert
        }
    ]

    const tableHeaders = [
        {
            label: "Actor",
            key: "actor"
        },
        {
            label: "Action",
            key: "action"
        },
        {
            label: "Description",
            key: "description"
        },
        {
            label: "Date/Time",
            key: "date"
        }
    ]

    return (
        // <MainLayout>
            <div 
            // className='max-w-[100%] mx-auto pt-36 pb-20'
            className='max-w-[1440px] mx-auto pt-30 md:pt-36 pb-20'
            >
                <Container>
                    <Link 
                    className='inline-flex gap-1 cursor-pointer'
                    href={'/dashboard/organizations'}
                    >
                        <ArrowLeftIcon className='text-[#5E6775] w-6 h-6' />
                        <span className='text-[#5E6775]'>Back</span>
                    </Link>
                    <div className='mt-3'>
                        {/* Info Card */}
                        <div 
                        className='w-full py-8 px-6 rounded-2xl bg-gradient-to-r from-[#5F3DF4] to-[#833DF4] flex flex-col gap-[30px]'
                        >
                            <div className='w-full flex flex-col-reverse gap-4 md:flex-row md:justify-between md:items-center'>
                                <h1 className='text-xl md:text-4xl text-white font-semibold'>{header?.organizationName || "Organization"}</h1>
                                <div 
                                className='w-max h-8 px-2 text-center rounded-[8px] border bg-[#AB99FA73] text-white text-sm flex items-center'
                                >
                                    <p>{subscription?.subTier || subscription?.currentPlan || "N/A"} Plan - Monthly</p>
                                </div>
                            </div>

                            <div className='flex flex-col md:flex-row md:items-center gap-6 md:gap-[100px]'>
                                {
                                    items.map((item, i) => {
                                        const Icon = item.icon
                                        return (
                                            <div key={i} className='flex items-center gap-2'>
                                                {/* icon */}
                                                <div className='size-10 rounded-[8px] bg-[#AB99FA73] flex justify-center items-center'>
                                                    <Icon className='text-white' size={18} />
                                                </div>
                                                <div className='flex flex-col'>
                                                    <span className='text-[#CEC4FB] text-sm'>{item.header}</span>
                                                    <p className='text-white'>{item.content}</p>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </div>

                            <div>
                                <p className='text-white text-sm'>Manage and track all activities for this organization, including their subscriptions, SDR agents, and performance insights</p>
                            </div>
                        </div>

                        <div className='flex flex-col md:flex-row gap-6 md:gap-10 mt-6'>
                            {/* Left card */}
                            <div className='w-full md:w-1/2 bg-white pt-6 px-6 pb-12 rounded-[12px] border border-[#E4E4E4] flex flex-col gap-6'>
                                <div className='flex flex-col gap-2'>
                                    <div className='w-full flex justify-between items-center'>
                                        <div className='flex items-center gap-2'>
                                            <WalletIcon className='text-[#5F3DF3]' />
                                            <p className='text-xl font-medium whitespace-nowrap'>Subscription & Plan</p>
                                        </div>
                                        <div className={cn(
                                            'flex gap-1 py-1.5 px-3 rounded-full',
                                            subscription?.status === 'Active' 
                                                ? 'bg-[#169F56] text-white' 
                                                : 'bg-[#F7F7F7] text-[#5E6775]'
                                        )}>
                                            <CircleCheck className={subscription?.status === 'Active' ? 'text-white' : 'text-[#5E6775]'} />
                                            <p className='text-xs'>{subscription?.status || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <span className='text-[#5E6775] text-sm'>This organization is currently subscribed to the Pro Plan with access to multi-channel SDR agents.</span>
                                    </div>
                                </div>

                                {/* Input */}
                                <div className='flex flex-col gap-4'>
                                    <div className='grid grid-cols-1  md:grid-cols-2 gap-4'>
                                        <div className='flex flex-col bg-[#F7F7F7] py-4 px-3 rounded-[8px]'>
                                            <p className='text-[#5E6775] text-sm'>Current Plan</p>
                                            <p className='font-medium'>{subscription?.currentPlan || "N/A"}</p>
                                        </div>
                                        <div className='flex flex-col bg-[#F7F7F7] py-4 px-3 rounded-[8px]'>
                                            <p className='text-[#5E6775] text-sm'>Sub-tier</p>
                                            <p className='font-medium'>{subscription?.subTier || "N/A"}</p>
                                        </div>
                                    </div>
                                    <div className='w-full flex flex-col bg-[#F7F7F7] py-4 px-3 rounded-[8px]'>
                                        <p className='text-[#5E6775] text-sm'>Next Billing Date</p>
                                        <p className='font-medium'>
                                            {subscription?.nextBillingDate 
                                                ? new Date(subscription.nextBillingDate).toLocaleDateString() 
                                                : "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* Right card */}
                            <div className='w-full md:w-1/2 bg-white pt-6 px-6 pb-12 rounded-[12px] border border-[#E4E4E4] flex flex-col gap-6'>
                                <div className='flex flex-col gap-2'>
                                    <div className='w-full flex justify-between items-center'>
                                        <div className='flex items-center gap-2'>
                                            <BotIcon size={20} className='text-[#5F3DF3]' />
                                            <p className='text-xl font-medium'>SDR Agents Summary</p>
                                        </div>
                                    </div>
                                    <div>
                                        <span className='text-[#5E6775] text-sm'>
                                            Organizations can create multiple SDR agents with different roles (e.g., Email Outreach, Voice Calls, Chat Assistant). 
                                            Track their activity and performance below.
                                        </span>
                                    </div>
                                </div>
                                <div className='flex flex-col md:flex-row gap-6 md:gap-10'>
                                    {
                                        summary.map((item, i) => {
                                            const Icon = item?.icon;
                                            return (
                                                <div 
                                                key={i} 
                                                className='w-full md:w-[250px] h-[100px] rounded-[8px] flex flex-col gap-2 justify-center items-center border'
                                                style={{
                                                    background: item.bgColor,
                                                    color: item.textColor,
                                                    borderColor: item.textColor 
                                                }}>
                                                    
                                                    <div className='flex items-center gap-1'>
                                                        <Icon className={`text-[${item.textColor}]`} size={12} />
                                                        <p className='text-sm'>{item.header}</p>
                                                    </div>
                                                    <h1 className='font-semibold text-3xl'>{item.count}</h1>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                                <div className='w-full'>
                                    <button 
                                    className='w-full flex justify-center items-center gap-2 text-[#5F3DF4] border border-[#5F3DF4] p-3 rounded-[8px] cursor-pointer hover:shadow-md'
                                    onClick={() => handlers.handleAgentsModal()}
                                    >
                                        <EyeOpenIcon className='text-[#5F3DF4]' />
                                        <span>View agent's performance</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className='flex flex-col-reverse md:flex-row md:justify-end gap-6 md:gap-2.5 mt-6'>
                            <button 
                            className='flex justify-center items-center gap-2 border border-[#D00416] text-[#D00416] py-4 md:p-2 rounded-[8px] cursor-pointer hover:shadow-md'
                            onClick={() => handlers.handleConfirmationModal()}
                            >
                                <TrashIcon />
                                <span className='text-sm'>Delete Organization</span>
                            </button>
                            <button className='flex justify-center items-center gap-2 bg-[#5F3DF4] text-white py-4 md:p-2 rounded-[8px] cursor-pointer hover:shadow-md'>
                                <BanIcon />
                                <span className='text-sm'>Suspend Organization</span>
                            </button>
                        </div>

                        {/* Table */}
                        <div className='flex w-full bg-white flex-col gap-6 mt-12 rounded-[12px] md:border py-5 md:p-6'>
                            <div className='flex flex-col md:flex-row gap-6 md:justify-between md:items-center'>
                                <div>
                                    <h1 className='text-xl font-medium'>Activity Log</h1>
                                </div>
                                    {/* Filters */}
                                <div className='flex flex-col md:flex-row md:justify-end gap-4'>
                                    <div 
                                    className='w-full md:w-[350px] flex justify-between items-center border py-3  px-4 rounded-[8px]'>
                                        <span>
                                        {/* <SearchIcon className={cn(isEmpty ? 'text-[#D3D3D3]' : 'text-[#5E6775]')} /> */}
                                        <SearchIcon />
                                        </span>
                                        <input
                                        placeholder='Search by actor'
                                        className={cn(
                                        "w-full px-2 py-0 rounded-lg",
                                        "focus:outline-none placeholder:text-[#5E6775]",
                                        "disabled:opacity-50 disabled:cursor-not-allowed",
                                        // isEmpty ? "placeholder:text-[#D3D3D3]" : "placeholder:text-[#5E6775]"
                                        )}
                                        // disabled={isEmpty && true}
                                        />
                                    </div>
                                    <div>
                                        <SelectAltInput 
                                        options={['Today', 'Last 7 days', 'Last 30 days', 'Last 90 days', 'Last 1 year']} 
                                        isEmpty={false}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className='hidden md:block'>
                                <ActivitiesTable 
                                    tableHeaders={tableHeaders} 
                                    tableData={activities.map((activity: any) => ({
                                        actor: activity.actor,
                                        action: activity.action,
                                        description: activity.description,
                                        date: new Date(activity.dateTime).toLocaleString()
                                    }))} 
                                />
                            </div>
                            <div className='flex gap-4 flex-col md:hidden'>
                                {
                                    activities.map((activity: any, i: number) => {
                                        return (
                                            <div key={i} className='w-full flex flex-col gap-6 py-6 px-4 rounded-[8px] shadow-[0_4px_12px_0_#21212112]'>
                                                <div className='flex justify-between'>
                                                    <p className='text-[#212121]'>Actor</p>
                                                    <p className='text-[#5E6775]'>{activity.actor}</p>
                                                </div>
                                                <div className='flex justify-between'>
                                                    <p className='text-[#212121]'>Action</p>
                                                    <p className='text-[#5E6775]'>{activity.action}</p>
                                                </div>
                                                <div className='flex justify-between'>
                                                    <p className='text-[#212121]'>Description</p>
                                                    <p className='text-[#5E6775]'>{activity.description}</p>
                                                </div>
                                                <div className='flex justify-between'>
                                                    <p className='text-[#212121]'>Date/Time</p>
                                                    <p className='text-[#5E6775]'>{new Date(activity.dateTime).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </Container>

                {/* Agents Details */}
                <Modals.Agents
                open={triggerAgentsModal} 
                setTrigger={setTriggerAgentsModal}
                />

                {/* Delete confirmation */}
                <Modals.Confirmation 
                open={triggerConfirmationModal}
                setTrigger={setTriggerConfirmationModal}
                handlers={handlers}
                organizationName={header?.organizationName}
                isDeleting={deleteOrganizationMutation.isPending}
                />

                 {/* Alert */}
                <Modals.Alert 
                open={triggerAlertModal}
                setTrigger={setTriggerAlertModal}
                />
            </div>
        // </MainLayout>
    )
}

export default Content