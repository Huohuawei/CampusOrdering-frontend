import { createRouter, createWebHistory } from 'vue-router'

// 注册登录
import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'

// 用户界面 Layout + 页面
import UserLayout from '../views/user/layout/UserLayout.vue'
import Home from '../views/user/home/Index.vue'
import MerchantDetail from '../views/user/home/MerchantDetail.vue'
import Cart from '../views/user/cart/Cart.vue'
import Orders from '../views/user/orders/Orders.vue'

// 定义路由规则
const routes = [
  // 注册登录路由
  { path: '/login', component: Login },
  { path: '/register', component: Register },

  // 用户界面路由（登录后跳转到这里）
  {
    path: '/user',
    component: UserLayout,
    children: [
      { path: 'home', component: Home },
      { path: 'cart', component: Cart },
      { path: 'orders', component: Orders },
      { path: 'order/confirm', name: 'OrderConfirm', component: () => import('../views/user/orders/OrderConfirm.vue') },
      { path: '/merchant/:id', component: MerchantDetail },
      { path: '', redirect: 'home' }
    ]
  },

  // 默认访问根路径跳转到 /user
  { path: '/', redirect: '/user/home' }
]

// 创建 Router 实例
const router = createRouter({
  history: createWebHistory(),
  routes,
})




export default router
