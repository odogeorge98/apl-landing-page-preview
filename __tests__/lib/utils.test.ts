import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('should handle conditional classes', () => {
    const isActive = true
    expect(cn('base', isActive && 'active')).toBe('base active')
  })

  it('should handle Tailwind merge conflicts', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('should handle empty and falsy values', () => {
    expect(cn('', 'px-2', null, undefined, false)).toBe('px-2')
  })

  it('should handle arrays and objects', () => {
    expect(cn(['px-2', 'py-1'], { 'text-red-500': true, 'bg-blue-500': false }))
      .toBe('px-2 py-1 text-red-500')
  })
})