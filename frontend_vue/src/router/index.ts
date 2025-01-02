import { createRouter, createWebHistory } from 'vue-router'
import HelloWorld from '@/components/HelloWorld.vue'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      redirect: '/dashboard/home',
      children: [
        {
          path: 'home',
          component: HelloWorld,
        },
        {
          path: 'manage',
          component: HelloWorld,
          children: [
            {
              path: 'admin',
              component: HelloWorld,
            },
            {
              path: 'manager',
              component: HelloWorld,
            },
            {
              path: 'teacher',
              component: HelloWorld,
            },
            {
              path: 'student',
              component: HelloWorld,
            },
            {
              path: 'school',
              component: HelloWorld,
            },
            {
              path: 'class',
              component: HelloWorld,
            },
            {
              path: 'schedule',
              component: HelloWorld,
            },
            {
              path: 'learning-resource',
              component: HelloWorld,
            },
            {
              path: 'exam',
              component: HelloWorld,
            },
            {
              path: 'result',
              component: HelloWorld,
            },
            {
              path: 'profile',
              component: HelloWorld,
            },
            {
              path: 'setting',
              component: HelloWorld,
            },
          ]
        },
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
