<template>
  <main class="application-module company-applications">
    <header>
      <div>
        <h1>收到的简历</h1>
        <p class="app-muted">查看求职者投递，推进处理状态并维护面试安排。</p>
      </div>
      <button type="button" class="app-button green" :disabled="loading" @click="loadList">
        <el-icon><Refresh /></el-icon>刷新记录
      </button>
    </header>
    <el-skeleton v-if="loading" :rows="8" animated />
    <div v-else-if="error" class="app-error-box" role="alert">
      <p class="app-error">{{ error }}</p>
      <button type="button" class="app-button green" @click="loadList">重新读取</button>
    </div>
    <div v-else-if="!items.length" class="app-empty">
      <h3>暂无收到的投递</h3>
      <p>求职者投递后，可在这里处理。</p>
    </div>
    <section v-else class="company-application-list" aria-label="企业收到的投递">
      <article v-for="item in items" :key="item.id">
        <div>
          <h2>{{ item.jobTitle || '岗位信息不可用' }}</h2>
          <p>求职者：{{ item.username || '账号信息不可用' }}</p>
          <p>投递简历：{{ applicationResumeLabel(item) }}</p>
          <time :datetime="item.createTime">{{ formatApplicationTime(item.createTime) }}</time>
        </div>
        <el-tag :type="APPLICATION_STATUS_META[item.status]?.tagType || 'info'">{{
          APPLICATION_STATUS_META[item.status]?.label || item.statusText
        }}</el-tag
        ><router-link
          class="app-button green"
          :to="{ path: '/layout/application/info', query: { id: item.id } }"
          >处理投递</router-link
        >
      </article>
    </section>
  </main>
</template>
<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { getApplicationList } from '@/api/application'
import { APPLICATION_STATUS_META } from '@/constants/application'
import { applicationData, applicationResumeLabel, formatApplicationTime } from '@/utils/application'
import '@/assets/application.css'
const items = ref([]),
  loading = ref(false),
  error = ref('')
let sequence = 0
const loadList = async () => {
  const current = ++sequence
  loading.value = true
  error.value = ''
  items.value = []
  try {
    const data = applicationData(await getApplicationList())
    if (current !== sequence) return
    if (!Array.isArray(data)) throw new Error('投递列表响应异常')
    items.value = data
  } catch (cause) {
    if (current === sequence) error.value = cause.message || '投递读取失败'
  } finally {
    if (current === sequence) loading.value = false
  }
}
onMounted(loadList)
onBeforeUnmount(() => sequence++)
</script>
<style scoped>
.company-applications {
  max-width: 1150px;
  margin: auto;
}
.company-applications > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 24px;
}
.company-applications h1 {
  font-size: 28px;
  margin: 0 0 6px;
}
.company-applications header p {
  margin: 0;
  font-size: 13px;
}
.company-application-list {
  background: white;
  border-radius: 14px;
  padding: 0 24px;
}
.company-application-list article {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 24px;
  padding: 22px 0;
  border-bottom: 1px solid #e8eef2;
}
.company-application-list article:last-child {
  border: 0;
}
.company-application-list h2 {
  font-size: 17px;
  margin: 0 0 8px;
}
.company-application-list p {
  font-size: 13px;
  color: #617689;
  margin: 4px 0;
}
.company-application-list time {
  font-size: 12px;
  color: #8999a8;
}
@media (max-width: 600px) {
  .company-applications > header {
    align-items: flex-start;
  }
  .company-applications h1 {
    font-size: 24px;
  }
  .company-applications > header .app-button {
    white-space: nowrap;
    padding: 8px;
  }
  .company-application-list {
    padding: 0 17px;
  }
  .company-application-list article {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 12px;
  }
  .company-application-list .app-button {
    grid-column: 1/-1;
    justify-self: start;
  }
}
</style>
