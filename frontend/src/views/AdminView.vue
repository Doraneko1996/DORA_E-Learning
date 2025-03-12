<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useSnackbarStore } from '@/stores/snackbar'
import DataTable from '@/components/DataTable.vue'
import { useTable } from '@/composables/useTable'
import { getErrorMessage } from '@/utils/error.utils'
import { useDayjs } from '@/composables/useDayjs'
import { useOptions } from '@/composables/useOptions'
import { useOptionsStore } from '@/stores/options.store'
import api from '@/axios-config'

const genderOptions = useOptions('GENDER').options
const provinceOptions = useOptions('PROVINCE').options
const districtOptions = useOptions('DISTRICT').options

// Khai báo một ref để tham chiếu đến component DataTable để sử dụng biến trong DataTable
const dataTableRef = ref<InstanceType<typeof DataTable> | null>(null)

// Định nghĩa kiểu dữ liệu cho dữ liệu bảng
interface Admin {
  id: number;
  userName: string;
  firstName: string;
  lastName: string;
  status: number;
  createdAt: string | null;
  updatedAt: string | null;
  gender?: string;
  dob?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  district?: string;
  province?: string;
}

// Các bộ lọc của bảng
const filters = ref({
  gender: undefined,
  district: undefined,
  province: undefined
})

const { formatDateTime, formatDateInput } = useDayjs()

// Stores
const snackbar = useSnackbarStore()
const optionsStore = useOptionsStore()

// State
const { selectedIds, handleSelectionChange } = useTable()
const showEditModal = ref(false)
const selectedAdmin = ref<Admin | null>(null)
const originalAdmin = ref<Admin | null>(null)
const isEditing = ref(false)
const showDeleteModal = ref(false)
const loading = ref(false)
const showBulkDeleteModal = ref(false)
const isCreating = ref(false)

// Prefetch options khi component mounted
onMounted(async () => {
  // Chỉ fetch khi cache trống hoặc hết hạn
  const needsFetch = (['GENDER', 'PROVINCE', 'DISTRICT'] as const).filter(type =>
    !optionsStore.cache[type]?.length || !optionsStore.isCacheValid(type)
  )

  if (needsFetch.length) {
    await optionsStore.prefetchOptions(needsFetch)
  }
})

//#####===== XỬ LÝ TẠO MỚI TÀI KHOẢN =====#####//
//#############################################//
// Hàm xử lý mở modal thêm mới
const openCreateModal = () => {
  selectedAdmin.value = {
    id: 0,
    userName: '',
    firstName: '',
    lastName: '',
    status: 1,
    createdAt: null,
    updatedAt: null,
    dob: '',
    phoneNumber: '',
    email: '',
    address: '',
    district: undefined,
    province: undefined
  }
  isCreating.value = true
  isEditing.value = true // Tự động vào chế độ chỉnh sửa
  showEditModal.value = true
}

// Hàm xử lý thêm mới
const handleCreate = async () => {
  if (!selectedAdmin.value) return

  try {
    if (dataTableRef.value) {
      dataTableRef.value.loading = true // Bật loading
    }
    loading.value = true

    // Tạo payload chỉ chứa các trường cần thiết
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, status, createdAt, updatedAt, ...newAdmin } = selectedAdmin.value

    const response = await api.post('/admins/add', {
      ...newAdmin,
    })

    snackbar.showSnackbar(
      'Tạo mới thành công',
      response.data.data.message,
      response.data.status
    )

    showEditModal.value = false
    isCreating.value = false
    dataTableRef.value?.loadData() // Làm mới toàn bộ dữ liệu bảng
  } catch (error) {
    snackbar.showSnackbar(
      'Tạo mới thất bại',
      getErrorMessage(error, 'Lỗi không xác định'),
      'error'
    )
  } finally {
    if (dataTableRef.value) {
      dataTableRef.value.loading = false // Tắt loading
    }
    loading.value = false
  }
}

const handleCancelCreate = () => {
  showEditModal.value = false
  isCreating.value = false
  isEditing.value = false
}
//#############################################//

//#####===== XỬ LÝ CẬP NHẬT THÔNG TIN TÀI KHOẢN =====#####//
//########################################################//
// Hàm xử lý mở modal chỉnh sửa
const openEditModal = (admin: Admin) => {
  originalAdmin.value = {
    ...admin,
    district: districtOptions.value.find(d => d.value === admin.district)?.value || 'null',
    province: provinceOptions.value.find(d => d.value === admin.province)?.value || 'null',
    gender: admin.gender?.toString() || 'null',
    // Format lại ngày sinh
    dob: admin.dob ? formatDateInput(admin.dob) : ''
  }
  selectedAdmin.value = {
    ...originalAdmin.value
  }

  isEditing.value = false
  showEditModal.value = true
}

// Hàm xử lý cập nhật dữ liệu
const handleUpdate = async () => {
  if (!selectedAdmin.value) return

  try {
    if (dataTableRef.value) {
      dataTableRef.value.loading = true // Bật loading
    }
    loading.value = true

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, status, createdAt, updatedAt, ...rest } = selectedAdmin.value

    const response = await api.patch(`/admins/${id}`, {
      ...rest,
      // Cập nhật các trường có thể chỉnh sửa
      userName: selectedAdmin.value.userName,
      firstName: selectedAdmin.value.firstName,
      lastName: selectedAdmin.value.lastName,
      phoneNumber: selectedAdmin.value.phoneNumber || '',
      email: selectedAdmin.value.email || '',
      dob: selectedAdmin.value.dob || '',
      address: selectedAdmin.value.address || '',
      district: selectedAdmin.value.district || '',
      province: selectedAdmin.value.province || ''
    })

    if (dataTableRef.value?.items) {
      const index = dataTableRef.value.items.findIndex(
        item => item.id === selectedAdmin.value?.id
      )
      if (index !== -1) {
        dataTableRef.value.items[index] = {
          ...dataTableRef.value.items[index],
          ...response.data.data
        }
      }
    }

    snackbar.showSnackbar('Cập nhật thành công', 'Dữ liệu đã được cập nhật', 'success', 1500)
    showEditModal.value = false
  } catch (error) {
    snackbar.showSnackbar(
      'Cập nhật thất bại',
      getErrorMessage(error, 'Lỗi không xác định'),
      'error'
    )
  } finally {
    loading.value = false
    if (dataTableRef.value) {
      dataTableRef.value.loading = false // Tắt loading
    }
  }
}

// Hàm xử lý hủy bỏ cập nhật
const handleCancelEdit = () => {
  if (originalAdmin.value && selectedAdmin.value) {
    // Rollback dữ liệu về trạng thái ban đầu
    selectedAdmin.value = { ...originalAdmin.value }
  }
  isEditing.value = false // Tắt chế độ chỉnh sửa
}

// Xử lý sự kiện edit từ DataTable
const handleEdit = (item: Admin) => {
  openEditModal(item)
}
//########################################################//

//#####===== XỬ LÝ THAY ĐỔI TRẠNG THÁI TÀI KHOẢN =====#####//
//#########################################################//
const handleStatusChange = async (item: Admin, newStatus: boolean | null) => {

  if (dataTableRef.value) {
    dataTableRef.value.loading = true // Bật loading
  }

  try {
    await api.post('/admins/status', {
      ids: [item.id],
      status: newStatus ? 1 : 0
    })

    // Cập nhật trạng thái local
    item.status = newStatus ? 1 : 0
    item.updatedAt = new Date().toISOString()

    // Hiển thị thông báo thành công
    snackbar.showSnackbar(
      newStatus ? 'Kích hoạt thành công' : 'Hủy kích hoạt thành công',
      'Cập nhật trạng thái thành công',
      'success',
      1500
    )
  } catch (error) {
    // Hiển thị thông báo lỗi
    snackbar.showSnackbar(
      'Cập nhật trạng thái thất bại',
      getErrorMessage(error, 'Lỗi hệ thống'),
      'error'
    )

    // Rollback giá trị switch
    item.status = newStatus ? 0 : 1
  } finally {
    if (dataTableRef.value) {
      dataTableRef.value.loading = false // Tắt loading
    }
  }
}
//#########################################################//

//#####===== XỬ LÝ THAY ĐỔI TRẠNG THÁI NHIỀU TÀI KHOẢN =====#####//
//###############################################################//
// const showBulkStatusModal = ref(false)
// const bulkStatus = ref<boolean | null>(null)

// // Mở modal xác nhận thay đổi trạng thái hàng loạt
// const openBulkStatusModal = () => {
//   if (!dataTableRef.value?.items || selectedIds.value.length === 0) return

//   // Tính toán trạng thái dựa trên đa số
//   const selectedItems = dataTableRef.value.items.filter(item =>
//     selectedIds.value.includes(item.id)
//   )

//   const activeCount = selectedItems.filter(item => item.status === 1).length
//   const inactiveCount = selectedItems.length - activeCount

//   // [Logic] Xác định trạng thái chiếm đa số
//   bulkStatus.value = activeCount >= inactiveCount
//   console.log(bulkStatus.value)

//   showBulkStatusModal.value = true
// }

// const confirmBulkStatusChange = async () => {
//   if (!bulkStatus.value || !selectedIds.value.length) return

//   try {
//     if (dataTableRef.value) {
//       dataTableRef.value.loading = true // Bật loading
//     }
//     loading.value = true

//     await api.post('/admins/status', {
//       ids: selectedIds.value,
//       status: !bulkStatus.value ? 1 : 0
//     })

//     selectedIds.value = []
//     console.log(selectedIds.value)

//     // Làm mới lại dữ liệu bảng
//     dataTableRef.value?.loadData()

//     // Hiển thị thông báo thành công
//     snackbar.showSnackbar(
//       !bulkStatus.value ? 'Kích hoạt thành công' : 'Hủy kích hoạt thành công',
//       `Đã cập nhật trạng thái của ${selectedIds.value.length} tài khoản`,
//       'success'
//     )
//   } catch (error) {
//     // Hiển thị thông báo lỗi
//     snackbar.showSnackbar(
//       'Cập nhật trạng thái thất bại',
//       getErrorMessage(error, 'Lỗi hệ thống'),
//       'error'
//     )
//   } finally {
//     loading.value = false
//     showBulkStatusModal.value = false
//     if (dataTableRef.value) {
//       dataTableRef.value.loading = false // Tắt loading
//     }
//   }
// }
//#########################################################//

//#####===== XỬ LÝ XÓA TÀI KHOẢN =====#####//
//#########################################//
// Hàm xử lý mở modal xác nhận xóa
const handleDelete = (item: Admin) => {
  selectedIds.value = [item.id]
  showDeleteModal.value = true
}

// Hàm xử lý xóa tài khoản
const confirmDelete = async () => {
  try {
    if (dataTableRef.value) {
      dataTableRef.value.loading = true // Bật loading
    }
    loading.value = true

    await api.delete('/admins', {
      data: { ids: selectedIds.value }
    })

    // Cập nhật lại dữ liệu
    if (dataTableRef.value?.items) {
      dataTableRef.value.items = dataTableRef.value.items.filter(
        item => !selectedIds.value.includes(item.id)
      )
    }

    snackbar.showSnackbar(
      'Xóa thành công',
      `Đã xóa thành công ${selectedIds.value.length} tài khoản`,
      'success'
    )
    selectedIds.value = []
  } catch (error) {
    snackbar.showSnackbar(
      'Xóa thất bại',
      getErrorMessage(error, 'Lỗi không xác định'),
      'error'
    )
  } finally {
    loading.value = false
    showDeleteModal.value = false
    if (dataTableRef.value) {
      dataTableRef.value.loading = false
    }
  }
}
//#########################################//

//#####===== XỬ LÝ XÓA NHIỀU TÀI KHOẢN =====#####//
//###############################################//
// Hàm xử lý mở modal xác nhận xóa hàng loạt
const handleBulkDelete = () => {
  showBulkDeleteModal.value = true
}

// Hàm xử lý xóa hàng loạt
const confirmBulkDelete = async () => {
  try {
    if (dataTableRef.value) {
      dataTableRef.value.loading = true // Bật loading
    }
    loading.value = true

    const response = await api.delete('/admins', {
      data: { ids: selectedIds.value }
    })

    // Cập nhật lại dữ liệu
    if (dataTableRef.value?.items) {
      dataTableRef.value.items = dataTableRef.value.items.filter(
        item => !selectedIds.value.includes(item.id)
      )
    }

    snackbar.showSnackbar(
      'Xóa thành công',
      response.data.data.message,
      'success'
    )
    selectedIds.value = []
  } catch (error) {
    snackbar.showSnackbar(
      'Xóa thất bại',
      getErrorMessage(error, 'Lỗi không xác định'),
      'error'
    )
  } finally {
    loading.value = false
    showBulkDeleteModal.value = false
    if (dataTableRef.value) {
      dataTableRef.value.loading = false
    }
  }
}
//###############################################//

//#####===== XỬ LÝ ĐẶT LẠI MẬT KHẨU =====#####//
//############################################//

const handleResetPassword = () => {
  console.log('Đặt lại mật khẩu cho IDs:', selectedIds.value)
}
//############################################//
</script>

<template>
  <DataTable ref="dataTableRef" endpoint="/admins/list" :headers="[
    { title: 'ID', key: 'id', nowrap: true },
    { title: 'Họ & chữ đệm', key: 'firstName', sortable: false, nowrap: true },
    { title: 'Tên', key: 'lastName', nowrap: true },
    { title: 'Trạng thái', key: 'status', nowrap: true },
    { title: 'Ngày sinh', key: 'dob', nowrap: true },
    { title: 'Giới tính', key: 'gender', nowrap: true },
    { title: 'SĐT', key: 'phoneNumber', sortable: false, nowrap: true },
    { title: 'Email', key: 'email', sortable: false, nowrap: true },
    { title: '', key: 'actions', sortable: false }
  ]" :filters="filters" @update:selected="handleSelectionChange" @edit="handleEdit" @delete="handleDelete"
    @status-change="handleStatusChange">

    <!-- Toolbar xử lý dữ liệu hàng loạt -->
    <template #toolbar-bulk-actions="{ selectedIds }">
      <!-- Đặt lại mật khẩu hàng loạt -->
      <v-tooltip v-if="selectedIds.length > 0" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" icon="mdi-account-key-outline" variant="text" @click="handleResetPassword()" />
        </template>
        <span>Đặt lại mật khẩu</span>
      </v-tooltip>

      <!-- Thay đổi trạng thái tài khoản hàng loạt -->
      <!-- <v-tooltip v-if="selectedIds.length > 0" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" icon="mdi-account-lock-outline" variant="text" @click="openBulkStatusModal" />
        </template>
        <span>Kích hoạt/Hủy kích hoạt</span>
      </v-tooltip> -->

      <!-- Xóa tài khoản hàng loạt -->
      <v-tooltip v-if="selectedIds.length > 0" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" icon="mdi-trash-can-outline" variant="text" @click="handleBulkDelete()" />
        </template>
        <span>Xóa</span>
      </v-tooltip>
    </template>

    <template v-if="!selectedIds.length" #toolbar-view-actions>
      <!-- Hiển thị các nút riêng lẻ trên màn hình lớn -->
      <div class="d-none d-sm-flex pr-1">
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
            <v-btn icon v-bind="props" @click="openCreateModal">
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
            <v-list-item prepend-icon="mdi-plus-box-outline" title="Thêm mới" @click="openCreateModal" />
          </v-list>
        </v-menu>
      </div>
    </template>
  </DataTable>

  <!-- Modal xem thông tin chi tiết, chỉnh sửa, tạo mới -->
  <v-dialog transition="none" v-model="showEditModal" max-width="800" persistent>
    <v-card :loading="loading">
      <v-toolbar :color="isCreating ? 'teal-darken-1' : 'primary'">
        <v-toolbar-title>
          {{ isCreating ? 'Thêm quản trị viên' : 'Chi tiết tài khoản' }}
        </v-toolbar-title>
        <v-btn v-if="isEditing && isCreating" icon @click="handleCancelCreate">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-btn v-else icon @click="showEditModal = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pt-6">
        <v-form v-if="selectedAdmin" @submit.prevent="isCreating ? handleCreate() : handleUpdate()">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model="selectedAdmin.userName" label="Tên đăng nhập *" :readonly="!isEditing"
                variant="outlined" />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field v-model="selectedAdmin.email" label="Email" :readonly="!isEditing" type="email"
                variant="outlined" />
            </v-col>

            <v-col cols="12" md="5">
              <v-text-field v-model="selectedAdmin.firstName" label="Họ & chữ đệm *" :readonly="!isEditing"
                variant="outlined" />
            </v-col>

            <v-col cols="12" md="3">
              <v-text-field v-model="selectedAdmin.lastName" label="Tên *" :readonly="!isEditing" variant="outlined" />
            </v-col>

            <v-col cols="12" md="4">
              <v-select v-model="selectedAdmin.gender" :items="genderOptions" item-title="label" item-value="value"
                label="Giới tính" :readonly="!isEditing" variant="outlined" :clearable="isEditing" />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field v-model="selectedAdmin.phoneNumber" label="Số điện thoại" :readonly="!isEditing"
                variant="outlined" />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field type="date" v-model="selectedAdmin.dob" label="Ngày sinh" :readonly="!isEditing"
                variant="outlined" />
            </v-col>

            <v-col cols="12">
              <v-text-field v-model="selectedAdmin.address" label="Địa chỉ" :readonly="!isEditing" variant="outlined" />
            </v-col>

            <v-col cols="12" md="6">
              <v-combobox v-model="selectedAdmin.district" :items="districtOptions" item-title="label"
                item-value="value" label="Quận/Huyện" :readonly="!isEditing" variant="outlined" :clearable="isEditing"
                :return-object="false" />
            </v-col>

            <v-col cols="12" md="6">
              <v-combobox v-model="selectedAdmin.province" :items="provinceOptions" item-title="label"
                item-value="value" label="Tỉnh/Thành phố" :readonly="!isEditing" variant="outlined"
                :clearable="isEditing" :return-object="false" />
            </v-col>
          </v-row>

          <v-row v-if="!isCreating" class="text-caption text-medium-emphasis mt-2">
            <v-col cols="6">
              <div class="d-flex align-center gap-1">
                <v-icon size="small" class="mr-1">mdi-clock-plus-outline</v-icon>
                <small>Tạo lúc: {{ formatDateTime(selectedAdmin.createdAt) }}</small>
              </div>
            </v-col>
            <v-col cols="6">
              <div class="d-flex align-center gap-1">
                <v-icon size="small" class="mr-1">mdi-clock-edit-outline</v-icon>
                <small>Cập nhật: {{ formatDateTime(selectedAdmin.updatedAt) }}</small>
              </div>
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <v-card-actions class="pa-0">
            <v-btn v-if="isEditing" type="submit" color="success" variant="flat" prepend-icon="mdi-content-save"
              :loading="loading" :text="isCreating ? 'Tạo mới' : 'Cập nhật'"></v-btn>

            <v-spacer />

            <v-btn v-if="!isEditing" color="primary" variant="flat" prepend-icon="mdi-pencil" text="Sửa"
              @click="isEditing = true"></v-btn>
            <v-btn v-if="isEditing && isCreating" text="Hủy bỏ" @click="handleCancelCreate"></v-btn>
            <v-btn v-else-if="isEditing" text="Hủy bỏ" @click="handleCancelEdit"></v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Modal xác nhận xóa đơn -->
  <v-dialog transition="none" v-model="showDeleteModal" max-width="500">
    <v-card :loading="loading">
      <v-toolbar color="error">
        <v-toolbar-title>Xóa tài khoản</v-toolbar-title>
        <v-btn icon @click="showDeleteModal = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text class="pt-4">
        <p>Chắc chắn xóa tài khoản này?</p>
      </v-card-text>

      <v-card-actions>
        <v-btn @click="showDeleteModal = false">Hủy bỏ</v-btn>
        <v-btn :loading="loading" color="error" variant="flat" prepend-icon="mdi-trash-can-outline"
          @click="confirmDelete">Xóa</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Modal xác nhận xóa hàng loạt -->
  <v-dialog transition="none" v-model="showBulkDeleteModal" max-width="500">
    <v-card :loading="loading">
      <v-toolbar color="error">
        <v-toolbar-title>Xóa tài khoản</v-toolbar-title>
        <v-btn icon @click="showBulkDeleteModal = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text class="pt-4">
        <p>Chắc chắn xóa <strong>{{ selectedIds.length }}</strong> tài khoản đã chọn?</p>
      </v-card-text>

      <v-card-actions>
        <v-btn @click="showBulkDeleteModal = false">Hủy bỏ</v-btn>
        <v-btn :loading="loading" color="error" variant="flat" prepend-icon="mdi-trash-can-outline"
          @click="confirmBulkDelete">Xóa</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Modal xác nhận thay đổi trạng thái hàng loạt -->
  <!-- <v-dialog transition="none" v-model="showBulkStatusModal" max-width="500">
    <v-card :loading="loading">
      <v-toolbar :color="!bulkStatus ? 'success' : 'warning'">
        <v-toolbar-title>
          {{ !bulkStatus ? 'Kích hoạt hàng loạt' : 'Hủy kích hoạt hàng loạt' }}
        </v-toolbar-title>
        <v-btn icon @click="showBulkStatusModal = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pt-4">
        <p>Chắc chắn <strong>{{ !bulkStatus ? 'Kích hoạt' : 'Hủy kích hoạt' }}</strong> cho <strong>{{ selectedIds.length }}</strong> tài khoản?</p>
      </v-card-text>

      <v-card-actions>
        <v-btn @click="showBulkStatusModal = false">Hủy bỏ</v-btn>
        <v-btn :loading="loading" :color="!bulkStatus ? 'success' : 'warning'" variant="flat"
          @click="confirmBulkStatusChange">
          Xác nhận
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog> -->
</template>
