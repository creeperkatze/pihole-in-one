<script setup lang="ts">
import { computed } from 'vue'

import BlockingCard from '../components/BlockingCard.vue'
import DomainCard from '../components/DomainCard.vue'
import StatsCard from '../components/StatsCard.vue'
import SystemCard from '../components/SystemCard.vue'
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

const showSite = computed(
	() =>
		settings.value!.showCurrentSite &&
		Boolean(currentDomain.value) &&
		!states.value[activeInstance.value]?.error,
)
const showStats = computed(() => settings.value!.showStats)
const showSystem = computed(
	() => settings.value!.showSystemInfo && Boolean(states.value[activeInstance.value]?.padd),
)
</script>

<template>
	<div v-if="states[activeInstance]?.summary" class="flex flex-col gap-2">
		<BlockingCard
			:enabled="isEnabled(activeInstance)"
			:sub="statusSub(activeInstance)"
			:busy="states[activeInstance]?.toggling"
			@toggle="toggleBlocking(activeInstance)"
			@disable-for="disableFor(activeInstance, $event)"
		/>

		<StatsCard v-if="showStats" :summary="states[activeInstance]!.summary!" />

		<SystemCard v-if="showSystem" :padd="states[activeInstance]!.padd!" />

		<DomainCard
			v-if="showSite"
			:key="currentDomain!"
			:domain="currentDomain!"
			:instances="settings!.instances"
		/>
	</div>
</template>
