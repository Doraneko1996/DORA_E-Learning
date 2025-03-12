import { defineBoot } from '#q-app/wrappers'
import { Notify } from 'quasar'

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli-vite/boot-files
export default defineBoot((/* { app, router, ... } */) => {
  Notify.setDefaults({
    timeout: 2500,
    textColor: 'white'
  })
})
