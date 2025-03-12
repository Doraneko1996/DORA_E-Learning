<template>
  <q-btn
    round
    dense
    flat
    :icon="themeStore.darkMode ? 'mdi-lightbulb-on-outline' : 'mdi-lightbulb-night'"
    @click="themeStore.toggleTheme"
  />
</template>

<script setup lang="ts">
import { useThemeStore } from 'src/stores/theme.store';

const themeStore = useThemeStore();
</script>
