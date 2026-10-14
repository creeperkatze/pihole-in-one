export function formatSeconds(s: number): string {
	if (s < 60) return `${s}s`
	if (s % 3600 === 0) return `${s / 3600}h`
	return `${Math.round(s / 60)}min`
}

export function formatNumber(n: number): string {
	return n.toLocaleString()
}

// Fits the four characters of the toolbar badge
export function formatCompact(n: number): string {
	if (n < 1000) return String(n)
	const [value, suffix] = n < 1_000_000 ? [n / 1000, 'k'] : [n / 1_000_000, 'M']
	return `${value < 10 ? Math.floor(value * 10) / 10 : Math.floor(value)}${suffix}`
}

function countdownUnit(seconds: number): number {
	if (seconds > 3600) return 3600
	if (seconds > 60) return 60
	return 1
}

// Rounds up so the badge never shows less time than is left
export function formatCountdown(seconds: number): string {
	const unit = countdownUnit(seconds)
	const value = Math.ceil(seconds / unit)
	if (unit === 3600) return `${value}h`
	if (unit === 60) return `${value}m`
	return `${value}s`
}

// Seconds until formatCountdown shows a different value
export function countdownStep(seconds: number): number {
	const unit = countdownUnit(seconds)
	return seconds - (Math.ceil(seconds / unit) - 1) * unit
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
