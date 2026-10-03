import { messages } from './messages'
import { defineSiteConfig } from './shared/config'

export default defineSiteConfig(
	{
		title: 'Pi-hole In One',
		url: 'https://pihole-in-one.creeperkatze.dev',
		repo: 'creeperkatze/pihole-in-one',
		version: process.env.VERSION,
		messages,
		nav: (t, prefix) => [
			{ text: t('nav.faq'), link: `${prefix}/faq` },
			{
				text: t('nav.translate'),
				link: 'https://crowdin.com/project/pihole-in-one',
				target: '_blank',
			},
		],
		socialLinks: [{ icon: 'discord', link: 'https://link.creeperkatze.dev/discord' }],
	},
	{
		themeConfig: {
			logo: '/icon.svg',
			siteTitle: false,
		},
	},
)
