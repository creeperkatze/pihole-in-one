/* eslint-disable simple-import-sort/imports */

import { browserStoreStats, createTheme } from '../shared/theme'

import { messages } from '../messages'
import Logo from './icons/logo.svg?skipsvgo'
// Must come after the theme so the brand colors win
import './custom.css'

export default createTheme({
	messages,
	logo: Logo,
	stats: browserStoreStats({
		chrome: 'gaaobidjebianpcngcfpkniaocibidhe',
		firefox: 'pihole-in-one',
		edge: 'hbigjlhijpiegpnbdhmdgdlfbcgljdao',
	}),
	showcase: [
		{ key: 'blocking', image: '/screenshots/home.png' },
		{ key: 'currentSite', image: '/screenshots/blocked.png' },
		{ key: 'domains', image: '/screenshots/domains.png' },
		{ key: 'groups', image: '/screenshots/lists.png' },
		{ key: 'multiInstance', image: '/screenshots/connection.png' },
		{ key: 'badge', image: '/screenshots/customization.png' },
		{ key: 'customization', image: '/screenshots/popup.png' },
		{ key: 'backup', image: '/screenshots/data.png' },
	],
})
