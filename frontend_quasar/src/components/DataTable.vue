<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { useQuasar } from 'quasar'
import { QTable } from 'quasar';
import { api } from 'src/boot/axios'
import { formatDateTime } from 'src/boot/dayjs'
import { getErrorMessage } from 'src/utils/error.utils'

export interface Column {
  name: string;
  label: string;
  field: string | ((row: any) => any); // eslint-disable-line @typescript-eslint/no-explicit-any
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
}

const $q = useQuasar()

// Tính toán màu nền dựa trên dark mode
const headerBackground = computed(() => {
  return $q.dark.isActive ? 'var(--q-blue-10)' : 'var(--q-blue-1)'
})

// Định nghĩa props
const props = defineProps({
  endpoint: { type: String, required: true },
  headers: { type: Array as () => Column[], required: true },
  selection: { type: String as () => 'multiple' | 'single' | 'none', default: 'none' },
  separator: { type: String as () => 'horizontal' | 'vertical' | 'cell' | 'none' | undefined },
  filters: { type: Object, default: () => ({}) },
})

// Định nghĩa emits
const emit = defineEmits(['edit', 'delete', 'status-change', 'update:filters', 'update:selected', 'filters-changed'])

// Trạng thái nội bộ
const tableRef: Ref<QTable | null> = ref(null)
const items = ref<any[]>([]) // eslint-disable-line @typescript-eslint/no-explicit-any
const totalItems = ref(0)
const selected = ref<any[]>([]) // eslint-disable-line @typescript-eslint/no-explicit-any
const loading = ref(false)
const lastUpdated = ref<Date | null>(null)
const pagination = ref({
  sortBy: 'createdAt',
  descending: true,
  page: 1,
  rowsPerPage: 50,
  rowsNumber: 0,
})
const searchQuery = ref('')

// Tải dữ liệu từ API
const loadData = (requestProp: {
  pagination: { sortBy: string; descending: boolean; page: number; rowsPerPage: number; rowsNumber?: number };
  filter?: string;
}) => {
  const { page, rowsPerPage, sortBy, descending } = requestProp.pagination;
  loading.value = true;

  // Lọc các filter có giá trị
  const activeFilters = Object.fromEntries(
    Object.entries(props.filters).filter(([, value]) => value !== undefined)
  );

  api.post(props.endpoint, {
    page,
    limit: rowsPerPage,
    sortBy,
    order: descending ? 'desc' : 'asc',
    search: searchQuery.value || undefined,
    ...activeFilters,
  })
    .then((response) => {
      items.value = response.data.data;
      totalItems.value = response.data.meta.total;
      lastUpdated.value = response.data.timestamp || null;
      pagination.value = {
        ...pagination.value,
        page,
        rowsPerPage,
        sortBy,
        descending,
        rowsNumber: totalItems.value,
      };
    })
    .catch((error) => {
      $q.notify({
        type: 'negative',
        message: 'Lỗi khi tải dữ liệu',
        caption: getErrorMessage(error, 'Lỗi không xác định')
      })
    })
    .finally(() => {
      loading.value = false;
    });
};

// Xử lý tìm kiếm
const handleSearch = () => {
  pagination.value.page = 1
  tableRef.value?.requestServerInteraction()
}

// Xử lý làm mới
const handleRefresh = () => {
  searchQuery.value = ''
  pagination.value.page = 1
  tableRef.value?.requestServerInteraction()
}

// Theo dõi thay đổi filters
watch(() => props.filters, (newVal) => {
  emit('filters-changed', newVal)
}, { deep: true })

// Theo dõi thay đổi selected
watch(selected, (newVal: { id: number }[]) => {
  emit('update:selected', newVal.map(item => item.id))
}, { deep: true })

onMounted(() => {
  // get initial data from server (1st page)
  tableRef.value?.requestServerInteraction()
})

// Phương thức làm mới bảng
const refresh = () => {
  if (tableRef.value) {
    tableRef.value.requestServerInteraction();
  }
};

// Expose phương thức refresh để component cha có thể truy cập
defineExpose({
  refresh,
  clearSelection: () => tableRef.value?.clearSelection(),
});
</script>

<template>
  <div>
    <!-- Slot cho filters -->
    <slot name="filters"></slot>

    <q-table ref="tableRef" :rows="items" :columns="headers" :separator="separator" row-key="id" :loading="loading"
      v-model:pagination="pagination" :filter="searchQuery" rows-per-page-label="Số lượng:"
      :rows-per-page-options="[50, 100, 200, 500]" @request="loadData" :selection="selection"
      v-model:selected="selected" flat bordered class="custom-table" :style="{ '--header-bg': headerBackground }"
      color="primary">
      <!-- Toolbar tùy chỉnh -->
      <template v-slot:top>
        <q-toolbar class="q-gutter-xs q-pa-xs">
          <q-btn flat round size="sm" color="negative" v-if="selected.length > 0" icon="close" @click="selected = []" />
          <q-toolbar-title class="text-subtitle1" v-if="selected.length > 0">
            Đã chọn {{ selected.length }} mục
          </q-toolbar-title>
          <slot name="toolbar-bulk-actions" :selectedIds="selected.map(item => item.id)"></slot>
          <q-input debounce="500" v-if="!selected.length" v-model="searchQuery" dense outlined
            placeholder="Nhập từ khóa..." style="min-width: 200px" prepend-inner-icon="search"
            @keyup.enter="handleSearch" clearable>
            <template v-slot:prepend>
              <q-icon name="mdi-magnify" />
            </template>
          </q-input>
          <q-btn v-if="!selected.length" icon="refresh" @click="handleRefresh" :loading="loading" flat round />
          <span v-if="!selected.length && lastUpdated" class="gt-xs text-caption text-italic">
            Cập nhật: {{ formatDateTime(lastUpdated) }}
          </span>
          <q-space v-if="!selected.length" />
          <slot name="toolbar-view-actions"></slot>
        </q-toolbar>
      </template>

      <!-- Tùy chỉnh phân trang -->
      <template v-slot:pagination="scope">
        <span class="text-caption">
          Tổng: {{ totalItems }}
        </span>
        <q-btn v-if="scope.pagesNumber > 2" icon="first_page" color="primary" round dense flat
          :disable="scope.isFirstPage" @click="scope.firstPage" />
        <q-btn icon="chevron_left" color="primary" round dense flat :disable="scope.isFirstPage"
          @click="scope.prevPage" />
        <span class="q-mx-sm">
          Tr. {{ scope.pagination.page }} / {{ scope.pagesNumber }}
        </span>
        <q-btn icon="chevron_right" color="primary" round dense flat :disable="scope.isLastPage"
          @click="scope.nextPage" />
        <q-btn v-if="scope.pagesNumber > 2" icon="last_page" color="primary" round dense flat
          :disable="scope.isLastPage" @click="scope.lastPage" />
      </template>

      <template v-slot:loading>
        <q-inner-loading label="Đang tải..." label-style="font-size: 1.2em" showing color="primary" />
      </template>

      <!-- Slot cho cột hành động -->
      <template v-slot:body-cell-actions="props">
        <q-td class="text-center">
          <slot name="body-cell-actions" :row="props.row"></slot>
        </q-td>
      </template>

      <!-- Slot cho cột trạng thái -->
      <template v-slot:body-cell-status="props">
        <q-td class="text-center">
          <slot name="body-cell-status" :row="props.row"></slot>
        </q-td>
      </template>

      <!-- Slot cho cột ngày sinh -->
      <template v-slot:body-cell-dob="props">
        <q-td class="text-center">
          <slot name="body-cell-dob" :row="props.row"></slot>
        </q-td>
      </template>

      <!-- Slot cho cột giới tính -->
      <template v-slot:body-cell-gender="props">
        <q-td class="text-center">
          <slot name="body-cell-gender" :row="props.row"></slot>
        </q-td>
      </template>
    </q-table>
  </div>
</template>
