import { defineStore } from 'pinia'
import { getUserInfo } from '@/api/user'

export const useUserStore = defineStore('user', {

  state: () => ({

    // JWT
    token: localStorage.getItem('token') || '',

    // 当前登录用户
    userInfo: null

  }),

  getters: {

    // 当前用户角色
    role: (state) => {
      return state.userInfo?.role || ''
    }

  },

  actions: {

    // 设置 Token
    setToken(token) {

      this.token = token

      localStorage.setItem('token', token)

    },

    // 获取当前用户信息
    async initUser() {

      const res = await getUserInfo()

      if (res.data.code !== 200) {

        throw new Error(
          res.data.message || '获取用户信息失败'
        )

      }

      this.userInfo = res.data.data

      return this.userInfo

    },

    // 清空用户状态
    clearUser() {

      this.token = ''

      this.userInfo = null

      localStorage.removeItem('token')

    }

  }

})