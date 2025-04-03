import { createRouter, createWebHistory } from 'vue-router';

// 用户端
import Home from '@/views/user/home/index.vue';
import MerchantDetail from '@/views/user/merchant/index.vue';
import Order from '@/views/user/order/index.vue';
import Profile from '@/views/user/profile/index.vue';

// 商家端
import MerchantDashboard from '@/views/merchant/dashboard/index.vue';
import MerchantOrders from '@/views/merchant/orders/index.vue';
import MerchantMenu from '@/views/merchant/menu/index.vue';
import MerchantStats from '@/views/merchant/stats/index.vue';

// 管理端
import AdminOverview from '@/views/admin/overview/index.vue';
import AdminMerchants from '@/views/admin/merchants/index.vue';
import AdminUsers from '@/views/admin/users/index.vue';
import AdminSystem from '@/views/admin/system/index.vue';

// 错误页面
import NotFound from '@/views/errors/404.vue';
import Forbidden from '@/views/errors/403.vue';

// 定义路由规则
const routes = [
  { path: '/', component: Home },
  { path: '/merchant/:id', component: MerchantDetail },
  { path: '/orders', component: Order },
  { path: '/profile', component: Profile },

  { path: '/merchant/dashboard', component: MerchantDashboard },
  { path: '/merchant/orders', component: MerchantOrders },
  { path: '/merchant/menu', component: MerchantMenu },
  { path: '/merchant/stats', component: MerchantStats },

  { path: '/admin/overview', component: AdminOverview },
  { path: '/admin/merchants', component: AdminMerchants },
  { path: '/admin/users', component: AdminUsers },
  { path: '/admin/system', component: AdminSystem },

  { path: '/403', component: Forbidden },
  { path: '/:pathMatch(.*)*', component: NotFound }, // 404 处理
];

// 创建 Router 实例
const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
