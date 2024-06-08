import { createRouter, createWebHistory } from 'vue-router'
import Warehouses from '../views/Warehouses.vue'
import WarehouseDetails from '../views/WarehouseDetails.vue';
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
			component: Warehouses
		},
		{ path: '/warehouse/:id', name: 'WarehouseDetails', component: WarehouseDetails, props: true },
		{
			path: '/categories',
			component: () => import('../views/Categories.vue')
		},
		{
			path: '/subcategories',
			component: () => import('../views/Subcategories.vue')
		},
		{
			path: '/organizations',
			component: () => import('../views/Organizations.vue')
		},
		{
			path: '/orders',
			component: () => import('../views/Orders.vue')
		},
		{
			path: '/organizationOrders',
			component: () => import('../views/OrganizationOrders.vue')
		},
		{
			path: '/offers',
			component: () => import('../views/Offers.vue')
		},
		{
			path: '/offersfororganization',
			component: () => import('../views/OffersForOrganization.vue')
		},
		{
			path: '/users',
			component: () => import('../views/Users.vue')
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