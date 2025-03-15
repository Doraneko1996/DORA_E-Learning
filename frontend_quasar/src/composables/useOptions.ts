import { ref, watch } from 'vue'
import { useOptionsStore } from 'src/stores/options.store'
import type { OptionType } from 'src/types/option.type'
import { useQuasar } from 'quasar'

export const useOptions = (type: OptionType) => {
  const store = useOptionsStore()
  const options = ref(store.cache[type] || [])
  const $q = useQuasar()

  // Tự động lấy dữ liệu nếu chưa có trong cache
  if (!store.cache[type]?.length) {
    store
      .getOptions(type)
      .then((data) => {
        options.value = data // Cập nhật options khi dữ liệu được tải thành công
      })
      .catch((error) => {
        $q.notify({
          type: 'negative',
          message: `Lỗi khi tải tùy chọn ${type}`,
          caption: error.message,
        })
        options.value = [] // Đặt lại options về mảng rỗng nếu lỗi
      })
  }

  // Theo dõi thay đổi trong store.cache[type]
  watch(
    () => store.cache[type],
    (newOptions) => {
      options.value = newOptions || []
    },
    { deep: true },
  )

  return {
    options: store.cache[type] || [], // Trả về mảng thô trực tiếp
    isLoading: store.loading.has(type), // Trả về giá trị thô thay vì ComputedRef
    refresh: () => store.getOptions(type),
  }
}
