import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSnackbarStore = defineStore('SnackbarStore', () => {
  const snackbarVisible = ref(false)
  const errorMsg = ref('')
  const errorDetail = ref('')
  const snackbarStatus = ref('error')
  const duration = ref(3000);

  const showSnackbar = (msg: string, detailMsg: string, status: string, durationTime: number = 3000) => {
    errorMsg.value = msg
    errorDetail.value = detailMsg
    snackbarStatus.value = status
    snackbarVisible.value = true
    duration.value = durationTime
    setTimeout(() => {
      closeSnackbar()
    }, duration.value)
  }

  function closeSnackbar() {
    snackbarVisible.value = false
  }

  return { errorMsg, errorDetail, snackbarStatus, snackbarVisible, showSnackbar, closeSnackbar }
})
