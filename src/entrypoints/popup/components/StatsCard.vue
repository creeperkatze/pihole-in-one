<template>
	<div class="flex flex-col gap-2">
		<div class="text-[11px] font-semibold text-secondary uppercase tracking-[0.5px]">
			{{ formatMessage(messages['popup.statistics']) }}
		</div>

		<StatsGrid :stats="formattedStats" />
	</div>
</template>

<script setup lang="ts">
import { defineMessages } from '@formatjs/intl'
import { computed } from 'vue'

import type { PiholeSummary } from '../../../utils/api'
import { formatNumber } from '../../../utils/format'
import { useVIntl } from '../../../utils/i18n'
import StatsGrid from './StatsGrid.vue'

const props = defineProps<{
	summary: PiholeSummary
}>()

const { formatMessage } = useVIntl()
const messages = defineMessages({
	'popup.statistics': { id: 'popup.statistics', defaultMessage: 'Statistics' },
	'popup.stats.queriesToday': { id: 'popup.stats.queriesToday', defaultMessage: 'Queries Today' },
	'popup.stats.blockedToday': { id: 'popup.stats.blockedToday', defaultMessage: 'Blocked Today' },
	'popup.stats.blockedPercent': {
		id: 'popup.stats.blockedPercent',
		defaultMessage: 'Blocked %',
	},
	'popup.stats.cached': { id: 'popup.stats.cached', defaultMessage: 'Cached' },
})

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
			label: formatMessage(messages['popup.stats.blockedPercent']),
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
</script>
