<template>

  <div class="password-container">

    <h2>修改密码</h2>

    <el-form>

      <!-- 旧密码 -->
      <el-form-item label="旧密码">

        <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入旧密码"
            show-password
        />

      </el-form-item>

      <!-- 新密码 -->
      <el-form-item label="新密码">

        <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
        />

      </el-form-item>

      <!-- 确认新密码 -->
      <el-form-item label="确认新密码">

        <el-input
            v-model="passwordForm.rePassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
        />

      </el-form-item>

      <el-form-item>

        <el-button
            type="primary"
            @click="handleUpdatePassword"
        >
            修改密码
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

import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

import { updatePassword } from '@/api/user'

const router = useRouter()

// 修改密码表单
const passwordForm = reactive({

    oldPassword: '',

    newPassword: '',

    rePassword: ''

})

// 修改密码
const handleUpdatePassword = async () => {

    // 检查旧密码
    if (!passwordForm.oldPassword) {

        ElMessage.warning('请输入旧密码')

        return

    }

    // 检查新密码
    if (!passwordForm.newPassword) {

        ElMessage.warning('请输入新密码')

        return

    }

    // 检查确认密码
    if (!passwordForm.rePassword) {

        ElMessage.warning('请再次输入新密码')

        return

    }

    // 检查两次密码是否一致
    if (passwordForm.newPassword !== passwordForm.rePassword) {

        ElMessage.warning('两次密码不一致')

        return

    }

    try {

        const res = await updatePassword(passwordForm)

        if (res.data.code === 200) {

            ElMessage.success('密码修改成功')

            // 修改成功后返回首页
            router.push('/layout')

        } else {

            ElMessage.error(
                res.data.message || '密码修改失败'
            )

        }

    } catch (e) {

        console.error(e)

        ElMessage.error('修改密码失败')

    }

}

// 返回首页
const goBack = () => {

    router.push('/layout')

}

</script>

<style scoped>

.password-container {

    width: 500px;

    margin: 50px auto;

}

</style>