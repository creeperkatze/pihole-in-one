import { storage } from '@wxt-dev/storage'
import {
	type BlockingStatus,
	type HistoryPoint,
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
import { simulatingFetch } from './simulate-errors'

type ApiTarget = Pick<PiholeInstance, 'baseUrl' | 'apiPassword'>

type SessionStoreShape = Record<string, SessionEntry>

export interface PiholeSystemInfo {
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
	messageCount: number
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

async function passwordFingerprint(password: string): Promise<string> {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
	return Array.from(new Uint8Array(digest).slice(0, 8), (b) =>
		b.toString(16).padStart(2, '0'),
	).join('')
}

// Sessions are keyed by URL and password so a session is never reused with other credentials
class BrowserSessionStore implements SessionStore {
	readonly #fingerprint: Promise<string>

	constructor(password: string) {
		this.#fingerprint = passwordFingerprint(password)
	}

	async #key(baseUrl: string): Promise<string> {
		return `${baseUrl}#${await this.#fingerprint}`
	}

	async get(baseUrl: string): Promise<SessionEntry | null> {
		const store = await sessionCacheItem.getValue()
		return store[await this.#key(baseUrl)] ?? null
	}

	async set(baseUrl: string, entry: SessionEntry): Promise<void> {
		const key = await this.#key(baseUrl)
		const store = await sessionCacheItem.getValue()
		store[key] = entry
		await sessionCacheItem.setValue(store)
	}

	async delete(baseUrl: string): Promise<void> {
		const key = await this.#key(baseUrl)
		const store = await sessionCacheItem.getValue()
		delete store[key]
		await sessionCacheItem.setValue(store)
	}
}

const sessionStores = new Map<string, BrowserSessionStore>()

function sessionStoreFor(password: string): BrowserSessionStore {
	let store = sessionStores.get(password)
	if (!store) {
		store = new BrowserSessionStore(password)
		sessionStores.set(password, store)
	}
	return store
}

class ExtensionPiHoleClient extends PiHoleClient {
	async getSummary(): Promise<PiholeSummary> {
		const [stats, blocking, historyRes, groupsRes, listsRes, messagesRes] = await Promise.all([
			this.stats.getSummary(),
			this.dns.getStatus(),
			this.history.get().catch(() => ({ history: [] })),
			this.groups.list().catch(() => ({ groups: [] })),
			this.lists.list().catch(() => ({ lists: [] })),
			this.info.getMessagesCount().catch(() => ({ count: 0 })),
		])

		return {
			queries: stats.queries,
			clients: stats.clients,
			blocking,
			history: historyRes.history,
			groups: groupsRes.groups,
			lists: listsRes.lists,
			messageCount: messagesRes.count,
		}
	}
}

function getClientCacheKey(target: ApiTarget): string {
	return `${target.baseUrl}::${target.apiPassword}::${currentTimeoutMs}`
}

function createClient(target: ApiTarget, timeoutMs: number): ExtensionPiHoleClient {
	const options: PiHoleClientOptions = {
		baseUrl: target.baseUrl,
		password: target.apiPassword,
		timeoutMs,
		userAgent: USER_AGENT,
		sessionStore: sessionStoreFor(target.apiPassword),
		...(import.meta.env.DEV && { fetch: simulatingFetch }),
	}
	return new ExtensionPiHoleClient(options)
}

export function getPiHoleClient(target: ApiTarget): ExtensionPiHoleClient {
	const cacheKey = getClientCacheKey(target)
	const cached = clientCache.get(cacheKey)
	if (cached) return cached

	const client = createClient(target, currentTimeoutMs)
	clientCache.set(cacheKey, client)
	return client
}

export async function getSystemInfo(target: ApiTarget): Promise<PiholeSystemInfo> {
	const padd = await getPiHoleClient(target).padd.getSummary()
	return {
		cpu: padd['%cpu'] ?? 0,
		memory: padd['%mem'] ?? 0,
		temperature: padd.sensors?.cpu_temp ?? null,
		tempUnit: padd.sensors?.unit ?? 'C',
		uptime: padd.system?.uptime ?? 0,
	}
}

// Logs out on the Pi-hole and forgets the cached session, if there is one
export async function endSession(target: ApiTarget): Promise<void> {
	const store = sessionStoreFor(target.apiPassword)
	if (!(await store.get(target.baseUrl))) return
	await createClient(target, currentTimeoutMs)
		.auth.logout()
		.catch(() => {})
	await store.delete(target.baseUrl)
}

// Gravity downloads every list, which takes much longer than a normal request
const GRAVITY_TIMEOUT_MS = 5 * 60 * 1000

export function updateGravity(target: ApiTarget): Promise<string> {
	return createClient(target, GRAVITY_TIMEOUT_MS).actions.updateGravity()
}
