<template>
  <v-btn :icon="theme === 'dark' ? 'mdi-weather-sunny' : 'mdi-weather-night'" @click="toggleTheme" />
</template>

<script lang="ts" setup>
import { useThemeStore } from '@/stores/theme'
import { computed } from 'vue'

const themeStore = useThemeStore()
const theme = computed(() => themeStore.theme)

function toggleTheme() {
  themeStore.toggleTheme()
}
</script>
