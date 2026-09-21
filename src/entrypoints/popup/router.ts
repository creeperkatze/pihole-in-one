import { createRouter, createWebHashHistory } from 'vue-router'

import DomainsView from './views/DomainsView.vue'
import GroupsView from './views/GroupsView.vue'
import HomeView from './views/HomeView.vue'
import ListsView from './views/ListsView.vue'

export const router = createRouter({
	history: createWebHashHistory(),
	routes: [
		{ path: '/', name: 'root', component: HomeView },
		{ path: '/:pihole/home', name: 'home', component: HomeView },
		{ path: '/:pihole/groups', name: 'groups', component: GroupsView },
		{ path: '/:pihole/lists', name: 'lists', component: ListsView },
		{ path: '/:pihole/domains', name: 'domains', component: DomainsView },
		{ path: '/:pathMatch(.*)*', redirect: '/' },
	],
})
