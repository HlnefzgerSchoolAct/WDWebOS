import type { StudentProfile } from './localAuth'

export type LunchPeriod = StudentProfile['lunchPeriod']

export type ScheduleBlock = {
  id: string
  label: string
  startMinutes: number
  endMinutes: number
}

export type SchoolDayKind = 'regular' | 'early-out' | 'no-school'

export type ClockSnapshot = {
  timeLabel: string
  dayLabel: string
  dateLabel: string
  scheduleTitle: string
  dayKind: SchoolDayKind
  currentPeriodLabel: string
  nextPeriodLabel: string
  countdownLabel: string
  blocks: ScheduleBlock[]
}

type ScheduleBlueprint = {
  title: string
  blocks: ScheduleBlock[]
}

const SCHEDULES: Record<
  'A lunch' | 'B lunch' | 'C lunch' | 'early-out-a' | 'early-out-b' | 'early-out-c',
  ScheduleBlueprint
> = {
  'A lunch': {
    title: 'Regular Schedule - A Lunch',
    blocks: [
      { id: 'period-1', label: '1st Period', startMinutes: 8 * 60, endMinutes: 9 * 60 + 35 },
      { id: 'period-2', label: '2nd Period', startMinutes: 9 * 60 + 45, endMinutes: 11 * 60 + 15 },
      { id: 'lunch-a', label: 'A Lunch', startMinutes: 11 * 60 + 15, endMinutes: 11 * 60 + 40 },
      { id: 'period-3', label: '3rd Period', startMinutes: 11 * 60 + 40, endMinutes: 13 * 60 + 15 },
      { id: 'period-4', label: '4th Period', startMinutes: 13 * 60 + 25, endMinutes: 14 * 60 + 55 },
    ],
  },
  'B lunch': {
    title: 'Regular Schedule - B Lunch',
    blocks: [
      { id: 'period-1', label: '1st Period', startMinutes: 8 * 60, endMinutes: 9 * 60 + 35 },
      { id: 'period-2', label: '2nd Period', startMinutes: 9 * 60 + 45, endMinutes: 11 * 60 + 15 },
      { id: 'period-3a', label: '3rd Period', startMinutes: 11 * 60 + 25, endMinutes: 12 * 60 + 5 },
      { id: 'lunch-b', label: 'B Lunch', startMinutes: 12 * 60 + 5, endMinutes: 12 * 60 + 30 },
      { id: 'period-3b', label: '3rd Period', startMinutes: 12 * 60 + 30, endMinutes: 13 * 60 + 15 },
      { id: 'period-4', label: '4th Period', startMinutes: 13 * 60 + 25, endMinutes: 14 * 60 + 55 },
    ],
  },
  'C lunch': {
    title: 'Regular Schedule - C Lunch',
    blocks: [
      { id: 'period-1', label: '1st Period', startMinutes: 8 * 60, endMinutes: 9 * 60 + 35 },
      { id: 'period-2', label: '2nd Period', startMinutes: 9 * 60 + 45, endMinutes: 11 * 60 + 15 },
      { id: 'period-3', label: '3rd Period', startMinutes: 11 * 60 + 25, endMinutes: 12 * 60 + 50 },
      { id: 'lunch-c', label: 'C Lunch', startMinutes: 12 * 60 + 50, endMinutes: 13 * 60 + 15 },
      { id: 'period-4', label: '4th Period', startMinutes: 13 * 60 + 25, endMinutes: 14 * 60 + 55 },
    ],
  },
  'early-out-a': {
    title: 'Early Out Schedule - A Lunch',
    blocks: [
      { id: 'period-1', label: '1st Period', startMinutes: 8 * 60, endMinutes: 9 * 60 },
      { id: 'homeroom', label: 'Homeroom', startMinutes: 9 * 60 + 5, endMinutes: 9 * 60 + 40 },
      { id: 'period-2', label: '2nd Period', startMinutes: 9 * 60 + 45, endMinutes: 10 * 60 + 40 },
      { id: 'lunch-a', label: 'A Lunch', startMinutes: 10 * 60 + 40, endMinutes: 11 * 60 + 5 },
      { id: 'period-3', label: '3rd Period', startMinutes: 11 * 60 + 5, endMinutes: 12 * 60 + 15 },
      { id: 'period-4', label: '4th Period', startMinutes: 12 * 60 + 20, endMinutes: 13 * 60 + 15 },
    ],
  },
  'early-out-b': {
    title: 'Early Out Schedule - B Lunch',
    blocks: [
      { id: 'period-1', label: '1st Period', startMinutes: 8 * 60, endMinutes: 9 * 60 },
      { id: 'homeroom', label: 'Homeroom', startMinutes: 9 * 60 + 5, endMinutes: 9 * 60 + 40 },
      { id: 'period-2', label: '2nd Period', startMinutes: 9 * 60 + 45, endMinutes: 10 * 60 + 40 },
      { id: 'period-3a', label: '3rd Period', startMinutes: 10 * 60 + 45, endMinutes: 11 * 60 + 15 },
      { id: 'lunch-b', label: 'B Lunch', startMinutes: 11 * 60 + 15, endMinutes: 11 * 60 + 40 },
      { id: 'period-3b', label: '3rd Period', startMinutes: 11 * 60 + 40, endMinutes: 12 * 60 + 15 },
      { id: 'period-4', label: '4th Period', startMinutes: 12 * 60 + 20, endMinutes: 13 * 60 + 15 },
    ],
  },
  'early-out-c': {
    title: 'Early Out Schedule - C Lunch',
    blocks: [
      { id: 'period-1', label: '1st Period', startMinutes: 8 * 60, endMinutes: 9 * 60 },
      { id: 'homeroom', label: 'Homeroom', startMinutes: 9 * 60 + 5, endMinutes: 9 * 60 + 40 },
      { id: 'period-2', label: '2nd Period', startMinutes: 9 * 60 + 45, endMinutes: 10 * 60 + 40 },
      { id: 'period-3', label: '3rd Period', startMinutes: 10 * 60 + 45, endMinutes: 11 * 60 + 50 },
      { id: 'lunch-c', label: 'C Lunch', startMinutes: 11 * 60 + 50, endMinutes: 12 * 60 + 15 },
      { id: 'period-4', label: '4th Period', startMinutes: 12 * 60 + 20, endMinutes: 13 * 60 + 15 },
    ],
  },
}

function minutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes()
}

function createDateFromMinutes(baseDate: Date, totalMinutes: number): Date {
  const nextDate = new Date(baseDate)
  nextDate.setHours(0, 0, 0, 0)
  nextDate.setMinutes(totalMinutes)
  return nextDate
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatDay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

function formatSchoolTitle(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

function formatCountdown(target: Date, now: Date): string {
  const remainingSeconds = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000))
  const days = Math.floor(remainingSeconds / 86400)
  const hours = Math.floor((remainingSeconds % 86400) / 3600)
  const minutes = Math.floor((remainingSeconds % 3600) / 60)
  const seconds = remainingSeconds % 60

  const parts: string[] = []

  if (days > 0) {
    parts.push(`${days}d`)
  }

  if (hours > 0 || days > 0) {
    parts.push(`${hours}h`)
  }

  parts.push(`${minutes}m`)
  parts.push(`${String(seconds).padStart(2, '0')}s`)

  return parts.join(' ')
}

function getSchoolDayKind(date: Date): SchoolDayKind {
  const day = date.getDay()

  if (day === 0 || day === 6) {
    return 'no-school'
  }

  if (day === 3) {
    return 'early-out'
  }

  return 'regular'
}

function getRegularSchedule(profileLunchPeriod: LunchPeriod): ScheduleBlueprint {
  return SCHEDULES[profileLunchPeriod] ?? SCHEDULES['A lunch']
}

function getEarlyOutSchedule(profileLunchPeriod: LunchPeriod): ScheduleBlueprint {
  if (profileLunchPeriod === 'B lunch') {
    return SCHEDULES['early-out-b']
  }

  if (profileLunchPeriod === 'C lunch') {
    return SCHEDULES['early-out-c']
  }

  return SCHEDULES['early-out-a']
}

function getNextSchoolDay(date: Date): Date {
  const nextDate = new Date(date)
  nextDate.setHours(8, 0, 0, 0)
  nextDate.setDate(nextDate.getDate() + 1)

  while (nextDate.getDay() === 0 || nextDate.getDay() === 6) {
    nextDate.setDate(nextDate.getDate() + 1)
  }

  return nextDate
}

function getActiveSchedule(date: Date, lunchPeriod: LunchPeriod): ScheduleBlueprint {
  const dayKind = getSchoolDayKind(date)

  if (dayKind === 'early-out') {
    return getEarlyOutSchedule(lunchPeriod)
  }

  if (dayKind === 'regular') {
    return getRegularSchedule(lunchPeriod)
  }

  return {
    title: 'No School',
    blocks: [],
  }
}

export function getClockSnapshot(date: Date, lunchPeriod: LunchPeriod): ClockSnapshot {
  const dayKind = getSchoolDayKind(date)
  const activeSchedule = getActiveSchedule(date, lunchPeriod)
  const minutesNow = minutesSinceMidnight(date)

  if (dayKind === 'no-school') {
    const nextSchoolStart = getNextSchoolDay(date)

    return {
      timeLabel: formatTime(date),
      dayLabel: formatDay(date),
      dateLabel: formatSchoolTitle(date),
      scheduleTitle: activeSchedule.title,
      dayKind,
      currentPeriodLabel: 'No School',
      nextPeriodLabel: '1st Period',
      countdownLabel: formatCountdown(nextSchoolStart, date),
      blocks: activeSchedule.blocks,
    }
  }

  const blocks = activeSchedule.blocks
  const currentBlock = blocks.find(
    (block) => minutesNow >= block.startMinutes && minutesNow < block.endMinutes,
  )
  const nextBlock = blocks.find((block) => block.startMinutes > minutesNow)

  if (currentBlock) {
    return {
      timeLabel: formatTime(date),
      dayLabel: formatDay(date),
      dateLabel: formatSchoolTitle(date),
      scheduleTitle: activeSchedule.title,
      dayKind,
      currentPeriodLabel: currentBlock.label,
      nextPeriodLabel: nextBlock?.label ?? 'School dismissed',
      countdownLabel: nextBlock
        ? formatCountdown(createDateFromMinutes(date, nextBlock.startMinutes), date)
        : formatCountdown(getNextSchoolDay(date), date),
      blocks,
    }
  }

  if (blocks.length > 0 && minutesNow < blocks[0].startMinutes) {
    return {
      timeLabel: formatTime(date),
      dayLabel: formatDay(date),
      dateLabel: formatSchoolTitle(date),
      scheduleTitle: activeSchedule.title,
      dayKind,
      currentPeriodLabel: 'Before School',
      nextPeriodLabel: blocks[0].label,
      countdownLabel: formatCountdown(createDateFromMinutes(date, blocks[0].startMinutes), date),
      blocks,
    }
  }

  if (nextBlock) {
    return {
      timeLabel: formatTime(date),
      dayLabel: formatDay(date),
      dateLabel: formatSchoolTitle(date),
      scheduleTitle: activeSchedule.title,
      dayKind,
      currentPeriodLabel: 'Passing Period',
      nextPeriodLabel: nextBlock.label,
      countdownLabel: formatCountdown(createDateFromMinutes(date, nextBlock.startMinutes), date),
      blocks,
    }
  }

  return {
    timeLabel: formatTime(date),
    dayLabel: formatDay(date),
    dateLabel: formatSchoolTitle(date),
    scheduleTitle: activeSchedule.title,
    dayKind,
    currentPeriodLabel: 'School Dismissed',
    nextPeriodLabel: '1st Period',
    countdownLabel: formatCountdown(getNextSchoolDay(date), date),
    blocks,
  }
}