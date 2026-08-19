<script setup lang="ts">
import Logo from './icons/logo.svg?skipsvgo'
</script>

<template>
	<div class="hero-logo">
		<Logo role="img" aria-label="Pi-hole In One" />
	</div>
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

@media (min-width: 640px) {
	.hero-logo :deep(svg) {
		height: 80px;
	}
}
</style>
