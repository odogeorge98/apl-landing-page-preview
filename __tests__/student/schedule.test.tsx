import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import ScheduleView from '@/components/student/schedule/ScheduleView'

// Wednesday 28 October 2026, 09:00 local time
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 9, 28, 9, 0))
})
afterEach(() => vi.useRealTimers())

const week = () => screen.getByRole('region', { name: /Wednesday, 28 October 2026/ }).parentElement as HTMLElement

describe('ScheduleView', () => {
  it('shows the next class and this week at a glance', () => {
    render(<ScheduleView />)
    expect(screen.getByRole('heading', { level: 1, name: 'Schedule' })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: 'Computer fundamentals and troubleshooting' })).toBeTruthy()
    expect(screen.getByText('Starts in 1 hr')).toBeTruthy()
    expect(screen.getByText('26 Oct – 1 Nov 2026')).toBeTruthy()
    expect(screen.getByText('Classes this week').previousElementSibling?.textContent).toBe('9')
    expect(screen.getByText('Learning time this week').previousElementSibling?.textContent).toBe('15 hr 30 min')
  })

  it('marks today and lays out the whole week', () => {
    render(<ScheduleView />)
    expect(screen.getByRole('region', { name: /Wednesday, 28 October 2026 \(today\)/ })).toBeTruthy()
    expect(within(week()).getAllByRole('region')).toHaveLength(7)
    expect(screen.getByText('React components and state')).toBeTruthy()
  })

  it('opens session details and downloads a calendar file', () => {
    const createObjectURL = vi.fn(() => 'blob:test')
    const revokeObjectURL = vi.fn()
    Object.assign(URL, { createObjectURL, revokeObjectURL })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    render(<ScheduleView />)
    fireEvent.click(screen.getByRole('button', { name: /Wireframing in Figma/ }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText(/Wednesday, 28 October 2026/)).toBeTruthy()
    expect(within(dialog).getByText(/3:00 PM – 4:30 PM \(1 hr 30 min\)/)).toBeTruthy()
    expect(within(dialog).getByText('Online classroom')).toBeTruthy()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Add to calendar' }))
    expect(createObjectURL).toHaveBeenCalledTimes(1)
    const blob = (createObjectURL.mock.calls[0] as unknown as [Blob])[0]
    expect(blob.type).toContain('text/calendar')
    expect(click).toHaveBeenCalled()
    click.mockRestore()
  })

  it('filters by class type and programme', () => {
    render(<ScheduleView />)
    fireEvent.click(screen.getByRole('button', { name: 'Online' }))
    expect(screen.queryByText('React components and state')).toBeNull() // on-site
    expect(screen.getByText('Python and pandas workshop')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'All' }))
    fireEvent.change(screen.getByLabelText('Filter by programme'), { target: { value: 'Cybersecurity' } })
    expect(screen.getByText('Security fundamentals')).toBeTruthy()
    expect(screen.queryByText('Python and pandas workshop')).toBeNull()
  })

  it('navigates between weeks', () => {
    render(<ScheduleView />)
    const today = screen.getByRole('button', { name: 'Today' }) as HTMLButtonElement
    expect(today.disabled).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Next week' }))
    expect(screen.getByText('2 Nov – 8 Nov 2026')).toBeTruthy()
    expect(today.disabled).toBe(false)
    fireEvent.click(today)
    expect(screen.getByText('26 Oct – 1 Nov 2026')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Previous week' }))
    expect(screen.getByText('19 Oct – 25 Oct 2026')).toBeTruthy()
  })

  it('lists upcoming sessions grouped by day, hiding classes that already ended', () => {
    vi.setSystemTime(new Date(2026, 9, 28, 13, 0)) // after the 10:00 class
    render(<ScheduleView />)
    fireEvent.click(screen.getByRole('button', { name: 'Upcoming' }))
    expect(screen.getByRole('region', { name: /Wednesday, 28 October 2026/ })).toBeTruthy()
    expect(screen.getByText('Today')).toBeTruthy()
    expect(screen.getByText('Tomorrow')).toBeTruthy()
    const todayGroup = screen.getByRole('region', { name: /Wednesday, 28 October 2026/ })
    expect(within(todayGroup).queryByText('Computer fundamentals and troubleshooting')).toBeNull()
    expect(within(todayGroup).getByText('Wireframing in Figma')).toBeTruthy()
  })
})
