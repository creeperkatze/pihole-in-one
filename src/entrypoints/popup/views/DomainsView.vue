<template>
	<DomainsList
		v-if="settings && states[activeInstance]?.summary"
		:instances="settings.instances"
		:show-add="settings.showDomainAdd"
	/>
</template>

<script setup lang="ts">
import DomainsList from '../components/DomainsList.vue'
import { usePopupInstances } from '../usePopupInstances'

const { settings, states, activeInstance } = usePopupInstances()
</script>
