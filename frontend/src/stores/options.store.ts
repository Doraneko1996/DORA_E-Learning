import { defineStore } from 'pinia'
import { ref } from 'vue'
import { OptionsService } from '@/services/options.service'
import type { OptionItem, OptionType } from '@/services/options.service'

interface OptionsState {
  [key: string]: OptionItem[]
}

export const useOptionsStore = defineStore('options', () => {
  const cache = ref<OptionsState>(
    JSON.parse(localStorage.getItem('optionsCache') || '{}') // Khôi phục cache từ localStorage
  )
  const loading = ref<Set<OptionType>>(new Set())

  const getOptions = async (type: OptionType) => {
    // Kiểm tra cache và thời gian hết hạn
    if (cache.value[type]?.length && isCacheValid(type)) {
      return cache.value[type]
    }

    loading.value.add(type)
    try {
      const options = await OptionsService.fetchOptions(type)
      cache.value[type] = options
      localStorage.setItem(`lastFetched_${type}`, Date.now().toString())
      localStorage.setItem('optionsCache', JSON.stringify(cache.value)) // Lưu cache vào localStorage
      return options
    } finally {
      loading.value.delete(type)
    }
  }

  // Hàm kiểm tra cache
  const isCacheValid = (type: OptionType) => {
    const lastFetched = localStorage.getItem(`lastFetched_${type}`)
    if (!lastFetched) return false
    return Date.now() - Number(lastFetched) < 86400000 // 24 giờ
  }

  const prefetchOptions = async (types: OptionType[]) => {
    await Promise.all(types.map((type) => getOptions(type)))
  }

  return {
    cache,
    loading,
    getOptions,
    isCacheValid,
    prefetchOptions,
  }
})
