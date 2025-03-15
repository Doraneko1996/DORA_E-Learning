<script setup lang="ts">
import { ref } from 'vue'
import useVuelidate from '@vuelidate/core'
import { required, minLength, helpers } from '@vuelidate/validators'
import { useQuasar } from 'quasar'
import { getErrorMessage } from 'src/utils/error.utils'
import ThemeToggle from 'src/components/ThemeToggle.vue'
import { useThemeStore } from 'src/stores/theme.store'
import authService from 'src/services/auth.service'
import { useRouter } from 'vue-router'
import { formatDateTime } from 'src/boot/dayjs'
import { setUserSession } from 'src/utils/storage.utils'

const $q = useQuasar()
const router = useRouter()
const loading = ref(false)
const visible = ref(false)

// Store
const themeStore = useThemeStore();

// State
const form = ref({
  userName: '',
  password: ''
})

// Validation Rules
const rules = {
  userName: {
    required: helpers.withMessage('Tên tài khoản không được để trống', required),
    minLength: helpers.withMessage('Tên tài khoản phải có ít nhất 4 ký tự', minLength(4))
  },
  password: {
    required: helpers.withMessage('Mật khẩu không được để trống', required),
    minLength: helpers.withMessage('Mật khẩu phải có ít nhất 6 ký tự', minLength(6))
  }
}

const v$ = useVuelidate(rules, form)

// Xử lý đăng nhập
const onSubmit = async () => {
  // Kiểm tra validation trước khi submit
  const isFormValid = await v$.value.$validate()
  if (!isFormValid) return

  loading.value = true
  try {
    // Gọi service đăng nhập
    const response = await authService.login({
      userName: form.value.userName,
      password: form.value.password
    })

    const sessionTime = process.env.SESSION_TIME || '100' // Thời hạn đăng nhập 100 phút
    const expiresIn = parseInt(sessionTime) * 60 * 1000
    const expirationTime = Date.now() + expiresIn

    setUserSession(response.data.user, response.data.access_token, expirationTime)

    // Thông báo đăng nhập thành công
    $q.notify({
      type: 'positive',
      multiLine: true,
      timeout: 0,
      actions: [{ label: 'Đã hiểu', color: 'white' }],
      message: response.message,
      caption: `Xin chào ${response.data.user.firstName} ${response.data.user.lastName}, thời gian sử dụng: ${sessionTime} phút, hết hạn vào: ${formatDateTime(new Date(expirationTime))}`
    })

    // Chuyển hướng đến trang chính sau khi đăng nhập
    await router.push({ name: 'dashboard' })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Đăng nhập thất bại',
      caption: `Lỗi: ${getErrorMessage(error)}`,
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <q-page class="flex flex-center">
    <q-page-sticky position="top-right" :offset="[18, 18]">
      <ThemeToggle></ThemeToggle>
    </q-page-sticky>
    <q-card :flat="themeStore.darkMode" bordered class="q-pa-md" style="width: 400px;" align="center">
      <q-linear-progress v-if="loading" class="fixed-top absolute-top" indeterminate />
      <q-form @submit="onSubmit">
        <q-card-section>
          <div class="text-h4 text-weight-bold">Đăng nhập</div>
          <div class="text-subtitle1 q-pt-sm">Sử dụng Tài khoản GEMS của bạn</div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-lg q-pb-xs q-px-sm q-gutter-sm">
          <q-input v-model="form.userName" label="Tên tài khoản" outlined :error="v$.userName.$error"
            :error-message="v$.userName.$errors[0]?.$message?.toString()" :disable="loading" />
          <q-input v-model="form.password" label="Mật khẩu" outlined :type="visible ? 'text' : 'password'"
            :error="v$.password.$error" :error-message="v$.password.$errors[0]?.$message?.toString()" :disable="loading">
            <template v-slot:append>
              <q-icon :name="visible ? 'visibility' : 'visibility_off'" class="cursor-pointer"
                @click="visible = !visible" />
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions class="q-pb-md" align="center">
          <q-btn type="submit" size="lg" class="full-width" label="Đăng nhập" color="primary" :loading="loading" />
        </q-card-actions>
      </q-form>

      <q-separator />

      <q-card-section align="center" class="text-body1">
        <div class="text-grey-8">Bạn quên mật khẩu?
          <a href="#" style="text-decoration: none" class="text-primary text-weight-bold">Đặt lại</a>
        </div>
      </q-card-section>

    </q-card>
  </q-page>
</template>
