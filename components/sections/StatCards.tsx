import { cn } from '@/lib/utils'
import React from 'react'

interface IStats {
    item: {
        title: string;
        emptyBalance: string;
        nonEmptyBalance: string;
        emptyPercentage: string;
        nonEmptyPercentage: string;
        direction: string;
        type?: string;
        icon: React.FC;
        showIcon?: boolean;
        suffix?: string;
    },
    isEmpty: boolean;
    Icon: any
}
const StatCard = ({ item, isEmpty, Icon }: IStats) => {
  const showIcon = item.showIcon !== false;
  const suffix = item.suffix || "vs last month";
  
  return (
    <div key={item.title} className='w-full border border-[#D5D9DE] gap-4 flex flex-col rounded-2xl p-4'>
        <span className='text-sm text-[#5E6775]'>
            {item.title}
        </span>
        <h1 
        className='font-bold text-4xl'>
            {item.type === "amount" ?  
            `₦${isEmpty ? item.emptyBalance : item.nonEmptyBalance}` : 
            isEmpty ? item.emptyBalance : item.nonEmptyBalance}
        </h1>
        <div className={'text-sm text-[#5E6775] inline-flex'}>
            {showIcon && (
                <span className='mt-1 mr-1'>
                    <Icon 
                    className={
                        cn('text-[#3D3D3D]', 
                        !isEmpty && item.direction === "progress" ? 
                        'text-[#15803D]' : !isEmpty && item.direction === "decline" && 'text-[#CB1616]'
                    )} />
                </span>
            )}
            <span 
            className={
                cn(showIcon && 'mr-1.5', showIcon && !isEmpty && item.direction === "progress" ? 
                'text-[#15803D]' : showIcon && !isEmpty && item.direction === "decline" && 
                'text-[#CB1616]'
            )}>
                {isEmpty ? item.emptyPercentage : item.nonEmptyPercentage}
            </span>
            {suffix && <span>{suffix}</span>}
        </div>
    </div>
  )
}

export default StatCard