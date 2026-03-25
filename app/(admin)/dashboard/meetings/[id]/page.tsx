import React from 'react'
import { MainLayout } from '@/components/layout/dashboard'
import { meetingsData } from '@/lib/data'
import Content from './content'

const Page = async ({ params }: any) => {
    const parameter = await params
    const meetingId = parameter.id;

    const selectedMeeting = meetingsData.find(meeting => meeting.id === meetingId)

    return (
        <MainLayout>
            <Content meeting={selectedMeeting} />
        </MainLayout>
    )
}

export default Page






