import '../../assets/main.css'

import { createApp } from 'vue'

import { applyColorScheme } from '../../helpers/colorScheme'
import { detectBrowserLocale, i18n } from '../../helpers/i18n'
import { getSettings } from '../../helpers/settings'
import App from './App.vue'

const settings = await getSettings()
applyColorScheme(settings.colorScheme)
i18n.global.locale.value = settings.locale || detectBrowserLocale()

const app = createApp(App)
app.use(i18n)
app.mount('#app')
