// File này chứa các hàm liên quan đến việc xử lý dữ liệu trong session storage
// Dữ liệu này nhận được từ backend khi người dùng đăng nhập thành công

// Lưu dữ liệu người dùng vào session storage
export const setUserSession = (user: object, token: string, expirationTime: number) => {
  sessionStorage.setItem('user', JSON.stringify(user))
  sessionStorage.setItem('access_token', token)
  sessionStorage.setItem('token_expiration', expirationTime.toString())
}

// Xóa tất cả dữ liệu trong session storage
export const clearSession = () => sessionStorage.clear()

// Lấy dữ liệu người dùng từ session storage
export const getUserSession = () => {
  const userStr = sessionStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

// Lấy thời gian hết hạn token từ session storage
export const getTokenExpiration = () => {
  const expirationTime = sessionStorage.getItem('token_expiration')
  return expirationTime ? parseInt(expirationTime, 10) : 0
}
