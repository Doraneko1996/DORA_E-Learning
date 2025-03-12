import { defineStore } from 'pinia'
import { ref } from 'vue'
import { OptionsService } from 'src/services/options.service'
import type { OptionItem, OptionType } from 'src/services/options.service'
import { LocalStorage } from 'quasar'

interface OptionsState {
  [key: string]: OptionItem[]
}

export const useOptionsStore = defineStore('options', () => {
  const cache = ref<OptionsState>(
    LocalStorage.getItem('optionsCache') || {}, // Khôi phục cache từ localStorage
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
      LocalStorage.set(`lastFetched_${type}`, Date.now())
      LocalStorage.set('optionsCache', cache.value) // Lưu cache vào localStorage
      return options
    } catch (e) {
      console.error('Lỗi lưu cache:', e)
      throw e
    } finally {
      loading.value.delete(type)
    }
  }

  // Hàm kiểm tra cache
  const isCacheValid = (type: OptionType) => {
    const lastFetched = LocalStorage.getItem<number>(`lastFetched_${type}`)
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
