<template>
  <div class="layout">
    <router-view />

    <nav class="floating-nav">
      <ul>
        <li>
          <router-link to="/user/home" :class="{ hoverable: true, active: current === '/user/home' }">推荐</router-link>
        </li>
        <li>
          <router-link to="/user/cart" :class="{ hoverable: true, active: current === '/user/cart' }">购物车</router-link>
        </li>
        <li>
          <router-link to="/user/orders" :class="{ hoverable: true, active: current === '/user/orders' }">我的订单</router-link>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const current = ref(route.path)

watch(() => route.path, (newPath) => {
  current.value = newPath
})

onMounted(() => {
  current.value = route.path
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500&display=swap');

.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-bottom: 80px;
  font-family: 'Poppins', sans-serif;
}

.floating-nav {
  position: fixed;
  bottom: 0;
  width: 100%;
  background-color: #000;
  z-index: 10;
  text-align: center;
  padding: 24px 0;
  box-shadow: 0 -2px 20px rgba(255, 255, 255, 0.05);
}

.floating-nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: inline-flex;
  gap: 16em; /* ✅ 增加间距 */
}

.floating-nav a {
  font-size: 18px;
  color: #cccccc; /* ✅ 默认灰白色 */
  text-decoration: none;
  text-transform: uppercase;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

.floating-nav a:hover {
  color: #ffffff; /* ✅ 悬浮时亮白 */
  text-shadow: 0 0 15px rgba(255,255,255,0.6); /* ✅ 更强光晕 */
  transform: translateY(-6px);
}

/* 光晕动画背景 */
.hoverable {
  display: inline-block;
  position: relative;
  backface-visibility: hidden;
  transition: transform 0.3s;
}

.hoverable::before {
  content: '';
  position: absolute;
  pointer-events: none;
  z-index: -1;
  top: 100%;
  left: 0;
  width: 100%;
  height: 12px;
  opacity: 0;
  background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 80%);
  transition: transform 0.3s, opacity 0.3s;
}

.hoverable:hover::before {
  opacity: 1;
  transform: translateY(-6px);
}

.active {
  color: #ffffff;
  font-weight: 600;
}
</style>
