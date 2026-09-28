;(function () {
	var s = localStorage.getItem('colorScheme')
	if (s === 'dark' || s === 'light') document.documentElement.dataset.theme = s
})()
