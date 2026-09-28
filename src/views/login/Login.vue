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

  min-height: 680px;

  display: flex;

  justify-content: center;

  align-items: center;

  padding: 28px;

  background:
    linear-gradient(135deg, rgba(18, 184, 134, 0.1) 0%, rgba(18, 184, 134, 0) 42%),
    linear-gradient(315deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0) 40%),
    linear-gradient(135deg, #f6fbf9 0%, #eef6fb 100%);

}


.login-card {

  width: min(100%, 480px);

  overflow: hidden;

  border: 1px solid rgba(18, 184, 134, 0.16);

  border-radius: 8px;

  box-shadow: 0 24px 80px rgba(15, 35, 52, 0.14);

}


.login-card :deep(.el-card__header) {

  padding: 32px 34px 20px;

  border-bottom: 0;

}


.login-header {

  text-align: center;

}


.login-header h2 {

  margin: 0;

  color: #17233d;

  font-size: 32px;

  font-weight: 850;

}


.login-header p {

  margin: 10px 0 0;

  color: #64748b;

  font-size: 15px;

}


.role-title {

  text-align: left;

  margin: 2px 0 14px;

  color: #334155;

  font-size: 15px;

  font-weight: 700;

}


.role-select {

  display: flex;

  gap: 12px;

  margin-bottom: 26px;

}


.role-item {

  flex: 1;

  min-width: 0;

  padding: 16px 10px;

  text-align: center;

  border: 1px solid #e6edf3;

  border-radius: 8px;

  cursor: pointer;

  transition: all 0.2s;

  background: #ffffff;

}


.role-item:hover {

  border-color: #12b886;

  box-shadow: 0 10px 28px rgba(18, 184, 134, 0.11);

}


.role-item.active {

  border-color: #12b886;

  background: #e8fbf5;

  box-shadow: inset 0 0 0 1px rgba(18, 184, 134, 0.18);

}


.role-icon {

  font-size: 26px;

  margin-bottom: 9px;

}


.role-name {

  font-size: 15px;

  font-weight: 750;

  margin-bottom: 5px;

  color: #17233d;

}


.role-desc {

  font-size: 12px;

  color: #64748b;

}


.login-form {

  margin-top: 4px;

}


.login-form :deep(.el-input__wrapper) {

  min-height: 44px;

}


.register-link {

  display: flex;

  justify-content: center;

  align-items: center;

  color: #64748b;

  font-size: 14px;

}


@media (max-width: 540px) {

  .login-container {

    min-height: 100vh;

    padding: 18px;

  }


  .login-card :deep(.el-card__body) {

    padding: 20px;

  }


  .role-select {

    flex-direction: column;

  }

}

</style>
