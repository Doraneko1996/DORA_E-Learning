import axios from 'axios'
import { useSnackbarStore } from '@/stores/snackbar'
import router from '@/router'

//#####===== XỬ LÝ ĐĂNG XUẤT KHI HẾT PHIÊN ĐĂNG NHẬP (BE) =====#####//
//##################################################################//
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Kiểm tra nếu lỗi là do token hết hạn
    if (error.response.status === 401) {
      sessionStorage.clear()
      const snackbar = useSnackbarStore()
      snackbar.showSnackbar('Phiên đăng nhập đã hết hạn!', 'Vui lòng đăng nhập lại.', 'error')
      // Chuyển hướng đến trang đăng nhập
      router.push('/')
    }

    return Promise.reject(error)
  },
)
//##################################################################//

//#####===== XỬ LÝ TỰ ĐỘNG GẮN TOKEN VÀO HEADER =====#####//
//########################################################//
const api = axios.create({
  baseURL: '/api'
})

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    Promise.reject(error)
  },
)

export default api
//########################################################//
