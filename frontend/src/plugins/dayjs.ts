import dayjs from 'dayjs'
import 'dayjs/locale/vi' // locale tiếng Việt
import relativeTime from 'dayjs/plugin/relativeTime' // plugin hiển thị thời gian tương đối
import customParseFormat from 'dayjs/plugin/customParseFormat' // plugin parse format tùy chỉnh
import duration from 'dayjs/plugin/duration' // plugin tính toán khoảng thời gian

// Cấu hình plugins
dayjs.extend(relativeTime)
dayjs.extend(customParseFormat)
dayjs.extend(duration)

// Cấu hình locale mặc định
dayjs.locale('vi')

// Tạo các hàm format thường dùng
export const formatDateTime = (date: string | Date | null) => {
  if (!date) return ''
  return dayjs(date).format('HH:mm:ss DD/MM/YYYY')
}

export const formatDate = (date: string | Date | null) => {
  if (!date) return ''
  return dayjs(date).format('DD/MM/YYYY')
}

export const formatTime = (date: string | Date | null) => {
  if (!date) return ''
  return dayjs(date).format('HH:mm:ss')
}

export const formatRelative = (date: string | Date | null) => {
  if (!date) return ''
  return dayjs(date).fromNow()
}

// Export dayjs instance để sử dụng trực tiếp
export default dayjs
