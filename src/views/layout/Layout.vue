<template>
  <el-container class="app-shell">
    <el-header class="header">
      <div class="brand-area">
        <div class="logo">Smart Recruit</div>

        <el-menu
          class="top-menu"
          mode="horizontal"
          router
          :ellipsis="false"
          :default-active="activeMenu"
        >
          <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
            {{ item.label }}
          </el-menu-item>
        </el-menu>
      </div>

      <div class="header-actions">
        <el-button type="primary" size="small" @click="goToUserInfo">
          <el-icon>
            <User />
          </el-icon>
          <span>个人中心</span>
        </el-button>

        <el-button type="danger" size="small" @click="logout">
          <el-icon>
            <SwitchButton />
          </el-icon>
          <span>退出登录</span>
        </el-button>
      </div>
    </el-header>

    <el-main class="content-main">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'

import { useRoute, useRouter } from 'vue-router'

import { SwitchButton, User } from '@element-plus/icons-vue'

import { useUserStore } from '@/stores/user'

const route = useRoute()

const router = useRouter()

const userStore = useUserStore()

const roleMenus = {
  JOB_SEEKER: [
    {
      label: '首页',
      path: '/layout/home',
    },
    {
      label: '简历管理',
      path: '/layout/resume',
    },
    {
      label: '岗位浏览',
      path: '/layout/job',
    },
    {
      label: '我的投递',
      path: '/layout/application',
    },
  ],

  COMPANY: [
    {
      label: '首页',
      path: '/layout/home',
    },
    {
      label: '企业信息',
      path: '/layout/company/info',
    },
    {
      label: '岗位管理',
      path: '/layout/job',
    },
    {
      label: '收到的简历',
      path: '/layout/application',
    },
  ],

  ADMIN: [
    {
      label: '首页',
      path: '/layout/home',
    },
    {
      label: '用户管理',
      path: '/layout/admin/user',
    },
    {
      label: '企业审核',
      path: '/layout/admin/company',
    },
    {
      label: '岗位管理',
      path: '/layout/job',
    },
  ],
}

const menuItems = computed(() => {
  return roleMenus[userStore.role] || roleMenus.JOB_SEEKER
})

const activeMenu = computed(() => {
  const currentPath = route.path

  const matchedItem = [...menuItems.value]
    .sort((a, b) => b.path.length - a.path.length)
    .find((item) => {
      return currentPath === item.path || currentPath.startsWith(`${item.path}/`)
    })

  return matchedItem?.path || currentPath
})

const goToUserInfo = () => {
  router.push('/layout/user/info')
}

const logout = () => {
  userStore.clearUser()

  router.push('/login')
}
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: #f5f8fb;
}

.header {
  position: sticky;
  top: 0;
  z-index: 20;
  height: auto;
  min-height: 72px;
  padding: 0 28px;
  border-bottom: 1px solid #d7f1eb;
  background: linear-gradient(90deg, rgba(248, 253, 251, 0.98), rgba(255, 255, 255, 0.96));
  color: #17233d;
  backdrop-filter: blur(16px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 22px;
}

.brand-area {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 30px;
  flex: 1;
}

.logo {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 0 0 auto;
  color: #17233d;
  font-size: 21px;
  font-weight: 800;
  white-space: nowrap;
}

.logo::before {
  content: '';
  width: 12px;
  height: 28px;
  border-radius: 999px;
  background: linear-gradient(180deg, #12b886, #6ed7bd);
}

.top-menu {
  min-width: 0;
  flex: 1;
  border-bottom: 0;
  background: transparent;
}

.top-menu :deep(.el-menu-item) {
  height: 72px;
  border-bottom: 0;
  color: #475569;
  font-size: 15px;
  font-weight: 650;
}

.top-menu :deep(.el-menu-item:hover) {
  border-bottom: 0;
  background: transparent;
  color: #0f9f7a;
}

.top-menu :deep(.el-menu-item.is-active) {
  border-bottom: 0;
  background: transparent;
  color: #0f9f7a;
}

.top-menu :deep(.el-menu-item.is-active:hover) {
  border-bottom: 0;
  background: transparent;
  color: #0f9f7a;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 0 0 auto;
}

.header-actions :deep(.el-button) {
  margin-left: 0;
}

.header-actions :deep(.el-button > span) {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.header-actions :deep(.el-button--primary) {
  border-color: #12b886;
  background: #12b886;
}

.header-actions :deep(.el-button--primary:hover),
.header-actions :deep(.el-button--primary:focus) {
  border-color: #0f9f7a;
  background: #0f9f7a;
}

.header-actions :deep(.el-button--danger) {
  border-color: #b8ecdd;
  background: #e8fbf5;
  color: #0f9f7a;
}

.header-actions :deep(.el-button--danger:hover),
.header-actions :deep(.el-button--danger:focus) {
  border-color: #12b886;
  background: #d6f6ed;
  color: #0f9f7a;
}

.content-main {
  min-width: 0;
  min-height: calc(100vh - 72px);
  padding: 26px 24px;
  background:
    linear-gradient(180deg, rgba(232, 251, 245, 0.55), rgba(245, 248, 251, 0) 260px), #f5f8fb;
  overflow: auto;
}

@media (max-width: 900px) {
  .header {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
    padding: 14px 16px 12px;
  }

  .brand-area {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .top-menu {
    width: 100%;
    overflow-x: auto;
  }

  .top-menu :deep(.el-menu-item) {
    height: 42px;
    padding: 0 14px;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .content-main {
    min-height: calc(100vh - 144px);
    padding: 14px;
  }
}

@media (max-width: 560px) {
  .logo {
    font-size: 17px;
  }

  .header-actions {
    justify-content: stretch;
  }

  .header-actions :deep(.el-button) {
    flex: 1;
  }
}
</style>
