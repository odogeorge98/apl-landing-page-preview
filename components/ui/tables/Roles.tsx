"use client";

import React, { useState } from 'react'
import { ITable } from '@/lib/interfaces'
import { cn } from '@/lib/utils'
import { ElipsisVerticalIcon } from '../Icons'
import ActionCard from '../ActionCard'

interface IRolesTable extends ITable {
  onViewDetails?: (role: any) => void
  onEditRole?: (role: any) => void
  onDeactivateRole?: (role: any) => void
  onActivateRole?: (role: any) => void
}

const Roles = ({ tableHeaders, tableData, className, onViewDetails, onEditRole, onDeactivateRole, onActivateRole }: IRolesTable) => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const handlers = {
    handleSelected(item: any) {
      setIsOpen(!isOpen);
      setSelectedRow(() => (isOpen ? null : item));
    },

    getStatusBadgeClass(status: string) {
      if (status === "Active") {
        return "bg-[#F0FDF4] text-[#0E5831]";
      } else if (status === "Inactive") {
        return "bg-[#F7F7F7] text-[#5E6775]";
      }
      return "bg-[#F7F7F7] text-[#5E6775]";
    },

    getActionItems(data: any) {
      const items: any[] = [
        {
          actionText: "View Details",
          loadingText: "Loading...",
          trigger: () => {
            onViewDetails?.(data)
            handlers.handleSelected(data)
          },
          color: "#212121"
        },
        {
          actionText: "Edit Role",
          loadingText: "Loading...",
          trigger: () => {
            onEditRole?.(data)
            handlers.handleSelected(data)
          },
          color: "#212121"
        }
      ]

      if (data.status === "Active") {
        items.push({
          actionText: "Deactivate Role",
          loadingText: "Loading...",
          trigger: () => {
            onDeactivateRole?.(data)
            handlers.handleSelected(data)
          },
          color: "#212121"
        })
      } else {
        items.push({
          actionText: "Activate Role",
          loadingText: "Loading...",
          trigger: () => {
            onActivateRole?.(data)
            handlers.handleSelected(data)
          },
          color: "#212121"
        })
      }

      return items;
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
              <td className='py-4 px-4'>{data.name}</td>
              <td className='py-4 px-4'>{data.users}</td>
              <td className='py-4 px-4'>{data.permissions}</td>
              <td className='py-4 px-4'>
                <span className={cn('w-max py-1 px-2 rounded-full text-xs font-medium', handlers.getStatusBadgeClass(data.status))}>
                  {data.status}
                </span>
              </td>
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

export default Roles

