import { ref } from 'vue'

export const useTable = (initialValue: number[] = []) => {
  const selectedIds = ref<number[]>(initialValue)

  const handleSelectionChange = (ids: number[]) => {
    selectedIds.value = ids
  }

  const resetSelection = () => {
    selectedIds.value = []
  }

  return {
    selectedIds,
    handleSelectionChange,
    resetSelection
  }
}
