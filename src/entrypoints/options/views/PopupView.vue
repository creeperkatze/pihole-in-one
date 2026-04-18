<template>
	<section class="flex flex-col">
		<SectionHeader
			:title="formatMessage(messages['options.popup.title'])"
			:description="formatMessage(messages['options.popup.description'])"
		/>
		<div v-if="initialized" class="px-8 py-4 max-w-xl flex flex-col gap-2">
			<OptionSelect
				:icon="popupStats.icon"
				:label="popupStats.label"
				:description="popupStats.description"
				:model-value="form.popupStats"
				:options="popupStats.options"
				@update:model-value="form.popupStats = $event as PopupStats"
			/>
			<OptionToggle
				:icon="popupGroupsOption.icon"
				:label="popupGroupsOption.label"
				:description="popupGroupsOption.description"
				:model-value="form.popupGroups"
				@update:model-value="form.popupGroups = $event"
			/>
			<OptionToggle
				:icon="popupListsOption.icon"
				:label="popupListsOption.label"
				:description="popupListsOption.description"
				:model-value="form.popupLists"
				@update:model-value="form.popupLists = $event"
			/>
			<div
				v-if="saveError"
				class="mt-3 px-3.5 py-2.5 rounded-lg text-[13px] border bg-danger-bg border-danger-border text-pihole-red"
			>
				{{ saveError }}
			</div>
		</div>
	</section>
</template>

<script lang="ts">
import { defineMessages } from '@formatjs/intl'
import { BarChart2, Layers, List } from '@lucide/vue'
import { computed } from 'vue'

import { useVIntl } from '../../../helpers/i18n'

export const messages = defineMessages({
	'options.popup.title': {
		id: 'options.popup.title',
		defaultMessage: 'Popup',
	},
	'options.popup.description': {
		id: 'options.popup.description',
		defaultMessage: "Adjust the popup's layout and sections.",
	},
	'options.popup.stats.label': {
		id: 'options.popup.stats.label',
		defaultMessage: 'Statistics',
	},
	'options.popup.stats.description': {
		id: 'options.popup.stats.description',
		defaultMessage: 'What statistics to show in the popup.',
	},
	'options.popup.stats.none': {
		id: 'options.popup.stats.none',
		defaultMessage: 'None',
	},
	'options.popup.stats.graphs': {
		id: 'options.popup.stats.graphs',
		defaultMessage: 'Graphs',
	},
	'options.popup.stats.all': {
		id: 'options.popup.stats.all',
		defaultMessage: 'All',
	},
	'options.popup.groups.label': {
		id: 'options.popup.groups.label',
		defaultMessage: 'Groups',
	},
	'options.popup.groups.description': {
		id: 'options.popup.groups.description',
		defaultMessage: 'Display group toggles in the popup for quick enable/disable.',
	},
	'options.popup.lists.label': {
		id: 'options.popup.lists.label',
		defaultMessage: 'Lists',
	},
	'options.popup.lists.description': {
		id: 'options.popup.lists.description',
		defaultMessage: 'Display list toggles in the popup for quick enable/disable.',
	},
})

export function usePopupOptions() {
	const { formatMessage } = useVIntl()

	const popupStats = computed(() => ({
		id: 'popupStats',
		type: 'select' as const,
		formKey: 'popupStats' as const,
		icon: BarChart2,
		label: formatMessage(messages['options.popup.stats.label']),
		description: formatMessage(messages['options.popup.stats.description']),
		options: [
			{ value: 'none', label: formatMessage(messages['options.popup.stats.none']) },
			{ value: 'graphs', label: formatMessage(messages['options.popup.stats.graphs']) },
			{ value: 'all', label: formatMessage(messages['options.popup.stats.all']) },
		],
	}))

	const popupGroupsOption = computed(() => ({
		id: 'popupGroups',
		type: 'toggle' as const,
		formKey: 'popupGroups' as const,
		icon: Layers,
		label: formatMessage(messages['options.popup.groups.label']),
		description: formatMessage(messages['options.popup.groups.description']),
	}))

	const popupListsOption = computed(() => ({
		id: 'popupLists',
		type: 'toggle' as const,
		formKey: 'popupLists' as const,
		icon: List,
		label: formatMessage(messages['options.popup.lists.label']),
		description: formatMessage(messages['options.popup.lists.description']),
	}))

	return { popupStats, popupGroupsOption, popupListsOption }
}
</script>

<script setup lang="ts">
import OptionSelect from '../../../components/options/OptionSelect.vue'
import OptionToggle from '../../../components/options/OptionToggle.vue'
import SectionHeader from '../../../components/options/SectionHeader.vue'
import { useSettings } from '../../../composables/useSettings'
import type { PopupStats } from '../../../helpers/settings'

const { form, saveError, initialized } = useSettings()
const { popupStats, popupGroupsOption, popupListsOption } = usePopupOptions()
const { formatMessage } = useVIntl()
</script>
