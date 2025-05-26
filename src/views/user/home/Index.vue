<template>
  <div class="home">
    <!-- 搜索 -->
    <div class="search-filter">
      <input v-model="searchKeyword" placeholder="搜索商户..." class="search-input" />
    </div>

    <!-- 商户列表 -->
    <div class="merchant-list">
      <div
        class="merchant-card"
        v-for="merchant in filteredMerchants"
        :key="merchant.id"
        @click="goToDetail(merchant.id)"
      >
        <img :src="merchant.coverImage" alt="商户图片" class="merchant-img" />
        <div class="merchant-info">
          <h3 class="merchant-name">{{ merchant.storeName }}</h3>
          <p class="merchant-description">📝 {{ merchant.storeDescription }}</p>
          <p class="merchant-address">📍 {{ merchant.storeAddress }}</p>
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
  router.push(`/merchant/${id}`)
}

onMounted(async () => {
  try {
    const res = await getMerchants() // ✅ 只请求一次
    console.log('拿到的商户数据:', res)
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
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500&display=swap');

.home {
  padding: 20px;
  font-family: 'Poppins', sans-serif;
  background-color: #f9f9f9;
  min-height: 100vh;
}

/* 搜索栏 */
.search-filter {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.search-input {
  flex: 1;
  min-width: 240px;
  max-width: 500px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
}

/* 商户卡片列表 */
.merchant-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); /* ✅ 自动三列，自适应 */
  gap: 24px;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 10px; /* ✅ 两边留点空间 */
}

.merchant-card {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  height: 100%;
}

.merchant-card:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12); /* ✅ hover加深阴影 */
}

.merchant-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-bottom: 1px solid #eee; /* ✅ 图片下方增加细线分隔 */
}

.merchant-info {
  padding: 24px 16px; /* ✅ 内边距加大，更舒适 */
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
  flex: 1;
}

.merchant-name {
  font-size: 22px; /* ✅ 标题再大一点 */
  font-weight: 800;
  color: #222;
  margin: 0;
}

.merchant-description,
.merchant-address {
  font-size: 15px;
  color: #666;
  margin: 0;
  line-height: 1.6; /* ✅ 行距变松，阅读更舒服 */
  max-width: 90%;
  word-break: break-word;
}

</style>
