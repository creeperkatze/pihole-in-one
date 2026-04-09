<template>
	<div class="stats-grid">
		<div v-for="stat in stats" :key="stat.label" class="stat">
			<div class="stat-value">{{ stat.value }}</div>
			<div class="stat-label">{{ stat.label }}</div>
		</div>
	</div>
</template>

<script setup lang="ts">
defineProps<{
	stats: Array<{ label: string; value: string }>
}>()
</script>

<style scoped>
.stats-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 8px;
}

.stat {
	padding: 10px 12px;
	border-radius: var(--radius);
	border: 1px solid var(--border);
	background: var(--bg-secondary);
}

.stat-value {
	font-size: 18px;
	font-weight: 700;
	letter-spacing: -0.5px;
	line-height: 1.2;
}

.stat-label {
	font-size: 11px;
	color: var(--text-muted);
	margin-top: 2px;
	text-transform: uppercase;
	letter-spacing: 0.4px;
}
</style>
