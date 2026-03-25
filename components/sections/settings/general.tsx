"use client";

import React, { useState } from 'react'

const GeneralSettings = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [organizationName, setOrganizationName] = useState("PEPP Cruise")
  const [businessDescription, setBusinessDescription] = useState("PEPP Cruise operations: rides, drivers, payments, and platform management.")
  const [timeZone, setTimeZone] = useState("(GMT +01:00) West Africa Time - Lagos")

  return (
    <div className='w-full'>
      {/* Header */}
      <div className='w-full flex justify-between items-center mb-6'>
        <h1 className='text-[18px] md:text-[28px] font-semibold text-[#212121]'>Settings</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className='px-4 md:px-6 py-2 md:py-3 bg-[#5F3DF4] text-white rounded-[8px] text-sm font-medium hover:bg-[#4d2fd4] transition-colors'
        >
          Edit settings
        </button>
      </div>

      {/* General Settings Section */}
      <div className='w-full mb-6'>
        <h2 className='text-lg md:text-xl font-semibold text-[#212121] mb-2'>General Settings</h2>
        <p className='text-sm text-[#5E6775] mb-6'>Manage your organization's basic information and preferences.</p>

        {/* Settings Card */}
        <div className='w-full bg-white rounded-[8px] p-6 md:p-8 shadow-sm border border-[#E4E4E4]'>
          {/* Logo Section */}
          <div className='w-full flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#E4E4E4]'>
            <div className='flex items-center gap-4'>
              <div className='w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#F7F7F7] flex items-center justify-center overflow-hidden flex-shrink-0'>
                <svg width="40" height="40" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 md:w-12 md:h-12">
                  <rect width="29" height="29" rx="14.5" fill="#B43DF4"/>
                  <path d="M19.1654 20.5V19.1667C19.1654 18.4594 18.8844 17.7811 18.3843 17.281C17.8842 16.781 17.2059 16.5 16.4987 16.5H12.4987C11.7915 16.5 11.1132 16.781 10.6131 17.281C10.113 17.7811 9.83203 18.4594 9.83203 19.1667V20.5M17.1654 11.1667C17.1654 12.6394 15.9715 13.8333 14.4987 13.8333C13.0259 13.8333 11.832 12.6394 11.832 11.1667C11.832 9.69391 13.0259 8.5 14.4987 8.5C15.9715 8.5 17.1654 9.69391 17.1654 11.1667Z" stroke="white" strokeWidth="1.35938" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className='flex flex-col gap-1'>
                <span className='text-sm md:text-base font-medium text-[#212121]'>{organizationName}</span>
                <span className='text-xs text-[#5E6775]'>PNG, JPEG under 5mb</span>
              </div>
            </div>
            <div className='flex gap-2'>
              <button className='px-4 py-2 border border-[#E4E4E4] text-[#212121] rounded-[8px] text-sm font-medium hover:bg-[#F7F7F7] transition-colors'>
                Change logo
              </button>
              <button className='px-4 py-2 bg-[#FEF2F2] text-[#DC2626] rounded-[8px] text-sm font-medium hover:bg-[#FEE2E2] transition-colors flex items-center gap-2'>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 4H14M12.6667 4V13.3333C12.6667 13.6879 12.5262 14.0281 12.2761 14.2781C12.0261 14.5282 11.6859 14.6667 11.3333 14.6667H4.66667C4.31405 14.6667 3.97391 14.5282 3.72386 14.2781C3.47381 14.0281 3.33333 13.6879 3.33333 13.3333V4M5.33333 4V2.66667C5.33333 2.31405 5.47381 1.97391 5.72386 1.72386C5.97391 1.47381 6.31405 1.33333 6.66667 1.33333H9.33333C9.68595 1.33333 10.0261 1.47381 10.2761 1.72386C10.5262 1.97391 10.6667 2.31405 10.6667 2.66667V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6.66667 7.33333V11.3333M9.33333 7.33333V11.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Remove logo
              </button>
            </div>
          </div>

          {/* Organization Name */}
          <div className='w-full flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 mb-6 border-b border-[#E4E4E4]'>
            <div className='flex-1'>
              <h3 className='text-sm md:text-base font-semibold text-[#212121] mb-1'>Organization Name</h3>
              <p className='text-xs md:text-sm text-[#5E6775]'>This name is used across the platform, including reports, invoices, and notifications.</p>
            </div>
            <div className='md:w-[300px] flex-shrink-0'>
              {isEditing ? (
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className='w-full px-4 py-2 border border-[#D5D9DE] rounded-[8px] text-sm text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#5F3DF4] focus:border-transparent'
                />
              ) : (
                <span className='text-sm md:text-base text-[#212121] font-medium'>{organizationName}</span>
              )}
            </div>
          </div>

          {/* Business Description */}
          <div className='w-full flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 mb-6 border-b border-[#E4E4E4]'>
            <div className='flex-1'>
              <h3 className='text-sm md:text-base font-semibold text-[#212121] mb-1'>Business Description</h3>
              <p className='text-xs md:text-sm text-[#5E6775]'>A short description of what your organization does. This may be used to help AI agents tailor messaging.</p>
            </div>
            <div className='md:w-[300px] flex-shrink-0'>
              {isEditing ? (
                <textarea
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  rows={4}
                  className='w-full px-4 py-2 border border-[#D5D9DE] rounded-[8px] text-sm text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#5F3DF4] focus:border-transparent resize-none'
                />
              ) : (
                <span className='text-sm md:text-base text-[#212121] font-medium'>{businessDescription}</span>
              )}
            </div>
          </div>

          {/* Time Zone */}
          <div className='w-full flex flex-col md:flex-row md:items-start justify-between gap-4'>
            <div className='flex-1'>
              <h3 className='text-sm md:text-base font-semibold text-[#212121] mb-1'>Time Zone</h3>
              <p className='text-xs md:text-sm text-[#5E6775]'>Used for scheduling meetings, sending notifications, and generating reports.</p>
            </div>
            <div className='md:w-[300px] flex-shrink-0'>
              {isEditing ? (
                <select
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  className='w-full px-4 py-2 border border-[#D5D9DE] rounded-[8px] text-sm text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#5F3DF4] focus:border-transparent bg-white'
                >
                  <option value="(GMT +01:00) West Africa Time - Lagos">(GMT +01:00) West Africa Time - Lagos</option>
                  <option value="(GMT +00:00) Greenwich Mean Time">(GMT +00:00) Greenwich Mean Time</option>
                  <option value="(GMT -05:00) Eastern Time">(GMT -05:00) Eastern Time</option>
                  <option value="(GMT -08:00) Pacific Time">(GMT -08:00) Pacific Time</option>
                </select>
              ) : (
                <span className='text-sm md:text-base text-[#212121] font-medium'>{timeZone}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GeneralSettings

