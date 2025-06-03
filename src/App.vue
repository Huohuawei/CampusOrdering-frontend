<template>
  <a-config-provider :locale="zhCN">
    <a-layout class="layout">
      <!-- 顶部导航栏 -->
      <a-layout-header class="header">
        <div class="logo-section">
          <img src="@/assets/logo.svg" alt="logo" class="logo-img" />
          <span class="logo-text">校园点餐系统后台</span>
        </div>
      </a-layout-header>
      
      <a-layout>
        <!-- 侧边栏 -->
        <a-layout-sider width="200" class="sider">
          <a-menu
            mode="inline"
            v-model="selectedKeys"
            theme="light"
            class="side-menu"
          >
            <a-menu-item key="report">
              <template #icon>
                <bar-chart-outlined />
              </template>
              <router-link to="/report">销售报表</router-link>
            </a-menu-item>
          </a-menu>
        </a-layout-sider>
        
        <!-- 主要内容区域 -->
        <a-layout-content class="main-content">
          <router-view></router-view>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-config-provider>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { BarChartOutlined } from '@ant-design/icons-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'

export default defineComponent({
  name: 'App',
  components: {
    BarChartOutlined
  },
  setup() {
    const selectedKeys = ref(['report'])

    return {
      zhCN,
      selectedKeys
    }
  }
})
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.layout {
  min-height: 100vh;
  background: #f0f2f5;
}

.header {
  display: flex;
  align-items: center;
  padding: 0 24px;
  background: #001529;
  position: fixed;
  width: 100%;
  z-index: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.logo-section {
  display: flex;
  align-items: center;
}

.logo-img {
  width: 32px;
  height: 32px;
  margin-right: 12px;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  white-space: nowrap;
}

.sider {
  background: #fff;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  margin-top: 64px;
  height: calc(100vh - 64px);
  position: fixed;
  left: 0;
  overflow: auto;
}

.side-menu {
  border-right: none;
}

.main-content {
  margin-left: 200px;
  margin-top: 64px;
  padding: 24px;
  min-height: calc(100vh - 64px);
}

.main-content > div {
  background: #fff;
  padding: 24px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* 链接样式 */
.ant-menu-item a {
  color: rgba(0, 0, 0, 0.85);
  text-decoration: none;
}

.ant-menu-item-selected a {
  color: #1890ff;
}
</style> 