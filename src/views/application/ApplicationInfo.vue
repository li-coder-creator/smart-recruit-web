<template>
  <CompanyApplicationInfo v-if="userStore.role === 'COMPANY'" /><MyApplicationInfo
    v-else-if="userStore.role === 'JOB_SEEKER'"
  />
</template>
<script setup>
import { useUserStore } from '@/stores/user'
import CompanyApplicationInfo from '@/views/application/CompanyApplicationInfo.vue'
import MyApplicationInfo from '@/views/application/MyApplicationInfo.vue'
const userStore = useUserStore()
</script>
