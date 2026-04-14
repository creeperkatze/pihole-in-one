import eslint from '@eslint/js'
import prettierPlugin from 'eslint-plugin-prettier/recommended'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	...pluginVue.configs['flat/recommended'],
	prettierPlugin,
	{
		languageOptions: {
			globals: {
				window: 'readonly',
				document: 'readonly',
				navigator: 'readonly',
				console: 'readonly',
				URL: 'readonly',
				URLSearchParams: 'readonly',
				fetch: 'readonly',
				setTimeout: 'readonly',
				clearTimeout: 'readonly',
				setInterval: 'readonly',
				clearInterval: 'readonly',
				HTMLElement: 'readonly',
				HTMLInputElement: 'readonly',
				browser: 'readonly',
				chrome: 'readonly',
				localStorage: 'readonly',
			},
		},
		plugins: {
			'simple-import-sort': simpleImportSort,
		},
		rules: {
			'simple-import-sort/imports': 'error',
			'simple-import-sort/exports': 'error',
			'vue/multi-word-component-names': 'off',
			'@typescript-eslint/no-explicit-any': 'warn',
		},
	},
	{
		files: ['**/*.vue'],
		languageOptions: {
			parserOptions: {
				parser: tseslint.parser,
			},
		},
	},
	{
		ignores: ['.wxt/', '.output/', 'node_modules/'],
	},
)
