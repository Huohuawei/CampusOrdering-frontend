<template>
  <div class="layout">
    <nav class="side-nav">
      <div class="nav-header">
        <h2>校园点餐</h2>
      </div>
      <ul>
        <li>
          <router-link to="/user/home" :class="{ hoverable: true, active: current === '/user/home' }">
            <i class="fas fa-home"></i>
            <span>推荐</span>
          </router-link>
        </li>
        <li>
          <router-link to="/user/aiassistant" :class="{ hoverable: true, active: current === '/user/ai-assistant' }">
            <i class="fas fa-robot"></i>
            <span>AI助手</span>
          </router-link>
        </li>
        <li>
          <router-link to="/user/cart" :class="{ hoverable: true, active: current === '/user/cart' }">
            <i class="fas fa-shopping-cart"></i>
            <span>购物车</span>
          </router-link>
        </li>
        <li>
          <router-link to="/user/orders" :class="{ hoverable: true, active: current === '/user/orders' }">
            <i class="fas fa-list-alt"></i>
            <span>我的订单</span>
          </router-link>
        </li>
        <li>
          <router-link to="/user/profile" :class="{ hoverable: true, active: current === '/user/profile' }">
            <i class="fas fa-user"></i>
            <span>个人信息</span>
          </router-link>
        </li>
      </ul>
    </nav>
    <main class="main-content">
      <router-view />
    </main>
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
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

.layout {
  display: flex;
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
  background-color: #f5f5f5;
}

.side-nav {
  width: 240px;
  background: linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%);
  z-index: 10;
  padding: 1rem 0;
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.1);
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
}

.nav-header {
  padding: 1.5rem;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1rem;
}

.nav-header h2 {
  color: #ffffff;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  background: linear-gradient(45deg, #fff, #a8a8a8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.side-nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.main-content {
  flex: 1;
  margin-left: 240px;
  padding: 2rem;
}

.side-nav a {
  font-size: 16px;
  color: #cccccc;
  text-decoration: none;
  text-transform: uppercase;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  gap: 1rem;
}

.side-nav a i {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
}

.side-nav a:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(6px);
}

.hoverable {
  display: flex;
  position: relative;
  backface-visibility: hidden;
  transition: all 0.3s ease;
}

.hoverable::before {
  content: '';
  position: absolute;
  pointer-events: none;
  z-index: -1;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
  transition: transform 0.3s, opacity 0.3s;
}

.hoverable:hover::before {
  opacity: 1;
  transform: translateX(6px);
}

.active {
  color: #ffffff;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.1);
  border-left: 4px solid #ffffff;
}

.active::before {
  opacity: 1;
}
</style>
