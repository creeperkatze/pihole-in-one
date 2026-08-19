<script setup lang="ts">
import HeartIcon from './icons/heart.svg'
</script>

<template>
	<a
		href="https://ko-fi.com/creeperkatze"
		target="_blank"
		rel="noopener noreferrer"
		class="donate-button"
		aria-label="Donate on Ko-fi"
	>
		<HeartIcon class="heart-icon" />
		Donate
	</a>
</template>

<style scoped>
.donate-button {
	margin-left: 16px;
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 4px 12px;
	border-radius: 9999px;
	background-color: var(--vp-c-brand-bg);
	font-size: 13px;
	font-weight: 500;
	color: #fff !important;
	text-decoration: none !important;
	transition: opacity 0.15s;
}

.donate-button:hover {
	opacity: 0.8;
}

.heart-icon {
	height: 16px;
	width: 16px;
	flex-shrink: 0;
}
</style>
