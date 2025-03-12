import { computed } from 'vue'
import { useOptionsStore } from '@/stores/options.store'
import type { OptionType } from '@/services/options.service'

export const useOptions = (type: OptionType) => {
  const store = useOptionsStore()

  return {
    options: computed(() => store.cache[type] || []),
    isLoading: computed(() => store.loading.has(type)),
    refresh: () => store.getOptions(type)
  }
}
