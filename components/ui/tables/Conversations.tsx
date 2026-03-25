"use client";

import { ITable } from '@/lib/interfaces'
import { cn } from '@/lib/utils'
import React, { useState } from 'react'
import { ElipsisVerticalIcon } from '../Icons'
import ActionCard from '../ActionCard'
import Link from 'next/link'

const Conversations = ({ tableHeaders, tableData, className }: ITable) => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const handlers = {
    handleSelected(item: any) {
      setIsOpen(!isOpen);
      setSelectedRow(() => (isOpen ? null : item));
    },

    getQualificationStatusBadgeClass(status: string) {
      if (status === "Qualified") {
        return "bg-[#F0FDF4] text-[#0E5831]";
      } else if (status === "Not qualified") {
        return "bg-[#FDF0F0] text-[#CB1616]";
      } else if (status === "Pending") {
        return "bg-[#FBF3E9] text-[#C17B1F]";
      }
      return "bg-[#F7F7F7] text-[#5E6775]";
    },

    getMeetingStatusBadgeClass(status: string) {
      if (status === "Active") {
        return "bg-[#F0FDF4] text-[#0E5831]";
      } else if (status === "Deleted") {
        return "bg-[#FDF0F0] text-[#CB1616]";
      } else if (status === "Suspended" || status === "Ended") {
        return "bg-[#FBF3E9] text-[#C17B1F]";
      }
      return "bg-[#F7F7F7] text-[#5E6775]";
    },

    getActionItems(data: any) {
      return [
        {
          actionText: "View conversation",
          loadingText: "Loading...",
          link: true,
          href: `/dashboard/conversations/${data.id || '1'}`,
          color: "#212121"
        }
      ]
    }
  }

  return (
    <div className='overflow-x-auto w-full max-w-full'>
      <table className='table-fixed md:table-auto w-full max-w-full border-collapse'>
        <thead>
          <tr className='border-b border-[#E4E4E4]'>
            {tableHeaders.map(header => (
              <th
                key={header.key}
                className="sticky top-0 bg-white z-10 text-start text-sm font-semibold text-[#212121] py-3 px-4"
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((data, index) => (
            <tr 
              key={index}
              className="border-b border-[#E4E4E4] text-[#5E6775] text-sm hover:bg-gray-50/50 last:border-b-0"
            >
              <td className='py-4 px-4'>{data.date}</td>
              <td className='py-4 px-4'>{data.email}</td>
              <td className='py-4 px-4'>
                <span className={cn('w-max py-1 px-2 rounded-full text-xs font-medium', handlers.getQualificationStatusBadgeClass(data.qualificationStatus))}>
                  {data.qualificationStatus}
                </span>
              </td>
              <td className='py-4 px-4'>
                <span className={cn('w-max py-1 px-2 rounded-full text-xs font-medium', handlers.getMeetingStatusBadgeClass(data.meetingStatus))}>
                  {data.meetingStatus}
                </span>
              </td>
              <td className='py-4 px-4'>{data.leadScore}</td>
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

export default Conversations
