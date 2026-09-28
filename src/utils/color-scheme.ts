import type { ColorScheme } from './settings'

export function applyColorScheme(scheme: ColorScheme): void {
	localStorage.setItem('colorScheme', scheme)
	if (scheme === 'auto') {
		delete document.documentElement.dataset.theme
	} else {
		document.documentElement.dataset.theme = scheme
	}
}
