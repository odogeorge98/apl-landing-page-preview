import { describe, it, expect } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import CurriculumOverview from '@/components/curriculum/CurriculumOverview'
import { curriculumProgrammes } from '@/lib/data/curriculum'

describe('curriculum data', () => {
  it('lists all 15 programmes with unique ids', () => {
    expect(curriculumProgrammes).toHaveLength(15)
    expect(new Set(curriculumProgrammes.map((p) => p.id)).size).toBe(15)
  })
})

describe('CurriculumOverview', () => {
  it('shows Front-End Web Development modules by default', () => {
    render(<CurriculumOverview />)
    expect(screen.getByRole('heading', { level: 1, name: 'Curriculum' })).toBeTruthy()
    expect(screen.getByText('Git and GitHub')).toBeTruthy()
    expect(screen.getByText('Implementing designs from prototypes')).toBeTruthy()
  })

  it('switches to IT Training and shows its modules', () => {
    render(<CurriculumOverview />)
    fireEvent.click(screen.getByRole('button', { name: /IT Training/ }))
    expect(screen.getByText('Computer fundamentals')).toBeTruthy()
    expect(screen.getByText('System configuration')).toBeTruthy()
  })

  it('shows a pending state for programmes without an outline', () => {
    render(<CurriculumOverview />)
    fireEvent.click(screen.getByRole('button', { name: /Cybersecurity/ }))
    expect(screen.getByText(/has not been added to the dashboard yet/)).toBeTruthy()
  })

  it('filters programmes by search', () => {
    render(<CurriculumOverview />)
    fireEvent.change(screen.getByPlaceholderText('Search programmes'), { target: { value: 'zzzz' } })
    expect(screen.getByText('No matching programmes')).toBeTruthy()
  })
})
