import { browser } from 'wxt/browser'

export interface BlockingStatus {
	blocking: 'enabled' | 'disabled'
	timer: number | null
}

export interface HistoryPoint {
	timestamp: number
	total: number
	cached: number
	blocked: number
	forwarded: number
}

export interface PiholeSummary {
	queries: {
		total: number
		blocked: number
		percent_blocked: number
		unique_domains: number
		cached: number
		forwarded: number
	}
	clients: {
		active: number
		total: number
	}
	blocking: BlockingStatus
	history: HistoryPoint[]
}

const SESSION_TTL = 25 * 60 * 1000 // 25 min (server default is 30)
const SESSION_STORAGE_KEY = 'sessionCache'

type SessionStore = Record<string, { sid: string; expires: number }>

async function getCachedSession(base: string): Promise<string | null> {
	const result = await browser.storage.local.get(SESSION_STORAGE_KEY)
	const store = (result[SESSION_STORAGE_KEY] ?? {}) as SessionStore
	const entry = store[base]
	if (entry && entry.expires > Date.now()) return entry.sid
	return null
}

async function setCachedSession(base: string, sid: string): Promise<void> {
	const result = await browser.storage.local.get(SESSION_STORAGE_KEY)
	const store = (result[SESSION_STORAGE_KEY] ?? {}) as SessionStore
	store[base] = { sid, expires: Date.now() + SESSION_TTL }
	await browser.storage.local.set({ [SESSION_STORAGE_KEY]: store })
}

async function deleteCachedSession(base: string): Promise<void> {
	const result = await browser.storage.local.get(SESSION_STORAGE_KEY)
	const store = (result[SESSION_STORAGE_KEY] ?? {}) as SessionStore
	delete store[base]
	await browser.storage.local.set({ [SESSION_STORAGE_KEY]: store })
}

class ApiError extends Error {
	constructor(
		readonly status: number,
		message: string,
	) {
		super(message)
	}
}

function extractErrorMessage(body: unknown, status: number): string {
	if (body && typeof body === 'object') {
		const b = body as Record<string, unknown>
		const inner = b.error as Record<string, unknown> | undefined
		const msg = inner?.message ?? b.message
		if (typeof msg === 'string' && msg) return msg
	}
	return `HTTP ${status}`
}

async function apiFetch<T>(
	base: string,
	path: string,
	sid: string,
	options: RequestInit & { noBody?: boolean } = {},
): Promise<T> {
	const { noBody, ...init } = options
	const res = await fetch(`${base}/api/${path}`, {
		...init,
		headers: {
			sid,
			'Content-Type': 'application/json',
			...(init.headers as Record<string, string>),
		},
	})

	if (!res.ok) {
		const body = await res.json().catch(() => null)
		console.error(`[Pi-hole] ${init.method ?? 'GET'} /api/${path} → ${res.status}`, body)
		throw new ApiError(res.status, extractErrorMessage(body, res.status))
	}

	if (noBody) return undefined as T
	return res.json() as Promise<T>
}

type AuthResponse = { session?: { valid: boolean; sid: string | null; message: string | null } }

async function authenticate(base: string, password: string): Promise<string> {
	// For passwordless installations: GET /api/auth returns a valid session
	if (!password) {
		const res = await fetch(`${base}/api/auth`)
		const data = (await res.json().catch(() => null)) as AuthResponse | null
		if (res.ok && data?.session?.valid && data.session.sid) return data.session.sid
		// Server requires a password — don't fall through with an empty one
		throw new ApiError(401, 'Password required')
	}

	const res = await fetch(`${base}/api/auth`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ password }),
	})

	const data = (await res.json().catch(() => null)) as AuthResponse | null

	if (!res.ok) {
		const msg = data?.session?.message ?? extractErrorMessage(data, res.status)
		console.error(`[Pi-hole] POST /api/auth → ${res.status}`, JSON.stringify(data))
		throw new ApiError(res.status, `Auth failed: ${msg}`)
	}

	if (!data?.session?.valid || !data.session.sid) {
		throw new ApiError(401, 'Auth failed — wrong password?')
	}

	return data.session.sid
}

async function getSession(base: string, password: string): Promise<string> {
	const cached = await getCachedSession(base)
	if (cached) return cached

	const sid = await authenticate(base, password)
	await setCachedSession(base, sid)
	return sid
}

async function withSession<T>(
	base: string,
	password: string,
	fn: (sid: string) => Promise<T>,
): Promise<T> {
	const sid = await getSession(base, password)
	try {
		return await fn(sid)
	} catch (e) {
		// Re-auth once on 401
		if (e instanceof ApiError && e.status === 401) {
			await deleteCachedSession(base)
			const freshSid = await authenticate(base, password)
			await setCachedSession(base, freshSid)
			return fn(freshSid)
		}
		throw e
	}
}

// ---- Public API ----

export async function getSummary(base: string, password: string): Promise<PiholeSummary> {
	return withSession(base, password, async (sid) => {
		const [stats, blocking, historyRes] = await Promise.all([
			apiFetch<{ queries: PiholeSummary['queries']; clients: PiholeSummary['clients'] }>(
				base,
				'stats/summary',
				sid,
			),
			apiFetch<BlockingStatus>(base, 'dns/blocking', sid),
			apiFetch<{ history: HistoryPoint[] }>(base, 'history', sid).catch(() => ({ history: [] })),
		])
		return { queries: stats.queries, clients: stats.clients, blocking, history: historyRes.history }
	})
}

export interface DomainEntry {
	domain: string
	type: 'allow' | 'deny'
	kind: 'exact' | 'regex'
	enabled: boolean
	comment: string | null
	id: number
	groups: number[]
}

export interface DomainSearchResult {
	domains: DomainEntry[]
	gravity: Array<{ domain: string; address: string; comment: string | null; enabled: boolean }>
}

export async function searchDomain(
	base: string,
	password: string,
	domain: string,
): Promise<DomainSearchResult> {
	return withSession(base, password, async (sid) => {
		const res = await apiFetch<{ search: DomainSearchResult }>(
			base,
			`search/${encodeURIComponent(domain)}?partial=false`,
			sid,
		)
		return res.search
	})
}

export function domainRegex(domain: string): string {
	const escaped = domain.replace(/\./g, '\\.')
	return `(^|\\.)(${escaped})$`
}

export async function blockDomain(base: string, password: string, domain: string): Promise<void> {
	return withSession(base, password, (sid) =>
		apiFetch<void>(base, 'domains/deny/regex', sid, {
			method: 'POST',
			body: JSON.stringify({
				domain: domainRegex(domain),
				comment: '',
				groups: [0],
				enabled: true,
			}),
		}),
	)
}

export async function unblockDomain(base: string, password: string, domain: string): Promise<void> {
	return withSession(base, password, (sid) =>
		apiFetch<void>(base, `domains/deny/exact/${encodeURIComponent(domain)}`, sid, {
			method: 'DELETE',
			noBody: true,
		}),
	)
}

export async function deleteDomainEntry(
	base: string,
	password: string,
	type: 'allow' | 'deny',
	kind: 'exact' | 'regex',
	domain: string,
): Promise<void> {
	return withSession(base, password, (sid) =>
		apiFetch<void>(base, `domains/${type}/${kind}/${encodeURIComponent(domain)}`, sid, {
			method: 'DELETE',
			noBody: true,
		}),
	)
}

export async function allowlistDomain(
	base: string,
	password: string,
	domain: string,
): Promise<void> {
	return withSession(base, password, (sid) =>
		apiFetch<void>(base, 'domains/allow/regex', sid, {
			method: 'POST',
			body: JSON.stringify({
				domain: domainRegex(domain),
				comment: '',
				groups: [0],
				enabled: true,
			}),
		}),
	)
}

export async function unallowlistDomain(
	base: string,
	password: string,
	domain: string,
): Promise<void> {
	return withSession(base, password, (sid) =>
		apiFetch<void>(base, `domains/allow/exact/${encodeURIComponent(domain)}`, sid, {
			method: 'DELETE',
			noBody: true,
		}),
	)
}

export async function setBlocking(
	base: string,
	password: string,
	enabled: boolean,
	seconds?: number,
): Promise<BlockingStatus> {
	return withSession(base, password, (sid) =>
		apiFetch<BlockingStatus>(base, 'dns/blocking', sid, {
			method: 'POST',
			body: JSON.stringify({
				blocking: enabled,
				timer: seconds ? seconds : null,
			}),
		}),
	)
}
