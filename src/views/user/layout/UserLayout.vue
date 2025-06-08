<template>
  <div class="layout">
    <nav class="side-nav" :class="{ 'collapsed': isCollapsed }">
      <div class="nav-header" @click="router.push('/user/home')" style="cursor: pointer;">
        <div class="logo-text">
          <i class="fas fa-utensils logo-icon" v-show="!isCollapsed"></i>
          <h2 v-show="!isCollapsed">校园点餐</h2>
        </div>
      </div>
      <ul>
        <li>
          <router-link to="/user/home" :class="{ hoverable: true, active: current === '/user/home' }">
            <i class="fas fa-home"></i>
            <span v-show="!isCollapsed">推荐</span>
          </router-link>
        </li>
        <li>
          <router-link to="/user/aiassistant" :class="{ hoverable: true, active: current === '/user/aiassistant' }">
            <i class="fas fa-robot"></i>
            <span v-show="!isCollapsed">AI助手</span>
          </router-link>
        </li>
        <li>
          <router-link to="/user/cart" :class="{ hoverable: true, active: current === '/user/cart' }">
            <i class="fas fa-shopping-cart"></i>
            <span v-show="!isCollapsed">购物车</span>
          </router-link>
        </li>
        <li>
          <router-link to="/user/orders" :class="{ hoverable: true, active: current === '/user/orders' }">
            <i class="fas fa-list-alt"></i>
            <span v-show="!isCollapsed">我的订单</span>
          </router-link>
        </li>
        <li>
          <router-link to="/user/profile" :class="{ hoverable: true, active: current === '/user/profile' }">
            <i class="fas fa-user"></i>
            <span v-show="!isCollapsed">个人信息</span>
          </router-link>
        </li>
      </ul>
      <div class="nav-footer">
        <div class="collapse-btn" @click="toggleCollapse">
          <i class="fas fa-chevron-right" v-if="isCollapsed"></i>
          <i class="fas fa-chevron-left" v-else></i>
          <span class="food-icon" v-if="isCollapsed">🍴</span>
        </div>
      </div>
    </nav>
    <main class="main-content" :style="{ marginLeft: isCollapsed ? '70px' : '240px' }">
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
const isCollapsed = ref(false)

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

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
  background-color: #f5f6f8;
}

/* 侧边栏样式 - 月光主题 */
.side-nav {
  width: 240px;
  background: linear-gradient(180deg, #1e2a44 0%, #2c3e66 100%);
  z-index: 10;
  padding: 1rem 0;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  border-radius: 0 20px 20px 0;
  overflow: hidden;
}

.side-nav::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(12px);
  pointer-events: none;
}

.side-nav.collapsed {
  width: 70px;
}

.nav-header {
  padding: 1.5rem;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #3c4f7f 0%, #2c3e66 100%);
  position: relative;
  z-index: 1;
}

.logo-text {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}

.logo-icon {
  font-size: 28px;
  color: #e0e7ff;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.2));
}

.nav-header h2 {
  color: #e0e7ff;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.side-nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.side-nav a {
  font-size: 16px;
  color: #c6d0e8;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  gap: 1rem;
  border-radius: 10px;
  margin: 0 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.side-nav a i {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
  color: #e0e7ff;
}

.side-nav a:hover {
  color: #ffffff;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
  transform: translateX(4px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.hoverable::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.4s;
}

.hoverable:hover::before {
  left: 100%;
}

.active {
  color: #ffffff;
  font-weight: 600;
  background: linear-gradient(135deg, #5c76b3 0%, #4a6199 100%);
  border-left: 4px solid #e0e7ff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.nav-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  background: linear-gradient(135deg, #3c4f7f 0%, #2c3e66 100%);
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.collapse-btn {
  background: linear-gradient(135deg, #5c76b3 0%, #4a6199 100%);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: #e0e7ff;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.collapse-btn i {
  font-size: 1.2rem;
}

.collapse-btn .food-icon {
  font-size: 24px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.collapse-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.4s;
}

.collapse-btn:hover::before {
  left: 100%;
}

.collapse-btn:hover {
  background: linear-gradient(135deg, #6b88c9 0%, #5973af 100%);
  color: #ffffff;
  transform: scale(1.08) rotate(360deg);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
}

.collapse-btn:active {
  transform: scale(1.05) rotate(360deg);
}

.main-content {
  flex: 1;
  padding: 2rem;
  transition: margin-left 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .side-nav {
    width: 220px;
    border-radius: 0;
  }
  
  .side-nav.collapsed {
    width: 60px;
  }
  
  .main-content {
    margin-left: 220px;
    padding: 1.5rem;
  }
  
  .side-nav.collapsed + .main-content {
    margin-left: 60px;
  }
}

/* 滚动条美化 */
.main-content::-webkit-scrollbar {
  width: 6px;
}

.main-content::-webkit-scrollbar-track {
  background: #e8ebfd;
  border-radius: 3px;
}

.main-content::-webkit-scrollbar-thumb {
  background: #5c76b3;
  border-radius: 3px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: #4a6199;
}
</style>