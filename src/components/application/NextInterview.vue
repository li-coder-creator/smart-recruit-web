<template>
  <section class="app-next" aria-label="近期面试" :aria-busy="loading">
    <h2>近期面试</h2>
    <el-skeleton v-if="loading" :rows="4" animated />
    <div v-else-if="error" class="app-next-state" role="alert">
      <p class="app-error">{{ error }}</p>
      <button type="button" class="app-text-button" @click="$emit('retry')">重新读取面试</button>
    </div>
    <div v-else-if="!data?.interview" class="app-next-state">
      <el-icon><Calendar /></el-icon>
      <h3>暂无待参加的面试</h3>
      <p>企业确认安排后，会显示在这里。</p>
    </div>
    <template v-else>
      <p class="app-next-date">
        <el-icon><Calendar /></el-icon>{{ dateLabel }}
      </p>
      <p class="app-next-time">{{ data.interview.startTime?.slice(11, 16) }}</p>
      <h3 class="app-next-job">{{ data.interview.jobTitle || '岗位信息不可用' }}</h3>
      <p class="app-next-company">{{ data.interview.companyName || '企业信息不可用' }}</p>
      <p class="app-next-mode">
        <el-icon
          ><VideoCamera v-if="data.interview.mode === INTERVIEW_MODE.ONLINE" /><Location
            v-else /></el-icon
        >{{
          data.interview.mode === INTERVIEW_MODE.ONLINE
            ? `线上面试 · ${data.interview.platform || '平台待核实'}`
            : '线下面试'
        }}
      </p>
      <p class="app-pill" :class="INTERVIEW_TIMING_META[timing]?.tone">
        <el-icon><Clock /></el-icon>{{ interviewCountdown(data.interview, now) }}
      </p>
      <button
        type="button"
        class="app-button green app-next-button"
        @click="$emit('detail', data.interview.applicationId)"
      >
        查看面试安排
      </button>
      <button
        v-if="timing === INTERVIEW_TIMING.EXPIRED"
        type="button"
        class="app-text-button"
        @click="$emit('retry')"
      >
        刷新最新面试
      </button>
    </template>
  </section>
</template>
<script setup>
import { computed, watch } from 'vue'
import { Calendar, Clock, VideoCamera, Location } from '@element-plus/icons-vue'
import { useApplicationClock } from '@/composables/useApplicationClock'
import { INTERVIEW_MODE, INTERVIEW_TIMING, INTERVIEW_TIMING_META } from '@/constants/application'
import { interviewCountdown, interviewTiming, localTimeEpoch } from '@/utils/application'
const props = defineProps({
  data: { type: Object, default: null },
  loading: Boolean,
  error: { type: String, default: '' },
})
defineEmits(['detail', 'retry'])
const { now, sync } = useApplicationClock()
watch(
  () => props.data,
  (data) => {
    if (data) sync(data)
  },
  { immediate: true },
)
const timing = computed(() =>
  props.data?.interview ? interviewTiming(props.data.interview, now.value) : null,
)
const dateLabel = computed(() => {
  const epoch = localTimeEpoch(props.data?.interview?.startTime)
  return Number.isFinite(epoch)
    ? new Intl.DateTimeFormat('zh-CN', {
        timeZone: 'Asia/Shanghai',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      }).format(epoch)
    : '时间待核实'
})
</script>
<style scoped>
.app-next {
  padding: 23px;
  background: white;
  border-radius: 14px;
  overflow-wrap: anywhere;
}
.app-next h2 {
  font-size: 21px;
  line-height: 1.4;
  margin: 0 0 17px;
}
.app-next-date,
.app-next-mode {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #75879a;
  margin: 0;
}
.app-next-date .el-icon,
.app-next-mode .el-icon {
  font-size: 17px;
  flex-shrink: 0;
}
.app-next-time {
  font:
    750 38px/1.3 Arial,
    sans-serif;
  letter-spacing: -1px;
  margin: 17px 0 12px;
  color: #172e46;
}
.app-next-job {
  font-size: 18px;
  line-height: 1.6;
  margin: 0;
  font-weight: 650;
}
.app-next-company {
  font-size: 13px;
  color: #66768a;
  margin: 2px 0 20px;
}
.app-next-mode {
  color: #5c7187;
}
.app-next .app-pill {
  margin: 17px 0 16px;
}
.app-next-button {
  width: 100%;
  padding: 11px;
}
.app-next-state {
  font-size: 13px;
  color: var(--app-muted);
  padding: 12px 0;
}
.app-next-state > .el-icon {
  font-size: 27px;
  color: #90b8a9;
}
.app-next-state h3 {
  font-size: 15px;
  color: #52687c;
  margin-bottom: 5px;
}
.app-next-state p {
  margin: 0 0 12px;
}
.app-next .app-text-button {
  margin-top: 12px;
  font-size: 13px;
}
</style>
