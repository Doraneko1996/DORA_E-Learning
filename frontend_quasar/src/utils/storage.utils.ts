// File này chứa các hàm liên quan đến việc xử lý dữ liệu trong session storage
// Dữ liệu này nhận được từ backend khi người dùng đăng nhập thành công

import { SessionStorage } from 'quasar'

interface User {
  id: number,
  firstName: string,
  lastName: string,
  userName: string,
  role: number,
  status: boolean
}
// Lưu dữ liệu người dùng vào session storage
export const setUserSession = (user: User | null, token: string, expirationTime: number) => {
  SessionStorage.set('user', user) // Lưu object trực tiếp, không cần stringify
  SessionStorage.set('access_token', token)
  SessionStorage.set('token_expiration', expirationTime)
}

// Xóa tất cả dữ liệu trong session storage
export const clearSession = () => {
  SessionStorage.clear()
}

// Lấy dữ liệu người dùng từ session storage
export const getUserSession = (): User | null => {
  return SessionStorage.getItem('user') || null // Trả về null nếu không có
}

// Lấy thời gian hết hạn token từ session storage
export const getTokenExpiration = (): number => {
  return SessionStorage.getItem('token_expiration') || 0 // Trả về 0 nếu không có
}
