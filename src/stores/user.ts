import { defineStore } from 'pinia'
import type { User } from '@/types'

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null as User | null,
    loading: false,
    error: null as string | null
  }),

  getters: {
    isLoggedIn: (state) => !!state.currentUser,
    userRole: (state) => state.currentUser?.role
  },

  actions: {
    async login(username: string, password: string) {
      this.loading = true
      this.error = null
      try {
        // TODO: 调用登录API
        // this.currentUser = await login(username, password)
      } catch (err) {
        this.error = err instanceof Error ? err.message : '登录失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.loading = true
      this.error = null
      try {
        // TODO: 调用登出API
        this.currentUser = null
      } catch (err) {
        this.error = err instanceof Error ? err.message : '登出失败'
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateProfile(data: Partial<User>) {
      this.loading = true
      this.error = null
      try {
        // TODO: 调用更新个人信息API
        // this.currentUser = await updateProfile(data)
      } catch (err) {
        this.error = err instanceof Error ? err.message : '更新个人信息失败'
        throw err
      } finally {
        this.loading = false
      }
    }
  }
}) 