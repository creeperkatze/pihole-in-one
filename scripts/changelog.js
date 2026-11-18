import { readFileSync, writeFileSync } from 'node:fs'

const [command, version] = process.argv.slice(2)
const changelog = readFileSync('CHANGELOG.md', 'utf8').replace(/\r\n/g, '\n')

if (command === 'notes') {
	const name = version?.replace(/^v/, '')
	const section = changelog.split(/^## /m).find((part) => part.startsWith(`[${name}]`)) ?? ''
	const notes = section
		.slice(section.indexOf('\n') + 1)
		.split(/^\[.+\]: /m)[0]
		.trim()
	if (!notes) {
		console.error(`No notes for ${version} in CHANGELOG.md`)
		process.exit(1)
	}
	console.log(notes)
} else if (command === 'release') {
	const next = process.env.npm_package_version
	const tag = `v${next}`
	const date = new Date().toISOString().slice(0, 10)
	writeFileSync(
		'CHANGELOG.md',
		changelog
			.replace('## [Unreleased]', `## [Unreleased]\n\n## [${next}] - ${date}`)
			.replace(
				/^\[Unreleased\]: (.+)\/compare\/(.+)\.\.\.HEAD$/m,
				`[Unreleased]: $1/compare/${tag}...HEAD\n[${next}]: $1/compare/$2...${tag}`,
			),
	)
} else {
	console.error('Usage: node scripts/changelog.js notes <version> | release')
	process.exit(1)
}
