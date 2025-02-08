<script setup lang="ts">
import { ref } from 'vue'
import { useField, useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';
import ThemeToggle from '@/components/ThemeToggle.vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useSnackbarStore } from '@/stores/snackbar'

//===== XỬ LÝ ĐĂNG NHẬP =====//
const snackbar = useSnackbarStore()
// Khai báo trạng thái loading và visible
const loading = ref(false)
const visible = ref(false)

// Định nghĩa schema xác thực
const validationSchema = toTypedSchema(
  zod.object({
    user_name: zod.string({ required_error: "Hãy nhập tên tài khoản" }).min(1, { message: 'Hãy nhập tên tài khoản' }).min(4, { message: 'Tên tài khoản phải hơn 4 kí tự' }),
    password: zod.string({ required_error: "Hãy nhập mật khẩu" }).min(1, { message: 'Hãy nhập mật khẩu' }).min(6, { message: 'Mật khẩu phải hơn 6 kí tự' }),
  })
);

// Sử dụng useForm để quản lý form
const { handleSubmit } = useForm({
  validationSchema,
});

const user_name = useField('user_name')
const password = useField('password')

const router = useRouter()

const onSubmit = handleSubmit(async (values) => {
  loading.value = true; // Bắt đầu trạng thái loading
  try {
    const response = await axios.post('/api/auth/login', values)
    const name = `${response.data.user.first_name} ${response.data.user.last_name}`

    // Lưu dữ liệu người dùng vào sessionStorage
    sessionStorage.setItem('user', response.data.user)
    sessionStorage.setItem('access_token', response.data.access_token)
    // sessionStorage.setItem('refresh_token', response.data.refresh_token)

    // Tính toán thời gian hết hạn (100 phút)
    const sessionTime = import.meta.env.VITE_SESSION_TIME
    const expiresIn = parseInt(sessionTime) * 60 * 1000; // Chuyển đổi 100 phút thành mili giây
    const expirationTime = Date.now() + expiresIn;
    sessionStorage.setItem('token_expiration', expirationTime.toString());

    // Hiển thị thông báo thành công
    snackbar.showSnackbar(response.data.message, `Xin chào ${name}, thời gian sử dụng là ${sessionTime} phút, hết hạn lúc: ${new Date(expirationTime).toLocaleString()}`, 'success', 6000)

    // Chuyển hướng đến dashboard
    router.push('/dashboard')

  } catch (error) {
    const axiosError = error as { response?: { data?: { message?: string } } }; // Định nghĩa kiểu cho error

    // Hiển thị thông báo lỗi
    snackbar.showSnackbar('Đăng nhập thất bại', axiosError.response?.data?.message || 'Lỗi không xác định', 'error')

  } finally {
    loading.value = false; // Kết thúc trạng thái loading
  }
});
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
            v-model="user_name.value.value" :error-messages="user_name.errorMessage.value" />

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
