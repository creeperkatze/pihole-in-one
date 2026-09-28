<script setup lang="ts">
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

		<DomainCard
			v-if="settings!.showCurrentSite && currentDomain && !states[activeInstance]?.error"
			:key="currentDomain"
			:domain="currentDomain"
			:instances="settings!.instances"
		/>

		<StatsCard v-if="settings!.showStats" :summary="states[activeInstance]!.summary!" />

		<SystemCard
			v-if="settings!.showSystemInfo && states[activeInstance]?.system"
			:info="states[activeInstance]!.system!"
		/>
	</div>
</template>
