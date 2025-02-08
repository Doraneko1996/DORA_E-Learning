import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: localStorage.getItem('theme') || 'dark', // Khôi phục trạng thái từ localStorage
    background: localStorage.getItem('background') || 'on', // Khôi phục trạng thái từ localStorage
  }),
  actions: {
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'; // Chuyển đổi giữa sáng và tối
      localStorage.setItem('theme', this.theme); // Lưu trạng thái vào localStorage
    },
    toggleBackground() {
      this.background = this.background === 'on' ? 'off' : 'on'; // Chuyển đổi trạng thái background
      localStorage.setItem('background', this.background ? 'true' : 'false'); // Lưu trạng thái vào localStorage
    },
  },
})
