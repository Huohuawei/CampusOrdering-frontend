<template>
  <div class="home">
    <!-- 搜索区域 -->
    <div class="search-section">
      <div class="search-container">
        <i class="fas fa-search search-icon"></i>
        <input 
          v-model="searchKeyword" 
          placeholder="搜索商户..." 
          class="search-input"
        />
      </div>
    </div>

    <!-- 商户列表 -->
    <div class="merchant-list">
      <div
        class="merchant-card"
        v-for="merchant in filteredMerchants"
        :key="merchant.id"
        @click="goToDetail(merchant.id)"
      >
        <div class="merchant-img-container">
          <img :src="merchant.coverImage" alt="商户图片" class="merchant-img" />
          <div class="merchant-overlay">
            <span class="view-details">查看详情</span>
          </div>
        </div>
        <div class="merchant-info">
          <h3 class="merchant-name">{{ merchant.storeName }}</h3>
          <p class="merchant-description">
            <i class="fas fa-utensils"></i>
            {{ merchant.storeDescription }}
          </p>
          <p class="merchant-address">
            <i class="fas fa-map-marker-alt"></i>
            {{ merchant.storeAddress }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMerchants } from '../../../api/merchant'

const router = useRouter()

const searchKeyword = ref('')
const merchants = ref([])

const goToDetail = (id) => {
  router.push(`merchants/${id}`)
}

onMounted(async () => {
  try {
    const res = await getMerchants() // ✅ 只请求一次
    merchants.value = Array.isArray(res) ? res : []
  } catch (error) {
    console.error('加载商户数据失败', error)
    merchants.value = [] // 失败也保证页面不挂
  }
})

const filteredMerchants = computed(() => {
  if (!Array.isArray(merchants.value)) {
    return []
  }
  return merchants.value.filter((m) =>
    m.storeName?.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

.home {
  padding: 20px;
  font-family: 'Poppins', sans-serif;
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* 搜索区域样式 */
.search-section {
  background: linear-gradient(135deg, #2c3e50, #3498db);
  padding: 40px 20px;
  margin: -20px -20px 30px -20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.search-container {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 18px;
}

.search-input {
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  background: #ffffff;
}

/* 商户列表样式 */
.merchant-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 10px;
}

.merchant-card {
  background-color: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  position: relative;
}

.merchant-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.merchant-img-container {
  position: relative;
  overflow: hidden;
  height: 200px;
}

.merchant-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.merchant-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.merchant-card:hover .merchant-overlay {
  opacity: 1;
}

.merchant-card:hover .merchant-img {
  transform: scale(1.05);
}

.view-details {
  color: white;
  font-size: 18px;
  font-weight: 500;
  padding: 8px 20px;
  border: 2px solid white;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.view-details:hover {
  background: white;
  color: #2c3e50;
}

.merchant-info {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.merchant-name {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  line-height: 1.3;
}

.merchant-description,
.merchant-address {
  font-size: 15px;
  color: #666;
  margin: 0;
  line-height: 1.6;
  display: flex;
  align-items: center;
  gap: 8px;
}

.merchant-description i,
.merchant-address i {
  color: #3498db;
  font-size: 16px;
}

@media (max-width: 768px) {
  .search-section {
    padding: 30px 15px;
  }
  
  .merchant-list {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .merchant-img-container {
    height: 180px;
  }
}
</style>
