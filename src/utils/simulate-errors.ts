// TEMPORARY: simulates Pi-hole errors to test error messages. Remove before release.
// In the popup DevTools console: localStorage.simulateError = 'noSeats', then reopen the popup.
// Stop with localStorage.removeItem('simulateError').

type Scenario = {
	// Only changes are affected, reads and logins still reach the real Pi-hole
	writesOnly?: boolean
	respond: (init: RequestInit | undefined) => Promise<Response>
}

function json(status: number, body: unknown): Promise<Response> {
	return Promise.resolve(
		new Response(JSON.stringify(body), {
			status,
			headers: { 'content-type': 'application/json' },
		}),
	)
}

function apiError(status: number, key: string, message: string, hint: string | null = null) {
	return () => json(status, { error: { key, message, hint } })
}

const SCENARIOS: Record<string, Scenario> = {
	unreachable: { respond: () => Promise.reject(new TypeError('Failed to fetch')) },
	timeout: {
		respond: (init) =>
			new Promise((_, reject) => {
				init?.signal?.addEventListener('abort', () =>
					reject(new DOMException('Aborted', 'AbortError')),
				)
			}),
	},
	notPihole: {
		respond: () =>
			Promise.resolve(
				new Response('<html>Router login</html>', {
					status: 200,
					headers: { 'content-type': 'text/html' },
				}),
			),
	},
	notFound: {
		respond: () => Promise.resolve(new Response('Not found', { status: 404 })),
	},
	server: {
		respond: () => Promise.resolve(new Response('Bad gateway', { status: 502 })),
	},
	forbidden: { respond: apiError(403, 'forbidden', 'Forbidden') },
	noSeats: { respond: apiError(429, 'api_seats_exceeded', 'API seats exceeded') },
	rateLimited: { respond: apiError(429, 'rate_limiting', 'Rate-limiting login attempts') },
	wrongPassword: { respond: apiError(401, 'unauthorized', 'Unauthorized') },
	twoFactor: { respond: apiError(400, 'bad_request', 'No 2FA token found in JSON payload') },
	database: {
		writesOnly: true,
		respond: apiError(400, 'database_error', 'Could not add to gravity database'),
	},
	regex: {
		writesOnly: true,
		respond: apiError(400, 'regex_error', 'Regex validation failed', "Missing ']'"),
	},
	duplicate: {
		writesOnly: true,
		respond: () =>
			json(201, {
				domains: [],
				processed: {
					success: [],
					errors: [
						{
							item: 'example.com',
							error: 'UNIQUE constraint failed: domainlist.domain, domainlist.type',
						},
					],
				},
			}),
	},
}

function activeScenario(): Scenario | undefined {
	// The background worker has no localStorage
	if (typeof localStorage === 'undefined') return undefined
	const name = localStorage.getItem('simulateError')
	return name ? SCENARIOS[name] : undefined
}

export function simulatingFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
	const scenario = activeScenario()
	const method = (init?.method ?? 'GET').toUpperCase()
	const isAuth = String(input).includes('/api/auth')
	if (!scenario || (scenario.writesOnly && (method === 'GET' || isAuth))) return fetch(input, init)
	return scenario.respond(init)
}
