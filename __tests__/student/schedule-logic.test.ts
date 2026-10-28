import { describe, expect, it } from 'vitest'
import { weeklyClasses } from '@/lib/data/student-schedule'
import {
  buildIcs,
  describeStart,
  durationMinutes,
  formatClock,
  formatDuration,
  getSessionStatus,
  getSessions,
  icsFileName,
  relativeDayLabel,
  startOfWeek,
  toDateKey,
} from '@/lib/student/schedule'

// Wednesday 28 October 2026 (local time)
const wed = (h = 9, m = 0) => new Date(2026, 9, 28, h, m)

describe('week maths', () => {
  it('starts weeks on Monday', () => {
    expect(toDateKey(startOfWeek(wed()))).toBe('2026-10-26')
    expect(toDateKey(startOfWeek(new Date(2026, 10, 1)))).toBe('2026-10-26') // Sunday
    expect(toDateKey(startOfWeek(new Date(2026, 9, 26)))).toBe('2026-10-26') // Monday
  })
})

describe('getSessions', () => {
  const week = getSessions(weeklyClasses, new Date(2026, 9, 26), 7)

  it('expands every weekly class once per week, sorted by start', () => {
    expect(week).toHaveLength(weeklyClasses.length)
    const starts = week.map((s) => s.start.getTime())
    expect(starts).toEqual([...starts].sort((a, b) => a - b))
  })

  it('gives each occurrence a unique id and the right date', () => {
    expect(new Set(week.map((s) => s.sessionId)).size).toBe(week.length)
    const react = week.find((s) => s.id === 'fe-react')!
    expect(react.dateKey).toBe('2026-10-29') // Thursday
    expect(react.sessionId).toBe('fe-react:2026-10-29')
    expect(react.start.getHours()).toBe(10)
  })

  it('repeats the following week', () => {
    expect(getSessions(weeklyClasses, new Date(2026, 9, 26), 14)).toHaveLength(weeklyClasses.length * 2)
  })
})

describe('status and wording', () => {
  const session = getSessions(weeklyClasses, new Date(2026, 9, 28), 1).find((s) => s.id === 'it-fundamentals')!

  it('classifies past, live and upcoming', () => {
    expect(getSessionStatus(session, wed(9))).toBe('upcoming')
    expect(getSessionStatus(session, wed(11))).toBe('live')
    expect(getSessionStatus(session, wed(12))).toBe('past')
  })

  it('describes when a session starts', () => {
    expect(describeStart(session, wed(9))).toBe('Starts in 1 hr')
    expect(describeStart(session, wed(9, 30))).toBe('Starts in 30 min')
    expect(describeStart(session, wed(11))).toBe('In progress')
    expect(describeStart(session, new Date(2026, 9, 27, 18))).toBe('Tomorrow')
  })

  it('labels days relative to today', () => {
    expect(relativeDayLabel(wed(15), wed(9))).toBe('Today')
    expect(relativeDayLabel(new Date(2026, 9, 29), wed(9))).toBe('Tomorrow')
    expect(relativeDayLabel(new Date(2026, 9, 31), wed(9))).toMatch(/Sat/)
  })

  it('formats clock times and durations', () => {
    expect(formatClock('00:00')).toBe('12:00 AM')
    expect(formatClock('12:00')).toBe('12:00 PM')
    expect(formatClock('15:30')).toBe('3:30 PM')
    expect(formatDuration(90)).toBe('1 hr 30 min')
    expect(formatDuration(45)).toBe('45 min')
    expect(durationMinutes(session)).toBe(120)
  })
})

describe('calendar export', () => {
  const session = {
    ...getSessions(weeklyClasses, new Date(2026, 9, 28), 1).find((s) => s.id === 'pd-wireframing')!,
    topic: 'Wireframing, in Figma; part 1',
  }
  const ics = buildIcs(session, new Date(Date.UTC(2026, 9, 27, 12, 0, 0)))

  it('builds a valid single-event calendar with CRLF line endings', () => {
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true)
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
    expect(ics).toContain('DTSTART:20261028T150000')
    expect(ics).toContain('DTEND:20261028T163000')
    expect(ics).toContain('DTSTAMP:20261027T120000Z')
    expect(ics).toContain('UID:pd-wireframing:2026-10-28@nugiinnovations')
    expect(ics.split('\r\n').every((line) => !line.includes('\n'))).toBe(true)
  })

  it('escapes commas and semicolons in text fields', () => {
    expect(ics).toContain('Wireframing\\, in Figma\\; part 1')
  })

  it('makes a safe file name', () => {
    expect(icsFileName(session)).toBe('product-design-ui-ux-wireframing-in-figma-part-1-2026-10-28.ics')
  })
})
