import axios from 'axios'
import { useSnackbarStore } from '@/stores/snackbar'
import router from '@/router'

const snackbar = useSnackbarStore()

//===== XỬ LÝ ĐĂNG XUẤT KHI HẾT PHIÊN ĐĂNG NHẬP (BE) =====//
axios.interceptors.response.use(
  response => response,
  error => {

    // Kiểm tra nếu lỗi là do token hết hạn
    if (error.response.status === 401) {
      snackbar.showSnackbar('Phiên đăng nhập đã hết hạn!', 'Vui lòng đăng nhập lại.', 'error')
      // Chuyển hướng đến trang đăng nhập
      router.push('/')
    }

    return Promise.reject(error)
  }
);
//========================================================//
