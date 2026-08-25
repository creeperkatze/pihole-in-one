import svgLoader from 'vite-svg-loader'
import { defineConfig } from 'vitepress'

const version = process.env.VERSION

const title = 'Pi-hole In One'
const description = 'A browser extension to control your Pi-hole conveniently from within the browser.'
const url = 'https://pihole-in-one.creeperkatze.dev'
const image = `${url}/banner.png`

export default defineConfig({
	title,
	description,
	cleanUrls: true,
	head: [
		['link', { rel: 'icon', type: 'image/png', href: '/favicon.png' }],
		['meta', { property: 'og:type', content: 'website' }],
		['meta', { property: 'og:url', content: url }],
		['meta', { property: 'og:title', content: title }],
		['meta', { property: 'og:description', content: description }],
		['meta', { property: 'og:image', content: image }],
		['meta', { name: 'twitter:card', content: 'summary_large_image' }],
		['meta', { name: 'twitter:title', content: title }],
		['meta', { name: 'twitter:description', content: description }],
		['meta', { name: 'twitter:image', content: image }],
	],
	vite: {
		plugins: [svgLoader()],
	},
	themeConfig: {
		logo: '/icon.svg',
		siteTitle: false,
		nav: [
			{ text: 'FAQ', link: '/faq' },
			{ text: 'Translate', link: 'https://crowdin.com/project/pihole-in-one', target: '_blank' },
			...(version
				? [
						{
							text: `v${version}`,
							link: 'https://github.com/creeperkatze/pihole-in-one/releases',
						},
					]
				: []),
		],
		socialLinks: [{ icon: 'github', link: 'https://github.com/creeperkatze/pihole-in-one' }],
	},
})
