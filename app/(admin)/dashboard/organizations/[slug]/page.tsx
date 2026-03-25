"use client"

import React from 'react'
import { MainLayout } from '@/components/layout/dashboard'
import Content from './content'
import { useOrganizationById } from '@/lib/hooks/organization/use-organizations'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const Page = ({ params }: any) => {
    const organizationId = params?.slug || params?.id;
    
    const { data: organizationResponse, isLoading } = useOrganizationById(organizationId);
    
    const organization = organizationResponse?.data;

    if (isLoading) {
        return (
            <MainLayout>
                <div className='flex justify-center items-center min-h-[400px]'>
                    <LoadingSpinner />
                </div>
            </MainLayout>
        )
    }

    if (!organization) {
        return (
            <MainLayout>
                <div className='max-w-[1440px] mx-auto pt-36 pb-20'>
                    <div className='text-center py-20'>
                        <p className='text-[#5E6775]'>Organization not found</p>
                    </div>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <Content organization={organization} organizationId={organizationId} />
        </MainLayout>
    )
}

export default Page