<template>
	<template v-if="states[activeInstance]?.summary">
		<GroupsCard
			v-if="states[activeInstance]!.summary!.groups.length"
			:groups="states[activeInstance]!.summary!.groups"
			:base-url="settings!.instances[activeInstance]!.baseUrl"
			:api-password="settings!.instances[activeInstance]!.apiPassword"
		/>
		<EmptyState v-else :icon="Users" :text="t('popup.groups.empty')" />
	</template>
</template>

<script setup lang="ts">
import { Users } from '@lucide/vue'
import { useI18n } from 'vue-i18n'

import EmptyState from '../components/EmptyState.vue'
import GroupsCard from '../components/GroupsCard.vue'
import { usePopupInstances } from '../usePopupInstances'

const { t } = useI18n()

const { settings, states, activeInstance } = usePopupInstances()
</script>
