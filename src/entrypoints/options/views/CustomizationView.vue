<template>
	<section class="flex flex-col">
		<SectionHeader
			:title="t('options.customization.title')"
			:description="t('options.customization.description')"
		/>
		<div v-if="initialized" class="flex max-w-xl flex-col gap-2 p-4">
			<OptionSelect
				:icon="locale.icon"
				:label="locale.label"
				:model-value="form.locale"
				:options="locale.options"
				@update:model-value="form.locale = $event"
			>
				<template #description>
					<i18n-t keypath="options.language.description" tag="span">
						<template #crowdin>
							<a
								href="https://crowdin.com/project/pihole-in-one"
								target="_blank"
								rel="noopener"
								class="text-pihole-red hover:underline"
								@click.stop
								>Crowdin</a
							>
						</template>
					</i18n-t>
				</template>
			</OptionSelect>
			<OptionSelect
				:icon="colorScheme.icon"
				:label="colorScheme.label"
				:description="colorScheme.description"
				:model-value="form.colorScheme"
				:options="colorScheme.options"
				@update:model-value="form.colorScheme = $event as ColorScheme"
			/>
			<OptionSelect
				:icon="badgeMode.icon"
				:label="badgeMode.label"
				:description="badgeMode.description"
				:model-value="form.badgeMode"
				:options="badgeMode.options"
				@update:model-value="form.badgeMode = $event as BadgeMode"
			/>
			<OptionToggle
				:icon="showDiagnosisBadge.icon"
				:label="showDiagnosisBadge.label"
				:description="showDiagnosisBadge.description"
				:model-value="form.showDiagnosisBadge"
				@update:model-value="form.showDiagnosisBadge = $event"
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
import { Bell, Languages, Monitor, Tag } from '@lucide/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { LOCALES } from '../../../utils/i18n'

export function useCustomizationOptions() {
	const { t } = useI18n()

	const locale = computed(() => ({
		id: 'locale',
		type: 'select' as const,
		formKey: 'locale' as const,
		icon: Languages,
		label: t('options.language.label'),
		description: t('options.language.description', { crowdin: 'Crowdin' }),
		options: LOCALES.map((l) => ({ value: l.code, label: l.name })),
	}))

	const colorScheme = computed(() => ({
		id: 'colorScheme',
		type: 'select' as const,
		formKey: 'colorScheme' as const,
		icon: Monitor,
		label: t('options.colorScheme.label'),
		description: t('options.colorScheme.description'),
		options: [
			{ value: 'auto', label: t('options.colorScheme.auto') },
			{ value: 'dark', label: t('options.colorScheme.dark') },
			{ value: 'light', label: t('options.colorScheme.light') },
		],
	}))

	const badgeMode = computed(() => ({
		id: 'badgeMode',
		type: 'select' as const,
		formKey: 'badgeMode' as const,
		icon: Tag,
		label: t('options.customization.badge.label'),
		description: t('options.customization.badge.description'),
		options: [
			{ value: 'off', label: t('options.customization.badge.off') },
			{ value: 'state', label: t('options.customization.badge.state') },
			{
				value: 'percentage',
				label: t('options.customization.badge.percentage'),
			},
			{ value: 'clients', label: t('options.customization.badge.clients') },
		],
	}))

	const showDiagnosisBadge = computed(() => ({
		id: 'showDiagnosisBadge',
		type: 'toggle' as const,
		formKey: 'showDiagnosisBadge' as const,
		icon: Bell,
		label: t('options.customization.diagnosisBadge.label'),
		description: t('options.customization.diagnosisBadge.description'),
	}))

	return { locale, colorScheme, badgeMode, showDiagnosisBadge }
}
</script>

<script setup lang="ts">
import OptionSelect from '../../../components/options/OptionSelect.vue'
import OptionToggle from '../../../components/options/OptionToggle.vue'
import SectionHeader from '../../../components/options/SectionHeader.vue'
import { useSettings } from '../../../composables/useSettings'
import type { BadgeMode, ColorScheme } from '../../../utils/settings'

const { form, saveError, initialized } = useSettings()
const { locale, colorScheme, badgeMode, showDiagnosisBadge } = useCustomizationOptions()
const { t } = useI18n()
</script>
