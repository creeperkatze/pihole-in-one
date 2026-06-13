import { storage } from '@wxt-dev/storage'

interface UpdateCheckCache {
	tag: string
	ts: number
}

const CACHE_TTL = 10 * 60 * 1000

const updateCheckCacheItem = storage.defineItem<UpdateCheckCache | null>('local:updateCheckCache', {
	fallback: null,
})

export async function getLatestVersionTag(): Promise<string> {
	const entry = await updateCheckCacheItem.getValue()

	if (entry && Date.now() - entry.ts < CACHE_TTL) {
		return entry.tag
	}

	const res = await fetch('https://api.github.com/repos/creeperkatze/pihole-in-one/releases/latest')
	if (!res.ok) throw new Error(`HTTP ${res.status}`)

	const data = (await res.json()) as { tag_name?: string }
	const tag = data.tag_name?.replace(/^v/, '') ?? ''
	await updateCheckCacheItem.setValue({ tag, ts: Date.now() })

	return tag
}
