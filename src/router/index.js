import Vue from 'vue'
import VueRouter from 'vue-router'


Vue.use(VueRouter)

const routes = [{
    path: '/',
    redirect: "/login"
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../components/Login.vue')
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('../components/Home.vue'),
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: () => import('../components/Welcome.vue'),
      },
      {
        path: '/users',
        component: () => import('../components/user/Users.vue')
      },
      {
        path: '/rights',
        component: () => import('../components/power/Rights.vue')
      },
      {
        path: '/roles',
        component: () => import('../components/power/Roles.vue')
      },
      {
        path: '/categories',
        component: () => import('../components/goods/Cate.vue')
      },
      {
        path: '/params',
        component: () => import('../components/goods/Params.vue')
      },
      {
        path: '/goods',
        component: () => import('../components/goods/List.vue')
      },
      {
        path: '/goods/add',
        component: () => import('../components/goods/Add.vue')
      },
      {
        path: '/orders',
        component: () => import('../components/order/Order.vue')
      },
      {
        path: '/reports',
        component: () => import('../components/report/Report.vue')
      },
    ],
    
  },

]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next();
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router