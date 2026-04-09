import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'wxt'

export default defineConfig({
	srcDir: 'src',
	vite: () => ({
		plugins: [tailwindcss()],
	}),
	publicDir: 'src/public',
	modules: ['@wxt-dev/module-vue'],
	manifest: {
		name: 'Pi-hole In One',
		description: 'Control your Pi-hole directly from the browser.',
		permissions: ['storage', 'alarms', 'activeTab'],
		options_ui: { open_in_tab: true },
		icons: {
			16: 'icon-16.png',
			32: 'icon-32.png',
			48: 'icon-48.png',
			64: 'icon-64.png',
			128: 'icon-128.png',
		},
		host_permissions: ['<all_urls>'],
		browser_specific_settings: {
			gecko: {
				id: 'pihole-in-one@creeperkatze.de',
			},
		},
	},
	zip: {
		artifactTemplate: 'pihole-in-one-{{version}}-{{browser}}.zip',
		sourcesTemplate: 'pihole-in-one-{{version}}-sources.zip',
	},
})
