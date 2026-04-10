<template>
	<svg
		:width="width"
		:height="height"
		viewBox="0 0 300 100"
		role="img"
		aria-label="Pi-hole In One"
		class="text-zinc-950 dark:text-zinc-50"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			fill="#ff0000"
			d="M 49.999998,0 C 43.082556,0 36.165795,2.649699 30.865293,7.950319 L 7.9507522,30.862059 c -10.601003,10.601246 -10.601003,27.671151 0,38.272401 L 30.865293,92.04907 c 10.601007,10.60124 27.668405,10.60124 38.269407,0 L 92.04924,69.13446 c 10.60101,-10.60125 10.60101,-27.671152 0,-38.272401 L 69.1347,7.950319 C 63.8342,2.649697 56.917442,0 49.999998,0 Z m 0,27.941006 A 22.058621,22.058689 0 0 1 72.05862,49.999695 22.058621,22.058689 0 0 1 49.999998,72.05839 22.058621,22.058689 0 0 1 27.941377,49.999695 22.058621,22.058689 0 0 1 49.999998,27.941006 Z"
		/>
		<ellipse fill="#43d021" ry="10" rx="20" cy="90" cx="20" />
		<rect fill="currentColor" width="10" height="70" x="15" y="20.128235" />
		<path fill="#43d021" d="m 25,23.800699 v 20 l 25,-10 z" />
		<text
			style="
				font-style: normal;
				font-variant: normal;
				font-weight: bold;
				font-stretch: normal;
				font-size: 53.3333px;
				line-height: 1;
				font-family: inter, sans-serif;
				text-align: start;
				text-anchor: start;
				fill: currentColor;
			"
			x="111.65868"
			y="42.591148"
		>
			<tspan x="111.65868" y="42.591148">Pi-hole</tspan>
			<tspan x="111.65868" y="95.924454">In One</tspan>
		</text>
	</svg>
</template>

<script setup lang="ts">
withDefaults(
	defineProps<{
		width?: number
		height?: number
	}>(),
	{
		width: 128,
		height: 43,
	},
)
</script>
