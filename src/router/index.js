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
import UserPassword from '@/views/user/UserPassword.vue'

const router = createRouter({

  history: createWebHistory(),

  routes: [

    {
      path:'/',
      //路由重定向。
      redirect:'/login'
    },

    {
      path:'/login',
      //加载 Login 组件
      component:Login
    },

    {
      path:'/layout',
      component:Layout
    },

    {
      path: '/resume',
      component: ResumeList
     },

    {
        path: '/resume/edit',
        component:  ResumeEdit
    },
    {
      path: '/job',
        component: JobList
    },

    {
        path: '/job/add',
        component: JobEdit
    },

    {
        path: '/job/edit',
        component: JobEdit
    },
    {
      path: '/job/info',
      component: JobInfo
    },
    {
      path: '/application',
      component: () => import('@/views/application/ApplicationList.vue')
    },
    {
      path: '/application/info',
      component: ApplicationInfo
    },
    {
      path: '/register',
      component: Register
    },
    {
      path: '/user/info',
      component: UserInfo
    },

    {
      path: '/user/password',
      component: UserPassword
    },
    {
      path: '/user/update',
      component: UpdateInfo
    }
  ]

})
//把刚刚创建的路由实例导出去。因为你的 main.js 需要使用它。
export default router