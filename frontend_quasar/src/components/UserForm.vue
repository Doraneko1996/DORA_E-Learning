<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { getErrorMessage } from 'src/utils/error.utils'
import { useDialogPluginComponent } from 'quasar'
import { dayjs } from 'src/boot/dayjs'
import { useVuelidate } from '@vuelidate/core'
import { required, email, helpers, minLength } from '@vuelidate/validators'
import type { User } from 'src/types/user.type'

defineOptions({ name: 'UserForm' })

const props = defineProps<{
  user: User
  userService: {
    create: (data: Partial<User>) => Promise<any> // eslint-disable-line @typescript-eslint/no-explicit-any
    update: (id: number, data: Partial<User>) => Promise<any> // eslint-disable-line @typescript-eslint/no-explicit-any
  }
  genderOptions: { label: string; value: string }[]
  districtOptions: { label: string; value: string }[]
  provinceOptions: { label: string; value: string }[]
  editMode: boolean
  userType: 'admin' | 'manager'
}>()

const emit = defineEmits<{
  (e: 'ok'): void
  (e: 'hide'): void
  (e: 'cancel'): void
}>()

const { dialogRef, onDialogHide, onDialogCancel } = useDialogPluginComponent()
const $q = useQuasar()

const initialUserData = ref<User>({
  ...props.user,
  dob: props.user.dob ? dayjs(props.user.dob).format('DD/MM/YYYY') : null,
})
const localUser = ref<User>({ ...initialUserData.value })

const isEditing = ref(props.editMode)
const qDateProxy = ref<{ hide: () => void }>()
const loading = ref(false)
const filteredDistrictOptions = ref(props.districtOptions)

// Custom validator cho ngày sinh
const validDateOfBirth = (value: string | null) => {
  if (!value) return true // Nếu không nhập, không kiểm tra (không bắt buộc)
  const date = dayjs(value, 'DD/MM/YYYY', true)
  return date.isValid() && !date.isAfter(dayjs()) // Ngày hợp lệ và không trong tương lai
}

// Giá trị cho q-date (định dạng YYYY/MM/DD)
const dateForQDate = computed({
  get: () => {
    const dob = localUser.value.dob
    return dob && dayjs(dob, 'DD/MM/YYYY', true).isValid()
      ? dayjs(dob, 'DD/MM/YYYY').format('YYYY/MM/DD')
      : null
  },
  set: (newValue) => {
    const date = dayjs(newValue, 'YYYY/MM/DD', true)
    localUser.value.dob = date.isValid() ? date.format('DD/MM/YYYY') : null
  },
})

// Đồng bộ giá trị ngày sinh cho q-input (định dạng DD/MM/YYYY)
const dobValue = computed({
  get: () => {
    const dob = localUser.value.dob
    return dob || ''
  },
  set: (newValue) => {
    localUser.value.dob = newValue
  },
})

// Kiểm tra thay đổi
const hasChanges = computed(() => {
  return JSON.stringify(localUser.value) !== JSON.stringify(initialUserData.value)
})

// Validation rules
const rules: { [key in keyof User]?: any } = { // eslint-disable-line @typescript-eslint/no-explicit-any
  userName: {
    required: helpers.withMessage('Tên tài khoản không được để trống', required),
    minLength: helpers.withMessage('Tên tài khoản phải có ít nhất 4 ký tự', minLength(4)),
    alphaNumOnly: helpers.withMessage(
      'Tên tài khoản không được chứa ký tự đặc biệt hoặc chữ có dấu',
      helpers.regex(/^[a-zA-Z0-9]+$/)
    ),
  },
  firstName: { required: helpers.withMessage('Họ & chữ đệm không được để trống', required) },
  lastName: { required: helpers.withMessage('Tên không được để trống', required) },
  email: { email: helpers.withMessage('Email phải đúng định dạng', email) },
  dob: {
    validDateOfBirth: helpers.withMessage(
      'Ngày sinh không hợp lệ',
      validDateOfBirth
    ),
  },
  phoneNumber: {},
  address: {},
  gender: {},
  district: {},
  province: {},
}

const v$ = useVuelidate(rules, localUser.value)

// Tiêu đề động
const dialogTitle = computed(() => {
  const typeLabel = props.userType === 'admin' ? 'quản trị viên' : 'quản lý'
  if (props.editMode && props.user.id === 0) return `Thêm ${typeLabel}`
  return props.editMode ? `Chỉnh sửa ${typeLabel}` : `Chi tiết ${typeLabel}`
})

// Lọc quận/huyện
const filterDistricts = (val: string, update: (fn: () => void) => void) => {
  update(() => {
    const needle = val.toLowerCase()
    filteredDistrictOptions.value = props.districtOptions.filter(
      (option) => option.label.toLowerCase().includes(needle)
    )
  })
}

// Xử lý submit
const handleSubmit = async () => {
  if (!localUser.value) return

  const isFormValid = await v$.value.$validate()
  if (!isFormValid) return

  try {
    loading.value = true
    const { id, status, createdAt, updatedAt, ...userData } = localUser.value // eslint-disable-line @typescript-eslint/no-unused-vars

    if (userData.dob) {
      const date = dayjs(userData.dob, 'DD/MM/YYYY', true)
      userData.dob = date.isValid() ? date.format('YYYY-MM-DD') : null
    } else {
      userData.dob = null
    }

    const typeLabel = props.userType === 'admin' ? 'quản trị viên' : 'quản lý'
    if (id === 0) {
      const response = await props.userService.create(userData)
      $q.notify({
        type: 'positive',
        progress: true,
        message: `Tạo mới ${typeLabel} thành công`,
        caption: response.message,
      })
      emit('ok')
      onDialogHide()
    } else {
      const response = await props.userService.update(id, userData)
      $q.notify({
        type: 'positive',
        progress: true,
        message: `Cập nhật ${typeLabel} thành công`,
        caption: response.message,
      })
      initialUserData.value = { ...localUser.value }
    }
    emit('ok')
    isEditing.value = false
  } catch (error) {
    const typeLabel = props.userType === 'admin' ? 'quản trị viên' : 'quản lý'
    $q.notify({
      type: 'negative',
      progress: true,
      message: localUser.value.id === 0 ? `Tạo mới ${typeLabel} thất bại` : `Cập nhật ${typeLabel} thất bại`,
      caption: getErrorMessage(error, 'Lỗi không xác định'),
    })
    throw error
  } finally {
    loading.value = false
  }
}

const enableEdit = () => {
  isEditing.value = true
}

const handleCancel = () => {
  if (isEditing.value) {
    if (localUser.value.id === 0) {
      onDialogCancel()
    } else {
      localUser.value = { ...initialUserData.value }
      isEditing.value = false
      v$.value.$reset()
    }
  } else {
    onDialogCancel()
  }
}
</script>

<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin full-width" style="max-width: 850px;">
      <q-linear-progress v-if="loading" class="fixed-top absolute-top" indeterminate />
      <q-card-section>
        <div class="text-h6">{{ dialogTitle }}</div>
        <div v-if="isEditing && !localUser.id" class="text-subtitle2">
          Lưu ý: Mật khẩu mặc định sẽ là: [Tên đăng nhập]@
          <q-icon name="mdi-arrow-right-thin" /> {{ localUser.userName }}@
        </div>
      </q-card-section>
      <q-form @submit.prevent="handleSubmit" @keydown.enter.prevent>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <q-input class="col-12 col-md-6" outlined v-model.trim="localUser.userName" label="Tên đăng nhập *"
              :readonly="!isEditing" :disable="loading" :error="v$.userName?.$dirty && v$.userName?.$invalid"
              :error-message="v$.userName?.$errors.map(e => e.$message).join(', ')" @blur="v$.userName?.$touch" />
            <q-input class="col-12 col-md-6" outlined v-model="localUser.email" label="Email" :readonly="!isEditing"
              :disable="loading" :error="v$.email?.$dirty && v$.email?.$invalid"
              :error-message="v$.email?.$errors.map(e => e.$message).join(', ')" @blur="v$.email?.$touch" />
            <q-input class="col-12 col-md-5" outlined v-model.trim="localUser.firstName" label="Họ & chữ đệm *"
              :disable="loading" :readonly="!isEditing" :error="v$.firstName?.$dirty && v$.firstName?.$invalid"
              :error-message="v$.firstName?.$errors.map(e => e.$message).join(', ')" @blur="v$.firstName?.$touch" />
            <q-input class="col-12 col-md-3" outlined v-model.trim="localUser.lastName" label="Tên *"
              :readonly="!isEditing" :disable="loading" :error="v$.lastName?.$dirty && v$.lastName?.$invalid"
              :error-message="v$.lastName?.$errors.map(e => e.$message).join(', ')" @blur="v$.lastName?.$touch" />
            <q-select class="col-12 col-md-4" outlined v-model="localUser.gender" :options="props.genderOptions"
              label="Giới tính" :readonly="!isEditing" :disable="loading" emit-value map-options
              :behavior="$q.platform.is.ios === true ? 'dialog' : 'menu'" />
            <q-input class="col-12 col-md-6" outlined v-model="localUser.phoneNumber" label="Số điện thoại"
              :readonly="!isEditing" :disable="loading" mask="### ### ####" fill-mask="#" unmasked-value />
            <q-input class="col-12 col-md-6" outlined v-model="dobValue" mask="##/##/####" fill-mask label="Ngày sinh"
              :readonly="!isEditing" :disable="loading" :error="v$.dob?.$dirty && v$.dob?.$invalid"
              :error-message="v$.dob?.$errors.map(e => e.$message).join(', ')" @blur="v$.dob?.$touch">
              <template v-slot:append>
                <q-icon name="event"
                  :class="{ 'cursor-pointer': isEditing && !loading, 'no-pointer-events': !isEditing || loading }">
                  <q-popup-proxy ref="qDateProxy" cover transition-show="scale" transition-hide="scale">
                    <q-date minimal v-model="dateForQDate" @update:model-value="qDateProxy?.hide()">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Đóng" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-input class="col-12" outlined v-model="localUser.address" label="Địa chỉ" :readonly="!isEditing"
              :disable="loading" />
            <q-select class="col-12 col-md-6" outlined v-model="localUser.district" :options="filteredDistrictOptions"
              label="Quận/Huyện" :readonly="!isEditing" :disable="loading" use-input input-debounce="100"
              @filter="filterDistricts" emit-value map-options
              :behavior="$q.platform.is.ios === true ? 'dialog' : 'menu'">
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">Không có kết quả</q-item-section>
                </q-item>
              </template>
            </q-select>
            <q-select class="col-12 col-md-6" outlined v-model="localUser.province" :options="props.provinceOptions"
              label="Tỉnh/Thành phố" :readonly="!isEditing" :disable="loading" emit-value map-options
              :behavior="$q.platform.is.ios === true ? 'dialog' : 'menu'" />
          </div>
        </q-card-section>
        <q-card-actions class="q-pa-md" align="right">
          <q-btn v-if="!isEditing" flat label="Cập nhật" color="primary" @click="enableEdit" />
          <q-btn v-if="isEditing" flat label="Hủy bỏ" @click="handleCancel" />
          <q-btn v-if="isEditing" type="submit" color="primary" :label="localUser.id === 0 ? 'Tạo mới' : 'Cập nhật'"
            :loading="loading" :disable="localUser.id !== 0 && !hasChanges" />
          <q-btn v-if="!isEditing" flat label="Đóng" @click="onDialogCancel" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>
