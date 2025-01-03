<script setup lang="ts">
import ThemeToggle from '@/components/ThemeToggle.vue'
import SidebarMenuToggle from '@/components/SidebarMenuToggle.vue'
import SidebarMenu from '@/components/SidebarMenu.vue'
</script>

<template>
    <div class="flex min-h-screen">
        <!-- Sidebar -->
        <aside class="h-screen flex-none bg-surface-0 dark:bg-surface-900">
            <SidebarMenu />
        </aside>

        <!-- Main Content -->
        <main class="flex-1 flex flex-col min-h-screen">
            <!-- Header -->
            <div class="sticky top-0 z-40 bg-transparent">
                <div class="flex justify-between items-center p-3">
                    <SidebarMenuToggle />
                    <ThemeToggle />
                </div>
            </div>

            <!-- Page Content -->
            <div class="flex-1 p-3">
                <slot />
            </div>
        </main>
    </div>
</template>