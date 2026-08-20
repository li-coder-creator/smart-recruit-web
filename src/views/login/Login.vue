<template>

  <div class="login-container">

    <el-card class="login-card">

      <template #header>

        <div class="login-header">

          <h2>Smart Recruit</h2>

          <p>智慧招聘系统</p>

        </div>

      </template>

      <!-- 登录身份选择 -->
      <div class="role-title">
        请选择登录身份
      </div>

      <div class="role-select">

        <div
            class="role-item"
            :class="{ active: selectedRole === 'JOB_SEEKER' }"
            @click="selectedRole = 'JOB_SEEKER'"
        >

          <div class="role-icon">
            👤
          </div>

          <div class="role-name">
            求职者
          </div>

          <div class="role-desc">
            寻找心仪工作
          </div>

        </div>


        <div
            class="role-item"
            :class="{ active: selectedRole === 'COMPANY' }"
            @click="selectedRole = 'COMPANY'"
        >

          <div class="role-icon">
            🏢
          </div>

          <div class="role-name">
            企业用户
          </div>

          <div class="role-desc">
            发布招聘岗位
          </div>

        </div>


        <div
            class="role-item"
            :class="{ active: selectedRole === 'ADMIN' }"
            @click="selectedRole = 'ADMIN'"
        >

          <div class="role-icon">
            🔐
          </div>

          <div class="role-name">
            管理员
          </div>

          <div class="role-desc">
            系统管理后台
          </div>

        </div>

      </div>


      <el-form
          :model="loginForm"
          class="login-form"
      >

        <el-form-item>

          <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              clearable
              size="large"
          />

        </el-form-item>


        <el-form-item>

          <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              show-password
              size="large"
              @keyup.enter="handleLogin"
          />

        </el-form-item>


        <el-form-item>

          <el-button
              type="primary"
              size="large"
              style="width: 100%"
              @click="handleLogin"
          >
            登录
          </el-button>

        </el-form-item>


        <div class="register-link">

          <span>
            还没有账号？
          </span>

          <el-button
              link
              type="primary"
              @click="goToRegister"
          >
            注册账号
          </el-button>

        </div>

      </el-form>

    </el-card>

  </div>

</template>


<script setup>

import { reactive, ref } from 'vue'

import { ElMessage } from 'element-plus'

import { login } from '@/api/user'

import { useUserStore } from '@/stores/user'

import { useRouter } from 'vue-router'


const router = useRouter()

const userStore = useUserStore()


// 当前选择的角色
// 注意：这个值只用于前端 UI 展示
// 不发送给后端
const selectedRole = ref('JOB_SEEKER')


const loginForm = reactive({

  username: '',

  password: ''

})


const handleLogin = async () => {

  if (!loginForm.username) {

    ElMessage.warning('请输入用户名')

    return

  }


  if (!loginForm.password) {

    ElMessage.warning('请输入密码')

    return

  }


  try {

    const res = await login(loginForm)


    // 登录失败
    if (res.data.code !== 200) {

      ElMessage.error(
          res.data.message || '登录失败'
      )

      return

    }


    // 保存 Token
    userStore.setToken(
        res.data.data
    )


    // 获取后端真实用户信息
    await userStore.initUser()


    /*
     * 注意：
     *
     * selectedRole 只是登录页面的视觉选择。
     *
     * 真正角色以后端返回的 userStore.role 为准。
     */
    if (
        selectedRole.value !== userStore.role
    ) {

      ElMessage.warning(
          '登录身份与账号实际角色不一致，已按照账号实际角色登录'
      )

    } else {

      ElMessage.success('登录成功')

    }


    // 根据后端真实角色进入系统
    router.push('/layout')


  } catch (e) {

    console.error(e)

    ElMessage.error(
        '系统异常，请稍后重试'
    )

  }

}


// 跳转注册
const goToRegister = () => {

  router.push('/register')

}

</script>


<style scoped>

.login-container {

  width: 100vw;

  height: 100vh;

  display: flex;

  justify-content: center;

  align-items: center;

  background: #eef2f6;

}


.login-card {

  width: 460px;

  border-radius: 12px;

}


.login-header {

  text-align: center;

}


.login-header h2 {

  margin: 5px 0;

  font-size: 26px;

}


.login-header p {

  margin: 8px 0 0;

  color: #909399;

  font-size: 14px;

}


.role-title {

  text-align: center;

  margin: 10px 0 15px;

  color: #606266;

  font-size: 14px;

}


.role-select {

  display: flex;

  gap: 10px;

  margin-bottom: 25px;

}


.role-item {

  flex: 1;

  padding: 15px 8px;

  text-align: center;

  border: 1px solid #dcdfe6;

  border-radius: 8px;

  cursor: pointer;

  transition: all 0.2s;

  background: #fff;

}


.role-item:hover {

  border-color: #409eff;

}


.role-item.active {

  border-color: #409eff;

  background: #ecf5ff;

}


.role-icon {

  font-size: 28px;

  margin-bottom: 8px;

}


.role-name {

  font-size: 15px;

  font-weight: 600;

  margin-bottom: 5px;

}


.role-desc {

  font-size: 12px;

  color: #909399;

}


.login-form {

  margin-top: 5px;

}


.register-link {

  display: flex;

  justify-content: center;

  align-items: center;

  color: #909399;

  font-size: 14px;

}

</style>