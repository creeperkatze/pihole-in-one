<script setup lang="ts">
import { Megaphone, X } from '@lucide/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

defineEmits<{
	dismiss: []
}>()

const { t } = useI18n()

const items = computed(() => [
	t('popup.whatsNew.items.home'),
	t('popup.whatsNew.items.domains'),
	t('popup.whatsNew.items.piholes'),
])
</script>

<template>
	<section
		class="flex items-start gap-2.5 rounded-lg border border-pihole-red/30 bg-pihole-red/10 px-2.5 py-2"
	>
		<Megaphone class="mt-0.5 size-5 shrink-0 text-pihole-red" />
		<div class="min-w-0 flex-1">
			<p class="text-sm leading-tight font-semibold text-primary">
				{{ t('popup.whatsNew.title') }}
			</p>
			<ul class="mt-1.5 flex flex-col gap-1 text-xs text-secondary">
				<li v-for="item in items" :key="item" class="flex gap-1.5">
					<span class="text-pihole-red" aria-hidden="true">•</span>
					<span>{{ item }}</span>
				</li>
			</ul>
		</div>
		<button
			type="button"
			class="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded text-muted transition-colors hover:text-primary"
			:title="t('popup.whatsNew.dismiss')"
			:aria-label="t('popup.whatsNew.dismiss')"
			@click="$emit('dismiss')"
		>
			<X class="size-4" />
		</button>
	</section>
</template>
