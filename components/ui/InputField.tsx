import React from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link';
import { EyeCloseIcon, EyeOpenIcon } from './Icons';
import { Mail, Lock } from 'lucide-react';

interface IHandlers {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleToggle?: (param?: string) => void;
}


interface InputFieldType {
    label?: string;
    name: string;
    placeholder: string;
    value: string;
    wrapperCss: string;
    inputCss?: string;
    error: string | undefined;
    visible?: boolean | { password: string, confirm: string};
    handlers: Pick<IHandlers, 'onChange'> & Partial<Omit<IHandlers, 'onChange'>>;
    page?: string;
    disabled?: boolean;
    /** Dark inputs for PEPP Cruise admin auth landing */
    authDark?: boolean;
    inputIcon?: 'mail' | 'lock';
} 



const InputField = ({ 
    label, 
    name,
    placeholder,
    handlers,
    value,
    wrapperCss,
    inputCss,
    error,
    visible,
    page,
    disabled,
    authDark,
    inputIcon,
}: InputFieldType) => {
  const isPasswordField = ["password", "confirm", "confirmPassword"].includes(name);
  const inputType = isPasswordField ? (visible ? 'text' : 'password') : 'text';

  const Icon = inputIcon === 'mail' ? Mail : inputIcon === 'lock' ? Lock : null;

  return (
    <div className={cn('flex flex-col', wrapperCss)}>
        <label
          htmlFor={name}
          className={cn(
            authDark && 'text-sm font-medium text-[#C9B8E0]',
          )}
        >
          {label}
        </label>
        <div className="relative mt-1.5">
        {Icon && (
          <Icon
            className={cn(
              'pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2',
              authDark ? 'text-[#A995C9]' : 'text-gray-400',
            )}
            strokeWidth={1.75}
            aria-hidden
          />
        )}
        <input
        type={inputType}
        id={name} 
        name={name}
        placeholder={placeholder}
        onChange={(e) => handlers.onChange(e)}
        value={value}
        disabled={disabled}
        autoComplete={isPasswordField ? 'current-password' : name === 'email' ? 'email' : undefined}
        className={cn(
            'w-full rounded-xl border py-3 transition-colors',
            authDark && 'auth-form-input-transparent appearance-none',
            !Icon && 'px-3',
            Icon && 'pl-11',
            Icon && isPasswordField && 'pr-11',
            Icon && !isPasswordField && 'pr-3',
            authDark
              ? [
                  'bg-transparent',
                  'border-[#3D2E5E]',
                  'text-white placeholder:text-[#8B7BA8]',
                  'focus:outline-none focus:ring-2 focus:ring-[#8247E5]/35 focus:border-[#5C4A80]',
                ]
              : [
                  'px-3',
                  'placeholder:text-gray-400',
                  'focus:outline-none focus:ring-2 focus:border-transparent',
                ],
            'disabled:opacity-50 disabled:cursor-not-allowed',
            inputCss,
            error
              ? 'border-red-500 focus:ring-red-500'
              : !authDark && 'border-gray-300 focus:ring-[#5F3DF4]'
        )}
        />
        {
            isPasswordField && value && (
                <div className='absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer'>
                    {  
                        visible ? 
                        <EyeCloseIcon click={() => handlers.handleToggle && handlers.handleToggle(name)} /> : 
                        <EyeOpenIcon click={() => handlers.handleToggle && handlers.handleToggle(name)} className='#94A3B8' />
                    }  
                </div>
            )
        }
        </div>
        {error && (
            <p className="text-red-400 text-sm mt-1.5">{error}</p>
        )}
        {
            name === "password" && page === "forgot" && (
                <div className='text-right mt-4'>
                    <Link href={'/forgot-password'} className={cn(
                      'underline font-medium',
                      authDark ? 'text-[#8A4AF3]' : 'text-[#5F3DF4]',
                    )}>Forgot Password</Link>
                </div>
            )
        }
    </div>
  )
}

export default InputField
