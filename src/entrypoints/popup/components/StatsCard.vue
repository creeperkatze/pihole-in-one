<template>
	<div class="flex flex-col gap-2">
		<div class="text-[11px] font-semibold text-secondary uppercase tracking-[0.5px]">
			{{ formatMessage(messages['popup.statistics']) }}
		</div>

		<StatsGrid :stats="formattedStats" />

		<div v-if="mode === 'all'" class="grid grid-cols-2 gap-2">
			<DonutCard
				:title="formatMessage(messages['popup.statistics.queryStatus'])"
				:segments="statusSegments"
			/>
			<DonutCard
				:title="formatMessage(messages['popup.statistics.queryTypes'])"
				:segments="typesSegments"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { defineMessages } from '@formatjs/intl'
import { computed } from 'vue'

import type { PiholeSummary } from '../../../helpers/api'
import { formatNumber } from '../../../helpers/format'
import { useVIntl } from '../../../helpers/i18n'
import type { PopupStats } from '../../../helpers/settings'
import DonutCard from './DonutCard.vue'
import StatsGrid from './StatsGrid.vue'

const props = defineProps<{
	summary: PiholeSummary
	mode: PopupStats
}>()

const { formatMessage } = useVIntl()
const messages = defineMessages({
	'popup.statistics': { id: 'popup.statistics', defaultMessage: 'Statistics' },
	'popup.statistics.queryStatus': {
		id: 'popup.statistics.queryStatus',
		defaultMessage: 'Query Status',
	},
	'popup.statistics.queryTypes': {
		id: 'popup.statistics.queryTypes',
		defaultMessage: 'Query Types',
	},
	'popup.stats.queriesToday': { id: 'popup.stats.queriesToday', defaultMessage: 'Queries Today' },
	'popup.stats.blockedToday': { id: 'popup.stats.blockedToday', defaultMessage: 'Blocked Today' },
	'popup.stats.blocked': { id: 'popup.stats.blocked', defaultMessage: 'Blocked' },
	'popup.stats.cached': { id: 'popup.stats.cached', defaultMessage: 'Cached' },
})

const TYPE_COLORS: Record<string, string> = {
	A: '#3b82f6',
	AAAA: '#6366f1',
	PTR: '#8b5cf6',
	HTTPS: '#f97316',
	TXT: '#10b981',
	MX: '#f59e0b',
	SRV: '#ec4899',
	DS: '#14b8a6',
	SOA: '#84cc16',
	NS: '#06b6d4',
	RRSIG: '#f43f5e',
	DNSKEY: '#a78bfa',
	NAPTR: '#fb923c',
	SVCB: '#34d399',
	ANY: '#94a3b8',
}

const formattedStats = computed(() => {
	const q = props.summary.queries
	const history = props.summary.history ?? []
	return [
		{
			label: formatMessage(messages['popup.stats.queriesToday']),
			value: formatNumber(q.total),
			sparkline: history.map((h) => h.total),
			sparklineColor: '#3b82f6',
		},
		{
			label: formatMessage(messages['popup.stats.blockedToday']),
			value: formatNumber(q.blocked),
			sparkline: history.map((h) => h.blocked),
			sparklineColor: '#ef4444',
		},
		{
			label: formatMessage(messages['popup.stats.blocked']),
			value: `${q.percent_blocked.toFixed(1)}%`,
			sparkline: history.map((h) => (h.total > 0 ? (h.blocked / h.total) * 100 : 0)),
			sparklineColor: '#f97316',
		},
		{
			label: formatMessage(messages['popup.stats.cached']),
			value: formatNumber(q.cached),
			sparkline: history.map((h) => h.cached),
			sparklineColor: '#8b5cf6',
		},
	]
})

const statusSegments = computed(() => {
	const q = props.summary.queries
	const other = Math.max(0, q.total - q.blocked - q.cached - q.forwarded)
	return [
		{ label: 'Blocked', value: q.blocked, color: '#ef4444' },
		{ label: 'Cached', value: q.cached, color: '#8b5cf6' },
		{ label: 'Forwarded', value: q.forwarded, color: '#14b8a6' },
		...(other > 0 ? [{ label: 'Other', value: other, color: '#6b7280' }] : []),
	]
})

const typesSegments = computed(() => {
	const types = props.summary.queries.types
	const entries = Object.entries(types)
		.filter(([, v]) => v > 0)
		.sort((a, b) => b[1] - a[1])
	const top = entries.slice(0, 4)
	const otherVal = entries.slice(4).reduce((s, [, v]) => s + v, 0)
	return [
		...top.map(([name, value]) => ({ label: name, value, color: TYPE_COLORS[name] ?? '#6b7280' })),
		...(otherVal > 0 ? [{ label: 'Other', value: otherVal, color: '#6b7280' }] : []),
	]
})
</script>
