<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar, useDialogPluginComponent } from 'quasar';
import { useVuelidate } from '@vuelidate/core';
import { required, email, helpers, minLength } from '@vuelidate/validators';
import { dayjs } from 'src/boot/dayjs';
import { getErrorMessage } from 'src/utils/error.utils';
import type { User } from 'src/types/user.type';
import type { EducationLevel, GemsEmployee, Ic3Certificate, IcdlCertificate, InformaticRelation, Nvsp, SelectOption } from 'src/types/option.type';

defineOptions({ name: 'UserForm' });

// Định dạng ngày dưới dạng hằng số
const DATE_FORMAT_DISPLAY = 'DD/MM/YYYY';
const DATE_FORMAT_API = 'YYYY-MM-DD';

const props = defineProps<{
  user: User;
  userService: {
    create: (data: Partial<User>) => Promise<{ message: string; data?: User }>;
    update: (id: number, data: Partial<User>) => Promise<{ message: string; data?: User }>;
  };
  genderOptions: { label: string; value: string }[];
  districtOptions: { label: string; value: string }[];
  provinceOptions: { label: string; value: string }[];
  gemsEmployeeOptions?: SelectOption<GemsEmployee>[];
  educationLevelOptions?: SelectOption<EducationLevel>[];
  informaticRelationOptions?: SelectOption<InformaticRelation>[];
  nvspOptions?: SelectOption<Nvsp>[];
  ic3CertificateOptions?: SelectOption<Ic3Certificate>[];
  icdlCertificateOptions?: SelectOption<IcdlCertificate>[];
  editMode: boolean;
  userType: 'admin' | 'manager' | 'teacher';
}>();

const emit = defineEmits<{
  (e: 'ok'): void;
  (e: 'hide'): void;
  (e: 'cancel'): void;
}>();

const { dialogRef, onDialogHide, onDialogCancel } = useDialogPluginComponent();
const $q = useQuasar();

// Chuyển props thành ref để không dùng trực tiếp trong template
const genderOptions = ref(props.genderOptions);
const districtOptions = ref(props.districtOptions);
const provinceOptions = ref(props.provinceOptions);
const gemsEmployeeOptions = ref(props.gemsEmployeeOptions);
const educationLevelOptions = ref(props.educationLevelOptions);
const informaticRelationOptions = ref(props.informaticRelationOptions);
const nvspOptions = ref(props.nvspOptions);
const ic3CertificateOptions = ref(props.ic3CertificateOptions);
const icdlCertificateOptions = ref(props.icdlCertificateOptions);

const initialUserData = ref<User>({
  ...props.user,
  dob: props.user.dob ? dayjs(props.user.dob).format(DATE_FORMAT_DISPLAY) : null,
});
const localUser = ref<User>({ ...initialUserData.value });

// Khởi tạo teacherProfile chỉ khi userType là 'teacher'
const initialTeacherProfile = ref(
  props.userType === 'teacher'
    ? {
        gemsEmployee: props.user.teacherProfile?.gemsEmployee ?? null,
        educationLevel: props.user.teacherProfile?.educationLevel ?? null,
        informaticRelation: props.user.teacherProfile?.informaticRelation ?? null,
        nvsp: props.user.teacherProfile?.nvsp ?? null,
        ic3Certificate: props.user.teacherProfile?.ic3Certificate ?? null,
        icdlCertificate: props.user.teacherProfile?.icdlCertificate ?? null,
      }
    : {}
);
const teacherProfile = ref({ ...initialTeacherProfile.value });

const isEditing = ref(props.editMode);
const loading = ref(false);
const activeTab = ref('basicInfo');
const filteredDistrictOptions = ref(districtOptions.value);

// Custom validator cho ngày sinh
const validDateOfBirth = (value: string | null) => {
  if (!value) return true;
  const date = dayjs(value, DATE_FORMAT_DISPLAY, true);
  return date.isValid() && !date.isAfter(dayjs());
};

// Giá trị cho q-date
const dateForQDate = computed({
  get: () => {
    const dob = localUser.value.dob;
    return dob && dayjs(dob, DATE_FORMAT_DISPLAY, true).isValid()
      ? dayjs(dob, DATE_FORMAT_DISPLAY).format('YYYY/MM/DD')
      : null;
  },
  set: (newValue) => {
    const date = dayjs(newValue, 'YYYY/MM/DD', true);
    localUser.value.dob = date.isValid() ? date.format(DATE_FORMAT_DISPLAY) : null;
  },
});

// Đồng bộ giá trị ngày sinh cho q-input
const dobValue = computed({
  get: () => localUser.value.dob || '',
  set: (newValue) => (localUser.value.dob = newValue),
});

// Kiểm tra thay đổi của teacherProfile
const hasTeacherProfileChanges = computed(() => {
  if (props.userType !== 'teacher') return false;
  return (
    teacherProfile.value.gemsEmployee !== initialTeacherProfile.value.gemsEmployee ||
    teacherProfile.value.educationLevel !== initialTeacherProfile.value.educationLevel ||
    teacherProfile.value.informaticRelation !== initialTeacherProfile.value.informaticRelation ||
    teacherProfile.value.nvsp !== initialTeacherProfile.value.nvsp ||
    teacherProfile.value.ic3Certificate !== initialTeacherProfile.value.ic3Certificate ||
    teacherProfile.value.icdlCertificate !== initialTeacherProfile.value.icdlCertificate
  );
});

// Kiểm tra thay đổi tổng thể
const hasChanges = computed(() => {
  return (
    localUser.value.userName !== initialUserData.value.userName ||
    localUser.value.firstName !== initialUserData.value.firstName ||
    localUser.value.lastName !== initialUserData.value.lastName ||
    localUser.value.email !== initialUserData.value.email ||
    localUser.value.dob !== initialUserData.value.dob ||
    localUser.value.gender !== initialUserData.value.gender ||
    localUser.value.phoneNumber !== initialUserData.value.phoneNumber ||
    localUser.value.address !== initialUserData.value.address ||
    localUser.value.district !== initialUserData.value.district ||
    localUser.value.province !== initialUserData.value.province ||
    hasTeacherProfileChanges.value
  );
});

// Validation rules
const rules = {
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
  dob: { validDateOfBirth: helpers.withMessage('Ngày sinh không hợp lệ', validDateOfBirth) },
  phoneNumber: {},
  address: {},
  gender: {},
  district: {},
  province: {},
};

const validationState = computed(() => ({
  userName: localUser.value.userName,
  firstName: localUser.value.firstName,
  lastName: localUser.value.lastName,
  email: localUser.value.email,
  dob: localUser.value.dob,
  phoneNumber: localUser.value.phoneNumber,
  address: localUser.value.address,
  gender: localUser.value.gender,
  district: localUser.value.district,
  province: localUser.value.province,
}));

const v$ = useVuelidate(rules, validationState);

// Tiêu đề động và typeLabel
const typeLabel = computed(() =>
  props.userType === 'admin' ? 'quản trị viên' : props.userType === 'manager' ? 'quản lý' : 'giáo viên'
);

const dialogTitle = computed(() => {
  if (props.editMode && props.user.id === 0) return `Thêm ${typeLabel.value}`;
  return props.editMode ? `Chỉnh sửa ${typeLabel.value}` : `Chi tiết ${typeLabel.value}`;
});

// Lọc quận/huyện
const filterDistricts = (val: string, update: (fn: () => void) => void) => {
  update(() => {
    const needle = val.toLowerCase();
    filteredDistrictOptions.value = districtOptions.value.filter(
      (option) => option.label.toLowerCase().includes(needle)
    );
  });
};

// Xử lý submit
const handleSubmit = async () => {
  if (!localUser.value) return;

  const isFormValid = await v$.value.$validate();
  if (!isFormValid) return;

  try {
    loading.value = true;
    const { id, status, createdAt, updatedAt, ...userData } = localUser.value; // eslint-disable-line @typescript-eslint/no-unused-vars

    if (userData.dob) {
      const date = dayjs(userData.dob, DATE_FORMAT_DISPLAY, true);
      userData.dob = date.isValid() ? date.format(DATE_FORMAT_API) : null;
    } else {
      userData.dob = null;
    }

    if (props.userType === 'teacher') {
      userData.teacherProfile = { ...teacherProfile.value };
    }

    const action = id === 0 ? 'Tạo mới' : 'Cập nhật';
    const response = id === 0
      ? await props.userService.create(userData)
      : await props.userService.update(id, userData);

    $q.notify({
      type: 'positive',
      progress: true,
      message: `${action} ${typeLabel.value} thành công`,
      caption: response.message,
    });

    if (id === 0) {
      emit('ok');
      onDialogHide();
    } else {
      initialUserData.value = { ...localUser.value };
      initialTeacherProfile.value = { ...teacherProfile.value };
      emit('ok');
      isEditing.value = false;
    }
  } catch (error) {
    const action = localUser.value.id === 0 ? 'Tạo mới' : 'Cập nhật';
    $q.notify({
      type: 'negative',
      progress: true,
      message: `${action} ${typeLabel.value} thất bại`,
      caption: getErrorMessage(error, 'Lỗi không xác định'),
    });
    throw error;
  } finally {
    loading.value = false;
  }
};

const enableEdit = () => {
  isEditing.value = true;
};

const handleCancel = () => {
  if (isEditing.value) {
    localUser.value = { ...initialUserData.value };
    if (props.userType === 'teacher') {
      teacherProfile.value = { ...initialTeacherProfile.value };
    }
    if (localUser.value.id === 0) {
      onDialogCancel();
    } else {
      isEditing.value = false;
      v$.value.$reset();
    }
  } else {
    onDialogCancel();
  }
};
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

      <q-form @submit="handleSubmit" @keydown.enter.prevent>
        <q-tabs v-if="userType === 'teacher'" v-model="activeTab" dense align="justify" active-color="primary">
          <q-tab name="basicInfo" label="Thông tin cơ bản" />
          <q-tab name="teacherInfo" label="Hồ sơ giáo viên" />
        </q-tabs>
        <q-card-section style="max-height: 60vh" class="scroll">
          <q-tab-panels v-model="activeTab">
            <q-tab-panel class="q-px-none" name="basicInfo">
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
                <q-select class="col-12 col-md-4" outlined v-model="localUser.gender" :options="genderOptions"
                  label="Giới tính" :readonly="!isEditing" :disable="loading" emit-value map-options
                  :behavior="$q.platform.is.ios === true ? 'dialog' : 'menu'" />
                <q-input class="col-12 col-md-6" outlined v-model="localUser.phoneNumber" label="Số điện thoại"
                  :readonly="!isEditing" :disable="loading" mask="### ### ####" fill-mask="#" unmasked-value />
                <q-input class="col-12 col-md-6" outlined v-model="dobValue" mask="##/##/####"
                  fill-mask label="Ngày sinh" :readonly="!isEditing" :disable="loading"
                  :error="v$.dob?.$dirty && v$.dob?.$invalid"
                  :error-message="v$.dob?.$errors.map(e => e.$message).join(', ')" @blur="v$.dob?.$touch">
                  <template v-slot:append>
                    <q-icon name="event"
                      :class="{ 'cursor-pointer': isEditing && !loading, 'no-pointer-events': !isEditing || loading }">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date minimal v-model="dateForQDate">
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
                <q-select class="col-12 col-md-6" outlined v-model="localUser.district"
                  :options="filteredDistrictOptions" label="Quận/Huyện" :readonly="!isEditing" :disable="loading"
                  use-input input-debounce="100" @filter="filterDistricts" emit-value map-options
                  :behavior="$q.platform.is.ios === true ? 'dialog' : 'menu'">
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">Không có kết quả</q-item-section>
                    </q-item>
                  </template>
                </q-select>
                <q-select class="col-12 col-md-6" outlined v-model="localUser.province" :options="provinceOptions"
                  label="Tỉnh/Thành phố" :readonly="!isEditing" :disable="loading" emit-value map-options
                  :behavior="$q.platform.is.ios === true ? 'dialog' : 'menu'" />
              </div>
            </q-tab-panel>

            <q-tab-panel class="q-px-none" v-if="userType === 'teacher'" name="teacherInfo">
              <div class="row q-col-gutter-md">
                <q-select class="col-12 col-md-6" outlined v-model="teacherProfile.gemsEmployee"
                  :options="gemsEmployeeOptions" label="Có phải giáo viên trung tâm GEMS?" :readonly="!isEditing"
                  :disable="loading" emit-value map-options />
                <q-select class="col-12 col-md-6" outlined v-model="teacherProfile.educationLevel"
                  :options="educationLevelOptions" label="Trình độ học vấn" :readonly="!isEditing" :disable="loading"
                  emit-value map-options />
                <q-select class="col-12 col-md-6" outlined v-model="teacherProfile.informaticRelation"
                  :options="informaticRelationOptions" label="Bằng cấp có liên quan đến tin học?"
                  :readonly="!isEditing" :disable="loading" emit-value map-options />
                <q-select class="col-12 col-md-6" outlined v-model="teacherProfile.nvsp" :options="nvspOptions"
                  label="Đã có Chứng chỉ NVSP?" :readonly="!isEditing" :disable="loading" emit-value map-options />
                <q-select class="col-12 col-md-6" outlined v-model="teacherProfile.ic3Certificate"
                  :options="ic3CertificateOptions" label="Đã có Chứng chỉ IC3?" :readonly="!isEditing"
                  :disable="loading" emit-value map-options />
                <q-select class="col-12 col-md-6" outlined v-model="teacherProfile.icdlCertificate"
                  :options="icdlCertificateOptions" label="Đã có Chứng chỉ ICDL?" :readonly="!isEditing"
                  :disable="loading" emit-value map-options />
              </div>
            </q-tab-panel>
          </q-tab-panels>
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