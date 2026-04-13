<template>
	<section class="flex flex-col">
		<SectionHeader
			:title="formatMessage(messages['options.search.title'])"
			:description="formatMessage(messages['options.search.description'], { query })"
		/>
		<div class="px-8 py-4 max-w-xl">
			<div v-if="results.length === 0" class="text-sm text-secondary">
				{{ formatMessage(messages['options.search.noResults']) }}
			</div>
			<div v-else class="flex flex-col gap-2">
				<template v-for="opt in results" :key="opt.id">
					<OptionSlider
						:label="opt.label"
						:description="opt.description"
						:model-value="form[opt.formKey]"
						:min="opt.min"
						:max="opt.max"
						:step="opt.step"
						:format="opt.format"
						@update:model-value="setOption(opt.formKey, $event)"
					/>
				</template>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { defineMessages } from '@formatjs/intl'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import OptionSlider from '../../../components/options/OptionSlider.vue'
import SectionHeader from '../../../components/options/SectionHeader.vue'
import { useSettings } from '../../../composables/useSettings'
import { formatSeconds } from '../../../helpers/format'
import { useVIntl } from '../../../helpers/i18n'

const route = useRoute()
const { form, setOption } = useSettings()

const { formatMessage } = useVIntl()
const messages = defineMessages({
	'options.search.title': { id: 'options.search.title', defaultMessage: 'Search results' },
	'options.search.description': {
		id: 'options.search.description',
		defaultMessage: 'Showing options matching "{query}"',
	},
	'options.search.noResults': {
		id: 'options.search.noResults',
		defaultMessage: 'No options found',
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

const allOptions = computed(() => [
	{
		id: 'refreshInterval',
		formKey: 'refreshInterval' as const,
		label: formatMessage(messages['options.connection.refreshInterval.label']),
		description: formatMessage(messages['options.connection.refreshInterval.description']),
		min: 60,
		max: 3600,
		step: 30,
		format: formatSeconds,
	},
])

const query = computed(() => String(route.query.q ?? ''))

const results = computed(() => {
	const q = query.value.toLowerCase().trim()
	if (!q) return []
	return allOptions.value.filter(
		(o) => o.label.toLowerCase().includes(q) || o.description.toLowerCase().includes(q),
	)
})
</script>
