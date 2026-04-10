<template>
	<section class="flex flex-col">
		<SectionHeader
			title="Search results"
			:description="`Showing options matching &quot;${query}&quot;`"
		/>
		<div class="px-8 py-4 max-w-xl">
			<div v-if="results.length === 0" class="text-sm text-zinc-500 dark:text-zinc-400">
				No options found
			</div>
			<div v-else class="flex flex-col">
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
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import OptionSlider from '../../../components/options/OptionSlider.vue'
import OptionToggle from '../../../components/options/OptionToggle.vue'
import SectionHeader from '../../../components/options/SectionHeader.vue'
import { simpleOptions } from '../../../composables/simpleOptions'
import { useSettings } from '../../../composables/useSettings'

const route = useRoute()
const { form, setOption } = useSettings()

const query = computed(() => String(route.query.q ?? ''))

const results = computed(() => {
	const q = query.value.toLowerCase().trim()
	if (!q) return []
	return simpleOptions.filter(
		(o) => o.label.toLowerCase().includes(q) || o.description.toLowerCase().includes(q),
	)
})
</script>
