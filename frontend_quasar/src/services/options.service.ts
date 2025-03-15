import { api } from 'src/boot/axios'
import type { OptionItem, OptionType } from 'src/types/option.type'

export const OptionsService = {
  async fetchOptions(type: OptionType): Promise<OptionItem[]> {
    try {
      const { data } = await api.get(`/options/${type.toLowerCase()}`)
      return data.data
    } catch (error) {
      console.error(`Error fetching ${type} options:`, error)
      return []
    }
  },
}
