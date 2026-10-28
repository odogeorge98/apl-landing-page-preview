import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import LearningMaterialsView from '@/components/student/materials/LearningMaterialsView'
import { learningMaterials, materialCourses } from '@/lib/data/student-materials'
import { SAVED_MATERIALS_KEY } from '@/lib/hooks/student/use-saved-materials'

beforeEach(() => localStorage.clear())

const cards = () => screen.getAllByRole('article')

describe('materials data', () => {
  it('has unique ids and https links', () => {
    expect(new Set(learningMaterials.map((m) => m.id)).size).toBe(learningMaterials.length)
    for (const item of learningMaterials) expect(item.href.startsWith('https://')).toBe(true)
  })
})

describe('LearningMaterialsView', () => {
  it('lists every material with a safe external link', () => {
    render(<LearningMaterialsView />)
    expect(screen.getByRole('heading', { level: 1, name: 'Learning Materials' })).toBeTruthy()
    expect(cards()).toHaveLength(learningMaterials.length)
    const link = within(cards()[0]).getByRole('link', { name: /Open resource/ })
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toContain('noopener')
  })

  it('filters by programme, format and search', () => {
    render(<LearningMaterialsView />)
    fireEvent.click(screen.getByRole('button', { name: 'Data Science' }))
    expect(cards()).toHaveLength(learningMaterials.filter((m) => m.course === 'Data Science').length)

    fireEvent.click(screen.getByRole('button', { name: 'All programmes' }))
    fireEvent.change(screen.getByLabelText('Filter by format'), { target: { value: 'Book' } })
    expect(cards()).toHaveLength(1)
    expect(screen.getByText('Pro Git')).toBeTruthy()

    fireEvent.change(screen.getByLabelText('Filter by format'), { target: { value: 'All' } })
    fireEvent.change(screen.getByPlaceholderText('Search materials...'), { target: { value: 'tailwind' } })
    expect(cards()).toHaveLength(1)
  })

  it('shows an empty state and clears filters', () => {
    render(<LearningMaterialsView />)
    fireEvent.change(screen.getByPlaceholderText('Search materials...'), { target: { value: 'zzzz' } })
    expect(screen.getByText('No materials found')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(cards()).toHaveLength(learningMaterials.length)
  })

  it('saves a material, remembers it in localStorage, and filters to saved only', () => {
    render(<LearningMaterialsView />)
    fireEvent.click(screen.getByRole('button', { name: 'Save Learn React' }))
    expect(screen.getByRole('button', { name: 'Remove Learn React from saved' }).getAttribute('aria-pressed')).toBe('true')
    expect(JSON.parse(localStorage.getItem(SAVED_MATERIALS_KEY)!)).toEqual(['fe-react'])

    fireEvent.click(screen.getByRole('button', { name: 'Saved only' }))
    expect(cards()).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: 'Remove Learn React from saved' }))
    expect(screen.getByText('Nothing saved yet')).toBeTruthy()
    expect(JSON.parse(localStorage.getItem(SAVED_MATERIALS_KEY)!)).toEqual([])
  })

  it('restores saved materials on the next visit and ignores corrupt data', () => {
    localStorage.setItem(SAVED_MATERIALS_KEY, JSON.stringify(['fe-pro-git']))
    const { unmount } = render(<LearningMaterialsView />)
    expect(screen.getByRole('button', { name: 'Remove Pro Git from saved' })).toBeTruthy()
    unmount()

    localStorage.setItem(SAVED_MATERIALS_KEY, '{oops')
    render(<LearningMaterialsView />)
    expect(cards()).toHaveLength(learningMaterials.length)
    expect(materialCourses.length).toBeGreaterThan(1)
  })
})
