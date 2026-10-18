import type { DomainType } from 'pihole-js'

import { getPiHoleClient } from './api'
import type { PiholeInstance } from './settings'

export const PAUSE_PRESETS = [10, 30, 5 * 60, 30 * 60, 60 * 60]

// Matches the domain and all of its subdomains
export function domainRegex(domain: string): string {
	const escaped = domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
	return `(^|\\.)(${escaped})$`
}

// Removes the opposite rules for the domain and adds a regex rule unless one already applies
export async function setDomainRule(
	target: Pick<PiholeInstance, 'baseUrl' | 'apiPassword'>,
	domain: string,
	type: DomainType,
): Promise<void> {
	const client = getPiHoleClient(target)
	const { search } = await client.domains.search(domain, { partial: false })
	const entries = search.domains.filter((d) => d.enabled)
	await Promise.all(
		entries
			.filter((d) => d.type !== type)
			.map((d) => client.domains.delete(d.type, d.kind, d.domain)),
	)
	if (entries.some((d) => d.type === type)) return
	if (type === 'allow') await client.domains.allowRegex(domainRegex(domain))
	else await client.domains.denyRegex(domainRegex(domain))
}
