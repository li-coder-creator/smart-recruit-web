import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/views/layout/Layout.vue'

import Login from '@/views/login/Login.vue'

const router = createRouter({

  history: createWebHistory(),

  routes: [

    {
      path:'/',
      redirect:'/login'
    },

    {
      path:'/login',
      component:Login
    },

    {
      path:'/layout',
      component:Layout
    }

  ]

})

export default router