<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2>Smart Recruit</h2>
      </template>

      <el-form :model="loginForm">

        <el-form-item>
          <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              clearable
          />
        </el-form-item>

        <el-form-item>
          <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
              type="primary"
              style="width:100%"
              @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>

      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import { ElMessage } from "element-plus";
import { login } from "@/api/user";
import { useRouter } from "vue-router"
const router = useRouter()

const loginForm = reactive({
  username: "",
  password: ""
})

const handleLogin = async () => {
  try {

    const res = await login(loginForm)

    // 登录失败
    if (res.data.code !== 200) {
      ElMessage.error(res.data.message)
      return
    }

    // 登录成功
    localStorage.setItem("token", res.data.data)
    ElMessage.success("登录成功")
    //跳转
    router.push("/layout")

  } catch (e) {

    console.error(e)
    ElMessage.error("系统异常，请稍后重试")

  }
}


 

</script>

<style scoped>

.login-container{

  width:100vw;
  height:100vh;

  display:flex;

  justify-content:center;

  align-items:center;

  background:#eef2f6;

}

.login-card{

  width:400px;

  border-radius:10px;

}

h2{

  text-align:center;

}

</style>