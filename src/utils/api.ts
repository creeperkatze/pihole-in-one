import { storage } from '@wxt-dev/storage'
import {
	type BlockingStatus,
	type HistoryPoint,
	type PaddResponse,
	PiHoleClient,
	type PiHoleClientOptions,
	type PiholeGroup,
	type PiholeList,
	type SessionEntry,
	type SessionStore,
	type SummaryStatsResponse,
} from 'pihole-js'
import { browser } from 'wxt/browser'

import { DEFAULTS, getSettings, type PiholeInstance, watchSettings } from './settings'

type ApiTarget = Pick<PiholeInstance, 'baseUrl' | 'apiPassword'>

type SessionStoreShape = Record<string, SessionEntry>

export interface PiholeDiagnosis {
	cpu: number
	memory: number
	temperature: number | null
	tempUnit: string
	uptime: number
}

export interface PiholeSummary {
	queries: SummaryStatsResponse['queries']
	clients: SummaryStatsResponse['clients']
	blocking: BlockingStatus
	history: HistoryPoint[]
	groups: PiholeGroup[]
	lists: PiholeList[]
	diagnosis: PiholeDiagnosis | null
}

const sessionCacheItem = storage.defineItem<SessionStoreShape>('local:sessionCache', {
	fallback: {},
})

const USER_AGENT = `creeperkatze/pihole-in-one/${browser.runtime.getManifest().version}`

const clientCache = new Map<string, ExtensionPiHoleClient>()

let currentTimeoutMs = DEFAULTS.connectionTimeout * 1000

void getSettings()
	.then((settings) => {
		currentTimeoutMs = settings.connectionTimeout * 1000
	})
	.catch(() => {})

watchSettings((next) => {
	if (currentTimeoutMs !== next.connectionTimeout * 1000) {
		clientCache.clear()
	}
	currentTimeoutMs = next.connectionTimeout * 1000
})

class BrowserSessionStore implements SessionStore {
	async get(baseUrl: string): Promise<SessionEntry | null> {
		const store = await sessionCacheItem.getValue()
		return store[baseUrl] ?? null
	}

	async set(baseUrl: string, entry: SessionEntry): Promise<void> {
		const store = await sessionCacheItem.getValue()
		store[baseUrl] = entry
		await sessionCacheItem.setValue(store)
	}

	async delete(baseUrl: string): Promise<void> {
		const store = await sessionCacheItem.getValue()
		delete store[baseUrl]
		await sessionCacheItem.setValue(store)
	}
}

const browserSessionStore = new BrowserSessionStore()

function normalizePadd(padd: PaddResponse | null): PiholeSummary['diagnosis'] {
	if (!padd) return null
	return {
		cpu: padd['%cpu'] ?? 0,
		memory: padd['%mem'] ?? 0,
		temperature: padd.sensors?.cpu_temp ?? null,
		tempUnit: padd.sensors?.unit ?? 'C',
		uptime: padd.system?.uptime ?? 0,
	}
}

class ExtensionPiHoleClient extends PiHoleClient {
	async getSummary(): Promise<PiholeSummary> {
		const [stats, blocking, historyRes, groupsRes, listsRes, paddRes] = await Promise.all([
			this.stats.getSummary(),
			this.dns.getStatus(),
			this.history.get().catch(() => ({ history: [] })),
			this.groups.list().catch(() => ({ groups: [] })),
			this.lists.list().catch(() => ({ lists: [] })),
			this.padd.getSummary().catch(() => null),
		])

		return {
			queries: stats.queries,
			clients: stats.clients,
			blocking,
			history: historyRes.history,
			groups: groupsRes.groups,
			lists: listsRes.lists,
			diagnosis: normalizePadd(paddRes),
		}
	}
}

function getClientCacheKey(target: ApiTarget): string {
	return `${target.baseUrl}::${target.apiPassword}::${currentTimeoutMs}`
}

export function getPiHoleClient(target: ApiTarget): ExtensionPiHoleClient {
	const cacheKey = getClientCacheKey(target)
	const cached = clientCache.get(cacheKey)
	if (cached) return cached

	const options: PiHoleClientOptions = {
		baseUrl: target.baseUrl,
		password: target.apiPassword,
		timeoutMs: currentTimeoutMs,
		userAgent: USER_AGENT,
		sessionStore: browserSessionStore,
	}
	const client = new ExtensionPiHoleClient(options)
	clientCache.set(cacheKey, client)
	return client
}
