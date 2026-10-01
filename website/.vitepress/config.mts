import { messages } from './messages'
import { defineSiteConfig } from './shared/config'

export default defineSiteConfig(
	{
		title: 'Pi-hole In One',
		url: 'https://pihole-in-one.creeperkatze.dev',
		repo: 'creeperkatze/pihole-in-one',
		crowdin: 'pihole-in-one',
		version: process.env.VERSION,
		messages,
		locales: [
			{ label: 'English', lang: 'en-US' },
			{ label: 'Deutsch', lang: 'de-DE' },
		],
		nav: (t, link) => [{ text: t('nav.faq'), link: `${link}faq` }],
		socialLinks: [{ icon: 'discord', link: 'https://link.creeperkatze.dev/discord' }],
	},
	{
		themeConfig: {
			logo: '/icon.svg',
			siteTitle: false,
		},
	},
)
