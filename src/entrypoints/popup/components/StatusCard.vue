<template>
	<div class="status-card" :class="status">
		<div class="status-info">
			<span class="status-dot" :class="status"></span>
			<div>
				<div class="status-label">
					{{ status === 'enabled' ? 'Blocking Enabled' : 'Blocking Disabled' }}
				</div>
				<div class="status-sub">{{ sub }}</div>
			</div>
		</div>
		<button
			class="btn"
			:class="status === 'enabled' ? 'btn-danger' : 'btn-success'"
			:disabled="disabled"
			@click="$emit('toggle')"
		>
			{{ status === 'enabled' ? 'Disable' : 'Enable' }}
		</button>
	</div>
</template>

<script setup lang="ts">
defineProps<{
	status: 'enabled' | 'disabled'
	sub?: string
	disabled?: boolean
}>()

defineEmits<{ toggle: [] }>()
</script>

<style scoped>
.status-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	padding: 14px 16px;
	border-radius: var(--radius);
	border: 1px solid var(--border);
	background: var(--bg-secondary);
	transition: border-color 0.2s;
}

.status-card.enabled {
	border-color: var(--success-border);
	background: var(--success-bg);
}

@media (prefers-color-scheme: light) {
	.status-card.enabled {
		color: #000;
	}

	.status-card.enabled .status-sub {
		color: #333;
	}
}

.status-card.disabled {
	border-color: var(--danger-border);
	background: var(--danger-bg);
}

.status-info {
	display: flex;
	align-items: center;
	gap: 10px;
}

.status-dot {
	width: 10px;
	height: 10px;
	border-radius: 50%;
	flex-shrink: 0;
	background: var(--text-muted);
}

.status-dot.enabled {
	background: var(--success);
	box-shadow: 0 0 0 3px color-mix(in srgb, var(--success) 25%, transparent);
}

.status-dot.disabled {
	background: var(--danger);
	box-shadow: 0 0 0 3px color-mix(in srgb, var(--danger) 25%, transparent);
}

.status-label {
	font-weight: 600;
	font-size: 14px;
}

.status-sub {
	font-size: 12px;
	color: var(--text-muted);
	margin-top: 1px;
}
</style>
