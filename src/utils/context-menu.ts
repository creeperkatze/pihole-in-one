import { type Browser, browser } from 'wxt/browser'

import { PAUSE_PRESETS, setDomainRule } from './actions'
import { getPiHoleClient } from './api'
import { formatDuration } from './format'
import { i18n, resolveLocale } from './i18n'
import { type ExtensionSettings, getSettings, type PiholeInstance } from './settings'

const DISABLE = 'disable'
const DISABLE_FOR = 'disable-for-'
const DISABLE_INDEFINITELY = 'disable-indefinitely'
const ENABLE = 'enable'
const WHITELIST = 'whitelist'
const BLOCK = 'block'

const CONTEXTS: Browser.contextMenus.CreateProperties['contexts'] = [
	'page',
	'frame',
	'selection',
	'link',
	'image',
]
const SITE_PATTERNS = ['http://*/*', 'https://*/*']

let pending = Promise.resolve()

// Rebuilds run one after another so overlapping calls can't create duplicate ids
export function buildContextMenu(settings: ExtensionSettings): Promise<void> {
	pending = pending.then(() => createItems(settings)).catch(() => {})
	return pending
}

export function contextMenuKey(settings: ExtensionSettings): string {
	return [settings.showContextMenu, settings.locale, settings.instances.length > 0].join('|')
}

function create(properties: Browser.contextMenus.CreateProperties): void {
	browser.contextMenus.create({ contexts: CONTEXTS, ...properties }, () => {
		void browser.runtime.lastError
	})
}

async function createItems(settings: ExtensionSettings): Promise<void> {
	await browser.contextMenus.removeAll()
	if (!settings.showContextMenu || settings.instances.length === 0) return

	i18n.global.locale.value = resolveLocale(settings.locale)
	const { t } = i18n.global

	create({ id: DISABLE, title: t('contextMenu.disable') })
	for (const seconds of PAUSE_PRESETS) {
		create({ id: `${DISABLE_FOR}${seconds}`, parentId: DISABLE, title: formatDuration(seconds) })
	}
	create({ id: DISABLE_INDEFINITELY, parentId: DISABLE, title: t('contextMenu.indefinitely') })
	create({ id: ENABLE, title: t('contextMenu.enable') })
	create({ id: 'separator', type: 'separator', documentUrlPatterns: SITE_PATTERNS })
	create({ id: WHITELIST, title: t('contextMenu.whitelist'), documentUrlPatterns: SITE_PATTERNS })
	create({ id: BLOCK, title: t('contextMenu.block'), documentUrlPatterns: SITE_PATTERNS })
}

function hostname(url: string | undefined): string | null {
	if (!url) return null
	try {
		return new URL(url).hostname || null
	} catch {
		return null
	}
}

// Every action goes to all Pi-holes, like the site card in the popup
export async function handleContextMenuClick(
	info: Browser.contextMenus.OnClickData,
	tab?: Browser.tabs.Tab,
): Promise<void> {
	const { instances } = await getSettings()
	const id = String(info.menuItemId)
	const run = (action: (instance: PiholeInstance) => Promise<unknown>) =>
		Promise.allSettled(instances.map(action))

	if (id === ENABLE) {
		await run((instance) => getPiHoleClient(instance).dns.enable())
	} else if (id === DISABLE_INDEFINITELY) {
		await run((instance) => getPiHoleClient(instance).dns.disable())
	} else if (id.startsWith(DISABLE_FOR)) {
		const seconds = Number(id.slice(DISABLE_FOR.length))
		await run((instance) => getPiHoleClient(instance).dns.disable(seconds))
	} else if (id === WHITELIST || id === BLOCK) {
		const domain = hostname(info.pageUrl ?? tab?.url)
		if (!domain) return
		await run((instance) => setDomainRule(instance, domain, id === WHITELIST ? 'allow' : 'deny'))
	}
}
