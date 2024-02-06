import { createRouter, createWebHistory } from 'vue-router'
import Warehouse from '../views/Warehouse.vue'
import Login from '../views/Login.vue'

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: '/login',
			component: Login,
		},/*
		{
			path: '/:pathMatch(.*)*',
			redirect: '/login',
		},*/
		{
			path: '/',
			component: Warehouse
		},
		{
			path: '/banks',
			component: () => import('../views/Banks.vue')
		},
		,
		{
			path: '/orders',
			component: () => import('../views/Orders.vue')
		},
	],
})

router.beforeEach((to, from, next) => {
	const user = localStorage.getItem('user');
	
	if (!user && to.path !== '/login') {
	  // If the user is not logged in and trying to access a restricted page, redirect to the login page.
	  next('/login');
	} else {
	  // Allow the navigation
	  next();
	}
  });

export default router