import { boot } from 'quasar/wrappers'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import relativeTime from 'dayjs/plugin/relativeTime'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import duration from 'dayjs/plugin/duration'

dayjs.extend(relativeTime)
dayjs.extend(customParseFormat)
dayjs.extend(duration)
dayjs.locale('vi')

// Các hàm tiện ích để sử dụng với Composition API
export const formatDateTime = (date: string | Date | null) =>
  date ? dayjs(date).format('HH:mm DD/MM/YYYY') : ''

export const formatDate = (date: string | Date | null) =>
  date ? dayjs(date).format('DD/MM/YYYY') : ''

export const formatTime = (date: string | Date | null) =>
  date ? dayjs(date).format('HH:mm:ss') : ''

export const formatRelative = (date: string | Date | null) => (date ? dayjs(date).fromNow() : '')

// Boot cho Options API
export default boot(({ app }) => {
  app.config.globalProperties.$dayjs = dayjs
  app.config.globalProperties.$formatDateTime = formatDateTime
  app.config.globalProperties.$formatDate = formatDate
  app.config.globalProperties.$formatTime = formatTime
  app.config.globalProperties.$formatRelative = formatRelative
})

export { dayjs }
