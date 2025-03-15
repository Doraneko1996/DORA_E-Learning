<script setup lang="ts">
import { ref } from 'vue';
import DataTable from 'src/components/DataTable.vue';
import UserForm from 'src/components/UserForm.vue';
import TableFilters from 'src/components/TableFilters.vue';
import { getErrorMessage } from 'src/utils/error.utils';
import { dayjs, formatDate } from 'src/boot/dayjs';
import { useOptions } from 'src/composables/useOptions';
import teacherService from 'src/services/teacher.service';
import { useQuasar } from 'quasar';
import type { User } from 'src/types/user.type';

const $q = useQuasar();

// Options cho select
const { options: genderOptions } = useOptions('GENDER');
const { options: provinceOptions } = useOptions('PROVINCE');
const { options: districtOptions } = useOptions('DISTRICT');
const { options: educationLevelOptions } = useOptions('EDUCATION_LEVEL');
const { options: informaticRelationOptions } = useOptions('INFORMATIC_RELATION');
const { options: nvspOptions } = useOptions('NVSP');
const { options: gemsEmployeeOptions } = useOptions('GEMS_EMPLOYEE');
const { options: ic3CertificateOptions } = useOptions('IC3_CERTIFICATE');
const { options: icdlCertificateOptions } = useOptions('ICDL_CERTIFICATE');

// Định nghĩa filter options cho giáo viên
const filterOptions = ref([
  // {
  //   label: 'Giới tính',
  //   value: 'gender',
  //   options: genderOptions,
  // },
  {
    label: 'Quận/Huyện',
    value: 'district',
    options: districtOptions,
  },
  {
    label: 'Trình độ',
    value: 'educationLevel',
    options: educationLevelOptions,
  },
  {
    label: 'C/c NVSP',
    value: 'nvsp',
    options: nvspOptions,
  },
  {
    label: 'C/c IC3',
    value: 'ic3Certificate',
    options: ic3CertificateOptions,
  },
  {
    label: 'Đơn vị',
    value: 'gemsEmployee',
    options: gemsEmployeeOptions,
  },
]);

// Bộ lọc
const filters = ref({
  gender: undefined,
  district: undefined,
  educationLevel: undefined,
  nvsp: undefined,
  gemsEmployee: undefined,
});

// Trạng thái
const selectedIds = ref<number[]>([]);
const loading = ref(false);
const tableRef = ref<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
// Tham chiếu đến input file ẩn
const fileInputRef = ref<HTMLInputElement | null>(null);

// Mở dialog tạo mới hoặc chỉnh sửa
const openTeacherForm = (user: User, editMode: boolean) => {
  $q.dialog({
    component: UserForm,
    componentProps: {
      persistent: true,
      user,
      userService: teacherService,
      genderOptions,
      districtOptions,
      provinceOptions,
      gemsEmployeeOptions,
      educationLevelOptions,
      informaticRelationOptions,
      nvspOptions,
      ic3CertificateOptions,
      icdlCertificateOptions,
      editMode,
      userType: 'teacher',
    },
  })
    .onOk(() => {
      tableRef.value.refresh();
    })
    .onCancel(() => {
      editMode = false;
    })
    .onDismiss(() => {
      editMode = false;
    });
};

// Mở modal tạo mới
const openCreateModal = () => {
  const newTeacher: User = {
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
    province: null,
    teacherProfile: {
      gemsEmployee: null,
      educationLevel: null,
      informaticRelation: null,
      nvsp: null,
      ic3Certificate: null,
      icdlCertificate: null,
    },
  };
  openTeacherForm(newTeacher, true);
};

// Mở modal chỉnh sửa
const handleEdit = (teacher: User) => {
  openTeacherForm({ ...teacher }, false); // Mở ở chế độ xem chi tiết
};

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
    loading.value = true;
    const response = await teacherService.updateStatus([item.id], newStatus);
    item.status = newStatus;
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
    item.status = !newStatus;
  } finally {
    loading.value = false;
  }
};

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
    loading.value = true;
    const response = await teacherService.delete(ids);
    notif({
      spinner: false,
      icon: 'done',
      color: 'positive',
      message: 'Xóa tài khoản thành công',
      caption: response.message,
      progress: true,
      timeout: 2500,
    });
    selectedIds.value = [];
    tableRef.value.clearSelection();
    tableRef.value.refresh();
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
    loading.value = false;
  }
};

// Xử lý xóa đơn
const handleDelete = (item: User) => {
  $q.dialog({
    title: 'Xóa tài khoản',
    message: `Chắc chắn xóa tài khoản <strong>${item.userName}</strong>?`,
    html: true,
    cancel: true,
    persistent: true,
    color: 'negative',
  }).onOk(() => {
    confirmDeleteAction([item.id]).catch(() => { });
  });
};

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
    confirmDeleteAction(selectedIds.value).catch(() => { });
  });
};

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
    const response = await teacherService.resetPassword(ids);
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
    confirmResetPassword([item.id]).catch(() => { });
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
    confirmResetPassword(selectedIds.value).catch(() => { });
  });
};

// Xử lý tải file mẫu
const handleDownloadSample = async () => {
  const notif = $q.notify({
    group: false,
    timeout: 0,
    spinner: true,
    message: 'Tải file mẫu',
    caption: 'Đang xử lý...',
    color: 'grey',
  });

  try {
    loading.value = true;
    const fileBlob = await teacherService.downloadSampleFile();

    const url = window.URL.createObjectURL(fileBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'danh_sach_GV_mau_import.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    notif({
      spinner: false,
      icon: 'done',
      color: 'positive',
      message: 'Tải file mẫu thành công',
      caption: 'Hãy kiểm tra thư mục Download',
      progress: true,
      timeout: 2500,
    });
  } catch (error) {
    notif({
      spinner: false,
      icon: 'error',
      color: 'negative',
      message: 'Tải file mẫu thất bại',
      caption: getErrorMessage(error, 'Lỗi không xác định'),
      progress: true,
      timeout: 3000,
    });
  } finally {
    loading.value = false;
  }
};

// Hàm xử lý upload file
const uploadFile = async (file: File) => {
  const notif = $q.notify({
    group: false,
    timeout: 0,
    spinner: true,
    message: 'Nhập dữ liệu từ Excel',
    caption: 'Đang import dữ liệu...',
    color: 'grey',
  });

  try {
    loading.value = true;
    const result = await teacherService.import(file);

    if (result.success) {
      notif({
        spinner: false,
        icon: 'done',
        color: 'positive',
        message: 'Hoàn thành',
        caption: 'Nhập dữ liệu thành công',
        progress: true,
        timeout: 2500,
      });
      tableRef.value.refresh();
    } else {
      const url = window.URL.createObjectURL(result.errorFile!);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'danh_sach_gv_loi.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);

      notif({
        spinner: false,
        icon: 'warning',
        color: 'negative',
        message: 'Nhập dữ liệu thất bại',
        caption: 'Có lỗi nhập liệu trong file Excel',
        progress: true,
        timeout: 3000,
      });
    }
  } catch (error) {
    notif({
      spinner: false,
      icon: 'error',
      color: 'negative',
      message: 'Import thất bại',
      caption: getErrorMessage(error, 'Lỗi không xác định'),
      progress: true,
      timeout: 3000,
    });
  } finally {
    loading.value = false;
    if (fileInputRef.value) {
      fileInputRef.value.value = ''; // Reset input file
    }
  }
};

// Hàm kích hoạt chọn file từ button
const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click(); // Mở dialog chọn file
  }
};

// Hàm xử lý upload file với xác nhận
const handleFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0]; // Lấy file đầu tiên
  if (!file) return;

  $q.dialog({
    title: 'Xác nhận import',
    message: `Bạn có muốn import dữ liệu từ file "<strong>${file.name}</strong>" không?`,
    html: true,
    persistent: true,
    ok: {
      label: 'Tiến hành',
      color: 'positive',
    },
    cancel: {
      label: 'Hủy',
      color: 'negative',
      flat: true,
    },
  }).onOk(() => {
    void uploadFile(file); // Gọi hàm upload, dùng void để bỏ qua Promise
  });
};

// Xử lý xuất dữ liệu
const handleExportData = async () => {
  let notif: ((options: any) => void) | undefined; // eslint-disable-line @typescript-eslint/no-explicit-any

  try {
    // Chuẩn bị thông tin bộ lọc để hiển thị trong dialog
    const filterSummary = Object.entries(filters.value)
      .filter(([_, value]) => value !== undefined && value !== null) // eslint-disable-line @typescript-eslint/no-unused-vars
      .map(([key, value]) => {
        const option = filterOptions.value.find(opt => opt.value === key);
        const label = option?.options.find(opt => opt.value === value)?.label || value;
        return `${option?.label}: ${label}`;
      })
      .join(', ') || 'Không có bộ lọc';

    // Hiển thị dialog xác nhận
    await new Promise<void>((resolve, reject) => {
      $q.dialog({
        title: 'Xác nhận xuất dữ liệu',
        message: `Bạn có muốn xuất danh sách giáo viên với bộ lọc hiện tại?<br/><strong>Bộ lọc:</strong> ${filterSummary}`,
        html: true,
        persistent: true,
        ok: { label: 'Xuất file', color: 'positive' },
        cancel: { label: 'Hủy', color: 'negative', flat: true },
      })
        .onOk(() => resolve())
        .onCancel(() => reject(new Error('Hủy xuất dữ liệu')));
    });

    // Hiển thị thông báo "Đang xử lý"
    notif = $q.notify({
      group: false,
      timeout: 0,
      spinner: true,
      message: 'Xuất dữ liệu',
      caption: 'Đang xử lý...',
      color: 'grey',
    });

    loading.value = true;

    // Gọi API xuất file với bộ lọc hiện tại
    const fileBlob = await teacherService.export(filters.value);

    // Tạo tên file động bằng dayjs (YYYYMMDD_HHMM)
    const now = dayjs(); // Lấy thời gian hiện tại
    const filename = `danh_sach_giao_vien_${now.format('YYYYMMDD_HHmm')}.xlsx`;

    // Tạo URL và kích hoạt tải file
    const url = window.URL.createObjectURL(fileBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename; // Sử dụng tên file động
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    // Cập nhật thông báo thành công
    notif({
      spinner: false,
      icon: 'done',
      color: 'positive',
      message: 'Xuất dữ liệu thành công',
      caption: 'Hãy kiểm tra thư mục Download',
      progress: true,
      timeout: 2500,
    });
  } catch (error) {
    // Nếu lỗi do hủy dialog thì không hiển thị thông báo
    if (error instanceof Error && error.message === 'Hủy xuất dữ liệu') {
      return; // Thoát hàm mà không làm gì
    }

    // Cập nhật thông báo lỗi trên cùng notif (nếu đã được khởi tạo)
    if (notif) {
      notif({
        spinner: false,
        icon: 'error',
        color: 'negative',
        message: 'Xuất dữ liệu thất bại',
        caption: getErrorMessage(error, 'Lỗi không xác định'),
        progress: true,
        timeout: 3000,
      });
    } else {
      // Trường hợp lỗi xảy ra trước khi notif được tạo (hiếm)
      $q.notify({
        icon: 'error',
        color: 'negative',
        message: 'Xuất dữ liệu thất bại',
        caption: getErrorMessage(error, 'Lỗi không xác định'),
        progress: true,
        timeout: 3000,
      });
    }
  } finally {
    loading.value = false;
  }
};

// Xử lý khi filters thay đổi
const handleFiltersChanged = () => {
  tableRef.value.refresh();
};
</script>

<template>
  <div class="q-pa-md">
    <DataTable ref="tableRef" endpoint="/teachers/list" :headers="[
      { name: 'userName', label: 'Tài khoản', field: 'userName', align: 'left', sortable: true },
      { name: 'firstName', label: 'Họ & chữ đệm', field: 'firstName', align: 'left' },
      { name: 'lastName', label: 'Tên', field: 'lastName', align: 'left', sortable: true },
      { name: 'dob', label: 'Ngày sinh', field: 'dob', align: 'center' },
      { name: 'gender', label: 'Giới tính', field: 'gender', align: 'center', sortable: true },
      { name: 'phoneNumber', label: 'SĐT', field: 'phoneNumber', align: 'center' },
      { name: 'gemsEmployee', label: 'Đơn vị', field: 'teacherProfile.gemsEmployee', align: 'center' },
      { name: 'educationLevel', label: 'Trình độ', field: 'teacherProfile.educationLevel', align: 'center' },
      { name: 'nvsp', label: 'NVSP', field: 'teacherProfile.nvsp', align: 'center' },
      { name: 'ic3Certificate', label: 'IC3', field: 'teacherProfile.ic3Certificate', align: 'center' },
      { name: 'icdlCertificate', label: 'ICDL', field: 'teacherProfile.icdlCertificate', align: 'center' },
      { name: 'status', label: 'Trạng thái', field: 'status', align: 'center' },
      { name: 'actions', label: '', field: 'actions' },
    ]" separator="vertical" :filters="filters" selection="multiple" @update:filters="filters = $event"
      @filters-changed="handleFiltersChanged" @update:selected="selectedIds = $event" @edit="handleEdit"
      @delete="handleDelete" @status-change="handleStatusChange">
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

      <!-- Slot cho cột GV GEMS -->
      <template v-slot:body-cell-gemsEmployee="{ row }">
        {{ row.teacherProfile?.gemsEmployee === null ? 'Bỏ trống' : row.teacherProfile.gemsEmployee ? 'GEMS' : 'Trường'
        }}
      </template>

      <!-- Slot cho cột trình độ học vấn -->
      <template v-slot:body-cell-educationLevel="{ row }">
        {{educationLevelOptions.find(opt => opt.value === row.teacherProfile?.educationLevel)?.label || ''}}
      </template>

      <!-- Thêm slot cho cột Nghiệp vụ sư phạm -->
      <template v-slot:body-cell-nvsp="{ row }">
        {{row.teacherProfile ? (nvspOptions.find(opt => opt.value === row.teacherProfile.nvsp)?.label || 'N/A') : 'N/A'
        }}
      </template>

      <!-- Thêm slot cho cột IC3 -->
      <template v-slot:body-cell-ic3Certificate="{ row }">
        {{ row.teacherProfile ? (row.teacherProfile.ic3Certificate === null ? 'Bỏ trống' :
          row.teacherProfile.ic3Certificate ?
            'Có' : 'Không') : 'N/A' }}
      </template>

      <!-- Thêm slot cho cột ICDL -->
      <template v-slot:body-cell-icdlCertificate="{ row }">
        {{ row.teacherProfile ? (row.teacherProfile.icdlCertificate === null ? 'Bỏ trống' :
          row.teacherProfile.icdlCertificate ?
            'Có' : 'Không') : 'N/A' }}
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
          <q-tooltip>Đặt lại mật khẩu</q-tooltip>
        </q-btn>
        <q-btn v-if="selectedIds.length > 0" icon="mdi-trash-can-outline" @click="handleBulkDelete" flat round>
          <q-tooltip>Xóa hết</q-tooltip>
        </q-btn>
      </template>

      <!-- Hành động toolbar -->
      <template v-if="!selectedIds.length && $q.screen.lt.md" #toolbar-view-actions>
        <q-btn icon="mdi-dots-vertical" flat round>
          <q-menu>
            <q-list style="min-width: 180px">
              <!-- <q-item clickable v-close-popup @click="handleDownloadSample">
                <q-item-section side>
                  <q-icon name="mdi-file-download-outline" />
                </q-item-section>
                <q-item-section>Tải file mẫu</q-item-section>
              </q-item> -->
              <!-- <q-item clickable v-close-popup>
                <q-item-section side>
                  <q-icon name="mdi-file-import-outline" />
                </q-item-section>
                <q-item-section>Nhập dữ liệu</q-item-section>
              </q-item> -->
              <q-item clickable v-close-popup @click="handleExportData">
                <q-item-section side>
                  <q-icon name="mdi-file-export-outline" />
                </q-item-section>
                <q-item-section>Xuất dữ liệu</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="openCreateModal">
                <q-item-section side>
                  <q-icon name="mdi-plus-box-outline" />
                </q-item-section>
                <q-item-section>Tạo mới</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </template>

      <template v-else-if="!selectedIds.length && $q.screen.gt.sm" #toolbar-view-actions>
        <q-btn icon="mdi-file-download-outline" flat round @click="handleDownloadSample" :disable="loading">
          <q-tooltip>
            Tải file mẫu
          </q-tooltip>
        </q-btn>
        <q-btn icon="mdi-file-import-outline" flat round @click="triggerFileInput" :disable="loading">
          <q-tooltip>Nhập dữ liệu</q-tooltip>
        </q-btn>
        <input ref="fileInputRef" type="file" accept=".xlsx" style="display: none;" @change="handleFileSelected" />
        <q-btn icon="mdi-file-export-outline" flat round @click="handleExportData" :disable="loading">
          <q-tooltip>
            Xuất dữ liệu
          </q-tooltip>
        </q-btn>
        <q-btn icon="mdi-plus-box-outline" @click="openCreateModal" flat round :disable="loading">
          <q-tooltip>
            Tạo mới
          </q-tooltip>
        </q-btn>
      </template>
    </DataTable>
  </div>
</template>