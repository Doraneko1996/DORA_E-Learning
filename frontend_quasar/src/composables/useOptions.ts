import { useOptionsStore } from 'src/stores/options.store'
import type { OptionType } from 'src/services/options.service'

export const useOptions = (type: OptionType) => {
  const store = useOptionsStore()

  return {
    options: store.cache[type] || [], // Trả về mảng thô trực tiếp
    isLoading: store.loading.has(type), // Trả về giá trị thô thay vì ComputedRef
    refresh: () => store.getOptions(type),
  }
}
