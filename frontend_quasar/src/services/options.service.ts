import { api } from 'src/boot/axios'

export type OptionType = 'GENDER' | 'PROVINCE' | 'DISTRICT'

export interface OptionItem {
  value: string
  label: string
}

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
