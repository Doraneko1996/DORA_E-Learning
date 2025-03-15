<template>
  <q-layout view="hHh Lpr lFf">
    <!-- Header -->
    <q-header>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="drawer = !drawer" />
        <q-toolbar-title class="gt-xs">
          {{ title }}
        </q-toolbar-title>
        <q-space />
        <q-select v-if="selectedRole" v-model="selectedRole" :options="roles.map(r => r.title)" label="Đổi chức danh"
          color="white" outlined dense dark style="min-width: 150px" class="q-mr-md" />
        <theme-toggle />
      </q-toolbar>
    </q-header>

    <!-- Drawer -->
    <q-drawer v-model="drawer" show-if-above :width="250" :mini="miniState" @mouseenter="miniState = false"
      @mouseleave="handleMouseLeave" mini-to-overlay bordered>
      <q-scroll-area class="fit" :horizontal-thumb-style="{ opacity: '0' }">
        <q-list padding>
          <q-item clickable v-ripple to="/dashboard/home">
            <q-item-section avatar>
              <q-icon name="mdi-chart-box-outline" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Tổng quan</q-item-label>
            </q-item-section>
          </q-item>
          <q-separator />
          <q-item v-if="menuPermissions.canAccessAdmin" clickable v-ripple to="/dashboard/manage/admin">
            <q-item-section avatar>
              <q-icon name="mdi-shield-account-outline" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Quản trị viên</q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="menuPermissions.canAccessManager" clickable v-ripple to="/dashboard/manage/manager">
            <q-item-section avatar>
              <q-icon name="mdi-badge-account-outline" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Quản lý viên</q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="menuPermissions.canAccessManager" clickable v-ripple to="/dashboard/manage/teacher">
            <q-item-section avatar>
              <q-icon name="mdi-briefcase-account" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Giáo viên</q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="menuPermissions.canAccessTeacher" clickable v-ripple to="/dashboard/manage/student">
            <q-item-section avatar>
              <q-icon name="mdi-account-school-outline" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Học viên</q-item-label>
            </q-item-section>
          </q-item>
          <q-separator />
          <q-item v-if="menuPermissions.canAccessManager" clickable v-ripple to="/dashboard/manage/school">
            <q-item-section avatar>
              <q-icon name="mdi-town-hall" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Trường học</q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="menuPermissions.canAccessTeacher" clickable v-ripple to="/dashboard/manage/class">
            <q-item-section avatar>
              <q-icon name="mdi-chair-school" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Lớp học</q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="menuPermissions.canAccessTeacher" clickable v-ripple to="/dashboard/manage/schedule">
            <q-item-section avatar>
              <q-icon name="mdi-calendar-multiselect-outline" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Thời khóa biểu</q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="menuPermissions.canAccessTeacher" clickable v-ripple to="/dashboard/manage/edukit">
            <q-item-section avatar>
              <q-icon name="mdi-bookshelf" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Học liệu</q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="menuPermissions.canAccessTeacher" clickable v-ripple to="/dashboard/manage/exam">
            <q-item-section avatar>
              <q-icon name="mdi-book-clock-outline" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Đề thi</q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="menuPermissions.canAccessTeacher" clickable v-ripple to="/dashboard/manage/result">
            <q-item-section avatar>
              <q-icon name="mdi-counter" />
            </q-item-section>
            <q-item-section>
              Điểm số
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
      <div class="absolute-bottom q-pa-sm text-white" :hidden="shouldHide">
        <q-btn size="xl" align="between" class="full-width text-capitalize q-py-md"
          style="background-image: linear-gradient(-225deg, #22E1FF 0%, #1D8FE1 48%, #625EB1 100%);">
          <div class="q-gutter-sm row items-center no-wrap overflow-hidden">
            <q-avatar>
              <img src="https://i.imgur.com/4cDd1kC.png" alt="Avatar" />
            </q-avatar>
            <div class="column text-left">
              <div class="text-subtitle2 text-weight-bold ellipsis">{{ userFullName }}</div>
              <div class="text-caption">{{ userUsername }}</div>
            </div>
          </div>

          <q-menu v-model="menuOpen" fit @update:model-value="handleMenuUpdate">
            <q-list style="min-width: 100px">
              <q-item clickable to="/dashboard/profile">
                <q-item-section>Thông tin cá nhân</q-item-section>
              </q-item>
              <q-item clickable to="/dashboard/setting">
                <q-item-section>Cài đặt</q-item-section>
              </q-item>
              <q-item clickable @click="handleLogout" :disable="loading">
                <q-item-section>{{ loading ? 'Đang đăng xuất...' : 'Đăng xuất' }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </q-drawer>

    <!-- Nội dung chính -->
    <q-page-container>
      <router-view :user-role="selectedRoleValue" />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { clearSession, getUserSession } from 'src/utils/storage.utils';
import { getErrorMessage } from 'src/utils/error.utils';
import { useSessionTimeout } from 'src/composables/useSessionTimeout';
import AuthService from 'src/services/auth.service';
import ThemeToggle from 'src/components/ThemeToggle.vue';
import { useOptionsStore } from 'src/stores/options.store';
import type { OptionType } from 'src/types/option.type';

// Khai báo Quasar
const $q = useQuasar();

// Store
const optionsStore = useOptionsStore()

// State
const drawer = ref(false);
const miniState = ref(true);
const menuOpen = ref(false);
const route = useRoute();
const router = useRouter();
const loading = ref(false);
// Thông tin người dùng
const userFullName = computed(() => {
  const user = getUserSession();
  if (user && typeof user === 'object' && 'firstName' in user && 'lastName' in user) {
    // Tách firstName thành mảng các từ, lấy từ cuối cùng làm chữ đệm
    const firstNameParts = user.firstName.trim().split(/\s+/);
    const middleName = firstNameParts.length > 1 ? firstNameParts[firstNameParts.length - 1] : firstNameParts[0] || '';
    return `${middleName} ${user.lastName}`.trim();
  }
  return '';
});
const userUsername = ref<string>('');

// Tiêu đề trang
const title = computed(() => route.name || '');

// Xử lý đăng xuất
const handleLogout = async () => {
  loading.value = true;
  try {
    const response = await AuthService.logout();
    clearSession();
    $q.notify({
      type: 'positive',
      message: response.message,
      caption: 'Hẹn gặp lại sau nhé',
      progress: true
    });
    await router.push({ name: 'login' });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Đăng xuất thất bại',
      caption: getErrorMessage(error, 'Lỗi không xác định'),
      position: 'top',
    });
  } finally {
    loading.value = false;
  }
};

// Xử lý vai trò (role)
const selectedRole = ref<string>();
const allRoles = [
  { title: 'Admin', value: 0 },
  { title: 'Quản lý', value: 1 },
  { title: 'Giáo viên', value: 2 },
];
const roles = computed(() => {
  const user = getUserSession();
  // Kiểm tra user có tồn tại và có thuộc tính role không
  if (user && typeof user === 'object' && 'role' in user) {
    return user.role > 1 ? [] : allRoles.filter(role => role.value >= user.role);
  }
  return allRoles; // Giá trị mặc định nếu user không hợp lệ
});
const selectedRoleValue = computed(() =>
  allRoles.find(r => r.title === selectedRole.value)?.value ?? 2
);
const menuPermissions = computed(() => ({
  canAccessAdmin: selectedRoleValue.value === 0,
  canAccessManager: selectedRoleValue.value <= 1,
  canAccessTeacher: selectedRoleValue.value <= 2,
}));

onMounted(async () => {
  // Khởi tạo role từ sessionStorage
  const user = getUserSession();
  if (user && typeof user === 'object' && 'role' in user) {
    selectedRole.value = allRoles.find(r => r.value === user.role)?.title;
    userUsername.value = String(user.userName || '');
  }

  // Các option cơ bản luôn cần tải
  const basicOptions = ['GENDER', 'PROVINCE', 'DISTRICT'] as const;
  const needsFetch: OptionType[] = basicOptions.filter(type =>
    !optionsStore.cache[type]?.length || !optionsStore.isCacheValid(type)
  );

  // Nếu role không phải 'student', thêm các option đặc thù
  const userRole = user?.role as number;
  if (typeof userRole === 'number' && userRole !== 3) {
    const specificOptions = [
      'GEMS_EMPLOYEE',
      'EDUCATION_LEVEL',
      'INFORMATIC_RELATION',
      'NVSP',
      'IC3_CERTIFICATE',
      'ICDL_CERTIFICATE',
    ] as const;
    specificOptions.forEach(type => {
      if (!optionsStore.cache[type]?.length || !optionsStore.isCacheValid(type)) {
        needsFetch.push(type);
      }
    });
  }

  // Gọi prefetch nếu có option cần tải
  if (needsFetch.length) {
    await optionsStore.prefetchOptions(needsFetch)
  }
});

// Logic hiển thị footer: ẩn khi miniState = true và màn hình >= md
const shouldHide = computed(() => {
  return miniState.value && !$q.screen.lt.md;
});

// Xử lý khi chuột rời khỏi drawer
const handleMouseLeave = () => {
  if (!menuOpen.value) {
    miniState.value = true;
  }
};

// Xử lý khi trạng thái q-menu thay đổi
const handleMenuUpdate = (isOpen: boolean) => {
  if (isOpen) {
    miniState.value = false; // Mở rộng drawer khi menu mở
  } else if (!$q.screen.lt.md) {
    miniState.value = true; // Thu gọn drawer khi menu đóng, nếu màn hình >= md
  }
};

// Xử lý timeout phiên đăng nhập
useSessionTimeout();
</script>
