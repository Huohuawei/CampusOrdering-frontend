<template>
  <div class="ai-cooking-assistant">
    <div class="header">
      <div class="header-content">
        <h1 class="title">
          <span class="icon">🤖</span>
          AI备菜助手
        </h1>
        <p class="subtitle">基于销量数据和天气信息的智能备菜建议</p>
      </div>
      <div class="header-bg"></div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading">
      <div class="loading-container">
        <div class="spinner"></div>
        <div class="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p class="loading-text">正在分析数据，生成备菜建议...</p>
      </div>
    </div>

    <!-- 错误信息 -->
    <div v-if="errorMessage" class="error-message">
      <div class="error-icon">⚠️</div>
      <div class="error-content">
        <h3>数据加载失败</h3>
        <p>{{ errorMessage }}</p>
        <button @click="refreshData" class="retry-btn">
          <span class="btn-icon">🔄</span>
          重新获取
        </button>
      </div>
    </div>

    <!-- 主要内容 -->
    <div v-if="!isLoading && !errorMessage" class="content">
      <!-- 商家信息概览 -->
      <div class="merchant-overview card">
        <div class="card-header">
          <h2 class="card-title">
            <span class="title-icon">🏪</span>
            {{ merchant.storename || '未知商家' }}
          </h2>
        </div>
        <p class="description">{{ merchant.storeDescription || '暂无商家描述' }}</p>
        <div class="merchant-stats">
          <div class="stat-item">
            <span class="stat-label">总菜品</span>
            <span class="stat-value">{{ dishes.length }}</span>
          </div>
        </div>
      </div>

      <!-- 天气信息 -->
      <div class="weather-card card">
        <div class="card-header">
          <h3 class="card-title">
            <span class="title-icon">🌤️</span>
            今日天气 (上海嘉定)
          </h3>
        </div>
        <div v-if="weatherInfo" class="weather-content">
          <div class="weather-main">
            <div class="temperature-display">
              <span class="temperature">{{ weatherInfo.temperature }}°C</span>
              <span class="weather-desc">{{ weatherInfo.weather }}</span>
            </div>
          </div>
          <div class="weather-details">
            <div class="weather-item">
              <span class="weather-label">💧 湿度</span>
              <span class="weather-value">{{ weatherInfo.humidity }}%</span>
            </div>
            <div class="weather-item">
              <span class="weather-label">🧭 风向</span>
              <span class="weather-value">{{ weatherInfo.winddirection }}</span>
            </div>
            <div class="weather-item">
              <span class="weather-label">💨 风力</span>
              <span class="weather-value">{{ weatherInfo.windpower }}级</span>
            </div>
          </div>
        </div>
        <div v-else class="weather-unavailable">
          <span class="unavailable-icon">🌫️</span>
          <span>天气信息暂不可用</span>
        </div>
      </div>

      <!-- 销量统计 -->
      <div class="sales-stats card">
        <div class="card-header">
          <h3 class="card-title">
            <span class="title-icon">📊</span>
            菜品销量统计
          </h3>
        </div>

        <div class="stats-grid">
          <div class="stat-card orders">
            <div class="stat-icon">📋</div>
            <div class="stat-content">
              <span class="stat-number">{{ salesStats.totalOrders }}</span>
              <span class="stat-label">总订单数</span>
            </div>
          </div>
          <div class="stat-card items">
            <div class="stat-icon">🍽️</div>
            <div class="stat-content">
              <span class="stat-number">{{ salesStats.totalItemsSold }}</span>
              <span class="stat-label">总销量</span>
            </div>
          </div>
          <div class="stat-card revenue" v-if="salesStats.totalRevenue">
            <div class="stat-icon">💰</div>
            <div class="stat-content">
              <span class="stat-number">¥{{ salesStats.totalRevenue }}</span>
              <span class="stat-label">总营收</span>
            </div>
          </div>
          <div class="stat-card average" v-if="salesStats.averageOrderValue">
            <div class="stat-icon">📈</div>
            <div class="stat-content">
              <span class="stat-number">¥{{ salesStats.averageOrderValue }}</span>
              <span class="stat-label">平均订单</span>
            </div>
          </div>
        </div>

        <!-- 热销菜品排行 -->
        <div class="popular-dishes" v-if="salesStats.popularDishes?.length > 0">
          <h4 class="section-title">
            <span class="section-icon">🔥</span>
            热销菜品TOP5
          </h4>
          <div class="dish-list">
            <div v-for="(dish, index) in salesStats.popularDishes.slice(0, 5)" :key="dish.name" class="dish-item"
              :class="`rank-${index + 1}`">
              <div class="rank-badge">
                <span class="rank-number">{{ index + 1 }}</span>
                <span class="rank-crown" v-if="index === 0">👑</span>
              </div>
              <div class="dish-info">
                <span class="dish-name">{{ dish.name }}</span>
                <div class="dish-stats">
                  <span class="dish-count">{{ dish.count }}份</span>
                  <div class="popularity-bar">
                    <div class="popularity-fill"
                      :style="{ width: `${(dish.count / salesStats.popularDishes[0].count) * 100}%` }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-data">
          <span class="no-data-icon">📝</span>
          <span>暂无销量数据</span>
        </div>
      </div>

      <!-- AI备菜建议 -->
      <div class="ai-suggestions card">
        <div class="card-header">
          <h3 class="card-title">
            <span class="title-icon">🧠</span>
            AI备菜建议
          </h3>
          <button @click="generateSuggestions" class="generate-btn" :disabled="isGenerating"
            :class="{ 'generating': isGenerating }">
            <span class="btn-icon" v-if="!isGenerating">✨</span>
            <span class="btn-spinner" v-if="isGenerating"></span>
            {{ isGenerating ? '生成中...' : '生成建议' }}
          </button>
        </div>

        <div v-if="aiSuggestions" class="suggestions-content">
          <div class="suggestion-card" v-html="formatSuggestions(aiSuggestions)"></div>
        </div>

        <div v-if="!aiSuggestions && !isGenerating" class="no-suggestions">
          <div class="no-suggestions-content">
            <div class="no-suggestions-icon">🤔</div>
            <h4>准备为您生成专业建议</h4>
            <p>点击上方按钮，AI将根据您的销量数据和天气情况生成个性化备菜建议</p>
          </div>
        </div>

        <div v-if="isGenerating" class="generating-content">
          <div class="generating-animation">
            <div class="brain-icon">🧠</div>
            <div class="thinking-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <p>AI正在深度分析您的数据...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
// 注意：实际使用时需要确保API服务可用
// import { chatCompletion, getJiadingWeather } from '/src/services/hunyuanApi.js';

const merchant = ref({
  id: null,
  storename: '',
  storeDescription: ''
})

const salesStats = ref({
  totalOrders: 0,
  totalRevenue: 0,
  popularDishes: [],
  averageOrderValue: 0,
  totalItemsSold: 0
})

const dishes = ref([])
const weatherInfo = ref(null)
const aiSuggestions = ref('')
const isLoading = ref(true)
const isGenerating = ref(false)
const errorMessage = ref('')

// 获取商家信息
const fetchMerchant = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) throw new Error('用户未登录')

    const response = await fetch(`http://localhost:8080/api/merchants/user/${user.id}`)
    if (!response.ok) throw new Error('获取商家信息失败')

    const data = await response.json()
    merchant.value = {
      id: data.id,
      storename: data.storeName || '',
      storeDescription: data.storeDescription || ''
    }
  } catch (error) {
    console.error('Error fetching merchant:', error)
    throw error
  }
}

// 获取商家菜品
const fetchDishes = async () => {
  try {
    if (!merchant.value.id) return

    const response = await fetch(`http://localhost:8080/api/dishes/merchant/${merchant.value.id}`)
    if (!response.ok) throw new Error('获取菜品失败')

    const data = await response.json()
    dishes.value = Array.isArray(data) ? data.map(dish => dish.name || '未知菜品') : []
  } catch (error) {
    console.error('Error fetching dishes:', error)
    dishes.value = []
  }
}

// 获取销售统计
const fetchSalesStats = async () => {
  try {
    if (!merchant.value.id) return

    const ordersResponse = await fetch(`http://localhost:8080/api/orders/merchant/${merchant.value.id}`)
    if (!ordersResponse.ok) throw new Error('获取订单列表失败')
    const orders = await ordersResponse.json()

    if (!Array.isArray(orders) || orders.length === 0) {
      salesStats.value = {
        totalOrders: 0,
        totalRevenue: 0,
        popularDishes: [],
        averageOrderValue: 0,
        totalItemsSold: 0
      }
      return
    }

    let totalRevenue = 0
    const dishCounts = {}

    const orderItemsRequests = orders.map(async order => {
      try {
        const itemsResponse = await fetch(`http://localhost:8080/api/order-items/by-order/${order.id}`)
        if (!itemsResponse.ok) return []
        return await itemsResponse.json()
      } catch (error) {
        console.error(`获取订单 ${order.id} 的订单项失败:`, error)
        return []
      }
    })

    const allOrderItems = await Promise.all(orderItemsRequests)

    allOrderItems.forEach(orderItems => {
      if (!Array.isArray(orderItems)) return

      orderItems.forEach(item => {
        if (!item || !item.dish) return

        const price = Number(item.price) || 0
        const quantity = Number(item.quantity) || 0

        totalRevenue += price

        const dishId = item.dish.id
        const dishName = item.dish.name || '未知菜品'

        if (dishCounts[dishId]) {
          dishCounts[dishId].count += quantity
        } else {
          dishCounts[dishId] = {
            name: dishName,
            count: quantity
          }
        }
      })
    })

    const popularDishes = Object.values(dishCounts)
      .filter(dish => dish.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const totalItemsSold = Object.values(dishCounts).reduce((sum, dish) => sum + dish.count, 0)

    salesStats.value = {
      totalOrders: orders.length,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      popularDishes,
      averageOrderValue: orders.length > 0 ? parseFloat((totalRevenue / orders.length).toFixed(2)) : 0,
      totalItemsSold
    }
  } catch (error) {
    console.error('获取销售统计失败:', error)
    // 设置默认值而不是抛出错误
    salesStats.value = {
      totalOrders: 0,
      totalRevenue: 0,
      popularDishes: [],
      averageOrderValue: 0,
      totalItemsSold: 0
    }
  }
}

// 获取天气信息
const fetchWeather = async () => {
  try {
    // 注意：实际使用时需要确保API可用
    // const weather = await getJiadingWeather('base')
    // weatherInfo.value = weather

    // 模拟数据，实际使用时删除这部分
    weatherInfo.value = {
      temperature: 22,
      weather: '多云',
      humidity: 65,
      winddirection: '东南',
      windpower: 3
    }
  } catch (error) {
    console.error('获取天气信息失败:', error)
    weatherInfo.value = null
  }
}

// 生成AI备菜建议
const generateSuggestions = async () => {
  try {
    isGenerating.value = true
    aiSuggestions.value = ''

    // 构建提示词
    const prompt = buildPrompt()

    const messages = [
      {
        role: 'system',
        content: '你是一个专业的餐饮AI助手，擅长根据销量数据和天气情况为商家提供备菜建议。请提供具体、实用的建议。'
      },
      {
        role: 'user',
        content: prompt
      }
    ]

    // 注意：实际使用时需要确保API可用
    // const response = await chatCompletion(messages, 'hunyuan-pro', 0.7)
    // aiSuggestions.value = response.choices[0].message.content

    // 模拟响应，实际使用时删除这部分
    await new Promise(resolve => setTimeout(resolve, 3000))
    aiSuggestions.value = generateMockSuggestions()

  } catch (error) {
    console.error('生成AI建议失败:', error)
    aiSuggestions.value = '抱歉，AI建议生成失败，请稍后重试。可能是网络连接问题或服务暂时不可用。'
  } finally {
    isGenerating.value = false
  }
}

// 构建AI提示词
const buildPrompt = () => {
  const weatherDesc = weatherInfo.value
    ? `今日天气：${weatherInfo.value.weather}，温度${weatherInfo.value.temperature}°C，湿度${weatherInfo.value.humidity}%，${weatherInfo.value.winddirection}风${weatherInfo.value.windpower}级`
    : '天气信息暂不可用'

  const popularDishesDesc = salesStats.value.popularDishes?.length > 0
    ? salesStats.value.popularDishes.map((dish, index) => `${index + 1}. ${dish.name} (${dish.count}份)`).join('\n')
    : '暂无销量数据'

  const allDishesDesc = dishes.value.length > 0
    ? dishes.value.join('、')
    : '暂无菜品信息'

  return `
请根据以下信息为商家提供今日备菜建议：

【商家信息】
商家名称：${merchant.value.storename || '未知商家'}
商家描述：${merchant.value.storeDescription || '暂无描述'}
供应菜品：${allDishesDesc}

【天气信息】
${weatherDesc}

【销量数据】
总订单数：${salesStats.value.totalOrders}
总销售份数：${salesStats.value.totalItemsSold}
热销菜品排行：
${popularDishesDesc}

请你分析并提供：
1. 根据天气情况预测今日客流和菜品需求变化
2. 基于历史销售数据，建议热销菜品的备菜量
3. 考虑天气因素，推荐可能受青睐的菜品类型
4. 提供具体的备菜清单和数量建议
5. 给出特别提醒和注意事项

请用专业但友好的语气回复，提供具体可操作的建议。重点关注：
- 备菜数量的合理性（避免浪费和缺货）
- 天气对食欲的影响
- 成本控制建议
- 食材新鲜度管理

用中文回复，结构清晰，重点突出。`
}

// 生成模拟建议（实际使用时删除）
const generateMockSuggestions = () => {
  return `
## 🌤️ 天气分析与客流预测

根据今日**多云天气，22°C**的舒适温度，预计客流量会比较稳定。适中的温度和湿度有利于顾客外出就餐。

## 📊 基于销量数据的备菜建议

### 热销菜品备菜量建议：
1. **重点准备热销前3名菜品** - 建议备菜量增加20%
2. **中等热销菜品** - 按平均销量准备
3. **新品或低销量菜品** - 适量准备，避免浪费

## 🍽️ 天气适宜菜品推荐

**多云适温天气特别推荐：**
- 清爽类菜品：凉拌菜、沙拉类
- 温热汤品：适合微凉时段
- 烧烤类：户外感觉良好

## ⚠️ 特别提醒

- **食材新鲜度**：多云天气湿度适中，注意蔬菜保鲜
- **备菜时间**：建议分批备菜，确保新鲜度
- **成本控制**：根据历史数据，避免过量准备

## 💡 今日运营建议

建议适当推广清爽类菜品，准备一些适合分享的菜品以应对可能的聚餐需求。`
}

// 格式化AI建议显示 - 支持markdown语法
const formatSuggestions = (text) => {
  if (!text) return ''

  return text
    // 标题处理
    .replace(/### ([^\n]+)/g, '<h3 class="suggestion-h3">$1</h3>')
    .replace(/## ([^\n]+)/g, '<h2 class="suggestion-h2">$1</h2>')
    .replace(/# ([^\n]+)/g, '<h1 class="suggestion-h1">$1</h1>')
    // 中文标题标记
    .replace(/【([^】]+)】/g, '<h4 class="suggestion-h4">$1</h4>')
    // 粗体
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="suggestion-bold">$1</strong>')
    // 斜体
    .replace(/\*([^*]+)\*/g, '<em class="suggestion-italic">$1</em>')
    // 有序列表
    .replace(/(\d+\.\s+)([^\n]+)/g, '<div class="suggestion-list-item"><span class="suggestion-number">$1</span><span class="suggestion-text">$2</span></div>')
    // 无序列表
    .replace(/[-*]\s+([^\n]+)/g, '<div class="suggestion-bullet-item"><span class="suggestion-bullet">•</span><span class="suggestion-text">$1</span></div>')
    // 代码块
    .replace(/```([^`]+)```/g, '<pre class="suggestion-code">$1</pre>')
    // 行内代码
    .replace(/`([^`]+)`/g, '<code class="suggestion-inline-code">$1</code>')
    // 换行
    .replace(/\n/g, '<br>')
    // 清理多余的br
    .replace(/<br><br>/g, '<br>')
}

// 刷新数据
const refreshData = async () => {
  errorMessage.value = ''
  isLoading.value = true
  try {
    await loadAllData()
  } catch (error) {
    errorMessage.value = error.message || '加载数据失败，请检查网络连接'
  } finally {
    isLoading.value = false
  }
}

// 加载所有数据
const loadAllData = async () => {
  await fetchMerchant()
  // 并发执行，加快加载
  await Promise.all([
    fetchDishes(),
    fetchSalesStats(),
    fetchWeather()
  ])
}

// 初始化
onMounted(async () => {
  isLoading.value = true
  try {
    await loadAllData()
  } catch (error) {
    errorMessage.value = error.message || '初始化失败，请检查网络连接和API服务状态'
  } finally {
    isLoading.value = false
  }
})

</script>

<style scoped>
* {
  box-sizing: border-box;
}

.ai-cooking-assistant {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

/* 头部样式 */
.header {
  position: relative;
  text-align: center;
  margin-bottom: 40px;
  padding: 60px 20px;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="80" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="40" cy="70" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="30" r="1" fill="rgba(255,255,255,0.1)"/></svg>');
  animation: float 20s ease-in-out infinite;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-20px);
  }
}

.header-content {
  position: relative;
  z-index: 1;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.icon {
  font-size: 2rem;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {

  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }

  40% {
    transform: translateY(-10px);
  }

  60% {
    transform: translateY(-5px);
  }
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
  font-weight: 300;
}

/* 卡片通用样式 */
.card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  margin-bottom: 24px;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f1f3f5;
}

.card-title {
  margin: 0;
  color: #2c3e50;
  font-size: 1.4rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  font-size: 1.2rem;
}

/* 加载状态 */
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.loading-container {
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-bottom: 20px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  background: #667eea;
  border-radius: 50%;
  animation: loading-bounce 1.4s ease-in-out infinite both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

.loading-dots span:nth-child(3) {
  animation-delay: 0s;
}

@keyframes loading-bounce {

  0%,
  80%,
  100% {
    transform: scale(0);
  }

  40% {
    transform: scale(1);
  }
}

.loading-text {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

/* 错误信息 */
.error-message {
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  color: white;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(255, 107, 107, 0.3);
  display: flex;
  align-items: center;
  gap: 20px;
  margin: 40px 0;
}

.error-icon {
  font-size: 3rem;
  opacity: 0.9;
}

.error-content {
  flex: 1;
  text-align: left;
}

.error-content h3 {
  margin: 0 0 8px 0;
  font-size: 1.3rem;
}

.error-content p {
  margin: 0 0 16px 0;
  opacity: 0.9;
}

.retry-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.retry-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 1rem;
}

/* 内容布局 */
.content {
  display: grid;
  gap: 24px;
}

/* 商家信息 */
.merchant-overview {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.merchant-overview .card-title {
  color: white;
}

.description {
  margin: 0 0 20px 0;
  opacity: 0.9;
  font-size: 1.1rem;
  line-height: 1.6;
}

.merchant-stats {
  display: flex;
  gap: 24px;
  margin-top: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 16px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
}

/* 天气卡片 */
.weather-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.weather-main {
  flex: 1;
  min-width: 200px;
}

.temperature-display {
  display: flex;
  align-items: center;
  gap: 16px;
}

.temperature {
  font-size: 3rem;
  font-weight: 700;
  color: #e74c3c;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.weather-desc {
  font-size: 1.3rem;
  color: #34495e;
  font-weight: 500;
}

.weather-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.weather-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.weather-item:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.weather-label {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 4px;
}

.weather-value {
  font-weight: 600;
  color: #495057;
}

.weather-unavailable {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  color: #6c757d;
  font-style: italic;
}

.unavailable-icon {
  font-size: 1.5rem;
  opacity: 0.7;
}

/* 销量统计 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.1;
  transition: opacity 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.stat-card:hover::before {
  opacity: 0.15;
}

.stat-card.orders {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

.stat-card.items {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
}

.stat-card.revenue {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
}

.stat-card.average {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  color: white;
}

.stat-icon {
  font-size: 2.5rem;
  opacity: 0.9;
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
  font-weight: 300;
}

/* 热销菜品 */
.section-title {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  font-size: 1.1rem;
}

.dish-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dish-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  gap: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.dish-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.05;
  transition: opacity 0.3s ease;
}

.dish-item:hover {
  transform: translateX(8px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.dish-item:hover::before {
  opacity: 0.1;
}

.dish-item.rank-1 {
  background: linear-gradient(135deg, #f1c40f, #f39c12);
}

.dish-item.rank-1::before {
  background: #f39c12;
}

.dish-item.rank-2 {
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
}

.dish-item.rank-2::before {
  background: #7f8c8d;
}

.dish-item.rank-3 {
  background: linear-gradient(135deg, #cd7f32, #b8860b);
}

.dish-item.rank-3::before {
  background: #b8860b;
}

.dish-item.rank-4,
.dish-item.rank-5 {
  background: linear-gradient(135deg, #ecf0f1, #bdc3c7);
}

.dish-item.rank-4::before,
.dish-item.rank-5::before {
  background: #bdc3c7;
}

.rank-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.rank-number {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.rank-crown {
  font-size: 1.2rem;
}

.dish-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dish-name {
  font-weight: 600;
  font-size: 1.1rem;
  color: #2c3e50;
}

.dish-stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dish-count {
  color: #e74c3c;
  font-weight: 600;
  font-size: 1rem;
}

.popularity-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  overflow: hidden;
}

.popularity-fill {
  height: 100%;
  background: linear-gradient(90deg, #e74c3c, #c0392b);
  border-radius: 3px;
  transition: width 0.8s ease;
}

.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px;
  color: #6c757d;
  font-style: italic;
}

.no-data-icon {
  font-size: 1.5rem;
  opacity: 0.7;
}

/* AI建议部分 */
.generate-btn {
  background: linear-gradient(135deg, #27ae60, #229954);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
}

.generate-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #229954, #1e8449);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(39, 174, 96, 0.4);
}

.generate-btn:disabled {
  background: linear-gradient(135deg, #bdc3c7, #95a5a6);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.generate-btn.generating {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.suggestions-content {
  line-height: 1.6;
}

.suggestion-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  padding: 32px;
  border-radius: 16px;
  border: 2px solid #e9ecef;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  line-height: 1.8;
  font-size: 1rem;
}

/* AI建议内容样式 */
.suggestion-card .suggestion-h1 {
  color: #27ae60;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 32px 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 3px solid #27ae60;
  position: relative;
}

.suggestion-card .suggestion-h1::before {
  content: '🎯';
  margin-right: 12px;
}

.suggestion-card .suggestion-h2 {
  color: #2980b9;
  font-size: 1.4rem;
  font-weight: 600;
  margin: 28px 0 16px 0;
  padding: 12px 0 12px 20px;
  border-left: 4px solid #2980b9;
  background: linear-gradient(90deg, rgba(41, 128, 185, 0.1) 0%, transparent 100%);
  border-radius: 0 8px 8px 0;
  position: relative;
}

.suggestion-card .suggestion-h3 {
  color: #e67e22;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 24px 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.suggestion-card .suggestion-h4 {
  color: #8e44ad;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 20px 0 12px 0;
  padding: 10px 16px;
  background: linear-gradient(90deg, rgba(142, 68, 173, 0.1) 0%, transparent 100%);
  border-left: 4px solid #8e44ad;
  border-radius: 0 8px 8px 0;
}

.suggestion-card .suggestion-bold {
  color: #2c3e50;
  font-weight: 600;
  background: linear-gradient(90deg, rgba(52, 152, 219, 0.12) 0%, transparent 100%);
  padding: 3px 6px;
  border-radius: 4px;
  border-left: 2px solid #3498db;
}

.suggestion-card .suggestion-italic {
  color: #7f8c8d;
  font-style: italic;
}

.suggestion-list-item {
  display: flex;
  align-items: flex-start;
  margin: 12px 0;
  padding: 16px;
  background: rgba(39, 174, 96, 0.08);
  border-radius: 12px;
  border-left: 4px solid #27ae60;
  transition: all 0.3s ease;
  position: relative;
}

.suggestion-list-item:hover {
  background: rgba(39, 174, 96, 0.15);
  transform: translateX(4px);
}

.suggestion-number {
  color: #27ae60;
  font-weight: 700;
  min-width: 40px;
  font-size: 1rem;
  background: rgba(39, 174, 96, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
  margin-right: 8px;
}

.suggestion-bullet-item {
  display: flex;
  align-items: flex-start;
  margin: 10px 0;
  padding: 12px 16px;
  background: rgba(52, 152, 219, 0.08);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.suggestion-bullet-item:hover {
  background: rgba(52, 152, 219, 0.15);
  transform: translateX(4px);
}

.suggestion-bullet {
  color: #3498db;
  font-weight: bold;
  min-width: 24px;
  font-size: 1.2rem;
  margin-right: 8px;
}

.suggestion-text {
  flex: 1;
  color: #34495e;
  line-height: 1.6;
}

.suggestion-code {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 20px;
  border-radius: 12px;
  margin: 16px 0;
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  overflow-x: auto;
  border-left: 4px solid #3498db;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.suggestion-inline-code {
  background: #ecf0f1;
  color: #e74c3c;
  padding: 4px 8px;
  border-radius: 6px;
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  font-size: 0.9rem;
  border: 1px solid #bdc3c7;
  font-weight: 500;
}

/* 无建议状态 */
.no-suggestions {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
}

.no-suggestions-content {
  text-align: center;
  max-width: 400px;
}

.no-suggestions-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.7;
}

.no-suggestions-content h4 {
  color: #2c3e50;
  font-size: 1.3rem;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.no-suggestions-content p {
  color: #7f8c8d;
  margin: 0;
  line-height: 1.6;
}

/* 生成中状态 */
.generating-content {
  text-align: center;
  padding: 40px 20px;
}

.generating-animation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
}

.brain-icon {
  font-size: 3rem;
  animation: pulse 2s ease-in-out infinite;
}

.thinking-dots {
  display: flex;
  gap: 6px;
}

.thinking-dots span {
  width: 12px;
  height: 12px;
  background: #667eea;
  border-radius: 50%;
  animation: thinking-bounce 1.4s ease-in-out infinite both;
}

.thinking-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.thinking-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

.thinking-dots span:nth-child(3) {
  animation-delay: 0s;
}

@keyframes thinking-bounce {

  0%,
  80%,
  100% {
    transform: scale(0.8) translateY(0);
  }

  40% {
    transform: scale(1.2) translateY(-10px);
  }
}

.generating-content p {
  color: #666;
  font-size: 1.1rem;
  margin: 0;
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ai-cooking-assistant {
    padding: 16px;
  }

  .title {
    font-size: 2rem;
    flex-direction: column;
    gap: 8px;
  }

  .subtitle {
    font-size: 1rem;
  }

  .card {
    padding: 20px;
  }

  .card-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .weather-content {
    flex-direction: column;
  }

  .temperature-display {
    justify-content: center;
    text-align: center;
  }

  .weather-details {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .merchant-stats {
    justify-content: center;
  }

  .dish-item {
    flex-wrap: wrap;
  }

  .dish-stats {
    width: 100%;
    margin-top: 8px;
  }

  .suggestion-card {
    padding: 24px 20px;
    font-size: 0.95rem;
  }

  .suggestion-card .suggestion-h1 {
    font-size: 1.5rem;
  }

  .suggestion-card .suggestion-h2 {
    font-size: 1.2rem;
  }

  .suggestion-list-item,
  .suggestion-bullet-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .error-message {
    flex-direction: column;
    text-align: center;
  }

  .error-content {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .temperature {
    font-size: 2.5rem;
  }

  .weather-desc {
    font-size: 1.1rem;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .stat-icon {
    font-size: 2rem;
  }
}
</style>