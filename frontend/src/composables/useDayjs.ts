import dayjs from '@/plugins/dayjs'
import { type Dayjs } from 'dayjs'

export function useDayjs() {
  return {
    dayjs,
    formatDateTime: (date: string | Date | null) => {
      if (!date) return ''
      return dayjs(date).format('HH:mm DD/MM/YYYY')
    },
    formatDate: (date: string | Date | null) => {
      if (!date) return ''
      return dayjs(date).format('DD/MM/YYYY')
    },
    formatDateInput: (date: string | Date | null) => {
      if (!date) return ''
      return dayjs(date).format('YYYY-MM-DD')
    },
    formatTime: (date: string | Date | null) => {
      if (!date) return ''
      return dayjs(date).format('HH:mm:ss')
    },
    formatRelative: (date: string | Date | null) => {
      if (!date) return ''
      return dayjs(date).fromNow()
    },
    parseDate: (dateString: string, format: string): Dayjs => {
      return dayjs(dateString, format)
    },
    isValid: (date: string | Date | number | null): boolean => {
      return dayjs(date).isValid()
    },
    getDuration: (start: Date, end: Date) => {
      return dayjs.duration(dayjs(end).diff(start))
    }
  }
}
