<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from 'vue-router';
import Menu from 'primevue/menu';
import Avatar from 'primevue/avatar';
import Badge from 'primevue/badge';
import Button from 'primevue/button';
const router = useRouter();
const route = useRoute();

// Menu items configuration
const menuItems = ref([
    {
        id: 'dashboard',
        label: 'Trang chủ',
        icon: 'pi pi-home',
        to: '/'
    },
    {
        id: 'documents',
        label: 'Tài liệu',
        icon: 'pi pi-folder',
        items: [
            {
                id: 'new-doc',
                label: 'Tạo mới',
                icon: 'pi pi-plus',
                shortcut: '⌘+N',
                command: () => handleNewDocument()
            },
            {
                id: 'search-doc', 
                label: 'Tìm kiếm',
                icon: 'pi pi-search',
                shortcut: '⌘+S'
            }
        ]
    },
    {
        id: 'profile',
        label: 'Cá nhân',
        icon: 'pi pi-user',
        items: [
            {
                id: 'settings',
                label: 'Cài đặt',
                icon: 'pi pi-cog',
                to: '/settings'
            },
            {
                id: 'messages',
                label: 'Tin nhắn',
                icon: 'pi pi-inbox',
                badge: 2,
                to: '/messages'
            },
            {
                id: 'logout',
                label: 'Đăng xuất',
                icon: 'pi pi-sign-out',
                command: () => handleLogout()
            }
        ]
    }
]);

// Computed active menu item
const activeMenuItem = computed(() => {
    return menuItems.value.find(item => 
        item.to === route.path || 
        item.items?.some(subItem => subItem.to === route.path)
    );
});

// Methods
const handleNewDocument = () => {
    // Xử lý tạo tài liệu mới
    console.log('Creating new document');
};

const handleLogout = async () => {
    // Xử lý đăng xuất
    try {
        // Gọi API đăng xuất
        await router.push('/login');
    } catch (error) {
        console.error('Logout failed:', error);
    }
};

const navigateToRoute = (to) => {
    if (to) {
        router.push(to);
    }
};
</script>

<template>
    <!-- Main wrapper -->
    <div class="h-full flex flex-col border-r border-surface-200 dark:border-surface-800">
        <!-- Header -->
        <div class="flex-none p-3">
            <div class="h-10 flex items-center gap-2">
                <!-- <img src="@/assets/logo.svg" alt="Logo" class="w-8 h-8" /> -->
                <span class="text-xl font-semibold">
                    DORA<span class="text-primary">E-LEARNING</span>
                </span>
            </div>
        </div>

        <!-- Menu content -->
        <div class="flex-1 overflow-y-auto">
            <Menu :model="menuItems" class="w-full border-none p-2 bg-transparent">
                <template #item="{ item, props }">
                    <router-link
                        v-if="item.to"
                        :to="item.to"
                        v-ripple
                        custom
                        v-slot="{ navigate, href }"
                    >
                        <a 
                            :href="href"
                            v-bind="props.action"
                            @click="navigate"
                            class="flex items-center p-2 rounded-md"
                            :class="{
                                'bg-primary-50 dark:bg-primary-900': route.path === item.to
                            }"
                        >
                            <i :class="[item.icon, 'mr-2']" />
                            <span>{{ item.label }}</span>
                            <Badge v-if="item.badge" :value="item.badge" class="ml-auto" />
                            <span
                                v-if="item.shortcut"
                                class="ml-auto text-xs text-surface-500 dark:text-surface-400 px-2 py-1 bg-surface-100 dark:bg-surface-800 rounded"
                            >
                                {{ item.shortcut }}
                            </span>
                        </a>
                    </router-link>

                    <a
                        v-else
                        v-ripple
                        v-bind="props.action"
                        @click="item.command"
                        class="flex items-center p-2 rounded-md"
                    >
                        <i :class="[item.icon, 'mr-2']" />
                        <span>{{ item.label }}</span>
                        <Badge v-if="item.badge" :value="item.badge" class="ml-auto" />
                        <span
                            v-if="item.shortcut"
                            class="ml-auto text-xs text-surface-500 dark:text-surface-400 px-2 py-1 bg-surface-100 dark:bg-surface-800 rounded"
                        >
                            {{ item.shortcut }}
                        </span>
                    </a>
                </template>
            </Menu>
        </div>

        <!-- Footer with profile button -->
        <div class="flex-none mt-auto p-3">
            <Button
                v-ripple
                severity="secondary"
                class="flex w-full justify-start"
            >
                <Avatar
                    image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png"
                    class="mr-2"
                    shape="circle"
                />
                <div class="flex flex-col items-start">
                    <span class="font-semibold">Amy Elsner</span>
                    <span class="text-sm text-surface-500 dark:text-surface-400">
                        Admin
                    </span>
                </div>
            </Button>
        </div>
    </div>
</template>
