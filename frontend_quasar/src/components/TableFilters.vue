<script setup lang="ts">
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'

defineOptions({ name: 'TableFilters' })

interface FilterOption {
  label: string
  value: string
  options: { label: string; value: string | number | boolean | null }[]
}

const props = defineProps<{
  filters: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
  filterOptions: FilterOption[]
}>()

const emit = defineEmits<{
  (e: 'update:filters', value: Record<string, any>): void // eslint-disable-line @typescript-eslint/no-explicit-any
}>()

const $q = useQuasar()
const localFilters = ref({ ...props.filters })

// Đồng bộ filters với parent
watch(localFilters, (newVal) => {
  emit('update:filters', { ...newVal })
}, { deep: true })

// Reset tất cả filters
const resetFilters = () => {
  Object.keys(localFilters.value).forEach(key => {
    localFilters.value[key] = undefined
  })
}
</script>

<template>
  <q-list bordered class="rounded-borders q-mb-md">
    <q-expansion-item :default-opened="!$q.screen.lt.md" dense icon="mdi-filter" label="Lọc dữ liệu">
      <q-card>
        <q-card-section class="row q-col-gutter-x-md">
          <q-select v-for="filter in filterOptions" :key="filter.value" v-model="localFilters[filter.value]"
            :options="filter.options" :label="filter.label" class="col-12 col-md-2 q-mb-sm" outlined dense emit-value
            map-options :behavior="$q.platform.is.ios ? 'dialog' : 'menu'" />
          <div class="flex col justify-end items-center q-mb-sm"
            :class="{ 'hidden': !Object.values(localFilters).some(val => val !== undefined) }">
            <q-chip clickable @click="resetFilters" color="red" text-color="white" icon="mdi-filter-remove-outline"
              label="Xóa bộ lọc" />
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </q-list>
</template>
