export function formatNumber(n: number): string {
	return n.toLocaleString()
}

export function formatDuration(seconds: number): string {
	if (seconds >= 3600) {
		const h = Math.floor(seconds / 3600)
		const m = Math.floor((seconds % 3600) / 60)
		return m > 0 ? `${h}h ${m}m` : `${h}h`
	}
	if (seconds >= 60) {
		const m = Math.floor(seconds / 60)
		const s = seconds % 60
		return s > 0 ? `${m}m ${s}s` : `${m}m`
	}
	return `${seconds}s`
}
