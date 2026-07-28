<template>

  <div class="update-info-container">

    <h2>修改个人资料</h2>

    <el-form>

      <!-- 用户名 -->
      <el-form-item label="用户名">

        <el-input
            v-model="userForm.username"
            placeholder="请输入用户名"
        />

      </el-form-item>

      <!-- 昵称 -->
      <el-form-item label="昵称">

        <el-input
            v-model="userForm.nickname"
            placeholder="请输入昵称"
        />

      </el-form-item>

      <!-- 邮箱 -->
      <el-form-item label="邮箱">

        <el-input
            v-model="userForm.email"
            placeholder="请输入邮箱"
        />

      </el-form-item>

      <!-- 手机号 -->
      <el-form-item label="手机号">

        <el-input
            v-model="userForm.phone"
            placeholder="请输入手机号"
        />

      </el-form-item>

      <el-form-item>

        <el-button
            type="primary"
            @click="handleUpdate"
        >
          保存
        </el-button>

        <el-button
            @click="goBack"
        >
          返回
        </el-button>

      </el-form-item>

    </el-form>

  </div>

</template>

<script setup>

import { reactive, onMounted } from 'vue'

import { ElMessage } from 'element-plus'

import { useRouter } from 'vue-router'

import {
    getUserInfo,
    updateUserInfo
} from '@/api/user'

const router = useRouter()

// 用户资料
const userForm = reactive({

    username: '',

    nickname: '',

    email: '',

    phone: ''

})

// 获取当前用户信息
const loadUserInfo = async () => {

    try {

        const res = await getUserInfo()

        if (res.data.code === 200) {

            userForm.username = res.data.data.username

            userForm.nickname = res.data.data.nickname || ''

            userForm.email = res.data.data.email || ''

            userForm.phone = res.data.data.phone || ''

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

// 修改用户资料
const handleUpdate = async () => {

    // 检查用户名
    if (!userForm.username) {

        ElMessage.warning('用户名不能为空')

        return

    }

    try {

        const res = await updateUserInfo({

            username: userForm.username,

            nickname: userForm.nickname,

            email: userForm.email,

            phone: userForm.phone

        })

        if (res.data.code === 200) {

            ElMessage.success('修改成功')

            router.push('/user/info')

        } else {

            ElMessage.error(
                res.data.message || '修改失败'
            )

        }

    } catch (e) {

        console.error(e)

        ElMessage.error('修改失败')

    }

}

// 返回
const goBack = () => {

    router.push('/user/info')

}

// 页面加载
onMounted(() => {

    loadUserInfo()

})

</script>