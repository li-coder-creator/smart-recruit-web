<template>
  <section
    class="application-module app-detail-content"
    aria-label="投递详情内容"
    :aria-busy="loading"
  >
    <div class="app-detail-tools">
      <button type="button" class="app-text-button" :disabled="loading" @click="loadDetail(true)">
        <el-icon><Refresh /></el-icon>刷新详情
      </button>
    </div>
    <el-skeleton v-if="loading" :rows="9" animated />
    <div v-else-if="error" class="app-error-box" role="alert">
      <p class="app-error">{{ error }}</p>
      <button type="button" class="app-button green" @click="loadDetail(true)">重新读取详情</button>
    </div>
    <template v-else-if="detail">
      <div class="app-detail-heading">
        <div class="app-logo large" aria-hidden="true">
          {{ (detail.companyName?.trim() || '企').slice(0, 1) }}
        </div>
        <div>
          <h2>{{ detail.jobTitle || '岗位信息不可用' }}</h2>
          <p class="app-detail-company">
            {{
              [detail.companyName || '企业信息不可用', detail.city, detail.employment]
                .filter(Boolean)
                .join(' · ')
            }}
          </p>
        </div>
      </div>
      <p class="app-detail-salary">{{ formatApplicationSalary(detail) }}</p>
      <dl class="app-detail-meta">
        <div>
          <dt>当前状态</dt>
          <dd>
            <el-tag :type="statusMeta?.tagType || 'info'">{{
              statusMeta?.label || detail.statusText
            }}</el-tag>
          </dd>
        </div>
        <div>
          <dt>投递时间</dt>
          <dd>{{ formatApplicationTime(detail.createTime) }}</dd>
        </div>
        <div>
          <dt>投递简历</dt>
          <dd>{{ applicationResumeLabel(detail) }}</dd>
        </div>
        <div>
          <dt>投递编号</dt>
          <dd>{{ detail.id }}</dd>
        </div>
      </dl>
      <div class="app-detail-links">
        <router-link
          v-if="detail.jobViewable && detail.jobId"
          class="app-button green"
          :to="{ path: '/layout/job/info', query: { id: detail.jobId } }"
          >查看岗位</router-link
        ><span v-else class="app-muted">岗位当前不可查看，投递记录仍保留。</span
        ><router-link
          v-if="detail.resumeAvailable && detail.resumeId"
          class="app-button"
          :to="{ path: '/layout/resume/edit', query: { id: detail.resumeId } }"
          >查看当前简历</router-link
        >
      </div>
      <section
        ref="interviewsSection"
        class="app-detail-section"
        tabindex="-1"
        aria-label="本次投递的面试安排"
      >
        <h3>面试安排</h3>
        <p v-if="!detail.interviews.length" class="app-muted">
          {{
            detail.status === APPLICATION_STATUS.INTERVIEW
              ? '已进入面试阶段，企业尚未安排具体场次。'
              : '暂无已记录的面试安排。'
          }}
        </p>
        <ApplicationInterviewCard
          v-for="interview in detail.interviews"
          :key="interview.id"
          :interview="interview"
          :context="detail"
          :now="now"
          :application-status="detail.status"
        />
      </section>
      <section class="app-detail-section" aria-label="真实投递进展">
        <h3>投递进展</h3>
        <p v-if="!detail.historyComplete" class="app-history-note">
          该投递的早期历史未完整记录，以下仅展示已记录进展。
        </p>
        <p v-if="!detail.events.length" class="app-muted">暂无已记录进展。</p>
        <ol v-else class="app-timeline">
          <li v-for="event in detail.events" :key="event.id">
            <h4>{{ event.summary || '进展更新' }}</h4>
            <p v-if="event.eventType === 'APPLIED'">简历已送达企业，等待招聘人员处理。</p>
            <template v-if="event.interviewChange"
              ><p v-if="event.interviewChange.previousStartTime">
                原安排：{{ formatApplicationTime(event.interviewChange.previousStartTime) }} 至
                {{ formatApplicationTime(event.interviewChange.previousEndTime) }}
              </p>
              <p>
                面试时间：{{ formatApplicationTime(event.interviewChange.startTime) }} 至
                {{ formatApplicationTime(event.interviewChange.endTime) }}
              </p>
              <p v-if="event.interviewChange.cancelReason">
                取消原因：{{ event.interviewChange.cancelReason }}
              </p></template
            ><time :datetime="event.occurredAt">{{ formatApplicationTime(event.occurredAt) }}</time>
          </li>
        </ol>
      </section>
      <p class="app-detail-footnote">处理进展由招聘企业更新。岗位、企业和简历资料展示当前信息。</p>
    </template>
  </section>
</template>
<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { getMyApplicationDetail } from '@/api/application'
import { APPLICATION_STATUS, MY_APPLICATION_STATUS_META } from '@/constants/application'
import {
  applicationData,
  applicationResumeLabel,
  formatApplicationSalary,
  formatApplicationTime,
  isApplicationId,
} from '@/utils/application'
import { useApplicationClock } from '@/composables/useApplicationClock'
import ApplicationInterviewCard from '@/components/application/ApplicationInterviewCard.vue'
import '@/assets/application.css'
const props = defineProps({
  applicationId: { type: [Number, String], required: true },
  focusInterviews: Boolean,
})
const emit = defineEmits(['changed'])
const detail = ref(null),
  loading = ref(false),
  error = ref(''),
  interviewsSection = ref(null)
const { now, sync } = useApplicationClock()
const statusMeta = computed(() => MY_APPLICATION_STATUS_META[detail.value?.status])
let sequence = 0,
  controller
const loadDetail = async (refreshRelated = false) => {
  controller?.abort()
  controller = new AbortController()
  const current = ++sequence,
    id = props.applicationId
  loading.value = true
  error.value = ''
  detail.value = null
  try {
    if (!isApplicationId(id)) throw new Error('投递编号无效')
    const data = applicationData(await getMyApplicationDetail(id, { signal: controller.signal }))
    if (current !== sequence) return
    if (
      !data ||
      String(data.id) !== String(id) ||
      !Array.isArray(data.events) ||
      !Array.isArray(data.interviews) ||
      typeof data.historyComplete !== 'boolean' ||
      !MY_APPLICATION_STATUS_META[data.status]
    )
      throw new Error('投递详情响应异常，请重新读取')
    sync(data)
    detail.value = data
    if (refreshRelated) emit('changed')
    loading.value = false
    await nextTick()
    if (props.focusInterviews && current === sequence)
      interviewsSection.value?.focus({ preventScroll: false })
  } catch (cause) {
    if (current === sequence && cause.code !== 'ERR_CANCELED')
      error.value = cause.message || '投递详情读取失败'
  } finally {
    if (current === sequence) loading.value = false
  }
}
watch(
  () => props.applicationId,
  () => loadDetail(),
  { immediate: true },
)
onBeforeUnmount(() => {
  sequence++
  controller?.abort()
})
</script>
<style scoped>
.app-detail-tools {
  display: flex;
  justify-content: flex-end;
  margin: 0 0 15px;
}
.app-detail-tools button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
}
.app-detail-content .app-muted {
  font-size: 13px;
  line-height: 1.8;
}
.app-detail-section:focus {
  outline: none;
}
</style>
