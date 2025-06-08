<template>
  <div class="users-container">
    <div class="page-header">
      <h2>用户管理</h2>
      <div class="header-actions">
        <el-input v-model="searchQuery" placeholder="搜索用户..." class="search-input" clearable @clear="handleSearch"
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
      <el-table v-loading="loading" :data="filteredUsers" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="role" label="角色">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)">{{ getRoleLabel(row.role) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button-group>
              <el-button size="small" type="primary" @click="handleView(row)">
                查看
              </el-button>
              <el-button size="small" type="danger" @click="handleDelete(row)">
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          :total="totalUsers" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <!-- 用户详情对话框 -->
    <el-dialog v-model="dialogVisible" title="用户详情" width="500px">
      <div v-if="selectedUser" class="user-details">
        <div class="detail-item">
          <span class="label">用户名：</span>
          <span>{{ selectedUser.username }}</span>
        </div>
        <div class="detail-item">
          <span class="label">邮箱：</span>
          <span>{{ selectedUser.email }}</span>
        </div>
        <div class="detail-item">
          <span class="label">手机号：</span>
          <span>{{ selectedUser.phone }}</span>
        </div>
        <div class="detail-item">
          <span class="label">角色：</span>
          <el-tag :type="getRoleType(selectedUser.role)">
            {{ getRoleLabel(selectedUser.role) }}
          </el-tag>
        </div>
        <div class="detail-item">
          <span class="label">注册时间：</span>
          <span>{{ formatDate(selectedUser.createdAt) }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface User {
  id: number
  username: string
  email: string
  phone: string
  role: string
  createdAt: string
}

const loading = ref(false)
const users = ref<User[]>([])
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalUsers = ref(0)
const dialogVisible = ref(false)
const selectedUser = ref<User | null>(null)

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await fetch('http://localhost:8080/api/users')
    if (!response.ok) throw new Error('获取用户列表失败')
    const data = await response.json()
    users.value = data
    totalUsers.value = data.length
  } catch (error) {
    ElMessage.error('获取用户列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 过滤用户列表
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user =>
    user.username.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  )
})

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
}

// 处理分页
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

// 查看用户详情
const handleView = (user: User) => {
  selectedUser.value = user
  dialogVisible.value = true
}

// 删除用户
const handleDelete = async (user: User) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 ${user.username} 吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const response = await fetch(`http://localhost:8080/api/users/${user.id}`, {
      method: 'DELETE',
    })

    if (!response.ok) throw new Error('删除用户失败')

    ElMessage.success('删除成功')
    await fetchUsers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除用户失败')
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

// 获取角色标签
const getRoleLabel = (role: string) => {
  const roleMap: Record<string, string> = {
    'ADMIN': '管理员',
    'MERCHANT': '商家',
    'USER': '用户'
  }
  return roleMap[role] || role
}

// 获取角色标签类型
const getRoleType = (role: string) => {
  const typeMap: Record<string, string> = {
    'ADMIN': 'danger',
    'MERCHANT': 'warning',
    'USER': 'success'
  }
  return typeMap[role] || 'info'
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.users-container {
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

/* 用户详情对话框样式 */
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

.user-details {
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

/* 响应式设计 */
@media (max-width: 768px) {
  .users-container {
    padding: 10px;
  }

  .page-header {
    flex-direction: column;
    gap: 15px;
    padding: 15px;
  }

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