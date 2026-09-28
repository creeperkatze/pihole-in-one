<script setup lang="ts">
import { Languages, Monitor, Tag } from '@lucide/vue'
import { type Component, computed } from 'vue'
import { useI18n } from 'vue-i18n'

import DeFlag from '../../../assets/icons/flags/de.svg?component'
import EsFlag from '../../../assets/icons/flags/es.svg?component'
import FrFlag from '../../../assets/icons/flags/fr.svg?component'
import GbFlag from '../../../assets/icons/flags/gb.svg?component'
import OptionSelect from '../../../components/options/OptionSelect.vue'
import SectionHeader from '../../../components/options/SectionHeader.vue'
import { useSettings } from '../../../composables/useSettings'
import { LOCALES, type SupportedLocale } from '../../../utils/i18n'
import type { BadgeMode, ColorScheme } from '../../../utils/settings'

const { form, saveError, initialized } = useSettings()
const { t } = useI18n()

const FLAGS: Record<SupportedLocale, Component> = {
	'en-US': GbFlag,
	'de-DE': DeFlag,
	'es-ES': EsFlag,
	'fr-FR': FrFlag,
}

const languageOptions = LOCALES.map((l) => ({ value: l.code, label: l.name, flag: FLAGS[l.code] }))

const colorSchemeOptions = computed(() => [
	{ value: 'auto', label: t('options.colorScheme.auto') },
	{ value: 'dark', label: t('options.colorScheme.dark') },
	{ value: 'light', label: t('options.colorScheme.light') },
])

const badgeModeOptions = computed(() => [
	{ value: 'off', label: t('options.customization.badge.off') },
	{ value: 'state', label: t('options.customization.badge.state') },
	{ value: 'percentage', label: t('options.customization.badge.percentage') },
	{ value: 'clients', label: t('options.customization.badge.clients') },
])
</script>

<template>
	<section class="flex flex-col">
		<SectionHeader
			:title="t('options.customization.title')"
			:description="t('options.customization.description')"
		/>
		<div v-if="initialized" class="flex max-w-xl flex-col gap-2 p-4">
			<OptionSelect
				v-model="form.locale"
				:icon="Languages"
				:label="t('options.language.label')"
				:options="languageOptions"
			>
				<template #leading="{ option }">
					<component :is="option.flag" class="h-3 w-4 shrink-0 rounded-[1px]" />
				</template>
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
				:model-value="form.colorScheme"
				:icon="Monitor"
				:label="t('options.colorScheme.label')"
				:description="t('options.colorScheme.description')"
				:options="colorSchemeOptions"
				@update:model-value="form.colorScheme = $event as ColorScheme"
			/>
			<OptionSelect
				:model-value="form.badgeMode"
				:icon="Tag"
				:label="t('options.customization.badge.label')"
				:description="t('options.customization.badge.description')"
				:options="badgeModeOptions"
				@update:model-value="form.badgeMode = $event as BadgeMode"
			/>
			<div
				v-if="saveError"
				class="mt-3 rounded-lg border border-danger-border bg-danger-bg px-3.5 py-2.5 text-[13px] text-pihole-red"
			>
				{{ saveError }}
			</div>
		</div>
	</section>
</template>
