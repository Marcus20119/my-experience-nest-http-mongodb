import dayjs, { extend } from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

import { defaultTimezone } from '../constants'

extend(utc)
extend(timezone)

export const formatDateByTimezone = (
  date: Date,
  timezone = defaultTimezone,
  format = 'YYYY/MM/DD HH:mm:ss',
): string => {
  return dayjs(date).tz(timezone).format(format)
}

export const compareDate = (source: Date | undefined, destination: Date | undefined): boolean => {
  if (!source || !destination) return source === destination
  return source.toISOString() === destination.toISOString()
}

export const isSameTime = (source: Date | undefined, destination: Date | undefined): boolean => {
  if (!source || !destination) return false
  return new Date(source).getTime() === new Date(destination).getTime()
}
