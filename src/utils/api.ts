import { storage } from '@wxt-dev/storage'
import {
	type BlockingStatus,
	type DomainEntry,
	type DomainKind,
	type DomainSearchResult,
	type DomainType,
	type PaddResponse,
	PiHoleClient,
	type PiHoleClientOptions,
	type PiholeGroup,
	type PiholeList,
	type PiholeSummary,
	type SessionEntry,
	type SessionStore,
} from 'pihole-js'

import { DEFAULTS, getSettings, type PiholeInstance, watchSettings } from './settings'

type ApiTarget = Pick<PiholeInstance, 'baseUrl' | 'apiPassword'>

type SessionStoreShape = Record<string, SessionEntry>

const sessionCacheItem = storage.defineItem<SessionStoreShape>('local:sessionCache', {
	fallback: {},
})

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

function domainRegex(domain: string): string {
	const escaped = domain.replace(/\./g, '\\.')
	return `(^|\\.)(${escaped})$`
}

function emptyHistory(): PiholeSummary['history'] {
	return []
}

function emptyGroups(): PiholeGroup[] {
	return []
}

function emptyLists(): PiholeList[] {
	return []
}

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
			this.getStatsSummary(),
			this.getBlocking(),
			this.getHistory().catch(() => ({ history: emptyHistory() })),
			this.getGroups().catch(() => ({ groups: emptyGroups() })),
			this.getLists().catch(() => ({ lists: emptyLists() })),
			this.getPadd().catch(() => null),
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

	async searchDomain(domain: string): Promise<DomainSearchResult> {
		const result = await this.getSearch(domain, { partial: false })
		return result.search
	}

	async blockDomain(domain: string): Promise<void> {
		await this.createDomain('deny', 'regex', {
			domain: domainRegex(domain),
			comment: '',
			groups: [0],
			enabled: true,
		})
	}

	async allowlistDomain(domain: string): Promise<void> {
		await this.createDomain('allow', 'regex', {
			domain: domainRegex(domain),
			comment: '',
			groups: [0],
			enabled: true,
		})
	}

	async deleteDomainEntry(
		type: DomainType,
		kind: DomainKind,
		domain: DomainEntry['domain'],
	): Promise<void> {
		await this.deleteDomain(type, kind, domain)
	}

	async setGroupEnabled(group: PiholeGroup, enabled: boolean): Promise<void> {
		await this.replaceGroup(group.name, {
			name: group.name,
			comment: group.comment,
			enabled,
		})
	}

	async setListEnabled(list: PiholeList, enabled: boolean): Promise<void> {
		await this.replaceList(list.address, {
			type: list.type,
			comment: list.comment,
			groups: list.groups,
			enabled,
		})
	}

	async setBlocking(enabled: boolean, seconds?: number): Promise<BlockingStatus> {
		return this.updateBlocking(enabled, seconds ? seconds : null)
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
		sessionStore: browserSessionStore,
	}
	const client = new ExtensionPiHoleClient(options)
	clientCache.set(cacheKey, client)
	return client
}
