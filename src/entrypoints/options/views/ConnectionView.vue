<template>
	<section class="flex flex-col">
		<SectionHeader
			:title="formatMessage(messages['options.connection.title'])"
			:description="formatMessage(messages['options.connection.description'])"
		/>
		<div class="px-8 py-4 max-w-xl flex flex-col gap-2">
			<OptionPiHoleSelector
				:model-value="form.instances"
				@update:model-value="form.instances = $event"
			/>
			<OptionSlider
				:icon="Timer"
				:label="formatMessage(messages['options.connection.refreshInterval.label'])"
				:description="formatMessage(messages['options.connection.refreshInterval.description'])"
				:model-value="form.refreshInterval"
				:min="60"
				:max="3600"
				:step="30"
				suffix="s"
				:format="formatSeconds"
				@update:model-value="form.refreshInterval = $event"
			/>
			<div
				v-if="saveError"
				class="px-3.5 py-2.5 rounded-lg text-[13px] border bg-danger-bg border-danger-border text-pihole-red"
			>
				{{ saveError }}
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { defineMessages } from '@formatjs/intl'
import { Timer } from 'lucide-vue-next'

import OptionPiHoleSelector from '../../../components/options/OptionPiHoleSelector.vue'
import OptionSlider from '../../../components/options/OptionSlider.vue'
import SectionHeader from '../../../components/options/SectionHeader.vue'
import { useSettings } from '../../../composables/useSettings'
import { formatSeconds } from '../../../helpers/format'
import { useVIntl } from '../../../helpers/i18n'

const { form, saveError } = useSettings()

const { formatMessage } = useVIntl()
const messages = defineMessages({
	'options.connection.title': { id: 'options.connection.title', defaultMessage: 'Connection' },
	'options.connection.description': {
		id: 'options.connection.description',
		defaultMessage: 'Manage your Pi-hole instances and badge refresh settings.',
	},
	'options.connection.refreshInterval.label': {
		id: 'options.connection.refreshInterval.label',
		defaultMessage: 'Badge Refresh Interval',
	},
	'options.connection.refreshInterval.description': {
		id: 'options.connection.refreshInterval.description',
		defaultMessage: 'How often the badge is refreshed. Choose between one minute and one hour.',
	},
})
</script>
