"use client"

import { useState, useRef, useEffect } from 'react';
// import { ChevronDownIcon } from 'lucide-react';
import { ChevronDownIcon } from './Icons';
import { cn } from '@/lib/utils';

export default function CustomSelect({ isEmpty, options, className, value, onChange }: { isEmpty: boolean, options: string[], className?: string, value?: string, onChange?: (e: { target: { value: string } }) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(options[0] || "");
  const dropdownRef = useRef<any>(null);
  
  const selectedValue = value !== undefined ? value : (internalValue || options[0] || "");

  /** Close dropdown when clicking outside **/
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    if (onChange) {
      onChange({ target: { value: option } });
    } else {
      setInternalValue(option);
    }
    setIsOpen(false);
  };

  return (
        <div className="relative w-full outline-none text-[#D5D9DE]" ref={dropdownRef}>
          {/* Select Button */}
            <button
            onClick={() => setIsOpen(!isOpen)}
            // className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 flex items-center justify-between text-left hover:border-gray-300 transition-colors shadow-sm"
            className={
                cn("w-full flex gap-2 cursor-pointer bg-white border border-[#D5D9DE] rounded-[8px] px-3 items-center justify-between text-left hover:border-gray-300 transition-colors whitespace-nowrap h-[46px]", 
                    isEmpty && "pointer-events-none text-[#D3D3D3]",
                    className
                )}
            >
            <span className={cn("text-sm text-gray-900", isEmpty && "text-[#D3D3D3]")}>
              {selectedValue}
            </span>
            <ChevronDownIcon 
              className={cn(`w-5 h-5 text-gray-600 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`, isEmpty && "text-[#D3D3D3]")}
            />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[8px] shadow-lg overflow-hidden z-50">
              {options.map((option, index) => (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={`w-full px-4 py-3 text-left text-sm cursor-pointer hover:bg-gray-50 transition-colors text-[#212121] whitespace-nowrap ${
                    selectedValue === option ? 'bg-gray-50' : ''
                  } ${index !== options.length - 1 ? '' : ''}`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
    );
}