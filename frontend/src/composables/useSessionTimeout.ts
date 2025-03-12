import { onMounted } from 'vue'
import { useSnackbarStore } from '@/stores/snackbar'
import { useRouter } from 'vue-router'
import { clearSession, getTokenExpiration } from '@/utils/storage.utils'

export const useSessionTimeout = () => {
  const snackbar = useSnackbarStore()
  const router = useRouter()

  const handleLogoutWhenSessionExpire = () => {
    clearSession()
    snackbar.showSnackbar('Hết thời gian truy cập!', 'Bạn cần đăng nhập lại để sử dụng.', 'error')
    router.push('/')
  }

  onMounted(() => {
    const expirationTime = getTokenExpiration() // Lấy thời gian hết hạn token
    const warningTime = expirationTime - 10 * 60 * 1000 // 10 phút trước khi hết hạn
    const timeUntilWarning = warningTime - Date.now() // Tính thời gian đến khi hiển thị cảnh báo

    if (timeUntilWarning > 0) {
      // Đặt timeout cho cảnh báo
      setTimeout(() => {
        if (!sessionStorage.getItem('sessionEndWarningDisplayed')) {
          snackbar.showSnackbar(
            'Bạn sẽ được đăng xuất sau 10 phút nữa!',
            'Hãy hoàn thành công việc trước khi phiên hết hạn.',
            'warning',
            10000
          )
          sessionStorage.setItem('sessionEndWarningDisplayed', 'true')
        }
      }, timeUntilWarning)
    }

    // Đặt timeout cho việc đăng xuất
    const timeUntilExpiration = expirationTime - Date.now()
    if (timeUntilExpiration > 0) {
      setTimeout(handleLogoutWhenSessionExpire, timeUntilExpiration)
    } else {
      handleLogoutWhenSessionExpire()
    }
  })

  return { handleLogoutWhenSessionExpire }
}
