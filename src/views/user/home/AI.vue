<template>
  <div class="ai-page">
    <div class="ai-header">
      <h2 class="ai-title">
        <i class="fas fa-robot"></i>
        AI智能菜品推荐助手
      </h2>
      <div class="weather-info" v-if="currentWeather">
        <i class="fas fa-cloud-sun"></i>
        <span>{{ currentWeather.weather }} {{ currentWeather.temperature }}°C</span>
      </div>
    </div>

    <div class="ai-content">
      <!-- 快速推荐按钮组 -->
      <div class="quick-actions">
        <button @click="getWeatherAndRecommend" :disabled="chatLoading" class="action-btn weather-btn">
          <i class="fas fa-cloud-sun"></i>
          天气推荐
        </button>
        <button @click="getRandomRecommend" :disabled="chatLoading" class="action-btn random-btn">
          <i class="fas fa-dice"></i>
          随机推荐
        </button>
        <button @click="getHealthyRecommend" :disabled="chatLoading" class="action-btn healthy-btn">
          <i class="fas fa-heartbeat"></i>
          健康推荐
        </button>
      </div>

      <!-- 消息区域 -->
      <div class="chat-messages" ref="messagesContainer">
        <div v-for="(message, index) in messages" :key="index" class="message" :class="message.role">
          <div class="message-header">
            <div class="message-avatar">
              <i :class="message.role === 'user' ? 'fas fa-user' : 'fas fa-robot'"></i>
            </div>
            <div class="message-info">
              <strong>{{ message.role === 'user' ? '你' : 'AI菜品助手' }}</strong>
              <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
            </div>
          </div>
          <div class="message-content" v-html="formatMessage(message.content)"></div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="chat-input">
        <div class="input-group">
          <div class="input-wrapper">
            <i class="fas fa-comment-alt"></i>
            <input 
              v-model="userInput" 
              @keyup.enter="sendMessage" 
              :disabled="chatLoading"
              placeholder="告诉我你的口味偏好、饮食限制或想吃什么..." 
              class="message-input" 
            />
          </div>
          <button 
            @click="sendMessage" 
            :disabled="chatLoading || !userInput.trim()" 
            class="send-btn"
          >
            <i class="fas fa-paper-plane"></i>
            <span>{{ chatLoading ? '发送中...' : '发送' }}</span>
          </button>
        </div>
      </div>

      <!-- 加载动画 -->
      <div v-if="chatLoading" class="loading">
        <div class="spinner"></div>
        <span>AI正在为你精心挑选菜品...</span>
      </div>

      <!-- 建议标签 -->
      <div class="suggestion-tags" v-if="!chatLoading && messages.length <= 1">
        <span class="tag-label">
          <i class="fas fa-lightbulb"></i>
          试试这些：
        </span>
        <button 
          v-for="suggestion in suggestions" 
          :key="suggestion" 
          @click="useSuggestion(suggestion)"
          class="suggestion-tag"
        >
          {{ suggestion }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue';
import { chatCompletion, getJiadingWeather } from '../../../services/hunyuanApi.js';

const userInput = ref('');
const messages = ref([]);
const chatLoading = ref(false);
const currentWeather = ref(null);
const messagesContainer = ref(null);
const dishesData = ref([]);

// 建议标签
const suggestions = ref([
  '素食推荐', '下饭菜', '汤品推荐', '快手菜',
  '养生菜品', '减肥餐', '暖胃汤'
]);

// 初始化
onMounted(async () => {
  await initializeData();
  initializeChat();
});
// 获取菜品数据
const fetchDishes = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/dishes');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    dishesData.value = data;
    return data;
  } catch (error) {
    console.error('获取菜品数据失败:', error);
    // 返回默认菜品数据作为备选
    return getDefaultDishes();
  }
};
// 默认菜品数据（API失败时的备选）
const getDefaultDishes = () => {
  return [
    // { id: 1, name: '麻辣香锅', category: '热菜', tags: ['辣', '热'], difficulty: '中等', cookingTime: '30分钟' },
    // { id: 2, name: '凉拌黄瓜', category: '凉菜', tags: ['清爽', '简单'], difficulty: '简单', cookingTime: '10分钟' },
    // { id: 3, name: '蒸蛋羹', category: '蒸菜', tags: ['嫩滑', '营养'], difficulty: '简单', cookingTime: '15分钟' },
    // { id: 4, name: '番茄鸡蛋面', category: '面食', tags: ['酸甜', '快手'], difficulty: '简单', cookingTime: '15分钟' },
    // { id: 5, name: '青菜豆腐汤', category: '汤品', tags: ['清淡', '健康'], difficulty: '简单', cookingTime: '20分钟' }
  ];
};

// 初始化数据
const initializeData = async () => {
  try {
    // 并行获取菜品数据和天气数据
    const [dishes, weather] = await Promise.all([
      fetchDishes(),
      getJiadingWeather('base').catch(() => null)
    ]);

    dishesData.value = dishes;
    currentWeather.value = weather;
  } catch (error) {
    console.error('初始化数据失败:', error);
  }
};

// 初始化聊天
const initializeChat = () => {
  messages.value = [
    {
      role: 'assistant',
      content: '你好！我是AI菜品助手🤖，可以根据天气、心情、口味偏好为你推荐合适的菜品。我已经为你准备了丰富的菜品库，快告诉我你想吃什么吧！',
      timestamp: new Date()
    }
  ];
};
// 构建AI推荐的系统提示词
const buildSystemPrompt = (weatherData = null, userPreference = '') => {
  const dishesInfo = dishesData.value.map(dish =>
    `${dish.name}(${dish.category}) - 标签: ${dish.tags?.join(', ') || '无'} - 难度: ${dish.difficulty || '未知'} - 耗时: ${dish.cookingTime || '未知'}`
  ).join('\n');

  let prompt = `你是一个专业的AI菜品推荐助手，为点餐用户推荐点餐建议。以下是可用的菜品信息（请将推荐仅在菜品栏中餐品）：

${dishesInfo}

请根据以下要求提供推荐：
1. 从菜品栏中选择合适的推荐
2. 考虑菜品的营养搭配和口味平衡
3. 提供具体的推荐理由
4. 回复字数在200字以内
`;


  if (weatherData) {
    prompt += `\n\n当前天气情况：
- 天气: ${weatherData.weather}
- 温度: ${weatherData.temperature}°C
- 湿度: ${weatherData.humidity}%


请根据天气情况推荐合适的菜品。`;
  }

  if (userPreference) {
    prompt += `\n\n用户偏好或要求：${userPreference}`;
  }

  return prompt;
};

// 发送消息
const sendMessage = async () => {
  if (!userInput.value.trim()) return;

  const userMessage = {
    role: 'user',
    content: userInput.value,
    timestamp: new Date()
  };

  messages.value.push(userMessage);
  const currentMessage = userInput.value;
  userInput.value = '';
  chatLoading.value = true;

  try {
    // 构建包含菜品信息的消息历史
    const systemPrompt = buildSystemPrompt(currentWeather.value, currentMessage);
    const conversationMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.value.slice(-5) // 只保留最近5条消息避免token过多
    ];

    const response = await chatCompletion(conversationMessages);

    if (response.choices && response.choices.length > 0) {
      const aiMessage = {
        ...response.choices[0].message,
        timestamp: new Date()
      };
      messages.value.push(aiMessage);
    }
  } catch (error) {
    console.error('聊天请求失败:', error);
    messages.value.push({
      role: 'assistant',
      content: '抱歉，处理您的请求时出错了。请稍后再试。',
      timestamp: new Date()
    });
  } finally {
    chatLoading.value = false;
    await nextTick();
    scrollToBottom();
  }
};

// 天气推荐
const getWeatherAndRecommend = async () => {
  if (chatLoading.value) return;

  chatLoading.value = true;

  try {
    // 获取最新天气数据
    const weatherData = await getJiadingWeather('base');
    currentWeather.value = weatherData;

    const weatherPrompt = `请根据当前天气情况推荐合适的菜品`;

    const userMessage = {
      role: 'user',
      content: weatherPrompt,
      timestamp: new Date()
    };
    messages.value.push(userMessage);

    // 构建系统提示词
    const systemPrompt = buildSystemPrompt(weatherData);
    const conversationMessages = [
      { role: 'system', content: systemPrompt },
      userMessage
    ];

    const response = await chatCompletion(conversationMessages);

    if (response.choices && response.choices.length > 0) {
      const aiMessage = {
        ...response.choices[0].message,
        timestamp: new Date()
      };
      messages.value.push(aiMessage);
    }
  } catch (error) {
    console.error('天气推荐失败:', error);
    messages.value.push({
      role: 'assistant',
      content: '获取天气数据失败，无法提供天气推荐。请稍后再试。',
      timestamp: new Date()
    });
  } finally {
    chatLoading.value = false;
    await nextTick();
    scrollToBottom();
  }
};

// 随机推荐
const getRandomRecommend = async () => {
  if (chatLoading.value) return;

  const randomPrompt = "请从菜品库中随机推荐几道不同类型的菜品，包括荤素搭配";
  await sendRecommendation(randomPrompt);
};

// 健康推荐
const getHealthyRecommend = async () => {
  if (chatLoading.value) return;

  const healthyPrompt = "请推荐一些健康营养、低脂低盐的菜品，适合养生";
  await sendRecommendation(healthyPrompt);
};

// 通用推荐发送方法
const sendRecommendation = async (prompt) => {
  chatLoading.value = true;

  try {
    const userMessage = {
      role: 'user',
      content: prompt,
      timestamp: new Date()
    };
    messages.value.push(userMessage);

    const systemPrompt = buildSystemPrompt(currentWeather.value, prompt);
    const conversationMessages = [
      { role: 'system', content: systemPrompt },
      userMessage
    ];

    const response = await chatCompletion(conversationMessages);

    if (response.choices && response.choices.length > 0) {
      const aiMessage = {
        ...response.choices[0].message,
        timestamp: new Date()
      };
      messages.value.push(aiMessage);
    }
  } catch (error) {
    console.error('推荐请求失败:', error);
    messages.value.push({
      role: 'assistant',
      content: '抱歉，获取推荐时出错了。请稍后再试。',
      timestamp: new Date()
    });
  } finally {
    chatLoading.value = false;
    await nextTick();
    scrollToBottom();
  }
};

// 使用建议标签
const useSuggestion = (suggestion) => {
  userInput.value = suggestion;
  sendMessage();
};

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 格式化消息内容
const formatMessage = (content) => {
  if (!content) return '';

  // 简单的markdown-like格式化
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
};

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

.ai-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: 'Poppins', sans-serif;
  padding: 24px;
}

.ai-header {
  background: linear-gradient(135deg, #2c3e50, #3498db);
  margin: -24px -24px 30px -24px;
  padding: 40px 24px;
  text-align: center;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ai-title {
  color: #fff;
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-title i {
  font-size: 24px;
}

.weather-info {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  color: #fff;
  font-size: 16px;
}

.ai-content {
  max-width: 1000px;
  margin: 0 auto;
}

.quick-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  transition: all 0.3s ease;
}

.action-btn i {
  font-size: 18px;
}

.weather-btn {
  background: linear-gradient(135deg, #74b9ff, #0984e3);
}

.random-btn {
  background: linear-gradient(135deg, #fd79a8, #e84393);
}

.healthy-btn {
  background: linear-gradient(135deg, #00b894, #00a085);
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.chat-messages {
  height: 500px;
  overflow-y: auto;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.message {
  margin-bottom: 20px;
  padding: 16px;
  border-radius: 12px;
  max-width: 85%;
}

.message.user {
  background: #e3f2fd;
  margin-left: auto;
}

.message.assistant {
  background: #f1f8e9;
  margin-right: auto;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.message-avatar {
  width: 36px;
  height: 36px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.message.user .message-avatar {
  color: #1976d2;
}

.message.assistant .message-avatar {
  color: #2e7d32;
}

.message-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-info strong {
  font-size: 16px;
  color: #2c3e50;
}

.timestamp {
  font-size: 12px;
  color: #666;
}

.message-content {
  line-height: 1.6;
  color: #2c3e50;
}

.chat-input {
  margin-bottom: 24px;
}

.input-group {
  display: flex;
  gap: 16px;
}

.input-wrapper {
  position: relative;
  flex: 1;
}

.input-wrapper i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 18px;
}

.message-input {
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  outline: none;
  transition: all 0.3s ease;
}

.message-input:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.send-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 32px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: #fff;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
}

.send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  background: #fff3cd;
  border-radius: 12px;
  color: #856404;
  margin-bottom: 24px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.suggestion-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.tag-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.tag-label i {
  color: #f1c40f;
}

.suggestion-tag {
  padding: 8px 16px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  color: #2c3e50;
  transition: all 0.3s ease;
}

.suggestion-tag:hover {
  background: #3498db;
  color: #fff;
  border-color: #3498db;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .ai-header {
    flex-direction: column;
    gap: 16px;
    padding: 30px 16px;
  }

  .ai-title {
    font-size: 24px;
  }

  .quick-actions {
    justify-content: center;
  }

  .action-btn {
    flex: 1;
    min-width: 120px;
    justify-content: center;
  }

  .input-group {
    flex-direction: column;
  }

  .send-btn {
    width: 100%;
    justify-content: center;
  }

  .message {
    max-width: 95%;
  }
}
</style>