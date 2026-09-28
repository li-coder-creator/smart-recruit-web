<template>

  <div class="register-container">

    <el-card class="register-card">

      <template #header>

        <div class="register-header">

          <h2>Smart Recruit</h2>

          <p>创建您的账号</p>

        </div>

      </template>


      <!-- 注册身份 -->

      <div class="role-title">
        请选择注册身份
      </div>


      <div class="role-select">

        <!-- 求职者 -->

        <div
            class="role-item"
            :class="{ active: registerForm.role === 'JOB_SEEKER' }"
            @click="selectRole('JOB_SEEKER')"
        >

          <div class="role-icon">
            👤
          </div>

          <div class="role-name">
            求职者
          </div>

          <div class="role-desc">
            创建账号寻找工作
          </div>

        </div>


        <!-- 企业 -->

        <div
            class="role-item"
            :class="{ active: registerForm.role === 'COMPANY' }"
            @click="selectRole('COMPANY')"
        >

          <div class="role-icon">
            🏢
          </div>

          <div class="role-name">
            企业用户
          </div>

          <div class="role-desc">
            创建企业发布岗位
          </div>

        </div>

      </div>


      <el-form
          :model="registerForm"
          class="register-form"
      >

        <!-- 用户名 -->

        <el-form-item label="用户名">

          <el-input
              v-model="registerForm.username"
              placeholder="请输入用户名"
              clearable
          />

        </el-form-item>


        <!-- 企业名称 -->

        <el-form-item
            v-if="registerForm.role === 'COMPANY'"
            label="企业名称"
        >

          <el-input
              v-model="registerForm.name"
              placeholder="请输入企业名称"
              clearable
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


        <!-- 注册 -->

        <el-form-item>

          <el-button
              type="primary"
              style="width: 100%"
              @click="handleRegister"
          >
            注册
          </el-button>

        </el-form-item>


        <!-- 返回登录 -->

        <div class="login-link">

          <span>
            已有账号？
          </span>

          <el-button
              link
              type="primary"
              @click="goToLogin"
          >
            返回登录
          </el-button>

        </div>

      </el-form>

    </el-card>

  </div>

</template>


<script setup>

import { reactive } from 'vue'

import { ElMessage } from 'element-plus'

import { useRouter } from 'vue-router'

import {
    register,
    companyRegister
} from '@/api/user'


const router = useRouter()


const registerForm = reactive({

    username: '',

    password: '',

    rePassword: '',

    // 注册身份
    role: 'JOB_SEEKER',

    // 企业名称
    name: ''

})


/**
 * 选择注册身份
 */
const selectRole = (role) => {

    registerForm.role = role

}


/**
 * 注册
 */
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

    // 检查确认密码
    if (registerForm.password !== registerForm.rePassword) {

        ElMessage.warning('两次密码不一致')

        return
    }

    // 企业注册
    if (registerForm.role === 'COMPANY') {

        // 检查企业名称
        if (!registerForm.name) {

            ElMessage.warning('请输入企业名称')

            return
        }

    }

    try {

        let res

        // =========================
        // 求职者注册
        // =========================
        if (registerForm.role === 'JOB_SEEKER') {

            res = await register({

                username: registerForm.username,

                password: registerForm.password

            })

        }

        // =========================
        // 企业注册
        // =========================
        else if (registerForm.role === 'COMPANY') {

            res = await companyRegister({

                username: registerForm.username,

                password: registerForm.password,

                companyName: registerForm.name

            })

        }

        // =========================
        // 注册结果
        // =========================
        if (res.data.code === 200) {

            ElMessage.success('注册成功')

            router.push('/login')

        } else {

            ElMessage.error(
                res.data.message || '注册失败'
            )

        }

    } catch (e) {

        console.error(e)

        ElMessage.error(
            e.response?.data?.message || '注册失败'
        )

    }
}

/**
 * 返回登录
 */
const goToLogin = () => {

    router.push('/login')

}

</script>


<style scoped>

.register-container {

  width: 100vw;

  min-height: 100vh;

  display: flex;

  justify-content: center;

  align-items: center;

  padding: 28px;

  background:
    linear-gradient(135deg, rgba(18, 184, 134, 0.1) 0%, rgba(18, 184, 134, 0) 42%),
    linear-gradient(315deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0) 40%),
    linear-gradient(135deg, #f6fbf9 0%, #eef6fb 100%);

}


.register-card {

  width: min(100%, 500px);

  overflow: hidden;

  border: 1px solid rgba(18, 184, 134, 0.16);

  border-radius: 8px;

  box-shadow: 0 24px 80px rgba(15, 35, 52, 0.14);

}


.register-card :deep(.el-card__header) {

  padding: 32px 34px 20px;

  border-bottom: 0;

}


.register-header {

  text-align: center;

}


.register-header h2 {

  margin: 0;

  color: #17233d;

  font-size: 32px;

  font-weight: 850;

}


.register-header p {

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

  padding: 16px 10px;

  text-align: center;

  border: 1px solid #e6edf3;

  border-radius: 8px;

  cursor: pointer;

  transition: all 0.2s;

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

  margin-bottom: 8px;

}


.role-name {

  color: #17233d;

  font-size: 15px;

  font-weight: 750;

  margin-bottom: 5px;

}


.role-desc {

  font-size: 12px;

  color: #64748b;

}


.register-form {

  margin-top: 5px;

}


.register-form :deep(.el-input__wrapper) {

  min-height: 42px;

}


.login-link {

  display: flex;

  justify-content: center;

  align-items: center;

  color: #64748b;

  font-size: 14px;

}


@media (max-width: 540px) {

  .register-container {

    padding: 18px;

  }


  .register-card :deep(.el-card__body) {

    padding: 20px;

  }


  .role-select {

    flex-direction: column;

  }

}

</style>
