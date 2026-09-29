<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

interface ShowcaseItem {
	title: string
	details: string
	image: string
}

const features = [
	{ key: 'blocking', image: '/screenshots/home.png' },
	{ key: 'currentSite', image: '/screenshots/blocked.png' },
	{ key: 'domains', image: '/screenshots/domains.png' },
	{ key: 'groups', image: '/screenshots/lists.png' },
	{ key: 'multiInstance', image: '/screenshots/connection.png' },
	{ key: 'badge', image: '/screenshots/customization.png' },
	{ key: 'customization', image: '/screenshots/popup.png' },
	{ key: 'backup', image: '/screenshots/data.png' },
]

const { t } = useI18n()

const items = computed<ShowcaseItem[]>(() =>
	features.map(({ key, image }) => ({
		title: t(`meta.feature.${key}.title`),
		details: t(`meta.feature.${key}.description`),
		image,
	})),
)

const active = ref<ShowcaseItem | null>(null)

function onKeydown(event: KeyboardEvent) {
	if (event.key === 'Escape') active.value = null
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
	<div class="showcase">
		<div class="container">
			<div class="showcase-inner">
				<article
					v-for="(item, index) in items"
					:key="item.image"
					class="showcase-row"
					:class="{ reverse: index % 2 === 1 }"
				>
					<button type="button" class="showcase-media" :aria-label="item.title" @click="active = item">
						<img
							:src="item.image"
							:alt="item.title"
							width="1280"
							height="800"
							loading="lazy"
							decoding="async"
						/>
					</button>
					<div class="showcase-text">
						<h3>{{ item.title }}</h3>
						<p>{{ item.details }}</p>
					</div>
				</article>
			</div>
		</div>
		<Teleport to="body">
			<div v-if="active" class="lightbox" @click="active = null">
				<img :src="active.image" :alt="active.title" />
			</div>
		</Teleport>
	</div>
</template>

<style scoped>
.showcase {
	position: relative;
	padding: 32px 24px 8px;
}

.container {
	max-width: 1152px;
	margin: 0 auto;
}

.showcase-inner {
	display: flex;
	flex-direction: column;
	gap: 64px;
}

.showcase-row {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 24px;
}

.showcase-media {
	flex: 1 1 0;
	width: 100%;
	padding: 0;
	border: 0;
	background: none;
	cursor: zoom-in;
}

.showcase-media img {
	width: 100%;
	aspect-ratio: 1280 / 800;
	object-fit: cover;
	border-radius: 12px;
	background-color: var(--vp-c-bg-soft);
}

.showcase-text {
	flex: 1 1 0;
	width: 100%;
}

.showcase-text h3 {
	font-size: 1.25rem;
	font-weight: 600;
	line-height: 1.4;
	margin: 0 0 8px;
	letter-spacing: -0.01em;
}

.showcase-text p {
	font-size: 0.95rem;
	line-height: 1.6;
	color: var(--vp-c-text-2);
	margin: 0;
}

@media (min-width: 640px) {
	.showcase {
		padding-top: 48px;
		padding-left: 48px;
		padding-right: 48px;
	}
}

@media (min-width: 768px) {
	.showcase-row {
		flex-direction: row;
		align-items: center;
		gap: 48px;
	}

	.showcase-row.reverse {
		flex-direction: row-reverse;
	}
}

@media (min-width: 960px) {
	.showcase {
		padding-left: 64px;
		padding-right: 64px;
	}
}

.lightbox {
	position: fixed;
	inset: 0;
	z-index: 100;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 24px;
	background: rgba(0, 0, 0, 0.85);
	cursor: zoom-out;
}

.lightbox img {
	max-width: 100%;
	max-height: 100%;
	border-radius: 12px;
}
</style>
