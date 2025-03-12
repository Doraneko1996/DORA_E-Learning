import { onMounted } from 'vue'
import { Notify, SessionStorage } from 'quasar'
import { useRouter } from 'vue-router'
import { clearSession, getTokenExpiration } from 'src/utils/storage.utils'

export const useSessionTimeout = () => {
  const router = useRouter()

  const handleLogoutWhenSessionExpire = async () => {
    clearSession()
    Notify.create({
      type: 'negative',
      multiLine: true,
      timeout: 0,
      actions: [{ label: 'Đã hiểu', color: 'white' }],
      message: 'Hết thời gian truy cập',
      caption: 'Bạn cần đăng nhập lại để sử dụng',
      position: 'top',
    })
    await router.push('/')
  }

  onMounted(() => {
    const expirationTime = getTokenExpiration() // Lấy thời gian hết hạn token
    const warningTime = expirationTime - 10 * 60 * 1000 // 10 phút trước khi hết hạn
    const timeUntilWarning = warningTime - Date.now() // Tính thời gian đến khi hiển thị cảnh báo

    if (timeUntilWarning > 0) {
      setTimeout(() => {
        if (!SessionStorage.getItem<boolean>('sessionEndWarningDisplayed')) {
          Notify.create({
            type: 'warning',
            multiLine: true,
            timeout: 599000,
            actions: [{ label: 'Đã hiểu', color: 'dark' }],
            message: 'Bạn sẽ được đăng xuất sau 10 phút nữa',
            caption: 'Hãy hoàn thành công việc trước khi phiên hết hạn',
          })
          SessionStorage.setItem('sessionEndWarningDisplayed', true)
        }
      }, timeUntilWarning)
    }

    // Đặt timeout cho việc đăng xuất
    const timeUntilExpiration = expirationTime - Date.now()
    if (timeUntilExpiration > 0) {
      setTimeout(() => void handleLogoutWhenSessionExpire(), timeUntilExpiration)
    } else {
      void handleLogoutWhenSessionExpire()
    }
  })

  return { handleLogoutWhenSessionExpire }
}
