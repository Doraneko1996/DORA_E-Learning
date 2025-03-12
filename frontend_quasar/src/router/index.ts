import { defineRouter } from '#q-app/wrappers'
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router'
import routes from './routes'
import { Notify, SessionStorage } from 'quasar'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // Guard kiểm tra xác thực
  Router.beforeEach((to, from, next) => {
    // Kiểm tra xem route có yêu cầu đăng nhập không
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
    // Kiểm tra xem người dùng đã đăng nhập chưa
    const isAuthenticated = !!SessionStorage.getItem<string>('access_token')

    if (requiresAuth && !isAuthenticated) {
      // Nếu route yêu cầu đăng nhập nhưng người dùng chưa đăng nhập, chuyển hướng về login
      next({ name: 'login' })
      Notify.create({
        type: 'negative',
        multiLine: true,
        message: 'Không có quyền truy cập',
        caption: 'Bạn cần đăng nhập để sử dụng',
        position: 'top',
      })
    } else if (to.path === '/' && isAuthenticated) {
      // Chuyển hướng người dùng đã đăng nhập khỏi trang login
      next({ name: 'dashboard' })
    } else {
      // Nếu không, cho phép điều hướng bình thường
      next()
    }
  })

  return Router
})
