<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const CHROME_ID = 'gaaobidjebianpcngcfpkniaocibidhe'
const FIREFOX_SLUG = 'pihole-in-one'
const EDGE_ID = 'hbigjlhijpiegpnbdhmdgdlfbcgljdao'

interface Stats {
	chrome: number | null
	firefox: number | null
	edge: number | null
}

const stats = ref<Stats | null>(null)

async function fetchUsers(url: string): Promise<number | null> {
	try {
		const res = await fetch(url)
		if (!res.ok) throw new Error(`stats request failed with status ${res.status}`)
		const data = (await res.json()) as { value?: string }
		const value = Number(data.value)
		return Number.isFinite(value) ? value : null
	} catch {
		// Store stats are a nice-to-have, fail silently rather than showing a broken widget
		return null
	}
}

onMounted(async () => {
	const [chrome, firefox, edge] = await Promise.all([
		fetchUsers(`https://img.shields.io/chrome-web-store/users/${CHROME_ID}.json`),
		fetchUsers(`https://img.shields.io/amo/users/${FIREFOX_SLUG}.json`),
		fetchUsers(
			`https://img.shields.io/badge/dynamic/json.json?label=users&query=%24.activeInstallCount&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2F${EDGE_ID}`,
		),
	])
	if (chrome === null && firefox === null && edge === null) return
	stats.value = { chrome, firefox, edge }
})

const cards = computed(() => {
	if (!stats.value) return []
	const { chrome, firefox, edge } = stats.value

	const list: { label: string; value: string }[] = []
	if (chrome !== null) list.push({ label: 'Chrome Users', value: chrome.toLocaleString() })
	if (firefox !== null) list.push({ label: 'Firefox Users', value: firefox.toLocaleString() })
	if (edge !== null) list.push({ label: 'Edge Users', value: edge.toLocaleString() })
	return list
})
</script>

<template>
	<div v-if="cards.length" class="stats-bar">
		<div class="stats-grid">
			<article v-for="card in cards" :key="card.label" class="stat-card">
				<span class="stat-value">{{ card.value }}</span>
				<span class="stat-label">{{ card.label }}</span>
			</article>
		</div>
	</div>
</template>

<style scoped>
.stats-bar {
	position: relative;
	padding: 0 24px 16px;
}

.stats-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 16px;
	max-width: 1152px;
	margin: 0 auto;
}

.stat-card {
	flex: 1 1 200px;
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
	padding: 24px;
	border-radius: 12px;
	border: 1px solid var(--vp-c-bg-soft);
	background-color: var(--vp-c-bg-soft);
}

.stat-value {
	font-size: 2.25rem;
	font-weight: 700;
	line-height: 1;
	background-image: linear-gradient(120deg, var(--vp-c-brand-1) 30%, var(--vp-c-brand-2));
	-webkit-background-clip: text;
	background-clip: text;
	color: transparent;
}

.stat-label {
	margin-top: 4px;
	font-size: 0.875rem;
	font-weight: 500;
	color: var(--vp-c-text-2);
}

@media (min-width: 640px) {
	.stats-bar {
		padding: 0 48px 16px;
	}

	.stat-card {
		flex-basis: calc(33.333% - 11px);
	}
}

@media (min-width: 960px) {
	.stats-bar {
		padding: 0 64px 16px;
	}
}
</style>
