import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/report'
  },
  {
    path: '/report',
    name: 'Report',
    component: () => import('@/views/report/SalesReport.vue'),
    meta: { title: '销售报表', icon: 'bar-chart' }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router 