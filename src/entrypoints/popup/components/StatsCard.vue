<template>
	<StatsGrid :stats="formattedStats" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { PiholeSummary } from '../../../utils/api'
import { formatNumber } from '../../../utils/format'
import StatsGrid from './StatsGrid.vue'

const props = defineProps<{
	summary: PiholeSummary
}>()

const { t } = useI18n()

const formattedStats = computed(() => {
	const q = props.summary.queries
	const history = props.summary.history ?? []
	return [
		{
			label: t('popup.stats.queriesToday'),
			value: formatNumber(q.total),
			sparkline: history.map((h) => h.total),
			sparklineColor: '#3b82f6',
		},
		{
			label: t('popup.stats.blockedToday'),
			value: formatNumber(q.blocked),
			sparkline: history.map((h) => h.blocked),
			sparklineColor: '#ef4444',
		},
		{
			label: t('popup.stats.blockedPercent'),
			value: `${q.percent_blocked.toFixed(1)}%`,
			sparkline: history.map((h) => (h.total > 0 ? (h.blocked / h.total) * 100 : 0)),
			sparklineColor: '#f97316',
		},
		{
			label: t('popup.stats.cached'),
			value: formatNumber(q.cached),
			sparkline: history.map((h) => h.cached),
			sparklineColor: '#8b5cf6',
		},
	]
})
</script>
