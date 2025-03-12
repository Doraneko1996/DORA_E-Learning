import { defineStore } from 'pinia';
import { Dark } from 'quasar';

export const useThemeStore = defineStore('theme', {
  state: () => ({
    darkMode: localStorage.getItem('darkMode') === 'true',
  }),
  actions: {
    toggleTheme() {
      this.darkMode = !this.darkMode;
      Dark.set(this.darkMode);
      localStorage.setItem('darkMode', String(this.darkMode));
    },
    loadTheme() {
      Dark.set(this.darkMode);
    }
  }
});
