import { createRouter, createWebHashHistory } from 'vue-router'

import ConnectionView from './views/ConnectionView.vue'
import CustomizationView from './views/CustomizationView.vue'
import SearchView from './views/SearchView.vue'

export const router = createRouter({
	history: createWebHashHistory(),
	routes: [
		{ path: '/', redirect: '/connection' },
		{ path: '/connection', component: ConnectionView },
		{ path: '/customization', component: CustomizationView },
		{ path: '/search', component: SearchView },
	],
})
