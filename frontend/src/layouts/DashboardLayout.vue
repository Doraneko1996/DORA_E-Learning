<script setup lang="ts">
import ThemeToggle from '@/components/ThemeToggle.vue'
import { onMounted } from 'vue'
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSnackbarStore } from '@/stores/snackbar'
import { clearSession, getUserSession } from '@/utils/storage.utils'
import { getErrorMessage } from '@/utils/error.utils'
import { useSessionTimeout } from '@/composables/useSessionTimeout'
import { AuthService } from '@/services/auth.service'

const snackbar = useSnackbarStore()
const drawer = ref(false) // Biến để đóng mở menu bên (Mặc định là đóng)

//===== XỬ LÝ THAY ĐỔI TIÊU ĐỀ TRANG =====//
const route = useRoute()
const title = computed(() => route.meta.title || 'Tổng quan')
//========================================//

//===== XỬ LÝ ĐĂNG XUẤT =====//
const router = useRouter()
const loading = ref(false)

const handleLogout = async () => {
  loading.value = true // Bắt đầu trạng thái loading
  try {
    // Gọi API để đăng xuất
    const response = await AuthService.logout()

    // Xóa sessionStorage
    clearSession()

    // Hiển thị thông báo thành công
    snackbar.showSnackbar(response.message, 'Hẹn gặp lại sau nhé!', 'success')

    // Chuyển hướng đến trang đăng nhập
    router.push('/')
  } catch (error) {
    // Hiển thị thông báo lỗi
    snackbar.showSnackbar(
      'Đăng xuất thất bại',
      getErrorMessage(error, 'Lỗi không xác định'),
      'error'
    )
  } finally {
    loading.value = false // Kết thúc trạng thái loading
  }
}
//===========================//

//===== XỬ LÝ ĐĂNG XUẤT KHI HẾT PHIÊN ĐĂNG NHẬP (FE) =====//
useSessionTimeout()
//========================================================//

//===== XỬ LÝ CHỌN CHỨC DANH =====//
const selectedRole = ref<string>()
const allRoles = [
  { title: 'Admin', value: 0 },
  { title: 'Quản lý', value: 1 },
  { title: 'Giáo viên', value: 2 }
]
const roles = computed(() => {
  const user = getUserSession()
  return user?.role > 1 ? [] : allRoles.filter(role => role.value >= user.role)
})
const selectedRoleValue = computed(() => allRoles.find(r => r.title === selectedRole.value)?.value ?? 2)
const menuPermissions = computed(() => ({
// menuPermissions chỉ dùng để ẩn các menu dựa trên quyền của người dùng.
// Việc bảo mật được thực hiện ở phía backend.
  canAccessAdmin: selectedRoleValue.value === 0, // Chỉ admin mới có quyền truy cập
  canAccessManager: selectedRoleValue.value <= 1, // Quản lý và admin có quyền truy cập
  canAccessTeacher: selectedRoleValue.value <= 2, // Giáo viên, quản lý và admin đều có quyền truy cập
}))

// Khởi tạo role từ sessionStorage
onMounted(() => {
  const user = getUserSession()
  if (user) {
    selectedRole.value = allRoles.find(r => r.value === user.role)?.title
  }
})
//=============================//
</script>

<template>
  <v-navigation-drawer v-model="drawer" floating temporary>
    <v-list slim>
      <v-list-item prepend-icon="mdi-cat" title="DORA Education"></v-list-item>
    </v-list>

    <v-list color="primary" slim nav>
      <v-list-item prepend-icon="mdi-chart-line" title="Tổng quan" value="Tổng quan" router
        to="/dashboard/home"></v-list-item>

      <v-list-group value="Quản lý người dùng">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-badge-account-horizontal-outline"
            title="Quản lý người dùng"></v-list-item>
        </template>

        <v-list-item v-if="menuPermissions.canAccessAdmin" title="Quản trị viên" value="Quản trị viên" router
          to="/dashboard/manage/admin"></v-list-item>
        <v-list-item v-if="menuPermissions.canAccessAdmin" title="Quản lý viên" value="Quản lý viên" router
          to="/dashboard/manage/manager"></v-list-item>
        <v-list-item v-if="menuPermissions.canAccessManager" title="Giáo viên" value="Giáo viên" router
          to="/dashboard/manage/teacher"></v-list-item>
        <v-list-item v-if="menuPermissions.canAccessTeacher" title="Học viên" value="Học viên" router
          to="/dashboard/manage/student"></v-list-item>
      </v-list-group>
      <v-list-group value="Quản lý học vụ">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-bookshelf" title="Quản lý học vụ"></v-list-item>
        </template>

        <v-list-item v-if="menuPermissions.canAccessManager" title="Trường học" value="Trường học" router
          to="/dashboard/manage/school"></v-list-item>
        <v-list-item v-if="menuPermissions.canAccessTeacher" title="Lớp học" value="Lớp học" router
          to="/dashboard/manage/class"></v-list-item>
        <v-list-item v-if="menuPermissions.canAccessTeacher" title="Thời khóa biểu" value="Thời khóa biểu" router
          to="/dashboard/manage/schedule"></v-list-item>
        <v-list-item v-if="menuPermissions.canAccessTeacher" title="Học liệu" value="Học liệu" router
          to="/dashboard/manage/edukit"></v-list-item>
        <v-list-item v-if="menuPermissions.canAccessTeacher" title="Đề thi" value="Đề thi" router
          to="/dashboard/manage/exam"></v-list-item>
        <v-list-item v-if="menuPermissions.canAccessTeacher" title="Điểm số" value="Điểm số" router
          to="/dashboard/manage/result"></v-list-item>
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

    <!--NÚT ĐỔI CHỨC DANH-->
    <v-select v-if="selectedRole" class="mr-2" v-model="selectedRole" :items="roles.map(r => r.title)"
      label="Đổi chức danh" variant="outlined" density="compact" max-width="150" hide-details hide-selected></v-select>
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
