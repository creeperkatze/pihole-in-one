import { createRequire } from 'node:module'

import tailwindcss from '@tailwindcss/vite'
import svgLoader from 'vite-svg-loader'
import { defineConfig } from 'wxt'

const { version } = createRequire(import.meta.url)('./package.json')

export default defineConfig({
	srcDir: 'src',
	vite: () => ({
		plugins: [
			tailwindcss(),
			svgLoader(),
			{
				name: 'inject-theme-init',
				transformIndexHtml: {
					order: 'pre',
					handler: () => [
						{ tag: 'script', injectTo: 'head-prepend', attrs: { src: '/theme-init.js' } },
					],
				},
			},
		],
	}),
	publicDir: 'src/public',
	modules: ['@wxt-dev/module-vue'],
	manifest: {
		name: 'Pi-hole In One',
		description:
			'A browser extension to control your Pi-hole conveniently from within the browser.',
		version,
		icons: {
			16: 'icon-16.png',
			32: 'icon-32.png',
			48: 'icon-48.png',
			64: 'icon-64.png',
			128: 'icon-128.png',
		},
		optional_host_permissions: ['*://*/*'],
		permissions: ['storage', 'alarms', 'activeTab'],
		options_ui: { open_in_tab: true },
		browser_specific_settings: {
			gecko: {
				id: 'pihole-in-one@creeperkatze.dev',
				data_collection_permissions: {
					required: ['none'],
					optional: ['technicalAndInteraction'],
				},
			},
		},
	},
	zip: {
		artifactTemplate: 'pihole-in-one-{{version}}-{{browser}}.zip',
		sourcesTemplate: 'pihole-in-one-{{version}}-sources.zip',
	},
})
