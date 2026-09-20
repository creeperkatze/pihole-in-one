<script setup lang="ts">
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
		image: '/screenshots/extension.png',
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
]
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
					<div class="showcase-media">
						<img
							:src="item.image"
							:alt="item.title"
							width="1280"
							height="800"
							loading="lazy"
							decoding="async"
						/>
					</div>
					<div class="showcase-text">
						<h3>{{ item.title }}</h3>
						<p>{{ item.details }}</p>
					</div>
				</article>
			</div>
		</div>
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
</style>
