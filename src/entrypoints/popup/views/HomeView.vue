<template>
	<StatusCard
		v-if="states[activeInstance]?.summary"
		:status="isEnabled(activeInstance) ? 'enabled' : 'disabled'"
		:sub="statusSub(activeInstance)"
		:disabled="states[activeInstance]?.toggling"
		@toggle="toggleBlocking(activeInstance)"
	/>

	<DisablePresets
		v-if="isEnabled(activeInstance)"
		:disabled="states[activeInstance]?.toggling"
		@select="disableFor(activeInstance, $event)"
	/>

	<StatsCard v-if="states[activeInstance]?.summary" :summary="states[activeInstance]!.summary!" />

	<DomainCard
		v-if="currentDomain && !states[activeInstance]?.error"
		:domain="currentDomain"
		:instances="settings!.instances"
	/>
</template>

<script setup lang="ts">
import DisablePresets from '../components/DisablePresets.vue'
import DomainCard from '../components/DomainCard.vue'
import StatsCard from '../components/StatsCard.vue'
import StatusCard from '../components/StatusCard.vue'
import { usePopupInstances } from '../usePopupInstances'

const {
	settings,
	states,
	activeInstance,
	currentDomain,
	isEnabled,
	statusSub,
	toggleBlocking,
	disableFor,
} = usePopupInstances()
</script>
