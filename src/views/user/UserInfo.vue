<template>

  <div class="user-info-container">

    <h2>个人信息</h2>

    <el-card>

      <el-descriptions
          :column="1"
          border
      >

        <!-- 用户ID -->
        <el-descriptions-item label="用户ID">
          {{ userInfo.id }}
        </el-descriptions-item>

        <!-- 用户名 -->
        <el-descriptions-item label="用户名">
          {{ userInfo.username }}
        </el-descriptions-item>

        <!-- 昵称 -->
        <el-descriptions-item label="昵称">
          {{ userInfo.nickname || '未设置' }}
        </el-descriptions-item>

        <!-- 邮箱 -->
        <el-descriptions-item label="邮箱">
          {{ userInfo.email || '未设置' }}
        </el-descriptions-item>

        <!-- 手机号 -->
        <el-descriptions-item label="手机号">
          {{ userInfo.phone || '未设置' }}
        </el-descriptions-item>

        <!-- 注册时间 -->
        <el-descriptions-item label="注册时间">
          {{ userInfo.createTime || '未知' }}
        </el-descriptions-item>

      </el-descriptions>

      <div class="button-container">

        <!-- 修改资料 -->
        <el-button
            type="primary"
            @click="goToUpdateInfo"
        >
          修改资料
        </el-button>

        <!-- 修改密码 -->
        <el-button
            type="warning"
            @click="goToUpdatePassword"
        >
          修改密码
        </el-button>

        <!-- 返回首页 -->
        <el-button
            @click="goBack"
        >
          返回
        </el-button>

      </div>

    </el-card>

  </div>

</template>

<script setup>

import { reactive, onMounted } from 'vue'

import { ElMessage } from 'element-plus'

import { useRouter } from 'vue-router'

import { getUserInfo } from '@/api/user'

const router = useRouter()

// 当前用户信息
const userInfo = reactive({

    id: null,

    username: '',

    nickname: '',

    email: '',

    phone: '',

    createTime: ''

})

// 获取用户信息
const loadUserInfo = async () => {

    try {

        const res = await getUserInfo()

        if (res.data.code === 200) {

            userInfo.id = res.data.data.id

            userInfo.username = res.data.data.username

            userInfo.nickname = res.data.data.nickname || ''

            userInfo.email = res.data.data.email || ''

            userInfo.phone = res.data.data.phone || ''

            userInfo.createTime = res.data.data.createTime || ''

        } else {

            ElMessage.error(
                res.data.message || '获取用户信息失败'
            )

        }

    } catch (e) {

        console.error(e)

        ElMessage.error('获取用户信息失败')

    }

}

// 修改资料
const goToUpdateInfo = () => {

    router.push('/user/update')

}

// 修改密码
const goToUpdatePassword = () => {

    router.push('/user/password')

}

// 返回首页
const goBack = () => {

    router.push('/layout')

}

// 页面加载
onMounted(() => {

    loadUserInfo()

})

</script>

<style scoped>

.user-info-container {

    padding: 30px;

    max-width: 700px;

    margin: 0 auto;

}

.button-container {

    margin-top: 20px;

}

</style>