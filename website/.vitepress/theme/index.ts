/* eslint-disable simple-import-sort/imports */

import { h } from 'vue'

import { browserStoreStats, createTheme, Showcase, type ShowcaseItem } from '../shared/theme'

import { messages } from '../messages'
import Featured from './components/Featured.vue'
import Logo from './icons/logo.svg?skipsvgo'
// Must come after the theme so the brand colors win
import './custom.css'

const showcase: ShowcaseItem[] = [
	{ key: 'blocking', image: '/screenshots/home.png' },
	{ key: 'currentSite', image: '/screenshots/blocked.png' },
	{ key: 'domains', image: '/screenshots/domains.png' },
	{ key: 'groups', image: '/screenshots/lists.png' },
	{ key: 'multiInstance', image: '/screenshots/connection.png' },
	{ key: 'badge', image: '/screenshots/customization.png' },
	{ key: 'customization', image: '/screenshots/popup.png' },
	{ key: 'backup', image: '/screenshots/data.png' },
]

export default createTheme({
	messages,
	logo: Logo,
	stats: browserStoreStats({
		chrome: 'gaaobidjebianpcngcfpkniaocibidhe',
		firefox: 'pihole-in-one',
		edge: 'hbigjlhijpiegpnbdhmdgdlfbcgljdao',
	}),
	slots: {
		// Replaces the built-in showcase slot so the featured cards can follow it
		'home-features-after': () => [
			h(Showcase, { items: showcase }),
			h(Featured, {
				items: [
					{
						publication: 'GENZ TECH',
						title: 'This Student Built a One-Click Pi-hole Remote for Your Browser',
						icon: '/icons/genztech.png',
						date: '2026-10-01',
						link: 'https://genztech.blog/p/pihole-in-one-browser-extension/',
					},
				],
			}),
		],
	},
})
