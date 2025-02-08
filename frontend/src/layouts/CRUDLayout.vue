<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useDayjs } from '@/composables/useDayjs'
import axios from 'axios'
import { useSnackbarStore } from '@/stores/snackbar'
import type { CRUDConfig } from '@/types/crud'
import type { CRUDItem } from '@/types/crud'

const snackbar = useSnackbarStore()

// Props để nhận config từ các trang con
const props = withDefaults(defineProps<{
  config: CRUDConfig
  dialog?: boolean
}>(), {
  config: () => ({
    title: '',
    apiEndpoint: '',
    headers: [],
    defaultSort: {
      key: '',
      order: 'asc'
    }
  }),
  dialog: false
})

// Emit các sự kiện
const emit = defineEmits<{
  'update:dialog': [value: boolean]  // v-model cho dialog
  'edit': [item: CRUDItem]    // Sự kiện edit
  'delete': [item: CRUDItem]  // Sự kiện delete
  'save': [item: CRUDItem]    // Sự kiện save
}>()

// Các state cho CRUD
const loading = ref(false)
const items = ref([])
const totalItems = ref(0)
const search = ref('')
const page = ref(1)
const itemsPerPage = ref(10)
const sortBy = ref(props.config.defaultSort?.key || '')
const sortDesc = ref(props.config.defaultSort?.order === 'desc')

// Computed cho dialog
const dialogModel = computed({
  get: () => props.dialog,
  set: (value) => emit('update:dialog', value)
})

// Các methods chung cho CRUD
const fetchData = async () => {
  loading.value = true
  try {
    const response = await axios.post(`${props.config.apiEndpoint}/list`, {
      page: page.value,
      limit: itemsPerPage.value,
      search: search.value,
      sortBy: sortBy.value,
      sortDesc: sortDesc.value
    })

    items.value = response.data.data
    totalItems.value = response.data.total
    page.value = response.data.page
    itemsPerPage.value = response.data.limit

    // Cập nhật lastUpdate
    lastUpdate.value = new Date()
  } catch (error: any) {
    snackbar.showSnackbar(
      'Lỗi tải dữ liệu',
      error.response?.data?.message || 'Lỗi không xác định',
      'error'
    )
  } finally {
    loading.value = false
  }
}

// Watch các thay đổi để tải lại dữ liệu
watch([page, itemsPerPage, search, sortBy, sortDesc], () => {
  fetchData()
})

// Tải dữ liệu khi component được mount
onMounted(() => {
  fetchData()
})

const { formatDateTime } = useDayjs()
const lastUpdate = ref<Date | null>(null)

// Sử dụng hàm format
const getLastUpdate = () => {
  if (!lastUpdate.value) return 'Chưa có dữ liệu'
  return formatDateTime(lastUpdate.value)
}

// Hàm tải lại dữ liệu
const handleRefresh = () => {
  page.value = 1 // Reset về trang đầu
  fetchData()
}

// Expose các biến cần thiết
defineExpose({
  items,
  loading,
  totalItems,
  page,
  itemsPerPage,
  refresh: handleRefresh
})
</script>

<template>
  <div>
    <!-- Toolbar chung -->
    <v-toolbar :elevation="2" rounded class="px-2 mb-4">
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        label="Tìm kiếm"
        variant="outlined"
        hide-details
        clearable
        density="compact"
        max-width="300"
      />

      <!-- Nút refresh và thời gian cập nhật -->
      <v-tooltip location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props" :loading="loading" @click="handleRefresh">
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </template>
        <span>Tải lại dữ liệu</span>
      </v-tooltip>

      <span class="d-none d-sm-block text-caption text-medium-emphasis font-italic">
        Cập nhật cuối:
        <br />
        {{ getLastUpdate() }}
      </span>

      <v-spacer />

      <!-- Hiển thị các nút riêng lẻ trên màn hình lớn -->
      <div class="d-none d-sm-flex">
        <!-- Nút tải file mẫu -->
        <v-tooltip location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props">
              <v-icon>mdi-file-download-outline</v-icon>
            </v-btn>
          </template>
          <span>Tải file mẫu</span>
        </v-tooltip>

        <!-- Nút Import -->
        <v-tooltip location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props">
              <v-icon>mdi-file-import-outline</v-icon>
            </v-btn>
          </template>
          <span>Nhập dữ liệu</span>
        </v-tooltip>

        <!-- Nút Export -->
        <v-tooltip location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props">
              <v-icon>mdi-file-export-outline</v-icon>
            </v-btn>
          </template>
          <span>Xuất dữ liệu</span>
        </v-tooltip>

        <!-- Nút Thêm mới -->
        <v-tooltip location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props" @click="dialogModel = true">
              <v-icon>mdi-plus-box-outline</v-icon>
            </v-btn>
          </template>
          <span>Thêm mới</span>
        </v-tooltip>
      </div>

      <!-- Menu chức năng trên màn hình nhỏ -->
      <div class="d-sm-none">
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>

          <v-list slim>
            <v-list-item prepend-icon="mdi-file-download-outline" title="Tải file mẫu" />
            <v-list-item prepend-icon="mdi-file-import-outline" title="Nhập dữ liệu" />
            <v-list-item prepend-icon="mdi-file-export-outline" title="Xuất dữ liệu" />
            <v-list-item
              prepend-icon="mdi-plus-box-outline"
              title="Thêm mới"
              @click="dialogModel = true"
            />
          </v-list>
        </v-menu>
      </div>
    </v-toolbar>

    <!-- Table chung -->
    <v-data-table-server
      v-model:items-per-page="itemsPerPage"
      v-model:page="page"
      v-model:sort-by="sortBy"
      v-model:sort-desc="sortDesc"
      :headers="config.headers"
      :items="items"
      :loading="loading"
      :items-length="totalItems"
    >
      <!-- Slot cho nội dung tùy chỉnh -->
      <template v-for="(_, name) in $slots" :key="name" #[name]="slotData">
        <slot :name="name" v-bind="slotData" />
      </template>

      <!-- Slot mặc định cho cột actions -->
      <template #item.actions="{ item }" v-if="!$slots['item.actions']">
        <v-tooltip location="top">
          <template v-slot:activator="{ props }">
            <v-btn
              icon="mdi-pencil"
              size="small"
              color="primary"
              class="mr-2"
              v-bind="props"
              @click="emit('edit', item.raw)"
            />
          </template>
          <span>Chỉnh sửa</span>
        </v-tooltip>

        <v-tooltip location="top">
          <template v-slot:activator="{ props }">
            <v-btn
              icon="mdi-delete"
              size="small"
              color="error"
              v-bind="props"
              @click="emit('delete', item.raw)"
            />
          </template>
          <span>Xóa</span>
        </v-tooltip>
      </template>
    </v-data-table-server>

    <!-- Dialog thêm/sửa -->
    <v-dialog v-model="dialogModel" max-width="500px">
      <v-card elevation="16">
        <v-card-item>
          <v-card-title>
            {{ dialogModel ? 'Chỉnh sửa' : 'Thêm mới' }}
          </v-card-title>
        </v-card-item>

        <v-card-text>
          <slot name="dialog-content" />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            prepend-icon="mdi-cancel"
            color="error"
            variant="flat"
            @click="dialogModel = false"
          >
            Hủy
          </v-btn>
          <v-btn
            prepend-icon="mdi-content-save-outline"
            color="primary"
            variant="flat"
            @click="emit('save')"
          >
            Lưu
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
