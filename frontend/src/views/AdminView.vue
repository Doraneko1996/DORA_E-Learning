<script setup lang="ts">
import type { CRUDConfig } from '@/types/crud'
import { useCRUD } from '@/composables/useCRUD'

const crudConfig: CRUDConfig = {
  title: 'Quản lý Admin',
  apiEndpoint: '/api/admin',
  headers: [
    { title: 'Tên đăng nhập', key: 'user_name', sortable: true },
    { title: 'Họ và tên', key: 'full_name', sortable: true },
    { title: 'Email', key: 'email', sortable: true },
    { title: 'Trạng thái', key: 'status', sortable: true },
    { title: 'Thao tác', key: 'actions', sortable: false }
  ],
  defaultSort: {
    key: 'user_name',
    order: 'asc'
  }
}

const {
  items,
  loading,
  dialog,
  editedItem,
  handleEdit,
  handleDelete,
  handleSave
} = useCRUD(crudConfig)
</script>

<template>
  <crud-layout
    :config="crudConfig"
    v-model:dialog="dialog"
    @edit="handleEdit"
    @delete="handleDelete"
    @save="handleSave"
  >
    <template #dialog-content>
      <!-- Form thêm/sửa tùy chỉnh cho admin -->
      <v-form v-if="editedItem" @submit.prevent="handleSave">
        <v-text-field
          v-model="editedItem.user_name"
          label="Tên đăng nhập"
          required
        />
        <v-text-field
          v-model="editedItem.first_name"
          label="Tên"
          required
        />
        <v-text-field
          v-model="editedItem.last_name"
          label="Họ"
          required
        />
        <!-- Thêm các trường khác -->
      </v-form>
    </template>

    <!-- Tùy chỉnh hiển thị các cột -->
    <template #item.full_name="{ item }">
      {{ item.raw.last_name }} {{ item.raw.first_name }}
    </template>

    <template #item.status="{ item }">
      <v-chip
        :color="item.raw.status ? 'success' : 'error'"
        :text="item.raw.status ? 'Hoạt động' : 'Khóa'"
        size="small"
      />
    </template>
  </crud-layout>
</template>
