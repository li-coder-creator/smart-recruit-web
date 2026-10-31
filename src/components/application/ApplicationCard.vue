<template>
  <article class="app-job-row" :aria-label="`${item.jobTitle || '岗位信息不可用'} ${statusLabel}`">
    <div class="app-logo" aria-hidden="true">
      <img v-if="logoUrl && !logoFailed" :src="logoUrl" alt="" @error="logoFailed = true" /><span
        v-else
        >{{ (item.companyName?.trim() || '企').slice(0, 1) }}</span
      >
    </div>
    <div class="app-job-info">
      <div class="app-job-heading">
        <h2 :title="item.jobTitle || '岗位信息不可用'">{{ item.jobTitle || '岗位信息不可用' }}</h2>
        <span class="app-salary">{{ formatApplicationSalary(item) }}</span>
      </div>
      <p class="app-company">
        {{
          [item.companyName || '企业信息不可用', item.city, item.employment]
            .filter(Boolean)
            .join(' · ')
        }}
      </p>
      <p class="app-resume">
        <el-icon aria-hidden="true"><Document /></el-icon
        ><span :title="applicationResumeLabel(item)">{{ applicationResumeLabel(item) }}</span
        ><span class="app-separator">|</span
        ><time :datetime="item.createTime">{{ formatApplicationTime(item.createTime, true) }}</time>
      </p>
    </div>
    <div v-if="item.status === APPLICATION_STATUS.REJECTED" class="app-rejected">
      本次未通过 · 继续加油
    </div>
    <div v-else class="app-progress" :aria-label="`当前状态：${statusLabel}；历史以详情记录为准`">
      <div
        v-for="(step, index) in steps"
        :key="step.status"
        class="app-step"
        :class="{
          current: item.status === step.status,
          submitted: index === 0 && item.status !== APPLICATION_STATUS.PENDING,
          interview: item.status === APPLICATION_STATUS.INTERVIEW && item.status === step.status,
          pending: item.status === APPLICATION_STATUS.PENDING && index === 0,
        }"
      >
        <span class="app-dot"></span><span>{{ step.label }}</span>
      </div>
    </div>
    <button
      type="button"
      class="app-button green app-row-detail"
      :aria-label="`查看${item.jobTitle || '岗位'}投递详情`"
      @click="$emit('detail', item.id)"
    >
      查看详情
    </button>
  </article>
</template>
<script setup>
import { computed, ref, watch } from 'vue'
import { Document } from '@element-plus/icons-vue'
import { APPLICATION_STATUS, MY_APPLICATION_STATUS_META } from '@/constants/application'
import {
  applicationResumeLabel,
  formatApplicationSalary,
  formatApplicationTime,
  safeMeetingUrl,
} from '@/utils/application'
const props = defineProps({ item: { type: Object, required: true } })
defineEmits(['detail'])
const logoFailed = ref(false)
const logoUrl = computed(() => safeMeetingUrl(props.item.companyLogo))
watch(
  () => props.item.companyLogo,
  () => {
    logoFailed.value = false
  },
)
const statusLabel = computed(
  () =>
    MY_APPLICATION_STATUS_META[props.item.status]?.label || props.item.statusText || '状态暂不可用',
)
const steps = [
  { status: APPLICATION_STATUS.PENDING, label: '已投递' },
  { status: APPLICATION_STATUS.SCREENING, label: '筛选中' },
  { status: APPLICATION_STATUS.INTERVIEW, label: '面试' },
  { status: APPLICATION_STATUS.HIRED, label: '录用' },
]
</script>
<style scoped>
.app-job-row {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) 188px 94px;
  gap: 14px;
  align-items: center;
  min-height: 112px;
  padding: 18px 0;
  border-bottom: 1px solid var(--app-line);
  box-sizing: border-box;
}
.app-job-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}
.app-job-heading h2 {
  font-size: 15px;
  font-weight: 650;
  line-height: 1.6;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.app-salary {
  color: var(--app-green);
  font-size: 13px;
  font-weight: 650;
  white-space: nowrap;
}
.app-company {
  color: #66768a;
  font-size: 13px;
  margin: 3px 0 5px;
  overflow-wrap: anywhere;
}
.app-resume {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  color: #8290a2;
  margin: 0;
  min-width: 0;
}
.app-resume > span:first-of-type {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 210px;
}
.app-resume .el-icon {
  font-size: 14px;
  flex-shrink: 0;
}
.app-resume time {
  white-space: nowrap;
}
.app-separator {
  color: #c8d2da;
}
.app-progress {
  display: flex;
  align-items: flex-start;
  margin: 0 2px;
}
.app-step {
  position: relative;
  flex: 1;
  text-align: center;
  color: #94a2b2;
  font-size: 10px;
}
.app-step:before {
  content: '';
  position: absolute;
  height: 1px;
  background: #e3e9ed;
  top: 9px;
  left: -50%;
  width: 100%;
}
.app-step:first-child:before {
  display: none;
}
.app-dot {
  position: relative;
  display: block;
  width: 13px;
  height: 13px;
  margin: 1px auto 7px;
  border: 2px solid white;
  border-radius: 50%;
  background: #cbd5df;
  box-sizing: content-box;
}
.app-step.submitted .app-dot,
.app-step.current .app-dot {
  background: var(--app-green);
}
.app-step.current {
  color: var(--app-green);
  font-weight: 600;
}
.app-step.current .app-dot {
  box-shadow: 0 0 0 1px var(--app-green);
}
.app-step.interview {
  color: var(--app-orange);
}
.app-step.interview .app-dot {
  background: var(--app-orange);
  box-shadow: 0 0 0 1px var(--app-orange);
}
.app-step.pending {
  color: #718196;
}
.app-step.pending .app-dot {
  background: #8696a9;
  box-shadow: 0 0 0 1px #8696a9;
}
.app-rejected {
  color: #b66f76;
  background: #fff5f6;
  border-radius: 7px;
  padding: 7px 9px;
  font-size: 12px;
  text-align: center;
}
.app-row-detail {
  padding: 8px 10px;
  white-space: nowrap;
}
@media (max-width: 1250px) {
  .app-job-row {
    grid-template-columns: 44px minmax(0, 1fr) 94px;
  }
  .app-progress,
  .app-rejected {
    grid-column: 2;
    grid-row: 2;
    max-width: 200px;
    margin: 0;
  }
  .app-row-detail {
    grid-column: 3;
    grid-row: 1/3;
  }
  .app-logo {
    grid-row: 1/3;
  }
  .app-job-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 1px;
  }
  .app-job-row {
    row-gap: 9px;
  }
  .app-job-heading h2 {
    white-space: normal;
  }
}
@media (max-width: 600px) {
  .app-job-row {
    grid-template-columns: 38px minmax(0, 1fr);
    gap: 10px;
    padding: 20px 0;
  }
  .app-logo {
    width: 38px;
    height: 38px;
    grid-row: 1;
    align-self: start;
  }
  .app-job-info {
    grid-column: 2;
  }
  .app-progress,
  .app-rejected {
    grid-column: 2;
    grid-row: 2;
    width: 190px;
  }
  .app-row-detail {
    grid-column: 2;
    grid-row: 3;
    justify-self: start;
    margin-top: 3px;
  }
  .app-resume {
    flex-wrap: wrap;
    gap: 5px;
  }
  .app-resume > span:first-of-type {
    max-width: 170px;
  }
  .app-job-heading h2 {
    font-size: 15px;
  }
  .app-company {
    font-size: 12px;
  }
}
</style>
