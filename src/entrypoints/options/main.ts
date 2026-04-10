import '../../assets/main.css'

import { createApp } from 'vue'

import { installI18n } from '../../helpers/i18n'
import App from './App.vue'
import { router } from './router'

const app = createApp(App)
installI18n(app)
app.use(router)
app.mount('#app')
