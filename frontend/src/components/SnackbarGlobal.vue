<script lang="ts" setup>
import { useSnackbarStore } from '@/stores/snackbar';
import { toRefs } from 'vue';

const snackbarStore = useSnackbarStore();
const { snackbarVisible, errorMsg, errorDetail, snackbarStatus } = toRefs(snackbarStore);
</script>

<template>
  <div class="text-center">
    <v-snackbar v-model="snackbarVisible" theme="light" :color="snackbarStatus" location="bottom right">
      <div class="text-subtitle-1 font-weight-bold pb-2">{{ errorMsg }}</div>
      <p>{{ errorDetail }}</p>
    </v-snackbar>
  </div>
</template>
