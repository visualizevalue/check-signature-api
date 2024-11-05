import { DateTime, Duration, DurationLikeObject } from 'luxon'

export const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

export const daysInSeconds = (days: number): number => days * 60 * 60 * 24

export const nowInSeconds = (): number => Math.floor(Date.now() / 1000)

export const asUTCDate = (date: Date|null) => date
  ? DateTime.utc(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds()
  )
  : null

export const BLOCKS_PER_DAY = 6200
export const BLOCKS_PER_WEEK = BLOCKS_PER_DAY * 7
export const BLOCKS_PER_2_WEEKS = BLOCKS_PER_WEEK * 2

export const formatDuration = (dur: Duration, shift: (keyof DurationLikeObject)[] = ['days', 'hours']) => {
  const obj = dur?.shiftTo(...shift).toObject() || {}

  return [
    obj.years && `${obj.years}y`,
    obj.weeks && `${obj.weeks}w`,
    obj.days && `${Math.floor(obj.days)}d`,
    obj.hours && `${Math.floor(obj.hours)}h`,
  ].filter(t => !!t).join(' ') || '0h'
}
