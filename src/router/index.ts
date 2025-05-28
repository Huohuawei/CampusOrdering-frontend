import { createRouter, createWebHistory } from 'vue-router';


//注册登录
import Login from '../views/auth/Login.vue';
import Register from '../views/auth/Register.vue';

// 用户端
import Home from '../views/user/home/Index.vue';

// 商家端
import MerchantLayout from '../layouts/MainLayout.vue';
import MerchantDashboard from '../views/merchant/Dashboard.vue';
import MenuManagement from '../views/merchant/MenuManagement.vue';
import OrderManagement from '../views/merchant/OrderManagement.vue';
import Profile from '../views/merchant/Profile.vue';
import Reviews from '../views/merchant/Reviews.vue';

// 管理端

// 错误页面

// 定义路由规则
const routes = [

  //注册登录路由
  { path: '/', component: Login },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/home', component: Home },
  
  // 商家路由
  {
    path: '/merchant',
    component: () => import('@/views/merchant/MerchantLayout.vue'),
    meta: { requiresAuth: true, role: 'MERCHANT' },
    children: [
      {
        path: '',
        redirect: '/merchant/dashboard'
      },
      {
        path: 'dashboard',
        component: () => import('@/views/merchant/Dashboard.vue')
      },
      {
        path: 'menu',
        component: () => import('@/views/merchant/MenuManagement.vue')
      },
      {
        path: 'orders',
        component: () => import('@/views/merchant/OrderManagement.vue')
      },
      {
        path: 'statistics',
        component: () => import('@/views/merchant/SalesStatistics.vue')
      },
      {
        path: 'profile',
        component: () => import('@/views/merchant/Profile.vue')
      }
    ]
  },

  {
    path: '/api-tester',
    name: 'ApiTester',
    component: () => import('../views/ApiTester.vue'),
    meta: {
      title: 'API测试工具'
    }
  }

];

// 创建 Router 实例
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫 - 检查登录状态和角色
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
    next('/login')
    } else if (to.meta.role && to.meta.role !== user.role) {
      next('/home') // 如果角色不匹配，重定向到首页
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router;
