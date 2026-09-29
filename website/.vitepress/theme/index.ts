/* eslint-disable simple-import-sort/imports */

import { defineComponent, h, watchEffect } from 'vue'
import { type Theme, useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

import { i18n } from '../i18n'
import DonateButton from './DonateButton.vue'
import HeroLogo from './HeroLogo.vue'
import Showcase from './Showcase.vue'
import SiteFooter from './SiteFooter.vue'
import StatsBar from './StatsBar.vue'
import './custom.css'

export default {
	extends: DefaultTheme,
	enhanceApp({ app }) {
		app.use(i18n)
	},
	Layout: defineComponent({
		setup() {
			const { lang } = useData()
			watchEffect(() => {
				i18n.global.locale.value = lang.value as typeof i18n.global.locale.value
			})
			return () =>
				h(DefaultTheme.Layout, null, {
					'nav-bar-content-after': () => h(DonateButton),
					'home-hero-info-before': () => h(HeroLogo),
					'home-features-before': () => h(StatsBar),
					'home-features-after': () => h(Showcase),
					'layout-bottom': () => h(SiteFooter),
				})
		},
	}),
} satisfies Theme
