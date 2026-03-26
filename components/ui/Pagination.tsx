"use client";

import React from 'react'
import { cn } from '@/lib/utils';
import { ArrowLeftIcon, ArrowRightIcon } from './Icons';
import AdminSelect from '@/components/ui/AdminSelect';

const itemsPerPageOptions = ['5', '10', '15', '20', '25'].map((v) => ({ value: v, label: v }));


interface IPagination {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    totalData: number;
}

const Pagination = ({ 
    currentPage, 
    totalPages, 
    setCurrentPage, 
    itemsPerPage, 
    onChange,
    totalData
}: IPagination) => {


    /** Calculate the start and end of the current results **/
    const startCount = (currentPage - 1) * itemsPerPage + 1;
    const endCount = Math.min(currentPage * itemsPerPage, totalData);
    
    const renderPaginationLinks = () => {
        const pageLinks = []
        /** The below renders pagination links */
        /** If number of pages is less than or equal to 6 */
        if(totalPages <= 6){
            for(let i = 1; i <= totalPages; i++){
                pageLinks.push(
                    <li key={i}>
                        <button
                        onClick={() => setCurrentPage(i)}
                        className={cn(
                            "cursor-pointer px-3 py-1 rounded-md text-gray-500 hover:bg-gray-100",
                            i === currentPage && "text-[#5F3DF4] font-semibold bg-gray-100"
                        )}
                        >
                        {i}
                        </button>
                    </li>
                )
            }
        } else {
            /** If number of pages is greater than 6 */
            /** show pages up to the current page */
            for(let i = 1; i <= currentPage; i++){
                pageLinks.push(
                    <li key={i}>
                        <button
                        onClick={() => setCurrentPage(i)}
                        className={cn(
                            "cursor-pointer px-3 py-1 rounded-md text-gray-500 hover:bg-gray-100",
                            i === currentPage && "text-[#5F3DF4] font-semibold bg-gray-100"
                        )}
                        >
                        {i}
                        </button>
                    </li>
                );
            }
    
            /** Add ellipsis */
            if(currentPage !== totalPages && currentPage !== totalPages - 1){
                pageLinks.push(
                    <li key="ellipsis">
                      <span className="px-3 py-1 text-gray-500">...</span>
                    </li>
                );
        
                /** Add the last page */
                pageLinks.push(
                    <li key={totalPages}>
                    <button
                        onClick={() => setCurrentPage(totalPages)}
                        className={cn(
                        "cursor-pointer px-3 py-1 rounded-md text-gray-500 hover:bg-gray-100",
                        totalPages === currentPage && "text-[#5F3DF4] font-semibold bg-gray-100"
                        )}
                    >
                        {totalPages}
                    </button>
                    </li>
                );
            }
        }
        return pageLinks;
    }

  return (
    <nav aria-label="Pagination" className='flex justify-between items-center mt-10'>
        <div className="flex gap-10">
            <div>
                <p className="text-gray-700">Showing {startCount} - {endCount} of {totalData} results</p>
            </div>
            <div className="inline-flex gap-3 text-gray-700">
                <span>Item per page</span>
                <select
                onChange={(e) => onChange(e)}
                value={itemsPerPage}
                className="border border-gray-500/20 px-2 py-1 rounded-sm"
                >
                    <option>5</option>
                    <option>10</option>
                    <option>15</option>
                    <option>20</option>
                    <option>25</option>
                </select>
            </div>
        </div>
        <ul className="flex items-center space-x-2">
            {/* Left Arrow Button */}
            <li>
                <button 
                    className="text-gray-600 hover:bg-gray-100 disabled:opacity-50 cursor-pointer p-2 rounded-full"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                >
                    <ArrowLeftIcon />
                </button>
            </li>

            {/* Render page number links based on totalPages */}
            {renderPaginationLinks()}

            {/* Right Arrow Button */}
            <li>
                <button 
                    className="text-gray-600 hover:bg-gray-100 disabled:opacity-50 cursor-pointer p-2 rounded-full"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                >
                    <ArrowRightIcon />
                </button>
            </li>
        </ul>
    </nav>
  )
}

export default Pagination