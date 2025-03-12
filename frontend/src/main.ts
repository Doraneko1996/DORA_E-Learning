import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Vuetify
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as labsComponents from 'vuetify/labs/components'
import * as directives from 'vuetify/directives'
// Translations provided by Vuetify
import { pl, vi } from 'vuetify/locale'

import App from './App.vue'
import router from './router'
import dayjs from '@/plugins/dayjs'

const vuetify = createVuetify({
  components: {
    ...components,
    ...labsComponents,
  },
  directives,
  locale: {
    locale: 'vi',
    messages: { vi, pl },
  },
  date: {
    locale: {
      vi: 'vi',
    },
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

// Thêm dayjs vào global properties
app.config.globalProperties.$dayjs = dayjs

// Định nghĩa kiểu cho global properties
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $dayjs: typeof dayjs
  }
}

app.mount('#app')
