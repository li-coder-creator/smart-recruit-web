import { createRouter, createWebHistory } from 'vue-router'

import Layout from '@/views/layout/Layout.vue'
import Login from '@/views/login/Login.vue'

import ResumeList from '@/views/resume/ResumeList.vue'
import ResumeEdit from '@/views/resume/ResumeEdit.vue'

import JobList from '@/views/job/JobList.vue'
import JobEdit from '@/views/job/JobEdit.vue'
import JobInfo from '@/views/job/JobInfo.vue'

import ApplicationInfo from '@/views/application/ApplicationInfo.vue'

import Register from '@/views/user/Register.vue'
import UserInfo from '@/views/user/UserInfo.vue'
import UpdateInfo from '@/views/user/UpdateInfo.vue'
import CompanyInfo from '@/views/company/CompanyInfo.vue'
import CompanyEdit from '@/views/company/CompanyEdit.vue'
import UserPassword from '@/views/user/UserPassword.vue'
import AdminUserList from '@/views/admin/AdminUserList.vue'
import AdminCompanyList from '@/views/admin/AdminCompanyList.vue'


const router = createRouter({

  history: createWebHistory(),

  routes: [

    // =========================
    // 公共页面
    // =========================

    {
      path: '/',
      redirect: '/login'
    },

    {
      path: '/login',
      component: Login
    },

    {
      path: '/register',
      component: Register
    },


    // =========================
    // 登录后的系统 Layout
    // =========================

    {
      path: '/layout',

      component: Layout,

      // Layout 及其所有子页面都需要登录
      meta: {
        requiresAuth: true
      },

      children: [

        // =========================
        // 首页
        // =========================

        {
          path: '',
          redirect: '/layout/home'
        },

        {
          path: 'home',

          component: () =>
            import('@/views/layout/Home.vue'),

          meta: {
            roles: ['JOB_SEEKER', 'COMPANY', 'ADMIN']
          }

        },


        // =========================
        // 简历
        // =========================

        {
          path: 'resume',

          component: ResumeList,

          meta: {
            roles: ['JOB_SEEKER']
          }


        },

        {
          path: 'resume/edit',

          component: ResumeEdit,

          meta: {
            roles: ['JOB_SEEKER']
          }


        },


        // =========================
        // 岗位
        // =========================

        {
          path: 'job',

          component: JobList,

          meta: {
            roles: ['JOB_SEEKER','COMPANY']
          }

        },

        {
          path: 'job/add',

          component: JobEdit,

          meta: {
            roles: ['COMPANY']
          }

        },

        {
          path: 'job/edit',

          component: JobEdit,

          meta: {
            roles: ['COMPANY']
          }
        },

        {
          path: 'job/info',

          component: JobInfo,
         
          meta: {
            roles: ['JOB_SEEKER','COMPANY']
          }

        },


        // =========================
        // 投递
        // =========================

        {
          path: 'application',

          component: () =>
            import('@/views/application/ApplicationList.vue'),
          meta: {
            roles: ['JOB_SEEKER','COMPANY']
          }

        },

        {
          path: 'application/info',

          component: ApplicationInfo,
          meta: {
            roles: ['JOB_SEEKER','COMPANY']
          }

        },


        // =========================
        // 个人中心
        // =========================

        {
          path: 'user/info',

          component: UserInfo,
          meta: {
            roles: ['JOB_SEEKER','COMPANY','ADMIN']
          }

        },

        {
          path: 'user/password',

          component: UserPassword,
          meta: {
            roles: ['JOB_SEEKER','COMPANY','ADMIN']
          }

        },

        {
          path: 'user/update',

          component: UpdateInfo,
          meta: {
            roles: ['JOB_SEEKER','COMPANY','ADMIN']
          }

        },
        // =========================
        // 企业信息
        // =========================

        {
          path: 'company/info',

          component: CompanyInfo,

          meta: {
            roles: ['COMPANY']
          }

        },
        {
          path: 'company/edit',

          component: CompanyEdit,

          meta: {
            roles: ['COMPANY']
          }

        },
        // =========================
        // 管理员：用户管理
        // =========================

        {
          path: 'admin/user',

          component: AdminUserList,

          meta: {
            roles: ['ADMIN']
          }

        },
        // =========================
        // 管理员：企业审核
        // =========================

        {
          path: 'admin/company',

          component: AdminCompanyList,

          meta: {
            roles: ['ADMIN']
          }

        },

      ]

    }

  ]

})


// ======================================================
// 全局路由守卫
// ======================================================

router.beforeEach(async (to) => {

  // =========================
  // 读取 Token
  // =========================

  const token = localStorage.getItem('token')


  // =========================
  // 未登录访问需要登录的页面
  // =========================

  if (
    to.matched.some(route => route.meta.requiresAuth)
    && !token
  ) {

    return '/login'

  }


  // =========================
  // 已登录访问登录/注册页面
  // =========================

  if (
    token
    && (
      to.path === '/login'
      || to.path === '/register'
      || to.path === '/'
    )
  ) {

    return '/layout/home'

  }


  // =========================
  // 没有 Token
  // 公共页面直接放行
  // =========================

  if (!token) {

    return true

  }


  // ==================================================
  // 有 Token
  // 检查 Pinia 中是否已经存在用户信息
  // ==================================================

  try {

    // 动态加载 Store
    //
    // 注意：
    // 这里故意不在文件顶部 import userStore，
    // 避免 Router -> Store -> request -> Router 的循环依赖。
    const { useUserStore } = await import('@/stores/user')

    const userStore = useUserStore()


    // =========================
    // 刷新页面后的用户信息恢复
    // =========================

    if (!userStore.userInfo) {

      await userStore.initUser()

    }

    // =========================
    // 角色权限检查
    // =========================
    const roles = to.meta?.roles

    if (
      roles &&
      !roles.includes(userStore.role)
    ) {

      return '/layout/home'

    }

    return true

  } catch (error) {

    console.error('恢复用户登录状态失败：', error)

    // Token 无效 / 已过期
    localStorage.removeItem('token')

    return '/login'

  }

})


export default router