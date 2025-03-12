<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PropType } from 'vue'
import { useDayjs } from '@/composables/useDayjs'
import { useSnackbarStore } from '@/stores/snackbar'
import { getErrorMessage } from '@/utils/error.utils'
import api from '@/axios-config'

interface Header {
  title: string
  key: string
  sortable?: boolean
  width?: string | number
  align?: 'start' | 'end' | 'center'
  nowrap?: boolean
}

interface SortItem {
  key: string
  order: 'asc' | 'desc'
}

const { formatDate, formatDateTime } = useDayjs()
const props = defineProps({
  endpoint: { type: String, required: true },
  headers: { type: Array as PropType<Header[]>, required: true },
  separator: { type: String },
  itemsPerPageOptions: { type: Array as PropType<number[]>, default: () => [50, 100, 200, 500] },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
})

const emit = defineEmits(['edit', 'delete', 'status-change', 'update:filters', 'update:selected'])

// Stores
const snackbar = useSnackbarStore()

// State
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const items = ref<any[]>([])
const totalItems = ref(0)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selected = ref<any[]>([])
const loading = ref(false)
const lastUpdated = ref<Date | null>(null)
const page = ref(1)
const itemsPerPage = ref(props.itemsPerPageOptions[0])
const sortBy = ref<SortItem[]>([])
const searchQuery = ref('')

// Fetch data with merged filters
const loadData = async () => {
  try {
    loading.value = true

    const response = await api.post(props.endpoint, {
      page: page.value,
      limit: itemsPerPage.value,
      sortBy: sortBy.value[0]?.key || 'createdAt',
      order: sortBy.value[0]?.order || 'desc',
      search: searchQuery.value,
      ...props.filters,
    })

    items.value = response.data.data
    totalItems.value = response.data.meta.total
    lastUpdated.value = new Date() // Cập nhật thời gian khi tải dữ liệu thành công
  } catch (error) {
    // Hiển thị thông báo lỗi
    snackbar.showSnackbar(
      'Cập nhật trạng thái thất bại',
      getErrorMessage(error, 'Lỗi không xác định'),
      'error',
    )

    console.error('Lỗi khi tải dữ liệu:', error)
  } finally {
    loading.value = false
  }
}

// Hàm xử lý tìm kiếm
const handleSearch = () => {
  page.value = 1
  loadData()
}

// Hàm xử lý tải lại dữ liệu
const handleRefresh = () => {
  searchQuery.value = ''
  page.value = 1
  loadData()
}

// Watchers
watch(() => props.filters, loadData, { deep: true })
watch(
  selected,
  (newVal) => {
    emit('update:selected', newVal.map(item => item.id))
  },
  { deep: true }
)

// defineExpose để cho phép component cha truy cập vào các biến trong component con
defineExpose({
  loading,
  items,
  loadData
})
</script>

<template>
  <v-card>
    <v-toolbar :color="selected.length ? 'deep-purple-lighten-1' : 'theme'">
      <v-btn v-if="selected.length > 0" icon @click="selected = []">
        <v-icon>mdi-close</v-icon>
      </v-btn>

      <v-toolbar-title v-if="selected.length > 0" class="text-body-1">
        Đã chọn {{ selected.length }} mục
      </v-toolbar-title>

      <!-- Slot cho các hành động khi chọn nhiều mục -->
      <slot name="toolbar-bulk-actions" :selectedIds="selected.map(item => item.id)"></slot>

      <!-- Phần search và refresh -->
      <v-text-field v-if="!selected.length" v-model="searchQuery" class="pl-5" density="compact" variant="outlined"
        max-width="300" placeholder="Nhập từ khóa và ấn Enter" prepend-inner-icon="mdi-magnify" single-line clearable
        hide-details :disabled="loading" @keyup.enter="handleSearch" />

      <v-btn v-if="!selected.length" icon="mdi-refresh" variant="text" :loading="loading" @click="handleRefresh"
        class="ml-2" />

      <!-- Hiển thị thời gian cập nhật lần cuối -->
      <span v-if="!selected.length && lastUpdated"
        class="ml-2 d-none d-sm-block text-caption text-medium-emphasis font-italic">
        Cập nhật: {{ formatDateTime(lastUpdated) }}
      </span>

      <v-spacer v-if="!selected.length" />

      <!-- Slot cho các hành động đặc thù của view -->
      <slot name="toolbar-view-actions"></slot>
    </v-toolbar>

    <!-- Phần data table -->
    <v-data-table-server v-model="selected" v-model:items-per-page="itemsPerPage" v-model:page="page"
      v-model:sort-by="sortBy" :headers="headers" :items="items" :items-length="totalItems" :loading="loading"
      :items-per-page-options="itemsPerPageOptions" @update:options="loadData" show-current-page show-select
      return-object fixed-header hover>
      <!-- Slot tùy chỉnh cho cột "Hành động" -->
      <template #[`item.actions`]="{ item }">
        <v-menu>
          <template v-slot:activator="{ props: menuProps }">
            <v-btn icon="mdi-dots-vertical" variant="text" v-bind="menuProps" />
          </template>
          <v-list slim>
            <v-list-item prepend-icon="mdi-pencil-outline" title="Chi tiết" @click="emit('edit', item)" />
            <v-list-item prepend-icon="mdi-trash-can-outline" title="Xóa bỏ" @click="emit('delete', item)" />
          </v-list>
        </v-menu>
      </template>

      <!-- Slot tùy chỉnh cho cột "trạng thái" -->
      <template #[`item.status`]="{ item }">
        <v-switch :model-value="Boolean(item.status)" color="success"
          @update:model-value="$emit('status-change', item, $event)" hide-details />
      </template>

      <!-- Slot tùy chỉnh cho cột "Ngày sinh" -->
      <template #[`item.dob`]="{ item }">
        {{ formatDate(item.dob) }}
      </template>

      <!-- Slot tùy chỉnh cho cột "Giới tính" -->
      <template #[`item.gender`]="{ item }">
        <span v-if="item.gender === null"></span>
        <span v-else-if="item.gender === false">Nữ</span>
        <span v-else>Nam</span>
      </template>

      <template #loading>
        <v-skeleton-loader type="table-row@10" />
      </template>

      <template #[`header.data-table-select`]="{ allSelected, selectAll, someSelected }">
        <v-checkbox-btn :indeterminate="someSelected && !allSelected" :model-value="allSelected" color="primary"
          @update:model-value="selectAll(!allSelected)"></v-checkbox-btn>
      </template>

      <template #[`item.data-table-select`]="{ internalItem, isSelected, toggleSelect }">
        <v-checkbox-btn :model-value="isSelected(internalItem)" color="primary"
          @update:model-value="toggleSelect(internalItem)"></v-checkbox-btn>
      </template>
    </v-data-table-server>
  </v-card>
</template>
