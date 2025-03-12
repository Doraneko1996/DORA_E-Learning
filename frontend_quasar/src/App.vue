<template>
  <router-view />
</template>

<script setup lang="ts">
import { useThemeStore } from 'src/stores/theme.store';

const themeStore = useThemeStore();
themeStore.loadTheme();
</script>
