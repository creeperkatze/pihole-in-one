<template>
	<section class="flex flex-col">
		<SectionHeader
			:title="formatMessage(messages['options.search.title'])"
			:description="formatMessage(messages['options.search.description'], { query })"
		/>
		<div v-if="initialized" class="px-8 py-4 max-w-xl">
			<div v-if="results.length === 0" class="text-sm text-secondary">
				{{ formatMessage(messages['options.search.noResults']) }}
			</div>
			<div v-else class="flex flex-col gap-2">
				<template v-for="opt in results" :key="opt.id">
					<OptionSlider
						v-if="opt.type === 'slider'"
						:icon="opt.icon"
						:label="opt.label"
						:description="opt.description"
						:model-value="form[opt.formKey] as number"
						:min="opt.min"
						:max="opt.max"
						:step="opt.step"
						:format="opt.format"
						@update:model-value="setOption(opt.formKey, $event)"
					/>
					<OptionSelect
						v-else-if="opt.type === 'select'"
						:icon="opt.icon"
						:label="opt.label"
						:description="opt.description"
						:model-value="form[opt.formKey] as string"
						:options="opt.options"
						@update:model-value="setOption(opt.formKey, $event)"
					/>
					<OptionToggle
						v-else-if="opt.type === 'toggle'"
						:icon="opt.icon"
						:label="opt.label"
						:description="opt.description"
						:model-value="form[opt.formKey] as boolean"
						@update:model-value="setOption(opt.formKey, $event)"
					/>
					<OptionPiHoleSelector
						v-else-if="opt.type === 'pihole'"
						:model-value="form.instances"
						@update:model-value="form.instances = $event"
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

import type { PiHoleOption } from '../../../components/options/OptionPiHoleSelector.vue'
import OptionPiHoleSelector from '../../../components/options/OptionPiHoleSelector.vue'
import type { SelectOption } from '../../../components/options/OptionSelect.vue'
import OptionSelect from '../../../components/options/OptionSelect.vue'
import type { SliderOption } from '../../../components/options/OptionSlider.vue'
import OptionSlider from '../../../components/options/OptionSlider.vue'
import type { ToggleOption } from '../../../components/options/OptionToggle.vue'
import OptionToggle from '../../../components/options/OptionToggle.vue'
import SectionHeader from '../../../components/options/SectionHeader.vue'
import { useSettings } from '../../../composables/useSettings'
import { useVIntl } from '../../../helpers/i18n'
import { useConnectionOptions } from './ConnectionView.vue'
import { useCustomizationOptions } from './CustomizationView.vue'
import { useDiagnosticsOptions } from './DiagnosticsView.vue'

type SearchableOption = SliderOption | SelectOption | ToggleOption | PiHoleOption

const route = useRoute()
const { form, setOption, initialized } = useSettings()
const { pihole, refreshInterval } = useConnectionOptions()
const { locale, colorScheme, badgeMode } = useCustomizationOptions()
const { telemetry } = useDiagnosticsOptions()

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

const allOptions = computed<SearchableOption[]>(() => [
	pihole.value,
	refreshInterval.value,
	locale.value,
	colorScheme.value,
	badgeMode.value,
	telemetry.value,
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
