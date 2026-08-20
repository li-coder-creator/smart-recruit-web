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

  background: #eef2f6;

}


.register-card {

  width: 480px;

  border-radius: 12px;

}


.register-header {

  text-align: center;

}


.register-header h2 {

  margin: 5px 0;

  font-size: 26px;

}


.register-header p {

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

  gap: 12px;

  margin-bottom: 25px;

}


.role-item {

  flex: 1;

  padding: 18px 10px;

  text-align: center;

  border: 1px solid #dcdfe6;

  border-radius: 8px;

  cursor: pointer;

  transition: all 0.2s;

}


.role-item:hover {

  border-color: #409eff;

}


.role-item.active {

  border-color: #409eff;

  background: #ecf5ff;

}


.role-icon {

  font-size: 30px;

  margin-bottom: 8px;

}


.role-name {

  font-size: 16px;

  font-weight: 600;

  margin-bottom: 5px;

}


.role-desc {

  font-size: 12px;

  color: #909399;

}


.register-form {

  margin-top: 5px;

}


.login-link {

  display: flex;

  justify-content: center;

  align-items: center;

  color: #909399;

  font-size: 14px;

}

</style>