<script lang="ts">
export interface FeaturedItem {
	publication: string
	title: string
	icon: string
	date: string
	link: string
}
</script>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{ items: FeaturedItem[] }>()

const { t, locale } = useI18n()

function formatDate(date: string): string {
	return new Date(`${date}T00:00:00Z`).toLocaleDateString(locale.value, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		timeZone: 'UTC',
	})
}
</script>

<template>
	<div class="vp-doc container">
		<h2>{{ t('featured.title') }}</h2>
		<p>{{ t('featured.description') }}</p>
		<div class="featured-grid">
			<a
				v-for="item in items"
				:key="item.link"
				:href="item.link"
				target="_blank"
				rel="noopener noreferrer"
				class="featured-card"
			>
				<div class="box">
					<img class="icon" :src="item.icon" :alt="item.publication" loading="lazy" />
					<div class="content">
						<div class="title-row">
							<span class="title">{{ item.publication }}</span>
							<time class="date" :datetime="item.date">{{ formatDate(item.date) }}</time>
						</div>
						<p class="details">{{ item.title }}</p>
					</div>
				</div>
			</a>
		</div>
	</div>
</template>

<style scoped>
.container {
	margin: auto;
	width: 100%;
	max-width: 1280px;
	padding: 0 24px;
}

.featured-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 16px;
}

.featured-card {
	display: block;
	border: 1px solid var(--vp-c-bg-soft);
	border-radius: 12px;
	height: 100%;
	background-color: var(--vp-c-bg-soft);
	text-decoration: none !important;
	color: inherit;
	transition:
		border-color 0.25s,
		background-color 0.25s;
}

.featured-card:hover {
	border-color: var(--vp-c-brand-1);
}

.box {
	display: flex;
	align-items: flex-start;
	gap: 12px;
	padding: 16px;
	height: 100%;
}

.icon {
	width: 40px;
	height: 40px;
	border-radius: 8px;
	flex-shrink: 0;
}

.content {
	flex-grow: 1;
	min-width: 0;
}

.title-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
}

.title {
	line-height: 24px;
	font-size: 16px;
	font-weight: 600;
	color: var(--vp-c-text-1);
}

.date {
	flex-shrink: 0;
	font-size: 13px;
	font-weight: 500;
	color: var(--vp-c-text-2);
}

.vp-doc .details {
	margin: 0;
	padding-top: 4px;
	line-height: 20px;
	font-size: 14px;
	font-weight: 500;
	color: var(--vp-c-text-2);
}

@media (min-width: 640px) {
	.container {
		padding: 0 48px;
	}
}

@media (min-width: 960px) {
	.container {
		padding: 0 64px;
	}
}
</style>
