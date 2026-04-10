<template>
	<section class="flex flex-col">
		<SectionHeader
			:title="formatMessage(messages['options.search.title'])"
			:description="formatMessage(messages['options.search.description'], { query })"
		/>
		<div class="px-8 py-4 max-w-xl">
			<div v-if="results.length === 0" class="text-sm text-zinc-500 dark:text-zinc-400">
				{{ formatMessage(messages['options.search.noResults']) }}
			</div>
			<div v-else class="flex flex-col gap-2">
				<template v-for="opt in results" :key="opt.id">
					<OptionToggle
						v-if="opt.type === 'toggle'"
						:label="opt.label"
						:description="opt.description"
						:model-value="form[opt.formKey]"
						@update:model-value="setOption(opt.formKey, $event)"
					/>
					<OptionSlider
						v-else-if="opt.type === 'slider'"
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
import OptionToggle from '../../../components/options/OptionToggle.vue'
import SectionHeader from '../../../components/options/SectionHeader.vue'
import { useSimpleOptions } from '../../../composables/simpleOptions'
import { useSettings } from '../../../composables/useSettings'
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
})

const query = computed(() => String(route.query.q ?? ''))

const simpleOptions = useSimpleOptions()

const results = computed(() => {
	const q = query.value.toLowerCase().trim()
	if (!q) return []
	return simpleOptions.value.filter(
		(o) => o.label.toLowerCase().includes(q) || o.description.toLowerCase().includes(q),
	)
})
</script>
