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
.ai-cooking-assistant {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f0f5 100%);
  min-height: calc(100vh - 60px);
}

/* 头部样式 */
.header {
  position: relative;
  margin-bottom: 25px;
  padding: 30px;
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 77, 128, 0.1);
  border: 1px solid rgba(0, 77, 128, 0.15);
  overflow: hidden;
}

.header-content {
  position: relative;
  z-index: 1;
}

.title {
  color: #004d80;
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon {
  font-size: 32px;
}

.subtitle {
  color: #2c3e50;
  font-size: 16px;
  margin: 0;
}

.header-bg {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(135deg, rgba(198, 224, 240, 0.2) 0%, rgba(176, 209, 232, 0.1) 100%);
  z-index: 0;
}

/* 卡片通用样式 */
.card {
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 77, 128, 0.1);
  border: 1px solid rgba(0, 77, 128, 0.15);
  margin-bottom: 25px;
  overflow: hidden;
  transition: all 0.3s;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 77, 128, 0.15);
}

.card-header {
  padding: 20px;
  background: linear-gradient(135deg, #c6e0f0 0%, #b0d1e8 100%);
  border-bottom: 1px solid rgba(0, 77, 128, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  color: #004d80;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-icon {
  font-size: 24px;
}

/* 商家概览样式 */
.merchant-overview {
  padding: 20px;
}

.description {
  color: #2c3e50;
  margin: 15px 0;
  line-height: 1.6;
}

.merchant-stats {
  display: flex;
  gap: 20px;
  margin-top: 15px;
}

.stat-item {
  background: linear-gradient(135deg, #e8f0f5 0%, #d3e4ed 100%);
  padding: 12px 20px;
  border-radius: 10px;
  border: 1px solid rgba(0, 77, 128, 0.1);
}

.stat-label {
  color: #004d80;
  font-size: 14px;
  font-weight: 500;
}

.stat-value {
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
  margin-left: 8px;
}

/* 天气卡片样式 */
.weather-card {
  padding: 20px;
}

.weather-content {
  padding: 20px;
}

.weather-main {
  text-align: center;
  margin-bottom: 20px;
}

.temperature-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.temperature {
  font-size: 36px;
  font-weight: 600;
  color: #004d80;
}

.weather-desc {
  color: #2c3e50;
  font-size: 18px;
}

.weather-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.weather-item {
  background: linear-gradient(135deg, #e8f0f5 0%, #d3e4ed 100%);
  padding: 12px;
  border-radius: 10px;
  border: 1px solid rgba(0, 77, 128, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.weather-label {
  color: #004d80;
  font-size: 14px;
}

.weather-value {
  color: #2c3e50;
  font-size: 16px;
  font-weight: 500;
}

/* 销量统计样式 */
.sales-stats {
  padding: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.stat-card {
  background: linear-gradient(135deg, #e8f0f5 0%, #d3e4ed 100%);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(0, 77, 128, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 24px;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-number {
  color: #004d80;
  font-size: 24px;
  font-weight: 600;
}

.stat-label {
  color: #2c3e50;
  font-size: 14px;
}

/* 热销菜品样式 */
.popular-dishes {
  margin-top: 25px;
}

.section-title {
  color: #004d80;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 15px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dish-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dish-item {
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid rgba(0, 77, 128, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
}

.rank-badge {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #c6e0f0 0%, #b0d1e8 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.rank-number {
  color: #004d80;
  font-weight: 600;
}

.rank-crown {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 20px;
}

.dish-info {
  flex: 1;
}

.dish-name {
  color: #2c3e50;
  font-weight: 500;
  margin-bottom: 5px;
  display: block;
}

.dish-stats {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dish-count {
  color: #004d80;
  font-size: 14px;
  min-width: 60px;
}

.popularity-bar {
  flex: 1;
  height: 6px;
  background: rgba(0, 77, 128, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.popularity-fill {
  height: 100%;
  background: linear-gradient(90deg, #c6e0f0 0%, #b0d1e8 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* AI建议样式 */
.ai-suggestions {
  padding: 20px;
}

.generate-btn {
  background: linear-gradient(135deg, #c6e0f0 0%, #b0d1e8 100%);
  border: 1px solid rgba(0, 77, 128, 0.2);
  color: #004d80;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 77, 128, 0.15);
  background: linear-gradient(135deg, #b0d1e8 0%, #a0c8e0 100%);
}

.generate-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.suggestions-content {
  padding: 20px;
}

.suggestion-card {
  background: linear-gradient(135deg, #e8f0f5 0%, #d3e4ed 100%);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(0, 77, 128, 0.1);
  color: #2c3e50;
  line-height: 1.6;
}

/* 加载状态样式 */
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-container {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 77, 128, 0.1);
  border-top-color: #004d80;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-bottom: 15px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  background: #004d80;
  border-radius: 50%;
  animation: dots 1.4s infinite ease-in-out;
}

.loading-dots span:nth-child(1) { animation-delay: 0s; }
.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }

.loading-text {
  color: #004d80;
  font-size: 16px;
}

/* 错误信息样式 */
.error-message {
  background: linear-gradient(135deg, #fff5f5 0%, #ffe3e3 100%);
  border: 1px solid rgba(245, 108, 108, 0.2);
  border-radius: 15px;
  padding: 30px;
  text-align: center;
  margin: 20px 0;
}

.error-icon {
  font-size: 32px;
  margin-bottom: 15px;
}

.error-content h3 {
  color: #f56c6c;
  margin: 0 0 10px 0;
}

.error-content p {
  color: #2c3e50;
  margin: 0 0 20px 0;
}

.retry-btn {
  background: linear-gradient(135deg, #f56c6c 0%, #e64242 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.2);
}

/* 动画 */
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes dots {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ai-cooking-assistant {
    padding: 15px;
  }
  
  .header {
    padding: 20px;
  }
  
  .title {
    font-size: 24px;
  }
  
  .subtitle {
    font-size: 14px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .weather-details {
    grid-template-columns: 1fr;
  }
  
  .dish-item {
    padding: 12px;
  }
  
  .stat-card {
    padding: 15px;
  }
  
  .stat-number {
    font-size: 20px;
  }
}
</style>