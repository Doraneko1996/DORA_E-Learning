<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import { ref } from 'vue'

const themeStore = useThemeStore()
const menu = ref()

const items = [
    {
        label: 'Giao diện',
        items: [
            {
                label: 'Sáng',
                icon: 'pi pi-sun',
                command: () => themeStore.setTheme('light'),
                class: themeStore.theme === 'light' ? 'text-primary' : ''
            },
            {
                label: 'Tối',
                icon: 'pi pi-moon',
                command: () => themeStore.setTheme('dark'),
                class: themeStore.theme === 'dark' ? 'text-primary' : ''
            },
            {
                label: 'Hệ thống',
                icon: 'pi pi-desktop',
                command: () => themeStore.setTheme('system'),
                class: themeStore.theme === 'system' ? 'text-primary' : ''
            }
        ]
    }
]

const toggleMenu = (event: Event) => {
    menu.value.toggle(event)
}
</script>

<template>
    <Button class="bg-surface-0 dark:bg-surface-900" @click="toggleMenu"
        :icon="themeStore.isDark ? 'pi pi-moon' : 'pi pi-sun'" variant="text" raised aria-label="Theme" />
    <Menu ref="menu" :model="items" :popup="true" />
</template>