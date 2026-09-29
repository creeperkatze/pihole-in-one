import svgLoader from 'vite-svg-loader'
import { type DefaultTheme, defineConfig, type LocaleConfig } from 'vitepress'

import { i18n } from './i18n'

const version = process.env.VERSION

const title = 'Pi-hole In One'
const url = 'https://pihole-in-one.creeperkatze.dev'
const image = `${url}/banner.png`

function locale(label: string, lang: string, link: string): LocaleConfig<DefaultTheme.Config>[string] {
	const t = (key: string) => i18n.global.t(key, {}, { locale: lang })
	const description = t('meta.summary')
	return {
		label,
		lang,
		link,
		description,
		head: [
			['meta', { property: 'og:description', content: description }],
			['meta', { name: 'twitter:description', content: description }],
		],
		themeConfig: {
			nav: [
				{ text: t('nav.faq'), link: `${link}faq` },
				{ text: t('nav.translate'), link: 'https://crowdin.com/project/pihole-in-one', target: '_blank' },
				...(version
					? [
							{
								text: `v${version}`,
								items: [
									{
										text: t('nav.changelog'),
										link: 'https://github.com/creeperkatze/pihole-in-one/releases',
									},
								],
							},
						]
					: []),
			],
			outline: { label: t('theme.onThisPage') },
			returnToTopLabel: t('theme.returnToTop'),
			sidebarMenuLabel: t('theme.menu'),
			darkModeSwitchLabel: t('theme.appearance'),
			lightModeSwitchTitle: t('theme.switchToLight'),
			darkModeSwitchTitle: t('theme.switchToDark'),
			langMenuLabel: t('theme.changeLanguage'),
			skipToContentLabel: t('theme.skipToContent'),
			notFound: {
				title: t('notFound.title'),
				quote: t('notFound.quote'),
				linkLabel: t('notFound.linkText'),
				linkText: t('notFound.linkText'),
			},
		},
	}
}

export default defineConfig({
	title,
	cleanUrls: true,
	head: [
		['link', { rel: 'icon', type: 'image/png', href: '/favicon.png' }],
		['meta', { property: 'og:type', content: 'website' }],
		['meta', { property: 'og:url', content: url }],
		['meta', { property: 'og:title', content: title }],
		['meta', { property: 'og:image', content: image }],
		['meta', { name: 'twitter:card', content: 'summary_large_image' }],
		['meta', { name: 'twitter:title', content: title }],
		['meta', { name: 'twitter:image', content: image }],
	],
	locales: {
		root: locale('English', 'en-US', '/'),
		de: locale('Deutsch', 'de-DE', '/de/'),
	},
	rewrites: {
		'de-DE/:rest*': 'de/:rest*',
	},
	vite: {
		plugins: [svgLoader()],
		define: {
			__VUE_I18N_FULL_INSTALL__: true,
			__VUE_I18N_LEGACY_API__: false,
			__INTLIFY_PROD_DEVTOOLS__: false,
		},
		ssr: {
			noExternal: ['vue-i18n'],
		},
	},
	themeConfig: {
		logo: '/icon.svg',
		siteTitle: false,
		socialLinks: [
			{ icon: 'github', link: 'https://github.com/creeperkatze/pihole-in-one' },
			{ icon: 'discord', link: 'https://link.creeperkatze.dev/discord' },
		],
	},
})
