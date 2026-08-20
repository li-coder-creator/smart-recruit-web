<template>

  <el-container style="height: 100vh">

    <!-- ========================= -->
    <!-- 顶部 -->
    <!-- ========================= -->

    <el-header class="header">

      <div class="logo">
        Smart Recruit
      </div>

      <div>

        <el-button
          type="primary"
          size="small"
          @click="goToUserInfo"
        >
          个人中心
        </el-button>

        <el-button
          type="danger"
          size="small"
          @click="logout"
        >
          退出登录
        </el-button>

      </div>

    </el-header>


    <el-container>

      <!-- ========================= -->
      <!-- 左侧菜单 -->
      <!-- ========================= -->

      <el-aside width="220px">

        <el-menu
          router
          :default-active="activeMenu"
        >

          <!-- ========================= -->
          <!-- 所有角色 -->
          <!-- ========================= -->

          <el-menu-item index="/layout/home">
            首页
          </el-menu-item>


          <!-- ========================= -->
          <!-- 求职者 -->
          <!-- ========================= -->

          <template v-if="userStore.role === 'JOB_SEEKER'">

            <el-menu-item index="/layout/resume">
              简历管理
            </el-menu-item>

            <el-menu-item index="/layout/job">
              岗位浏览
            </el-menu-item>

            <el-menu-item index="/layout/application">
              我的投递
            </el-menu-item>

          </template>


          <!-- ========================= -->
          <!-- 企业 -->
          <!-- ========================= -->

          <template v-if="userStore.role === 'COMPANY'">

            <el-menu-item index="/layout/job">
              岗位管理
            </el-menu-item>

            <el-menu-item index="/layout/application">
              收到的简历
            </el-menu-item>

          </template>


          <!-- ========================= -->
          <!-- 管理员 -->
          <!-- ========================= -->

          <template v-if="userStore.role === 'ADMIN'">

            <el-menu-item index="/layout/admin/user">
              用户管理
            </el-menu-item>

            <el-menu-item index="/layout/admin/company">
              企业审核
            </el-menu-item>

            <el-menu-item index="/layout/admin/job">
              岗位管理
            </el-menu-item>

          </template>

        </el-menu>

      </el-aside>


      <!-- ========================= -->
      <!-- 右侧内容 -->
      <!-- ========================= -->

      <el-main>

        <router-view />

      </el-main>

    </el-container>

  </el-container>

</template>


<script setup>

import {
  computed
} from 'vue'

import {
  useRoute,
  useRouter
} from 'vue-router'

import {
  useUserStore
} from '@/stores/user'


const route = useRoute()

const router = useRouter()

const userStore = useUserStore()


// =========================
// 当前菜单
// =========================

const activeMenu = computed(() => {

  return route.path

})


// =========================
// 个人中心
// =========================

const goToUserInfo = () => {

  router.push('/layout/user/info')

}


// =========================
// 退出登录
// =========================

const logout = () => {

  userStore.clearUser()

  router.push('/login')

}

</script>


<style scoped>

.header {

  background: #409EFF;

  color: white;

  display: flex;

  justify-content: space-between;

  align-items: center;

}


.logo {

  font-size: 22px;

  font-weight: bold;

}

</style>