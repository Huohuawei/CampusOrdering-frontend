<template>
  <router-view />
</template>

<script setup>
import { RouterView } from 'vue-router'
</script>


<style>
/* 全局基础样式 */
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f7fa;
}

#app {
  min-height: 100vh;
}

* {
  box-sizing: border-box;
}
</style>