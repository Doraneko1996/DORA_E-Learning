<script setup lang="ts">
import { useLayoutStore } from '@/stores/layout'
import Button from 'primevue/button'

const layoutStore = useLayoutStore()
</script>

<template>
    <Button @click="layoutStore.toggleMenu"
        :icon="layoutStore.isMenuCollapsed ? 'pi pi-caret-right' : 'pi pi-caret-left'"
        class="bg-surface-0 dark:bg-surface-900" variant="text" raised aria-label="Sidebar Menu" />
</template>