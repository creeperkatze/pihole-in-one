import { storage } from '@wxt-dev/storage'
import {
	PiHoleClient,
	type PiHoleClientOptions,
	type SessionEntry,
	type SessionStore,
} from 'pihole-js'

import { DEFAULTS, getSettings, type PiholeInstance, watchSettings } from './settings'

type ApiTarget = Pick<PiholeInstance, 'baseUrl' | 'apiPassword'>

type SessionStoreShape = Record<string, SessionEntry>

const sessionCacheItem = storage.defineItem<SessionStoreShape>('local:sessionCache', {
	fallback: {},
})

const clientCache = new Map<string, PiHoleClient>()

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

function getClientCacheKey(target: ApiTarget): string {
	return `${target.baseUrl}::${target.apiPassword}::${currentTimeoutMs}`
}

export function getPiHoleClient(target: ApiTarget): PiHoleClient {
	const cacheKey = getClientCacheKey(target)
	const cached = clientCache.get(cacheKey)
	if (cached) return cached

	const options: PiHoleClientOptions = {
		baseUrl: target.baseUrl,
		password: target.apiPassword,
		timeoutMs: currentTimeoutMs,
		sessionStore: browserSessionStore,
	}
	const client = new PiHoleClient(options)
	clientCache.set(cacheKey, client)
	return client
}
