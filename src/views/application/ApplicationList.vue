<template>
  <MyApplications v-if="userStore.role === 'JOB_SEEKER'" /><CompanyApplications
    v-else-if="userStore.role === 'COMPANY'"
  />
</template>
<script setup>
import { useUserStore } from '@/stores/user'
import MyApplications from '@/views/application/MyApplications.vue'
import CompanyApplications from '@/views/application/CompanyApplications.vue'
const userStore = useUserStore()
</script>
