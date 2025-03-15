import AuthLayout from 'src/layouts/AuthLayout.vue'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: AuthLayout,
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('pages/LoginPage.vue'),
      },
    ],
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('layouts/MainLayout.vue'),
    redirect: '/dashboard/home',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'home',
        name: 'Tổng quan',
        component: () => import('pages/IndexPage.vue'),
      },
      {
        path: 'manage',
        children: [
          {
            path: 'admin',
            name: 'Quản trị viên',
            component: () => import('pages/AdminPage.vue'),
          },
          {
            path: 'manager',
            name: 'Quản lý viên',
            component: () => import('pages/ManagerPage.vue'),
          },
          {
            path: 'teacher',
            name: 'Giáo viên',
            component: () => import('pages/TeacherPage.vue'),
          },
        ],
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
