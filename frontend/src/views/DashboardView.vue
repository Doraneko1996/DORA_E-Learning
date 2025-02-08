<script setup lang="ts">
import ThemeToggle from '@/components/ThemeToggle.vue';
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSnackbarStore } from '@/stores/snackbar'
import axios from 'axios'

const snackbar = useSnackbarStore()

const drawer = ref(false)
const open = ref(['Quản lý người dùng', 'Quản lý học vụ'])

//===== XỬ LÝ THAY ĐỔI TIÊU ĐỀ TRANG =====//
const route = useRoute()
const title = ref(route.meta.title || 'Tổng quan') // Khởi tạo tiêu đề từ meta

// Theo dõi sự thay đổi của route
watch(route, (newRoute) => {
  title.value = newRoute.meta.title || 'Tổng quan' // Cập nhật tiêu đề từ meta
})
//========================================//

//===== XỬ LÝ ĐĂNG XUẤT =====//
const router = useRouter()
const loading = ref(false)

async function handleLogout() {
  loading.value = true // Bắt đầu trạng thái loading
  try {
    // Gọi API để đăng xuất
    const response = await axios.post('/api/auth/logout')

    // Xóa sessionStorage
    sessionStorage.clear()

    // Hiển thị thông báo thành công
    snackbar.showSnackbar(response.data.message, 'Hẹn gặp lại sau nhé!', 'success')

    // Chuyển hướng đến trang đăng nhập
    router.push('/')

  } catch (error) {
    const axiosError = error as { response?: { data?: { message?: string } } }; // Định nghĩa kiểu cho error

    // Hiển thị thông báo lỗi
    snackbar.showSnackbar('Đăng xuất thất bại', axiosError.response?.data?.message || 'Lỗi không xác định', 'error')
  } finally {
    loading.value = false
  }
}
//===========================//

//===== XỬ LÝ ĐĂNG XUẤT KHI HẾT PHIÊN ĐĂNG NHẬP (FE) =====//
import { onMounted } from 'vue';

onMounted(() => {
  const expirationTime = parseInt(sessionStorage.getItem('token_expiration') || '0', 10);
  const warningTime = expirationTime - (10 * 60 * 1000); // Thời điểm cảnh báo (trước 10 phút)

  // Tính thời gian đến khi hiển thị cảnh báo
  const timeUntilWarning = warningTime - Date.now();

  if (timeUntilWarning > 0) {
    // Đặt timeout cho cảnh báo
    setTimeout(() => {
      if (!sessionStorage.getItem('sessionEndWarningDisplayed')) {
        snackbar.showSnackbar(
          'Bạn sẽ được đăng xuất sau 10 phút nữa!',
          'Hãy hoàn thành công việc trước khi phiên hết hạn.',
          'warning',
          10000
        );
        sessionStorage.setItem('sessionEndWarningDisplayed', 'true');
      }
    }, timeUntilWarning);
  }

  // Đặt timeout cho việc đăng xuất
  const timeUntilExpiration = expirationTime - Date.now();
  if (timeUntilExpiration > 0) {
    setTimeout(() => {
      handleLogoutWhenSessionExpire();
    }, timeUntilExpiration);
  } else {
    handleLogoutWhenSessionExpire();
  }
});

const handleLogoutWhenSessionExpire = () => {
  // Xóa sessionStorage
  sessionStorage.clear()

  // Hiển thị thông báo
  snackbar.showSnackbar('Hết thời gian truy cập!', 'Bạn cần đăng nhập lại để sử dụng.', 'error')

  // Chuyển hướng về trang đăng nhập
  router.push('/')
}
//========================================================//

//===== FAKE DỮ LIỆU NĂM HỌC =====//
const selectedYear = ref('2024-2025');
const schoolYears = [
  '2024-2025',
  '2023-2024',
  '2022-2023'
];
//=============================//
</script>

<template>
  <v-navigation-drawer v-model="drawer" floating temporary>
    <v-list slim>
      <v-list-item prepend-icon="mdi-cat" title="DORA Education"></v-list-item>
    </v-list>

    <v-list color="primary" v-model:opened="open" slim nav>
      <v-list-item prepend-icon="mdi-chart-line" title="Tổng quan" value="Tổng quan" router
        to="/dashboard/home"></v-list-item>
      <v-list-group value="Quản lý người dùng">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-badge-account-horizontal-outline"
            title="Quản lý người dùng"></v-list-item>
        </template>

        <v-list-item title="Quản trị viên" value="Quản trị viên" router to="/dashboard/manage/admin"></v-list-item>
        <v-list-item title="Quản lý viên" value="Quản lý viên" router to="/dashboard/manage/manager"></v-list-item>
        <v-list-item title="Giáo viên" value="Giáo viên" router to="/dashboard/manage/teacher"></v-list-item>
        <v-list-item title="Học viên" value="Học viên" router to="/dashboard/manage/student"></v-list-item>
      </v-list-group>
      <v-list-group value="Quản lý học vụ">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-bookshelf" title="Quản lý học vụ"></v-list-item>
        </template>

        <v-list-item title="Trường học" value="Trường học" router to="/dashboard/manage/school"></v-list-item>
        <v-list-item title="Lớp học" value="Lớp học" router to="/dashboard/manage/class"></v-list-item>
        <v-list-item title="Thời khóa biểu" value="Thời khóa biểu" router to="/dashboard/manage/schedule"></v-list-item>
        <v-list-item title="Học liệu" value="Học liệu" router to="/dashboard/manage/edukit"></v-list-item>
        <v-list-item title="Đề thi" value="Đề thi" router to="/dashboard/manage/exam"></v-list-item>
        <v-list-item title="Điểm số" value="Điểm số" router to="/dashboard/manage/result"></v-list-item>
      </v-list-group>
    </v-list>

    <template v-slot:append>
      <div class="pa-3">
        <v-menu>
          <!--THÔNG TIN NGƯỜI DÙNG-->
          <template v-slot:activator="{ props }">
            <v-card v-bind="props" theme="dark"
              style="background-image: linear-gradient(-225deg, #22E1FF 0%, #1D8FE1 48%, #625EB1 100%);"
              append-avatar="https://i.imgur.com/4cDd1kC.png" link>
              <template v-slot:title>
                <span class="text-subtitle-1 font-weight-bold">Doraneko</span>
              </template>

              <template v-slot:subtitle>
                <span class="text-subtitle-2">doraneko1996</span>
              </template>
            </v-card>
          </template>
          <!--====================-->

          <!--MENU NGƯỜI DÙNG-->
          <v-list>
            <v-list-item title="Thông tin cá nhân" value="Thông tin cá nhân" router
              to="/dashboard/profile"></v-list-item>
            <v-list-item title="Cài đặt" value="Cài đặt" router to="/dashboard/setting"></v-list-item>
            <v-list-item :title="loading ? 'Đang đăng xuất...' : 'Đăng xuất'" value="Đăng xuất"
              @click="handleLogout"></v-list-item>
          </v-list>
          <!--===============-->
        </v-menu>
      </div>
    </template>
  </v-navigation-drawer>

  <v-app-bar>
    <!--NÚT ĐÓNG MỞ MENU BÊN-->
    <template v-slot:prepend>
      <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    </template>
    <!--====================-->

    <!--TIÊU ĐỀ TRANG-->
    <v-app-bar-title class="d-none d-sm-flex">{{ title }}</v-app-bar-title>
    <!--=============-->

    <v-spacer></v-spacer>

    <!--NÚT CHỌN NĂM HỌC-->
    <v-select class="mr-2" v-model="selectedYear" :items="schoolYears" label="Năm học" variant="outlined"
      density="compact" max-width="150" hide-details hide-selected></v-select>
    <!--================-->

    <!--NÚT TÙY CHỈNH GIAO DIỆN-->
    <theme-toggle></theme-toggle>
    <!--=======================-->

  </v-app-bar>

  <v-main>
    <v-container fluid>
      <router-view v-slot="{ Component, route }">
        <component :is="Component" :key="route.path" />
      </router-view>
    </v-container>
  </v-main>
</template>
