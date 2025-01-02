import { defineStore } from 'pinia'
import { computed, onUnmounted, ref, watch } from 'vue'

type Theme = 'light' | 'dark' | 'system'

export const useThemeStore = defineStore('theme', () => {
    // State
    const theme = ref<Theme>(localStorage.getItem('theme') as Theme || 'system')
    const systemDark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches)

    // Getters
    const isDark = computed(() => {
        if (theme.value === 'system') return systemDark.value
        return theme.value === 'dark'
    })

    // Actions
    function init() {
        // Theo dõi system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        mediaQuery.addEventListener('change', (e) => {
            systemDark.value = e.matches
        })

        // Cleanup khi component unmount
        onUnmounted(() => {
            mediaQuery.removeEventListener('change', (e) => {
                systemDark.value = e.matches
            })
        })
    }

    function setTheme(newTheme: Theme) {
        theme.value = newTheme
        localStorage.setItem('theme', newTheme)
    }

    // Effects
    watch(
        isDark,
        (dark) => {
            if (dark) {
                document.documentElement.classList.add('dark')
            } else {
                document.documentElement.classList.remove('dark')
            }
        },
        { immediate: true }
    )

    return {
        theme,
        isDark,
        setTheme,
        init
    }
}) 