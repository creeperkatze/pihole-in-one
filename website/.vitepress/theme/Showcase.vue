<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

interface ShowcaseItem {
	title: string
	details: string
	image: string
}

const items: ShowcaseItem[] = [
	{
		title: 'Everything about your Pi-hole, one click away',
		details:
			"Toggle blocking on or off, or disable it for a preset duration so it re-enables automatically. See today's queries, blocked percentage, and cache hits, each with a 24-hour sparkline.",
		image: '/screenshots/home.png',
	},
	{
		title: "Know when a domain's blocked, instantly",
		details:
			"The popup highlights the current tab's domain in red when it's blocked, and shows which list blocked it, without opening the Pi-hole admin interface.",
		image: '/screenshots/blocked.png',
	},
	{
		title: 'Allowlist a domain without leaving the tab',
		details: 'Toggle the current domain to allowlisted right from the popup, then reload and move on.',
		image: '/screenshots/whitelisted.png',
	},
	{
		title: 'Flip groups on and off',
		details: 'Toggle any Pi-hole group from the popup, for example to pause filtering for one set of devices.',
		image: '/screenshots/groups.png',
	},
	{
		title: 'Control your blocklists and update gravity',
		details:
			'Enable or disable individual blocklists with a single toggle, and update gravity right away after changing them.',
		image: '/screenshots/lists.png',
	},
	{
		title: 'Block or allow any domain, even with regex',
		details:
			'Type a domain, choose exact or regex, and add it to the allowlist or blocklist. Remove entries again with one click.',
		image: '/screenshots/domains.png',
	},
	{
		title: 'Connect every Pi-hole you run',
		details:
			'Add as many Pi-hole instances as you want, and switch between them with per-instance tabs right in the popup.',
		image: '/screenshots/connection.png',
	},
	{
		title: 'Make it feel like yours',
		details:
			'Choose your language, force light or dark mode, and decide what the toolbar badge shows: blocked percentage, on/off state, or active client count.',
		image: '/screenshots/customization.png',
	},
	{
		title: 'Show exactly what you want to see',
		details:
			'Pick which sections appear in the popup: stats as graphs or donut charts, group toggles, list toggles, and system status like CPU, memory, and temperature.',
		image: '/screenshots/popup.png',
	},
	{
		title: 'Take your settings with you',
		details:
			'Export your settings to a JSON file, import them on another browser, or reset everything to the defaults.',
		image: '/screenshots/data.png',
	},
]

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
					:key="item.title"
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
