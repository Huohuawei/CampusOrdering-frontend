import { createRouter, createWebHistory } from 'vue-router';


//注册登录
import Login from '../views/auth/Login.vue';
import Register from '../views/auth/Register.vue';

// 用户端
import Home from '../views/user/home/Index.vue';

// 商家端

// 管理端

// 错误页面

// 定义路由规则
const routes = [

  //注册登录路由
  { path: '/', component: Login },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/home', component: Home },

];

// 创建 Router 实例
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫 - 检查登录状态
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  
  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router;
