<template>
  <main class="application-module my-application-info">
    <div class="app-info-back">
      <router-link class="app-text-button" to="/layout/application"
        ><el-icon><ArrowLeft /></el-icon>返回我的投递</router-link
      >
    </div>
    <h1>投递详情</h1>
    <ApplicationDetailPanel
      :application-id="typeof route.query.id === 'string' ? route.query.id : ''"
    />
  </main>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import ApplicationDetailPanel from '@/components/application/ApplicationDetailPanel.vue'
import '@/assets/application.css'
const route = useRoute()
</script>
<style scoped>
.my-application-info {
  max-width: 760px;
  margin: auto;
  background: white;
  border: 1px solid #e4ecef;
  border-radius: 14px;
  padding: 28px;
}
.app-info-back a {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
}
.my-application-info h1 {
  font-size: 25px;
  margin: 22px 0 8px;
}
@media (max-width: 600px) {
  .my-application-info {
    padding: 20px;
  }
}
</style>
