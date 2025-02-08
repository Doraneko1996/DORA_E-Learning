import { ref } from 'vue'
import axios from 'axios'
import { useSnackbarStore } from '@/stores/snackbar'
import type { CRUDConfig } from '@/types/crud'
import type { CRUDItem } from '@/types/crud'

const snackbar = useSnackbarStore()

export function useCRUD(config: CRUDConfig) {
  const items = ref([])
  const loading = ref(false)
  const dialog = ref(false)
  const editedItem = ref<CRUDItem | null>(null)
  const totalItems = ref(0)
  const page = ref(1)
  const itemsPerPage = ref(10)
  const search = ref('')
  const sortBy = ref(config.defaultSort?.key || '')
  const sortOrder = ref(config.defaultSort?.order === 'desc')

  // Xử lý sự kiện edit
  const handleEdit = (item: never) => {
    editedIndex.value = items.value.indexOf(item)
    editedItem.value = Object.assign({}, item)  // Clone item để edit
    dialog.value = true
  }

  // Xử lý sự kiện xóa
  const handleDelete = async (item: { id: string | number }) => {
    try {
      await axios.delete(`${config.apiEndpoint}/${item.id}`)
      const index = items.value.findIndex((i: { id: string | number }) => i.id === item.id)
      items.value.splice(index, 1)
      snackbar.showSnackbar('Thành công', 'Xóa dữ liệu thành công', 'success')
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } }; // Định nghĩa kiểu cho error
      snackbar.showSnackbar(
        'Lỗi',
        axiosError.response?.data?.message || 'Lỗi không xác định',
        'error'
      )
    }
  }

  // Xử lý sự kiện lưu
  const handleSave = async () => {
    try {
      if (!editedItem.value) return

      if (editedIndex.value > -1) {
        // Cập nhật
        await axios.patch(
          `${config.apiEndpoint}/${editedItem.value.id}`,
          editedItem.value
        )
      } else {
        // Thêm mới
        await axios.post(config.apiEndpoint, editedItem.value)
      }
      dialog.value = false
      snackbar.showSnackbar(
        'Thành công',
        'Lưu dữ liệu thành công',
        'success'
      )
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } }; // Định nghĩa kiểu cho error
      snackbar.showSnackbar(
        'Lỗi',
        axiosError.response?.data?.message || 'Lỗi không xác định',
        'error'
      )
    }
  }

  return {
    items,
    loading,
    dialog,
    editedItem,
    editedIndex,
    handleEdit,
    handleDelete,
    handleSave
  }
}
