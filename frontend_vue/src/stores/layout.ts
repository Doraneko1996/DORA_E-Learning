import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLayoutStore = defineStore('layout', () => {
    const isMenuCollapsed = ref(localStorage.getItem('menuCollapsed') === 'true')

    const toggleMenu = () => {
        isMenuCollapsed.value = !isMenuCollapsed.value
        localStorage.setItem('menuCollapsed', isMenuCollapsed.value.toString())
    }

    return {
        isMenuCollapsed,
        toggleMenu
    }
}) 