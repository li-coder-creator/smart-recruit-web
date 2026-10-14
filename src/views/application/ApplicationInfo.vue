<template>
  <main class="application-detail">
    <div class="toolbar">
      <el-button link :disabled="busy" @click="router.push('/layout/application')"
        >← 返回投递列表</el-button
      >
      <el-button :disabled="busy || loading" @click="loadDetail">刷新详情</el-button>
    </div>
    <el-skeleton v-if="loading" :rows="6" animated />
    <el-result v-else-if="readError" icon="error" title="投递详情暂不可用" :sub-title="readError">
      <template #extra
        ><el-button :disabled="busy" @click="loadDetail">重新读取</el-button></template
      >
    </el-result>
    <article v-else-if="application" class="surface">
      <header>
        <div>
          <h1>投递详情</h1>
          <p>{{ application.jobTitle || '岗位名称不可用' }}</p>
        </div>
        <el-tag :type="statusMeta?.tagType || 'info'">{{
          statusMeta?.label || application.statusText || '未知状态'
        }}</el-tag>
      </header>
      <dl>
        <div>
          <dt>投递编号</dt>
          <dd>{{ application.id }}</dd>
        </div>
        <div>
          <dt>企业</dt>
          <dd>{{ application.companyName || '企业名称不可用' }}</dd>
        </div>
        <div v-if="isCompany">
          <dt>求职者账号</dt>
          <dd>{{ application.username || '账号信息不可用' }}</dd>
        </div>
        <div>
          <dt>投递简历</dt>
          <dd>
            {{
              application.resumeTitle ||
              (application.resumeAvailable === false ? '原简历已删除' : '简历名称未填写')
            }}
          </dd>
        </div>
        <div>
          <dt>投递时间</dt>
          <dd>{{ formatTime(application.createTime) }}</dd>
        </div>
        <div>
          <dt>更新时间</dt>
          <dd>{{ formatTime(application.updateTime) }}</dd>
        </div>
      </dl>
      <el-alert
        v-if="application.resumeAvailable === false"
        type="info"
        :closable="false"
        show-icon
        title="原简历已不存在，投递记录仍保留。"
      />
      <section v-if="isCompany" class="status-section" aria-label="投递状态处理">
        <h2>处理投递</h2>
        <p class="hint">允许跳过中间阶段向前推进，不可退回；录用、拒绝后不可再次修改。</p>
        <el-alert
          v-if="!statusMeta"
          type="warning"
          :closable="false"
          title="投递状态无法识别，请刷新核实后再处理。"
        />
        <p v-else-if="!nextStatuses.length" class="terminal" role="status">
          当前已{{ statusMeta.label }}，处理已结束。
        </p>
        <el-form v-else @submit.prevent="updateStatus">
          <el-form-item label="推进到" label-for="application-next-status">
            <el-select
              id="application-next-status"
              v-model="selectedStatus"
              placeholder="请选择下一状态"
              :disabled="busy || requiresRefresh"
            >
              <el-option
                v-for="status in nextStatuses"
                :key="status"
                :value="status"
                :label="APPLICATION_STATUS_META[status].label"
              />
            </el-select>
          </el-form-item>
          <el-button
            type="primary"
            :disabled="busy || requiresRefresh || !nextStatuses.includes(selectedStatus)"
            :loading="busy"
            @click="updateStatus"
            >更新状态</el-button
          >
        </el-form>
        <div v-if="updateError" class="update-error" role="alert">
          <p>{{ updateError }}</p>
          <p>请刷新详情核实当前状态后再操作。</p>
          <el-button :disabled="busy" @click="loadDetail">刷新后再处理</el-button>
        </div>
      </section>
      <p v-else class="hint">处理进展由招聘企业更新，你可以刷新查看最新状态。</p>
      <el-button
        v-if="isCompany && application.jobId"
        class="job-link"
        :disabled="busy"
        @click="router.push({ path: '/layout/job/info', query: { id: application.jobId } })"
        >查看岗位与招聘进展</el-button
      >
    </article>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getApplicationDetail, updateApplicationStatus } from '@/api/application'
import { useUserStore } from '@/stores/user'
import { APPLICATION_STATUS_META, APPLICATION_TRANSITIONS } from '@/constants/application'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const isCompany = computed(() => userStore.role === 'COMPANY')
const application = ref(null)
const loading = ref(false)
const busy = ref(false)
const readError = ref('')
const updateError = ref('')
const requiresRefresh = ref(false)
const selectedStatus = ref(null)
const statusMeta = computed(() => APPLICATION_STATUS_META[application.value?.status])
const nextStatuses = computed(() => APPLICATION_TRANSITIONS[application.value?.status] || [])
const formatTime = (value) => (value ? value.replace('T', ' ').slice(0, 19) : '—')
let readSequence = 0

const loadDetail = async () => {
  const sequence = ++readSequence
  loading.value = true
  application.value = null
  selectedStatus.value = null
  readError.value = ''
  updateError.value = ''
  requiresRefresh.value = false
  try {
    const id = route.query.id
    if (typeof id !== 'string' || !/^[1-9]\d*$/.test(id)) throw new Error('投递编号无效')
    const response = await getApplicationDetail(id)
    if (sequence !== readSequence) return false
    const data = response.data.data
    if (!data || String(data.id) !== id || !Number.isInteger(data.status))
      throw new Error('投递详情响应格式异常')
    application.value = data
    return true
  } catch (error) {
    if (sequence === readSequence) readError.value = error.message || '读取失败，请稍后重试'
    return false
  } finally {
    if (sequence === readSequence) loading.value = false
  }
}

const updateStatus = async () => {
  if (
    !isCompany.value ||
    busy.value ||
    loading.value ||
    requiresRefresh.value ||
    !application.value ||
    !nextStatuses.value.includes(selectedStatus.value)
  )
    return
  const id = application.value.id
  const targetStatus = selectedStatus.value
  const targetLabel = APPLICATION_STATUS_META[targetStatus].label
  busy.value = true
  updateError.value = ''
  try {
    try {
      await ElMessageBox.confirm(
        '确认将此投递从“' +
          statusMeta.value.label +
          '”推进为“' +
          targetLabel +
          '”？提交后不能退回原状态。',
        '确认推进投递',
        { confirmButtonText: '确认更新', cancelButtonText: '取消', type: 'warning' },
      )
    } catch {
      return
    }
    await updateApplicationStatus(id, { status: targetStatus })
    ElMessage.success('投递已更新为' + targetLabel)
    // 修改成功与重新读取是两件事；读取失败时不能把已成功的写入报告为失败。
    if (!(await loadDetail())) readError.value = '状态已更新，但详情刷新失败：' + readError.value
  } catch (error) {
    updateError.value = error.message || '操作结果暂未确认'
    // 后端可能已被其他处理人更新，或网络超时导致结果未知；刷新前禁止重复提交。
    requiresRefresh.value = true
  } finally {
    busy.value = false
  }
}

// 登录过期时允许公共拦截器跳转登录页。
onBeforeRouteLeave((to) => !busy.value || to.path === '/login')
onBeforeRouteUpdate(() => !busy.value)
watch(() => route.query.id, loadDetail, { immediate: true })
onBeforeUnmount(() => {
  readSequence++
})
</script>

<style scoped>
.application-detail {
  max-width: 940px;
  margin: 0 auto 36px;
  color: #34475d;
  --el-color-primary: #0aa88d;
}
.toolbar,
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}
.toolbar {
  margin-bottom: 22px;
}
.surface {
  background: white;
  border: 1px solid #e0e9ee;
  border-radius: 10px;
  padding: 28px;
  overflow-wrap: anywhere;
}
h1 {
  margin: 0;
  font-size: 26px;
  color: #20384c;
}
h2 {
  font-size: 18px;
  color: #20384c;
}
header p {
  line-height: 1.6;
  margin-bottom: 0;
}
dl {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 24px;
  margin: 28px 0;
}
dt {
  color: #718497;
  font-size: 13px;
}
dd {
  margin: 8px 0 0;
  line-height: 1.6;
  font-size: 14px;
}
.status-section {
  border-top: 1px solid #edf1f4;
  padding-top: 16px;
  margin-top: 24px;
}
.hint {
  color: #718497;
  font-size: 13px;
  line-height: 1.8;
}
.el-form {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
}
.el-select {
  width: 210px;
}
.terminal {
  background: #eefaf6;
  padding: 14px;
  border-radius: 6px;
}
.update-error {
  color: #b04e47;
  font-size: 14px;
}
.job-link {
  margin-top: 20px;
}
@media (max-width: 560px) {
  .surface {
    padding: 20px;
  }
  dl {
    grid-template-columns: 1fr;
  }
  h1 {
    font-size: 23px;
  }
}
</style>
