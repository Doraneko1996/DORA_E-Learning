import { defineBoot } from '#q-app/wrappers'
import axios, { type AxiosInstance } from 'axios'
import { Notify, SessionStorage } from 'quasar'

// Khai báo kiểu cho Vue global properties
declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance
    $api: AxiosInstance
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({ baseURL: `${process.env.API_ENDPOINT}` })

export default defineBoot(({ app, router }) => {
  // Gắn token tự động vào header cho mỗi request
  api.interceptors.request.use(
    (config) => {
      const token = SessionStorage.getItem<string>('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(
        error instanceof Error ? error : new Error('Request configuration failed'),
      )
    },
  )

  // Xử lý khi hết phiên đăng nhập
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        SessionStorage.clear()

        Notify.create({
          type: 'negative',
          message: 'Phiên đăng nhập đã hết hạn',
          caption: 'Vui lòng đăng nhập lại nha',
        })

        await router.push('/')
      }
      return Promise.reject(error instanceof Error ? error : new Error('Request failed'))
    },
  )
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
})

export { api }
