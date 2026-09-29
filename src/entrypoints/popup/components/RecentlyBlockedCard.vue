<template>
	<section class="rounded-lg border border-border bg-surface-3">
		<div class="flex items-center gap-3 px-3 py-2.5">
			<Loader2 v-if="loading" class="size-5 shrink-0 animate-spin text-secondary" />
			<History v-else class="size-5 shrink-0 text-secondary" />
			<div class="min-w-0 flex-1">
				<p class="text-sm font-semibold">{{ t('popup.recentlyBlocked.title') }}</p>
				<p class="min-h-4 truncate text-xs text-secondary">{{ loading ? '' : subtitle }}</p>
			</div>
		</div>

		<div v-if="!loading" class="flex flex-col gap-1.5 border-t border-border px-3 py-2">
			<p v-if="loadError" class="text-xs text-pihole-red">{{ loadError }}</p>
			<p v-else-if="entries.length === 0" class="text-xs text-secondary">
				{{ t('popup.recentlyBlocked.empty') }}
			</p>
			<template v-else>
				<p v-if="actionError" class="text-xs text-pihole-red">{{ actionError }}</p>
				<div v-for="entry in entries" :key="entry.domain" class="flex items-center gap-2">
					<component
						:is="entry.allowed ? ShieldCheck : ShieldBan"
						class="size-4 shrink-0"
						:class="entry.allowed ? 'text-pihole-green' : 'text-pihole-red'"
						aria-hidden="true"
					/>
					<span class="min-w-0 flex-1 truncate text-xs font-medium" :title="entry.domain">
						{{ entry.domain }}
					</span>
					<Button
						size="sm"
						:variant="entry.allowed ? 'success' : 'default'"
						:disabled="acting === entry.domain"
						:aria-pressed="entry.allowed"
						:title="
							entry.allowed ? t('popup.domain.removeFromWhitelist') : t('popup.domain.whitelist')
						"
						@click="toggleAllowlist(entry)"
					>
						<ShieldCheck class="size-4" :class="{ 'text-pihole-green': !entry.allowed }" />
						{{ t('popup.domain.whitelist') }}
					</Button>
				</div>
			</template>
		</div>
	</section>
</template>

<script setup lang="ts">
import { History, Loader2, ShieldBan, ShieldCheck } from '@lucide/vue'
import type { QueryLogEntry } from 'pihole-js'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import Button from '../../../components/ui/Button.vue'
import { useErrorMessage } from '../../../composables/useApiMessages'
import { getPiHoleClient } from '../../../utils/api'
import type { PiholeInstance } from '../../../utils/settings'

interface BlockedEntry {
	domain: string
	allowed: boolean
}

const WINDOW_MINUTES = 10
const QUERY_LIMIT = 500
const MAX_ENTRIES = 5

// Only blocks from the Pi-hole's own lists can be lifted by whitelisting
const BLOCKED_STATUSES = new Set([
	'GRAVITY',
	'REGEX',
	'DENYLIST',
	'GRAVITY_CNAME',
	'REGEX_CNAME',
	'DENYLIST_CNAME',
])

const props = defineProps<{
	instances: PiholeInstance[]
}>()

const { t } = useI18n()
const describeError = useErrorMessage()

const loading = ref(true)
const loadError = ref('')
const actionError = ref('')
const acting = ref<string | null>(null)
const allDevices = ref(false)
const entries = ref<BlockedEntry[]>([])

const subtitle = computed(() =>
	allDevices.value
		? t('popup.recentlyBlocked.allDevices', { minutes: WINDOW_MINUTES })
		: t('popup.recentlyBlocked.thisDevice', { minutes: WINDOW_MINUTES }),
)

// The query log stores IPv4 clients without the IPv6 mapping prefix
function normalizeIp(ip: string): string {
	return ip.replace(/^::ffff:/i, '')
}

async function recentQueries(
	inst: PiholeInstance,
): Promise<{ queries: QueryLogEntry[]; matchedDevice: boolean }> {
	const client = getPiHoleClient(inst)
	const from = Math.floor(Date.now() / 1000) - WINDOW_MINUTES * 60
	const { remote_addr } = await client.info.getClient()
	const own = await client.queries.list({
		from,
		client_ip: normalizeIp(remote_addr),
		length: QUERY_LIMIT,
	})
	if (own.queries.length > 0) return { queries: own.queries, matchedDevice: true }
	// Behind a proxy, or when DNS and HTTP use different IP versions, the address won't match
	const all = await client.queries.list({ from, length: QUERY_LIMIT })
	return { queries: all.queries, matchedDevice: false }
}

async function load(): Promise<void> {
	const results = await Promise.allSettled(
		props.instances.map(async (inst) => {
			const [recent, allowlist] = await Promise.all([
				recentQueries(inst),
				getPiHoleClient(inst).domains.getAllowlist(),
			])
			const allowed = allowlist.domains.filter((d) => d.enabled).map((d) => d.domain)
			return { ...recent, allowed }
		}),
	)
	const fulfilled = results.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []))
	if (fulfilled.length === 0) {
		const failure = results.find((r) => r.status === 'rejected')
		loadError.value = describeError(failure?.reason, 'popup.recentlyBlocked.loadError')
		return
	}

	allDevices.value = fulfilled.some((r) => !r.matchedDevice)
	const allowed = new Set(fulfilled.flatMap((r) => r.allowed))
	const latest = new Map<string, number>()
	for (const query of fulfilled.flatMap((r) => r.queries)) {
		if (!query.status || !BLOCKED_STATUSES.has(query.status)) continue
		latest.set(query.domain, Math.max(latest.get(query.domain) ?? 0, query.time))
	}
	entries.value = [...latest]
		.sort((a, b) => b[1] - a[1])
		.slice(0, MAX_ENTRIES)
		.map(([domain]) => ({ domain, allowed: allowed.has(domain) }))
}

async function toggleAllowlist(entry: BlockedEntry): Promise<void> {
	acting.value = entry.domain
	actionError.value = ''
	try {
		await Promise.all(
			props.instances.map((inst) =>
				entry.allowed
					? getPiHoleClient(inst).domains.unallow(entry.domain)
					: getPiHoleClient(inst).domains.allow(entry.domain),
			),
		)
		entry.allowed = !entry.allowed
	} catch (e) {
		actionError.value = describeError(e, 'popup.error.actionFailed')
	} finally {
		acting.value = null
	}
}

onMounted(async () => {
	try {
		await load()
	} finally {
		loading.value = false
	}
})
</script>
