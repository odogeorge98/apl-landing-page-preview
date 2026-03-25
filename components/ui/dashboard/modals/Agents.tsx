"use client"

import React, { useState } from 'react'
import { Modal } from '../../Modal'
import { CircleCheck } from '../../Icons'
import { IModal } from '@/lib/interfaces/organisation'
import { cn } from '@/lib/utils'


const agents = [
    {
        label: "Agent 1",
        value: "one"
    },
    {
        label: "Agent 2",
        value: "two"
    },
    {
        label: "Agent 3",
        value: "three"
    },
    {
        label: "Agent 4",
        value: "four"
    },
    {
        label: "Agent 5",
        value: "five"
    }
]
const Agents = ({ open, setTrigger}: IModal) => {
    const [activeState, setActiveState] = useState("one")

    const handlers = {
        handleSwitch(screen: string){
            setActiveState(screen)
        },
        onClose() {
            // Close modal
            setTrigger(false);
        },
    }
  return (
    <Modal
    size="2xl"
    open={open}
    onOpenChange={() => handlers.onClose()}
    title="Organization Agents"
    headerTitleCss="hidden"
    >
        <div className='w-full bg-[#F7F7F8] text-sm flex justify-between text-[#5E6775] overflow-x-auto'>
            {
                agents.map((agent, i) => (
                    <div 
                    onClick={() => handlers.handleSwitch(agent.value)}
                    className={cn(
                        'w-1/5 cursor-pointer p-3 text-sm text-center transition-all duration-200 ease-in-out font-normal whitespace-nowrap',
                        activeState === agent.value && "bg-white text-[#212121] rounded-sm shadow-[0_4px_8px_0_#21212114] font-medium whitespace-nowrap"
                    )}
                    key={i}
                    >
                        <p>{agent.label}</p>
                    </div>
                ))
            }
        </div>

        {/* Info */}
        <div className='flex flex-col gap-4 text-sm'>
            <div className='flex justify-between'>
                <p className='text-[#5E6775]'>Name</p>
                <p>Agent Sarah - Inbound SDR</p>
            </div>
            <div className='flex justify-between'>
                <p className='text-[#5E6775]'>Leads Handled</p>
                <p>120</p>
            </div>
            <div className='flex justify-between'>
                <p className='text-[#5E6775]'>Meetings Booked</p>
                <p>100</p>
            </div>
            <div className='flex justify-between whitespace-nowrap overflow-x-auto custom-table'>
                <p className='text-[#5E6775]'>Statistics</p>
                <p className='max-w-[250px] md:max-w-full'>Qualified: <span className='text-[#169F56]'>65</span> | Unqualified: <span className='text-[#CB1616]'>45</span> | In Progress: <span className='text-[#C17B1F]'>10</span></p>
            </div>
            <div className='flex justify-between'>
                <p className='text-[#5E6775]'>Status</p>
                <div className='flex items-center gap-1 bg-[#169F56] text-white py-1.5 px-3 rounded-full'>
                    <CircleCheck />
                    <p>Active</p>
                </div>
            </div>
            <div className='flex items-center gap-1 text-[#169F56]'>
                <CircleCheck className='text-[#169F56]' />
                <p>Specialized in inbound qualification and demo scheduling</p>
            </div>
        </div>
    </Modal>
  )
}

export default Agents