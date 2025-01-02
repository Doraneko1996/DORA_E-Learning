<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

themeStore.init()
</script>

<template>
  <div class="min-h-screen bg-surface-200 dark:bg-surface-950">
    <RouterView />
  </div>
</template>
