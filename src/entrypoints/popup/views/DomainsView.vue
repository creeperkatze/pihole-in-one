<template>
	<DomainsList v-if="settings" :instances="settings.instances" :show-add="settings.showDomainAdd" />
</template>

<script setup lang="ts">
import DomainsList from '../components/DomainsList.vue'
import { usePopupInstances } from '../usePopupInstances'

const { settings } = usePopupInstances()
</script>
