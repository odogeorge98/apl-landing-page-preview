"use client";

import React, { useState } from 'react'
import Modals from "@/components/ui/dashboard/modals"

const User = () => {
    const [triggerModal, setTriggerModal] = useState(false)

    return (
        <section className='w-full'>
            <div className='container'>
                <div className='flex flex-col gap-10'>
                    <div>
                        <h1 className='text-2xl font-medium'>User Management</h1>
                    </div>
                    <div className='flex flex-col gap-10'>
                        <div className='flex justify-between'>
                            <div className='flex flex-col gap-2'>
                                <h3 className='font-medium'>Organization Invites</h3>
                                <span className='text-[#858585] text-sm'>Manage invitations for new organizations.</span>
                            </div>
                            <div>
                                <button 
                                className='py-2 px-6 cursor-pointer bg-[#F7F7F7] border border-[#E4E4E4] rounded-[8px] hover:shadow-[0_2px_24px_#E4E4E4]'
                                onClick={() => setTriggerModal(true)}
                                >
                                    Send Invite
                                </button>
                            </div>
                        </div>

                        <div className='flex justify-between'>
                            <div className='flex flex-col gap-2'>
                                <h3 className='font-medium'>Team Members</h3>
                                <span className='text-[#858585] text-sm'>Manage user access and permissions</span>
                            </div>
                            <div>
                                <button className='py-2 px-6 cursor-pointer bg-[#F7F7F7] border border-[#E4E4E4] rounded-[8px] hover:shadow-[0_2px_24px_#E4E4E4]'>Manage</button>
                            </div>
                        </div>

                        <div className='flex justify-between'>
                            <div className='flex flex-col gap-2'>
                                <h3 className='font-medium'>Role Permissions</h3>
                                <span className='text-[#858585] text-sm'>Configure what each role can access and modify</span>
                            </div>
                            <div>
                                <button className='py-2 px-6 cursor-pointer bg-[#F7F7F7] border border-[#E4E4E4] rounded-[8px] hover:shadow-[0_2px_24px_#E4E4E4]'>Configure Roles</button>
                            </div>
                        </div>

                        <div className='flex justify-between'>
                            <div className='flex flex-col gap-2'>
                                <h3 className='font-medium'>Single Sign-On (SSO)</h3>
                                <span className='text-[#858585] text-sm'>Enable SAML or OAuth integration for team login</span>
                            </div>
                            <div>
                                <button className='py-2 px-6 cursor-pointer bg-[#F7F7F7] border border-[#E4E4E4] rounded-[8px] hover:shadow-[0_2px_24px_#E4E4E4]'>Setup SSO</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Modals.Invite 
            open={triggerModal} 
            setTrigger={setTriggerModal}
            />
        </section>
    )
}

export default User