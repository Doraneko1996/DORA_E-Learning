<script setup lang="ts">
import { ref } from 'vue'
import { useField, useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { AuthService } from '@/services/auth.service'
import { setUserSession } from '@/utils/storage.utils'
import { getErrorMessage } from '@/utils/error.utils'
import { useRouter } from 'vue-router'
import { useSnackbarStore } from '@/stores/snackbar'
import { useDayjs } from '@/composables/useDayjs'

// Stores và router
const snackbar = useSnackbarStore()
const router = useRouter()
const { formatDateTime } = useDayjs()

// State
const loading = ref(false)
const visible = ref(false)

//===== XỬ LÝ ĐĂNG NHẬP =====//
// Định nghĩa schema xác thực
const validationSchema = toTypedSchema(
  zod.object({
    userName: zod.string({ required_error: "Hãy nhập tên tài khoản" }).min(1, { message: 'Hãy nhập tên tài khoản' }).min(4, { message: 'Tên tài khoản phải hơn 4 kí tự' }),
    password: zod.string({ required_error: "Hãy nhập mật khẩu" }).min(1, { message: 'Hãy nhập mật khẩu' }).min(6, { message: 'Mật khẩu phải hơn 6 kí tự' }),
  })
);

// Sử dụng useForm để quản lý form
const { handleSubmit } = useForm({
  validationSchema,
})

const userName = useField('userName')
const password = useField('password')

const onSubmit = handleSubmit(async (values) => {
  loading.value = true
  try {
    const response = await AuthService.login({
      userName: values.userName,
      password: values.password
    });
    const sessionTime = import.meta.env.VITE_SESSION_TIME
    const expiresIn = parseInt(sessionTime) * 60 * 1000
    const expirationTime = Date.now() + expiresIn

    setUserSession(response.data.user, response.data.access_token, expirationTime)

    snackbar.showSnackbar(
      response.message,
      `Xin chào ${response.data.user.firstName} ${response.data.user.lastName}, thời gian sử dụng: ${sessionTime} phút, hết hạn vào: ${formatDateTime(new Date(expirationTime))}`,
      'success',
      6000
    );

    router.push('/dashboard')
  } catch (error) {
    snackbar.showSnackbar(
      'Đăng nhập thất bại',
      getErrorMessage(error, 'Lỗi không xác định'),
      'error'
    );
  } finally {
    loading.value = false
  }
})
//===========================//
</script>

<template>
  <div class="position-fixed top-0 right-0 pa-3">
    <ThemeToggle />
  </div>
  <v-main class="d-flex align-center justify-center" style="min-height: 100vh;">
    <v-card :disabled="loading" :loading="loading" elevation="16" max-width="355" class="d-flex flex-column ga-4 w-100">

      <template v-slot:loader="{ isActive }">
        <v-progress-linear :active="isActive" color="primary" height="4" indeterminate></v-progress-linear>
      </template>

      <v-card-item class="py-4">
        <v-card-title class="text-h5 font-weight-bold text-center">
          Đăng nhập
        </v-card-title>

        <v-card-subtitle class="text-subtitle-1 text-center">
          Sử dụng Tài khoản GEMS của bạn
        </v-card-subtitle>
      </v-card-item>

      <v-card-text class="py-2">
        <form @submit="onSubmit" class="d-flex flex-column ga-3">
          <v-text-field label=" Tên tài khoản" variant="outlined" hint="Tên tài khoản của bạn"
            v-model="userName.value.value" :error-messages="userName.errorMessage.value" />

          <v-text-field :append-inner-icon="visible ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append-inner="visible = !visible" :type="visible ? 'text' : 'password'" label="Mật khẩu"
            variant="outlined" hint="Mật khẩu đăng nhập" v-model="password.value.value"
            :error-messages="password.errorMessage.value" />

          <v-btn type="submit" size="large" color="primary" :disabled="loading" class="text-none font-weight-bold">
            Đăng nhập
          </v-btn>
        </form>
      </v-card-text>
      <v-divider class="mx-4"></v-divider>
      <v-card-text class="w-100 text-center pt-0">
        <a href="#" class="text-primary text-decoration-none">
          Bạn quên mật khẩu?
        </a>
      </v-card-text>
    </v-card>
  </v-main>
</template>
