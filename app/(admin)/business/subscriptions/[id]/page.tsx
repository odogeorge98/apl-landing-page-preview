"use client";

import React from 'react'
import { MainLayout } from '@/components/layout/dashboard'
import Content from './content'
import { useParams } from 'next/navigation'
import { useOrganizationSubscriptions } from '@/lib/hooks/subscription/use-subscriptions'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const Page = () => {
  const params = useParams()
  const organizationId = params?.id as string

  const { data: organizationSubscriptionsResponse, isLoading: isLoadingHistory } = useOrganizationSubscriptions(
    organizationId,
    { page: 1, limit: 10 }
  );

  const organizationSubscriptions = organizationSubscriptionsResponse?.data?.subscriptions || [];
  const firstSubscription = organizationSubscriptions[0];

  if (isLoadingHistory) {
    return (
      <MainLayout>
        <div className='max-w-[1440px] mx-auto pt-36 pb-20'>
          <div className='flex justify-center items-center min-h-[400px]'>
            <LoadingSpinner />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!firstSubscription) {
    return (
      <MainLayout>
        <div className='max-w-[1440px] mx-auto pt-36 pb-20'>
          <div className='text-center py-20'>
            <p className='text-[#5E6775]'>No subscriptions found for this organization</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const subscriptionData = {
    id: firstSubscription.id,
    organizationName: firstSubscription.organization.name,
    subscriptionType: firstSubscription.subscriptionPlan.name,
    currentPlan: firstSubscription.subscriptionPlan.name,
    status: firstSubscription.status,
    organizationId: firstSubscription.organization.id,
  };

  return (
    <MainLayout>
      <Content 
        subscription={subscriptionData} 
        organizationSubscriptions={organizationSubscriptions}
        isLoadingHistory={isLoadingHistory}
      />
    </MainLayout>
  )
}

export default Page






