<script setup lang="ts">
import { useLayoutStore } from '@/stores/layout'
import { useRoute, useRouter } from 'vue-router'
import { ref, computed } from 'vue'
import Menu from 'primevue/menu'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'

const route = useRoute()
const router = useRouter()
const menu = ref()
const userMenu = ref()
const layoutStore = useLayoutStore()

const menuItems = ref([
    {
        label: 'Tổng quan',
        icon: 'pi pi-chart-line',
        route: '/dashboard/home'
    },
    {
        label: 'Quản lý',
        icon: 'pi pi-cog',
        items: [
            {
                label: 'Quản trị viên',
                icon: 'pi pi-hashtag',
                route: '/dashboard/manage/admin'
            },
            {
                label: 'Người quản lý',
                icon: 'pi pi-briefcase',
                route: '/dashboard/manage/manager'
            },
            {
                label: 'Giáo viên',
                icon: 'pi pi-id-card',
                route: '/dashboard/manage/teacher'
            },
            {
                label: 'Học viên',
                icon: 'pi pi-graduation-cap',
                route: '/dashboard/manage/student'
            },
        ]
    },
    {
        label: 'Quản lý học vụ',
        items: [
            {
                label: 'Trường học',
                icon: 'pi pi-building',
                route: '/dashboard/manage/school'
            },
            {
                label: 'Lớp học',
                icon: 'pi pi-home',
                route: '/dashboard/manage/class'
            },
            {
                label: 'Thời khóa biểu',
                icon: 'pi pi-calendar-clock',
                route: '/dashboard/manage/schedule'
            },
            {
                label: 'Học liệu',
                icon: 'pi pi-book',
                route: '/dashboard/manage/learning-resource'
            },
            {
                label: 'Đề thi',
                icon: 'pi pi-file-edit',
                route: '/dashboard/manage/exam'
            },
            {
                label: 'Điểm số',
                icon: 'pi pi-check-square',
                route: '/dashboard/manage/result'
            },
        ]
    }
])

const userMenuItems = ref([
    {
        id: 'profile',
        label: 'Thông tin cá nhân',
        icon: 'pi pi-user',
        route: '/dashboard/profile'
    },
    {
        id: 'setting',
        label: 'Cài đặt',
        icon: 'pi pi-cog',
        route: '/dashboard/setting'
    },
    {
        id: 'logout',
        label: 'Đăng xuất',
        icon: 'pi pi-sign-out',
        command: () => handleLogout()
    }
])

const toggleUserMenu = (event: MouseEvent) => {
    userMenu.value.toggle(event)
}

const activeMenuItem = computed(() => {
    return menuItems.value.find(item =>
        item.route === route.path ||
        item.items?.some(subItem => subItem.route === route.path)
    )
})

const handleLogout = async () => {
    try {
        await router.push('/login')
    } catch (error) {
        console.error('Logout failed:', error)
    }
}

const navigateToRoute = (to: string) => {
    if (to) {
        router.push(to)
    }
}
</script>

<template>
    <!-- Menu Container -->
    <div class="h-full flex flex-col overflow-auto"
        :class="[layoutStore.isMenuCollapsed ? 'w-0 border-r-0' : 'w-[270px]']">

        <!-- Logo & Brand -->
        <div class="flex-none p-3">
            <div class="h-10 flex items-center gap-2">
                <svg width="35" height="40" viewBox="0 0 35 40" fill="none" xmlns="http://www.w3.org/2000/svg"
                    class="h-8">
                    <path
                        d="M25.87 18.05L23.16 17.45L25.27 20.46V29.78L32.49 23.76V13.53L29.18 14.73L25.87 18.04V18.05ZM25.27 35.49L29.18 31.58V27.67L25.27 30.98V35.49ZM20.16 17.14H20.03H20.17H20.16ZM30.1 5.19L34.89 4.81L33.08 12.33L24.1 15.67L30.08 5.2L30.1 5.19ZM5.72 14.74L2.41 13.54V23.77L9.63 29.79V20.47L11.74 17.46L9.03 18.06L5.72 14.75V14.74ZM9.63 30.98L5.72 27.67V31.58L9.63 35.49V30.98ZM4.8 5.2L10.78 15.67L1.81 12.33L0 4.81L4.79 5.19L4.8 5.2ZM24.37 21.05V34.59L22.56 37.29L20.46 39.4H14.44L12.34 37.29L10.53 34.59V21.05L12.42 18.23L17.45 26.8L22.48 18.23L24.37 21.05ZM22.85 0L22.57 0.69L17.45 13.08L12.33 0.69L12.05 0H22.85Z"
                        fill="var(--p-primary-color)" />
                    <path
                        d="M30.69 4.21L24.37 4.81L22.57 0.69L22.86 0H26.48L30.69 4.21ZM23.75 5.67L22.66 3.08L18.05 14.24V17.14H19.7H20.03H20.16H20.2L24.1 15.7L30.11 5.19L23.75 5.67ZM4.21002 4.21L10.53 4.81L12.33 0.69L12.05 0H8.43002L4.22002 4.21H4.21002ZM21.9 17.4L20.6 18.2H14.3L13 17.4L12.4 18.2L12.42 18.23L17.45 26.8L22.48 18.23L22.5 18.2L21.9 17.4ZM4.79002 5.19L10.8 15.7L14.7 17.14H14.74H15.2H16.85V14.24L12.24 3.09L11.15 5.68L4.79002 5.2V5.19Z"
                        fill="var(--p-text-color)" />
                </svg>
                <span class="text-xl font-semibold">
                    DORA<span class="text-primary">E-LEARNING</span>
                </span>
            </div>
        </div>

        <!-- Menu Items -->
        <div class="flex-1">
            <Menu ref="menu" :model="menuItems" class="w-full border-none p-2 bg-transparent" />
        </div>

        <!-- User Profile -->
        <div class="flex-none mt-auto p-3">
            <Button @click="toggleUserMenu" aria-haspopup="true" aria-controls="user_menu"
                class="flex w-full justify-start" severity="secondary">
                <Avatar image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png" class="mr-2"
                    shape="circle" />
                <div class="flex flex-col items-start">
                    <span class="font-semibold">Doraneko</span>
                    <span class="text-sm text-surface-500 dark:text-surface-400">Admin</span>
                </div>
            </Button>
            <Menu ref="userMenu" id="user_menu" :model="userMenuItems" :popup="true" />
        </div>
    </div>
</template>