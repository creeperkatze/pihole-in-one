<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import Logo from './icons/logo.svg?skipsvgo'

const { t } = useI18n()
</script>

<template>
	<div class="hero-logo">
		<Logo role="img" aria-label="Pi-hole In One" />
	</div>
	<p class="tagline">{{ t('meta.summary') }}</p>
</template>

<style scoped>
.hero-logo {
	margin-bottom: 8px;
	color: var(--vp-c-text-1);
}

.hero-logo :deep(svg) {
	height: 64px;
	width: auto;
}

.tagline {
	padding-top: 8px;
	max-width: 392px;
	line-height: 28px;
	font-size: 18px;
	font-weight: 500;
	color: var(--vp-c-text-2);
}

@media (min-width: 640px) {
	.hero-logo :deep(svg) {
		height: 80px;
	}

	.tagline {
		padding-top: 12px;
		max-width: 576px;
		line-height: 32px;
		font-size: 20px;
	}
}

@media (min-width: 960px) {
	.tagline {
		line-height: 36px;
		font-size: 24px;
	}
}
</style>
