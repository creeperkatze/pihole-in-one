export function formatSeconds(s: number): string {
	if (s < 60) return `${s}s`
	if (s % 3600 === 0) return `${s / 3600}h`
	return `${Math.round(s / 60)}min`
}

export function formatNumber(n: number): string {
	return n.toLocaleString()
}

export function formatDuration(seconds: number): string {
	if (seconds >= 86400) {
		const d = Math.floor(seconds / 86400)
		const h = Math.floor((seconds % 86400) / 3600)
		return h > 0 ? `${d}d ${h}h` : `${d}d`
	}
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
