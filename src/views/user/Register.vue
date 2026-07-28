<template>

  <div class="register-container">

    <h2>用户注册</h2>

    <el-form>

      <!-- 用户名 -->
      <el-form-item label="用户名">

        <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
        />

      </el-form-item>

      <!-- 密码 -->
      <el-form-item label="密码">

        <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
        />

      </el-form-item>

      <!-- 确认密码 -->
      <el-form-item label="确认密码">

        <el-input
            v-model="registerForm.rePassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
        />

      </el-form-item>

      <el-form-item>

        <el-button
            type="primary"
            @click="handleRegister"
        >
            注册
        </el-button>

        <el-button
            @click="goToLogin"
        >
            返回登录
        </el-button>

      </el-form-item>

    </el-form>

  </div>

</template>

<script setup>

import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

import { register } from '@/api/user'

const router = useRouter()

// 注册表单
const registerForm = reactive({

    username: '',

    password: '',

    rePassword: ''

})

// 注册
const handleRegister = async () => {

    // 检查用户名
    if (!registerForm.username) {

        ElMessage.warning('请输入用户名')

        return

    }

    // 检查密码
    if (!registerForm.password) {

        ElMessage.warning('请输入密码')

        return

    }

    // 检查两次密码
    if (registerForm.password !== registerForm.rePassword) {

        ElMessage.warning('两次密码不一致')

        return

    }

    try {

        const res = await register({

            username: registerForm.username,

            password: registerForm.password

        })

        if (res.data.code === 200) {

            ElMessage.success('注册成功')

            // 注册成功后跳转登录
            router.push('/login')

        } else {

            ElMessage.error(res.data.message || '注册失败')

        }

    } catch (e) {

        console.error(e)

        ElMessage.error('注册失败')

    }

}

// 返回登录页面
const goToLogin = () => {

    router.push('/login')

}

</script>