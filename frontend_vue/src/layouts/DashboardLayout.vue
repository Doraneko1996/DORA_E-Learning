<script setup lang="ts">
import Menu from '@/components/Menu.vue';
import ThemeToggle from '@/components/ThemeToggle.vue';
</script>

<template>
    <div class="flex min-h-screen">
        <!-- Sidebar -->
        <aside class="w-[270px] h-screen flex-none bg-surface-0 dark:bg-surface-900">
            <Menu />
        </aside>

        <!-- Main Content -->
        <main class="flex-1 flex flex-col min-h-screen">
            <!-- Header với theme toggle -->
            <div class="sticky top-0 z-40 bg-surface-0 dark:bg-surface-900">
                <div class="flex justify-end p-3">
                    <ThemeToggle />
                </div>
            </div>

            <!-- Page Content -->
            <div class="flex-1 p-4">
                <slot />
            </div>
        </main>
    </div>
</template>