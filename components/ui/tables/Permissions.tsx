"use client";

import React from 'react'
import { ITable } from '@/lib/interfaces'
import { cn } from '@/lib/utils'

interface IPermissionsTable extends ITable {
  onEdit?: (permission: any) => void
  onDisable?: (permission: any) => void
  onActivate?: (permission: any) => void
  onDelete?: (permission: any) => void
  onDeleteClick?: (permission: any) => void
}

const Permissions = ({ tableHeaders, tableData, className, onEdit, onDisable, onActivate, onDelete, onDeleteClick }: IPermissionsTable) => {
  const getStatusBadgeClass = (status: string) => {
    if (status === "Active") {
      return "bg-[#F0FDF4] text-[#0E5831]";
    } else if (status === "Inactive") {
      return "bg-[#F7F7F7] text-[#5E6775]";
    }
    return "bg-[#F7F7F7] text-[#5E6775]";
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
              <td className='py-4 px-4'>
                <span className={cn('w-max py-1 px-2 rounded-full text-xs font-medium', getStatusBadgeClass(data.status))}>
                  {data.status}
                </span>
              </td>
              <td className='py-4 px-4'>{data.lastUpdated}</td>
              <td className='py-4 px-4'>
                <div className='flex gap-4 items-center'>
                  <button
                    onClick={() => onEdit?.(data)}
                    className='text-sm text-[#5F3DF4] hover:underline cursor-pointer'
                  >
                    Edit
                  </button>
                  {data.status === "Active" ? (
                    <button
                      onClick={() => onDisable?.(data)}
                      className='text-sm text-[#212121] hover:underline cursor-pointer'
                    >
                      Disable
                    </button>
                  ) : (
                    <button
                      onClick={() => onActivate?.(data)}
                      className='text-sm text-[#212121] hover:underline cursor-pointer'
                    >
                      Activate
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteClick ? onDeleteClick(data) : onDelete?.(data)}
                    className='text-sm text-[#CB1616] hover:underline cursor-pointer'
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Permissions

