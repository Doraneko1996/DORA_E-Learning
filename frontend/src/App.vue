<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { computed } from 'vue'
import SnackbarGlobal from '@/components/SnackbarGlobal.vue'

const themeStore = useThemeStore()
const theme = computed(() => themeStore.theme)
const background = computed(() => themeStore.background)
</script>

<template>
  <v-app :theme="theme"
    :style="{ background: background === 'on' ? 'linear-gradient(to top, #00c6fb 0%, #005bea 100%)' : '' }">
    <router-view />
    <SnackbarGlobal />
  </v-app>
</template>
