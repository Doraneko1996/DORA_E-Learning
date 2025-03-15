<script setup lang="ts">
import { computed, ref } from 'vue'
import DataTable from 'src/components/DataTable.vue'
import UserForm from 'src/components/UserForm.vue'
import TableFilters from 'src/components/TableFilters.vue'
import { getErrorMessage } from 'src/utils/error.utils'
import { formatDate } from 'src/boot/dayjs'
import { useOptions } from 'src/composables/useOptions'
import managerService from 'src/services/manager.service'
import { useQuasar } from 'quasar'
import type { User } from 'src/types/user.type'
import type { Column } from 'src/components/DataTable.vue'

// Khai báo props bằng defineProps
const props = defineProps<{
  userRole: number // Nhận vai trò người dùng từ layout
}>()

const $q = useQuasar()

// Options cho select
const { options: genderOptions } = useOptions('GENDER')
const { options: provinceOptions } = useOptions('PROVINCE')
const { options: districtOptions } = useOptions('DISTRICT')

// Định nghĩa filter options
const filterOptions = ref([
  {
    label: 'Giới tính',
    value: 'gender',
    options: genderOptions
  },
  {
    label: 'Quận/Huyện',
    value: 'district',
    options: districtOptions
  },
  {
    label: 'Tỉnh/Thành phố',
    value: 'province',
    options: provinceOptions
  }
])

// Bộ lọc
const filters = ref({
  gender: undefined,
  district: undefined,
  province: undefined
})

// Trạng thái
const selectedIds = ref<number[]>([])
const loading = ref(false)
const tableRef = ref<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any

// Danh sách cột động dựa trên vai trò
const headers = computed<Column[]>(() => {
  const baseHeaders: Column[] = [
    // { name: 'id', label: '#', field: 'id', align: 'center' },
    { name: 'userName', label: 'Tài khoản', field: 'userName', align: 'left', sortable: true },
    { name: 'firstName', label: 'Họ & chữ đệm', field: 'firstName', align: 'left' },
    { name: 'lastName', label: 'Tên', field: 'lastName', align: 'left', sortable: true },
    { name: 'dob', label: 'Ngày sinh', field: 'dob', align: 'center' },
    { name: 'gender', label: 'Giới tính', field: 'gender', align: 'center' },
    { name: 'phoneNumber', label: 'SĐT', field: 'phoneNumber', align: 'center' },
    { name: 'email', label: 'Email', field: 'email', align: 'left' }
  ]

  // Chỉ thêm cột 'status' và 'actions' nếu là Admin (userRole === 0)
  if (props.userRole === 0) {
    return [
      ...baseHeaders,
      { name: 'status', label: 'Trạng thái', field: 'status', align: 'center' },
      { name: 'actions', label: '', field: 'actions' }
    ]
  }
  return baseHeaders
})

// Định nghĩa selection dựa trên userRole
const selection = computed(() => props.userRole === 0 ? 'multiple' : 'none')

// Mở dialog tạo mới hoặc chỉnh sửa
const openManagerForm = (user: User, editMode: boolean) => {
  $q.dialog({
    component: UserForm,
    componentProps: {
      persistent: true,
      user,
      userService: managerService,
      genderOptions,
      districtOptions,
      provinceOptions,
      editMode,
      userType: 'manager',
    }
  }).onOk(() => {
    // Làm mới danh sách sau khi tạo mới hoặc cập nhật thành công
    tableRef.value.refresh()
  }).onCancel(() => {
    editMode = false
  }).onDismiss(() => {
    editMode = false
  })
}

// Mở modal tạo mới
const openCreateModal = () => {
  const newManager: User = {
    id: 0,
    userName: '',
    firstName: '',
    lastName: '',
    status: true,
    createdAt: null,
    updatedAt: null,
    gender: null,
    dob: null,
    phoneNumber: null,
    email: null,
    address: null,
    district: null,
    province: null
  }
  openManagerForm(newManager, true)
}

// Mở modal chỉnh sửa
const handleEdit = (manager: User) => {
  openManagerForm({ ...manager }, false) // Mở ở chế độ xem chi tiết
}

// Xử lý thay đổi trạng thái
const handleStatusChange = async (item: User, newStatus: boolean) => {
  const notif = $q.notify({
    group: false,
    timeout: 0,
    spinner: true,
    message: 'Cập nhật trạng thái',
    caption: 'Đang xử lý...',
    color: 'grey',
  });

  try {
    loading.value = true
    const response = await managerService.updateStatus([item.id], newStatus)
    item.status = newStatus
    notif({
      spinner: false,
      icon: 'done',
      color: 'positive',
      message: newStatus ? 'Kích hoạt thành công' : 'Hủy kích hoạt thành công',
      caption: response.message,
      progress: true,
      timeout: 2500,
    });
  } catch (error) {
    notif({
      spinner: false,
      icon: 'error',
      color: 'negative',
      message: 'Cập nhật trạng thái thất bại',
      caption: getErrorMessage(error, 'Lỗi không xác định'),
      progress: true,
      timeout: 2500,
    });
    item.status = !newStatus
  } finally {
    loading.value = false
  }
}

// Xác nhận xóa
const confirmDeleteAction = async (ids: number[]) => {
  const notif = $q.notify({
    group: false,
    timeout: 0,
    spinner: true,
    message: 'Xóa dữ liệu',
    caption: 'Đang xử lý...',
    color: 'grey',
  });

  try {
    loading.value = true
    const response = await managerService.delete(ids)
    notif({
      spinner: false,
      icon: 'done',
      color: 'positive',
      message: 'Xóa tài khoản thành công',
      caption: response.message,
      progress: true,
      timeout: 2500,
    });
    selectedIds.value = []
    tableRef.value.clearSelection()
    tableRef.value.refresh()
  } catch (error) {
    notif({
      spinner: false,
      icon: 'error',
      color: 'negative',
      message: 'Xóa tài khoản thất bại',
      caption: getErrorMessage(error, 'Lỗi không xác định'),
      progress: true,
      timeout: 2500,
    });
  } finally {
    loading.value = false
  }
}

// Xử lý xóa đơn
const handleDelete = (item: User) => {
  $q.dialog({
    title: 'Xóa tài khoản',
    message: 'Chắc chắn xóa tài khoản này?',
    cancel: true,
    persistent: true,
    color: 'negative',
  }).onOk(() => {
    confirmDeleteAction([item.id]).catch(() => { })
  })
}

// Xử lý xóa hàng loạt
const handleBulkDelete = () => {
  $q.dialog({
    title: 'Xóa tài khoản',
    message: `Chắc chắn xóa <strong>${selectedIds.value.length}</strong> tài khoản đã chọn?`,
    html: true,
    cancel: true,
    persistent: true,
    color: 'negative',
  }).onOk(() => {
    confirmDeleteAction(selectedIds.value).catch(() => { })
  })
}

// Xác nhận reset mật khẩu
const confirmResetPassword = async (ids: number[]) => {
  const notif = $q.notify({
    group: false,
    timeout: 0,
    spinner: true,
    message: 'Đặt lại mật khẩu',
    caption: 'Đang xử lý...',
    color: 'grey',
  });

  try {
    loading.value = true;
    const response = await managerService.resetPassword(ids);
    notif({
      spinner: false,
      icon: 'done',
      color: 'positive',
      message: 'Đặt lại mật khẩu thành công',
      caption: response.message,
      progress: true,
      timeout: 2500,
    });
    selectedIds.value = [];
    tableRef.value.clearSelection();
  } catch (error) {
    notif({
      spinner: false,
      icon: 'error',
      color: 'negative',
      message: 'Đặt lại mật khẩu thất bại',
      caption: getErrorMessage(error, 'Lỗi không xác định'),
      progress: true,
      timeout: 2500,
    });
  } finally {
    loading.value = false;
  }
};

// Xử lý reset mật khẩu đơn
const handleResetPassword = (item: User) => {
  $q.dialog({
    title: 'Đặt lại mật khẩu',
    message: `Chắc chắn đặt lại mật khẩu cho: <strong>${item.userName}</strong>?<br/>Mật khẩu sẽ trở về mặc định: <strong>${item.userName}@</strong>`,
    html: true,
    cancel: true,
    persistent: true,
    color: 'warning',
  }).onOk(() => {
    confirmResetPassword([item.id]).catch(() => { })
  });
};

// Xử lý reset mật khẩu hàng loạt
const handleBulkResetPassword = () => {
  $q.dialog({
    title: 'Đặt lại mật khẩu',
    message: `Chắc chắn đặt lại mật khẩu cho <strong>${selectedIds.value.length}</strong> tài khoản đã chọn?<br/>Mật khẩu sẽ trở về mặc định: <strong>[tênđăngnhập]@</strong>`,
    html: true,
    cancel: true,
    persistent: true,
    color: 'warning',
  }).onOk(() => {
    confirmResetPassword(selectedIds.value).catch(() => { })
  });
};

// Xử lý khi filters thay đổi
const handleFiltersChanged = () => {
  tableRef.value.refresh()
}
</script>

<template>
  <div class="q-pa-md">
    <DataTable ref="tableRef" endpoint="/managers/list" :headers="headers" separator="vertical" :filters="filters"
      :selection="selection" @update:filters="filters = $event" @filters-changed="handleFiltersChanged"
      @update:selected="selectedIds = $event" @edit="handleEdit" @delete="handleDelete"
      @status-change="handleStatusChange">

      <!-- filters -->
      <template v-slot:filters>
        <TableFilters v-model:filters="filters" :filter-options="filterOptions" />
      </template>

      <!-- Slot cho cột trạng thái -->
      <template v-slot:body-cell-status="{ row }">
        <q-toggle :disable="loading" v-model="row.status" @update:model-value="handleStatusChange(row, $event)" />
      </template>

      <!-- Slot cho cột ngày sinh -->
      <template v-slot:body-cell-dob="{ row }">
        {{ formatDate(row.dob) }}
      </template>

      <!-- Slot cho cột giới tính -->
      <template v-slot:body-cell-gender="{ row }">
        {{ row.gender === null ? '' : row.gender === 0 ? 'Nam' : 'Nữ' }}
      </template>

      <!-- Slot cho cột hành động -->
      <template v-slot:body-cell-actions="{ row }">
        <q-btn icon="mdi-dots-vertical" flat round :disable="selectedIds.length > 0">
          <q-menu>
            <q-list style="min-width: 100px">
              <q-item clickable v-close-popup @click="handleEdit(row)">
                <q-item-section side>
                  <q-icon name="mdi-text-box-edit-outline" />
                </q-item-section>
                <q-item-section>Chi tiết</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="handleResetPassword(row)">
                <q-item-section side>
                  <q-icon name="mdi-lock-reset" />
                </q-item-section>
                <q-item-section>Đặt lại mật khẩu</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="handleDelete(row)">
                <q-item-section side>
                  <q-icon name="mdi-trash-can-outline" />
                </q-item-section>
                <q-item-section>Xóa bỏ</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </template>

      <!-- Hành động hàng loạt -->
      <template #toolbar-bulk-actions="{ selectedIds }">
        <q-btn v-if="selectedIds.length > 0" icon="mdi-lock-reset" @click="handleBulkResetPassword" flat round>
          <q-tooltip>
            Đặt lại mật khẩu
          </q-tooltip>
        </q-btn>
        <q-btn v-if="selectedIds.length > 0" icon="delete" @click="handleBulkDelete" flat round>
          <q-tooltip>
            Xóa hết
          </q-tooltip>
        </q-btn>
      </template>

      <!-- Hành động toolbar -->
      <template v-if="!selectedIds.length" #toolbar-view-actions>
        <q-btn icon="mdi-plus-box-outline" @click="openCreateModal" flat round>
          <q-tooltip>
            Tạo mới
          </q-tooltip>
        </q-btn>
      </template>
    </DataTable>
  </div>
</template>