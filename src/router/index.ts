import { createRouter, createWebHistory } from 'vue-router'

// 公共页面
import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'

// 用户端布局和页面
import UserLayout from '../views/user/layout/UserLayout.vue'
import Home from '../views/user/home/Index.vue'
import MerchantDetail from '../views/user/home/MerchantDetail.vue'
import Cart from '../views/user/cart/Cart.vue'
import AIassistant from '../views/user/home/AI.vue'
import Orders from '../views/user/orders/Orders.vue'
import UserProfile from '../views/user/home/UserProfile.vue'

// 管理员端布局和页面
import AdminLayout from '../views/admin/layout/AdminLayout.vue'
import AdminDashboard from '../views/admin/Dashboard.vue'
import AdminUsers from '../views/admin/Users.vue'
import AdminMerchants from '../views/admin/Merchants.vue'
import AdminStatistics from '../views/admin/Statistics.vue'
import AdminSystem from '../views/admin/System.vue'

const routes = [
  // 认证路由
  { path: '/login', component: Login },
  { path: '/register', component: Register },

  // 用户端路由
  {
    path: '/user',
    component: UserLayout,
    meta: { requiresAuth: true, role: 'USER' },
    children: [
      { path: 'home', component: Home },
      { path: 'cart', component: Cart },
      { path: 'orders', component: Orders },
      { path: 'order/confirm', name: 'OrderConfirm', component: () => import('../views/user/orders/OrderConfirm.vue') },
      { path: 'merchants/:id', component: MerchantDetail },
      { path: 'aiassistant', component: AIassistant },
      { path: 'profile', component: UserProfile },
      { path: '', redirect: 'home' }
    ]
  },

  // 商家端路由
  {
    path: '/merchant',
    component: () => import('@/views/merchant/MerchantLayout.vue'),
    meta: { requiresAuth: true, role: 'MERCHANT' },
    children: [
      { path: 'dashboard', component: () => import('@/views/merchant/Dashboard.vue') },
      { path: 'menu', component: () => import('@/views/merchant/MenuManagement.vue') },
      { path: 'AI', component: () => import('@/views/merchant/AIAssistant.vue') },
      { path: 'orders', component: () => import('@/views/merchant/OrderManagement.vue') },
      { path: 'statistics', component: () => import('@/views/merchant/SalesStatistics.vue') },
      { path: 'profile', component: () => import('@/views/merchant/Profile.vue') }
    ]
  },

  // 管理员端路由
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, role: 'ADMIN' },
    children: [
      { path: 'dashboard', component: AdminDashboard },
      { path: 'users', component: AdminUsers },
      { path: 'merchants', component: AdminMerchants },
      { path: 'statistic', component: AdminStatistics },
      { path: 'system', component: AdminSystem },
      { path: '', redirect: 'dashboard' }
    ]
  },

  // 工具路由
  {
    path: '/api-tester',
    name: 'ApiTester',
    component: () => import('../views/ApiTester.vue'),
    meta: { title: 'API测试工具' }
  },

  // 默认路由
  { path: '/', redirect: 'login' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next('/login')
    } else if (to.meta.role && to.meta.role !== user.role) {
      // 根据角色重定向到对应首页
      switch (user.role) {
        case 'ADMIN':
          next('/admin/dashboard')
          break
        case 'MERCHANT':
          next('/merchant/dashboard')
          break
        case 'USER':
          next('/user/home')
          break
        default:
          next('/login')
      }
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router