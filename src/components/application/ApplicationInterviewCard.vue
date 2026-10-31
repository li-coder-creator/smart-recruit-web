<template>
  <article
    class="app-interview-card"
    :aria-label="`面试安排 ${formatApplicationTime(interview.startTime)}`"
  >
    <header>
      <h4>{{ interview.mode === INTERVIEW_MODE.ONLINE ? '线上面试' : '线下面试' }}</h4>
      <span class="app-pill" :class="meta?.tone">{{ meta?.label || '时间待核实' }}</span>
    </header>
    <p class="app-interview-times">
      {{ formatApplicationTime(interview.startTime) }} 至
      {{ formatApplicationTime(interview.endTime) }}
    </p>
    <p v-if="interview.mode === INTERVIEW_MODE.ONLINE">
      平台：{{ interview.platform || '平台信息不可用' }}
    </p>
    <p v-else>地址：{{ interview.address || '地址信息不可用' }}</p>
    <p v-if="interview.candidateNote" class="app-interview-note">{{ interview.candidateNote }}</p>
    <p v-if="interview.status === INTERVIEW_STATUS.CANCELLED" class="app-interview-cancel">
      取消原因：{{ interview.cancelReason || '未提供原因' }}<br />取消时间：{{
        formatApplicationTime(interview.cancelledAt)
      }}
    </p>
    <div class="app-interview-actions">
      <a
        v-if="canUse && meetingUrl"
        class="app-button green"
        :href="meetingUrl"
        target="_blank"
        rel="noopener noreferrer"
        >打开会议链接 <el-icon><TopRight /></el-icon
      ></a>
      <button v-if="canUse" type="button" class="app-button" @click="exportCalendar">
        <el-icon><Calendar /></el-icon>添加到日历
      </button>
      <slot name="actions" />
    </div>
  </article>
</template>
<script setup>
import { computed } from 'vue'
import { Calendar, TopRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  APPLICATION_STATUS,
  INTERVIEW_MODE,
  INTERVIEW_STATUS,
  INTERVIEW_TIMING,
  INTERVIEW_TIMING_META,
} from '@/constants/application'
import { formatApplicationTime, interviewTiming, safeMeetingUrl } from '@/utils/application'
import { downloadInterviewCalendar } from '@/utils/interviewCalendar'
const props = defineProps({
  interview: { type: Object, required: true },
  context: { type: Object, default: () => ({}) },
  now: { type: Number, required: true },
  applicationStatus: { type: Number, required: true },
})
const timing = computed(() => interviewTiming(props.interview, props.now))
const meta = computed(() => INTERVIEW_TIMING_META[timing.value])
const meetingUrl = computed(() => safeMeetingUrl(props.interview.meetingUrl))
const canUse = computed(
  () =>
    props.applicationStatus === APPLICATION_STATUS.INTERVIEW &&
    [INTERVIEW_TIMING.UPCOMING, INTERVIEW_TIMING.ONGOING].includes(timing.value),
)
const exportCalendar = () => {
  try {
    downloadInterviewCalendar(props.interview, props.context, props.now)
    ElMessage.success('日历文件已下载；面试改期后请重新导入')
  } catch (error) {
    ElMessage.error(error.message || '日历导出失败，请刷新后重试')
  }
}
</script>
