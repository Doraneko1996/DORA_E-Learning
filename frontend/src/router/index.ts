import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import CRUDLayout from '@/layouts/CRUDLayout.vue'
import { useSnackbarStore } from '@/stores/snackbar'
import AdminView from '@/views/AdminView.vue'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/dashboard',
      meta: { requiresAuth: true },
      name: 'dashboard',
      component: DashboardView,
      redirect: '/dashboard/home',
      children: [
        {
          path: 'home',
          meta: { title: 'Tổng quan' },
          component: HomeView,
        },
        {
          path: 'profile',
          meta: { title: 'Thông tin cá nhân' },
          component: LoginView,
        },
        {
          path: 'setting',
          meta: { title: 'Cài đặt' },
          component: LoginView,
        },
        {
          path: 'manage',
          component: CRUDLayout,
          children: [
            {
              path: 'admin',
              meta: {
                title: 'Quản trị viên',
                apiEndpoint: '/api/admin'
              },
              component: AdminView,
            },
            {
              path: 'manager',
              meta: { title: 'Quản lý viên' },
              component: LoginView,
            },
            {
              path: 'teacher',
              meta: { title: 'Giáo viên' },
              component: LoginView,
            },
            {
              path: 'student',
              meta: { title: 'Học viên' },
              component: LoginView,
            },
            {
              path: 'school',
              meta: { title: 'Trường học' },
              component: LoginView,
            },
            {
              path: 'class',
              meta: { title: 'Lớp học' },
              component: LoginView,
            },
            {
              path: 'schedule',
              meta: { title: 'Thời khóa biểu' },
              component: LoginView,
            },
            {
              path: 'edukit',
              meta: { title: 'Học liệu' },
              component: LoginView,
            },
            {
              path: 'exam',
              meta: { title: 'Đề thi' },
              component: LoginView,
            },
            {
              path: 'result',
              meta: { title: 'Điểm số' },
              component: LoginView,
            },
          ]
        },
      ]
    },
  ],
})

//===== GUARD KIỂM TRA XÁC THỰC =====//
router.beforeEach((to, from, next) => {
  const snackbar = useSnackbarStore()
  const isAuthenticated = !!sessionStorage.getItem('access_token'); // Kiểm tra token

  if (to.meta.requiresAuth && !isAuthenticated) {
    snackbar.showSnackbar('Không có quyền truy cập!', 'Bạn cần đăng nhập để sử dụng.', 'error')
    next({ name: 'login' }); // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
  } else {
    next(); // Cho phép truy cập
  }
})
//===================================//

export default router
