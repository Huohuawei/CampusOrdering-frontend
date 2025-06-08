<template>
  <div class="merchants-container">
    <div class="page-header">
      <h2>商家管理</h2>
      <div class="header-actions">
        <el-select v-model="statusFilter" placeholder="商家状态" clearable @change="handleStatusChange">
          <el-option label="全部" value="" />
          <el-option label="待审核" value="PENDING" />
          <el-option label="已通过" value="APPROVED" />
          <el-option label="已拒绝" value="REJECTED" />
        </el-select>
        <el-input v-model="searchQuery" placeholder="搜索商家..." class="search-input" clearable @clear="handleSearch"
          @input="handleSearch">
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <el-card class="table-card">
      <el-table v-loading="loading" :data="filteredMerchants" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="storeName" label="店铺名称" />
        <el-table-column prop="user.username" label="商家账号" />
        <el-table-column prop="storeAddress" label="店铺地址" />
        <el-table-column prop="status" label="审核状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="申请时间">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button-group>
              <el-button size="small" type="primary" @click="handleView(row)">
                查看
              </el-button>
              <el-button v-if="row.status === 'PENDING'" size="small" type="success" @click="handleApprove(row)">
                通过
              </el-button>
              <el-button v-if="row.status === 'PENDING'" size="small" type="danger" @click="handleReject(row)">
                拒绝
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          :total="totalMerchants" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <!-- 商家详情对话框 -->
    <el-dialog v-model="dialogVisible" title="商家详情" width="600px">
      <div v-if="selectedMerchant" class="merchant-details">
        <div class="detail-item">
          <span class="label">店铺名称：</span>
          <span>{{ selectedMerchant.storeName }}</span>
        </div>
        <div class="detail-item">
          <span class="label">商家账号：</span>
          <span>{{ selectedMerchant.user.username }}</span>
        </div>
        <div class="detail-item">
          <span class="label">店铺地址：</span>
          <span>{{ selectedMerchant.storeAddress }}</span>
        </div>
        <div class="detail-item">
          <span class="label">店铺描述：</span>
          <span>{{ selectedMerchant.storeDescription }}</span>
        </div>
        <div class="detail-item">
          <span class="label">状态：</span>
          <el-tag :type="getStatusType(selectedMerchant.status)">
            {{ getStatusLabel(selectedMerchant.status) }}
          </el-tag>
        </div>
        <div class="detail-item">
          <span class="label">申请时间：</span>
          <span>{{ formatDate(selectedMerchant.createdAt) }}</span>
        </div>
        <div class="detail-item" v-if="selectedMerchant.coverImage">
          <span class="label">店铺封面：</span>
          <el-image :src="selectedMerchant.coverImage" :preview-src-list="[selectedMerchant.coverImage]" fit="cover"
            style="width: 100px; height: 100px" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

interface Merchant {
  id: number
  storeName: string
  storeDescription: string
  storeAddress: string
  status: string
  coverImage: string | null
  user: {
    id: number
    username: string
    email: string
    phone: string
  }
  createdAt: string
}

const loading = ref(false)
const merchants = ref<Merchant[]>([])
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalMerchants = ref(0)
const dialogVisible = ref(false)
const selectedMerchant = ref<Merchant | null>(null)

// 获取商家列表
const fetchMerchants = async () => {
  loading.value = true
  try {
    const url = statusFilter.value
      ? `http://localhost:8080/api/merchants/status/${statusFilter.value}`
      : 'http://localhost:8080/api/merchants'

    const response = await fetch(url)
    if (!response.ok) throw new Error('获取商家列表失败')
    const data = await response.json()
    merchants.value = data
    totalMerchants.value = data.length
  } catch (error) {
    ElMessage.error('获取商家列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 过滤商家列表
const filteredMerchants = computed(() => {
  if (!searchQuery.value) return merchants.value
  const query = searchQuery.value.toLowerCase()
  return merchants.value.filter(merchant =>
    merchant.storeName.toLowerCase().includes(query) ||
    merchant.user.username.toLowerCase().includes(query) ||
    merchant.storeAddress.toLowerCase().includes(query)
  )
})

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchMerchants()
}

// 处理状态筛选
const handleStatusChange = () => {
  currentPage.value = 1
  fetchMerchants()
}

// 处理分页
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

// 查看商家详情
const handleView = (merchant: Merchant) => {
  selectedMerchant.value = merchant
  dialogVisible.value = true
}

// 审核通过
const handleApprove = async (merchant: Merchant) => {
  try {
    await ElMessageBox.confirm(
      `确定要通过商家 ${merchant.storeName} 的审核吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success',
      }
    )

    const response = await fetch(`http://localhost:8080/api/merchants/${merchant.id}/status/APPROVED`, {
      method: 'PATCH',
    })

    if (!response.ok) throw new Error('审核操作失败')

    ElMessage.success('审核通过成功')
    await fetchMerchants()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('审核操作失败')
      console.error(error)
    }
  }
}

// 审核拒绝
const handleReject = async (merchant: Merchant) => {
  try {
    await ElMessageBox.confirm(
      `确定要拒绝商家 ${merchant.storeName} 的审核吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const response = await fetch(`http://localhost:8080/api/merchants/${merchant.id}/status/REJECTED`, {
      method: 'PATCH',
    })

    if (!response.ok) throw new Error('审核操作失败')

    ElMessage.success('已拒绝审核')
    await fetchMerchants()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('审核操作失败')
      console.error(error)
    }
  }
}

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取状态标签
const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    'PENDING': '待审核',
    'APPROVED': '已通过',
    'REJECTED': '已拒绝'
  }
  return labelMap[status] || status
}

// 获取状态标签类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    'PENDING': 'warning',
    'APPROVED': 'success',
    'REJECTED': 'danger'
  }
  return typeMap[status] || 'info'
}

onMounted(() => {
  fetchMerchants()
})
</script>

<style scoped>
.merchants-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f8faf9 100%);
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 92, 75, 0.05);
  border: 1px solid rgba(0, 92, 75, 0.1);
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #005c4b;
  font-weight: 600;
  position: relative;
  padding-left: 15px;
}

.page-header h2::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 24px;
  background: linear-gradient(to bottom, #005c4b, #90c3b5);
  border-radius: 2px;
}

.header-actions {
  display: flex;
  gap: 16px;
}

.header-actions :deep(.el-select) {
  width: 150px;
}

.header-actions :deep(.el-select .el-input__wrapper) {
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 92, 75, 0.1);
  transition: all 0.3s;
}

.header-actions :deep(.el-select .el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(0, 92, 75, 0.15);
}

.search-input {
  width: 300px;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 92, 75, 0.1);
  transition: all 0.3s;
}

.search-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(0, 92, 75, 0.15);
}

.search-input :deep(.el-input__inner) {
  color: #005c4b;
}

.search-input :deep(.el-input__prefix) {
  color: #90c3b5;
}

.table-card {
  border-radius: 15px;
  border: 1px solid rgba(0, 92, 75, 0.1);
  background: linear-gradient(135deg, #ffffff 0%, #f8faf9 100%);
  box-shadow: 0 4px 15px rgba(0, 92, 75, 0.05);
  transition: all 0.3s;
}

.table-card:hover {
  box-shadow: 0 8px 20px rgba(0, 92, 75, 0.1);
}

.table-card :deep(.el-table) {
  --el-table-border-color: rgba(0, 92, 75, 0.1);
  --el-table-header-bg-color: #f8faf9;
  --el-table-row-hover-bg-color: #e6f0ec;
}

.table-card :deep(.el-table th) {
  background-color: #f8faf9;
  color: #005c4b;
  font-weight: 600;
}

.table-card :deep(.el-table td) {
  color: #666;
}

.table-card :deep(.el-tag) {
  border-radius: 12px;
  padding: 0 12px;
  height: 24px;
  line-height: 24px;
  font-weight: 500;
}

.table-card :deep(.el-button-group .el-button) {
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 500;
  transition: all 0.3s;
}

.table-card :deep(.el-button-group .el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 92, 75, 0.15);
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding: 10px 0;
}

.pagination-container :deep(.el-pagination) {
  --el-pagination-button-bg-color: #f8faf9;
  --el-pagination-hover-color: #005c4b;
}

.pagination-container :deep(.el-pagination .el-pagination__total) {
  color: #005c4b;
}

/* 商家详情对话框样式 */
:deep(.el-dialog) {
  border-radius: 15px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  background: linear-gradient(135deg, #ffffff 0%, #f8faf9 100%);
  margin: 0;
  padding: 20px;
  border-bottom: 1px solid rgba(0, 92, 75, 0.1);
}

:deep(.el-dialog__title) {
  color: #005c4b;
  font-weight: 600;
}

.merchant-details {
  padding: 20px;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 12px;
  background: #f8faf9;
  border-radius: 10px;
  transition: all 0.3s;
}

.detail-item:hover {
  background: #e6f0ec;
  transform: translateX(5px);
}

.detail-item .label {
  width: 100px;
  color: #005c4b;
  font-weight: 500;
}

.detail-item :deep(.el-image) {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 92, 75, 0.1);
  transition: all 0.3s;
}

.detail-item :deep(.el-image:hover) {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 92, 75, 0.15);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .merchants-container {
    padding: 10px;
  }

  .page-header {
    flex-direction: column;
    gap: 15px;
    padding: 15px;
  }

  .header-actions {
    flex-direction: column;
    width: 100%;
  }

  .header-actions :deep(.el-select),
  .search-input {
    width: 100%;
  }

  .table-card :deep(.el-table) {
    font-size: 14px;
  }

  .table-card :deep(.el-button-group .el-button) {
    padding: 6px 12px;
  }
}
</style>