<template>
  <section class="application-module company-interviews" aria-label="企业面试排期">
    <header class="manager-heading">
      <div>
        <h2>面试安排</h2>
        <p>安排、改期和取消将同步给求职者。</p>
      </div>
      <div class="manager-tools">
        <button type="button" class="app-button" :disabled="busy || loading" @click="refresh">
          刷新安排</button
        ><button
          v-if="applicationStatus === APPLICATION_STATUS.INTERVIEW"
          type="button"
          class="app-button green"
          :disabled="!canCreate"
          :title="hasOpen ? '已有未结束的面试安排' : undefined"
          @click="openCreate"
        >
          安排面试
        </button>
      </div>
    </header>
    <p v-if="applicationStatus !== APPLICATION_STATUS.INTERVIEW" class="manager-hint">
      {{
        terminal ? '投递流程已结束，可以查看历史面试安排。' : '先将投递推进至面试阶段，再安排面试。'
      }}
    </p>
    <p v-else-if="hasOpen && !requiresRefresh" class="manager-hint">
      当前已有未结束安排，可改期或取消后重新安排。
    </p>
    <el-skeleton v-if="loading" :rows="4" animated />
    <div v-else-if="readError" role="alert" class="app-error-box">
      <p class="app-error">{{ readError }}</p>
      <button type="button" class="app-button green" :disabled="busy" @click="refresh">
        重新读取面试安排
      </button>
    </div>
    <template v-else
      ><p v-if="!items.length" class="manager-hint">暂无已记录的面试场次。</p>
      <ApplicationInterviewCard
        v-for="interview in items"
        :key="interview.id"
        :interview="interview"
        :context="context"
        :now="now"
        :application-status="applicationStatus"
        ><template #actions
          ><button
            v-if="canEdit(interview)"
            type="button"
            class="app-button green"
            :disabled="busy || requiresRefresh"
            @click="openEdit(interview)"
          >
            改期</button
          ><button
            v-if="canCancel(interview)"
            type="button"
            class="app-button"
            :disabled="busy || requiresRefresh"
            @click="openCancel(interview)"
          >
            取消面试
          </button></template
        ></ApplicationInterviewCard
      ></template
    >
    <div v-if="writeError || requiresRefresh" class="manager-conflict" role="alert">
      <p>{{ writeError || '需要重新读取面试安排后再操作。' }}</p>
      <button type="button" class="app-text-button" :disabled="busy" @click="refresh">
        刷新投递与安排后再操作
      </button>
    </div>

    <el-dialog
      v-model="dialogOpen"
      :title="selected ? '修改面试安排' : '安排面试'"
      width="min(600px, calc(100vw - 24px))"
      :close-on-click-modal="false"
      :before-close="beforeClose"
      destroy-on-close
      class="interview-editor"
    >
      <form class="interview-form" novalidate @submit.prevent="save">
        <p class="form-time-note">面试时间按北京时间填写。</p>
        <div class="time-fields">
          <div class="form-field">
            <label for="interview-start">开始时间</label
            ><input
              id="interview-start"
              v-model="form.startTime"
              type="datetime-local"
              :step="TIME_STEP_SECONDS"
              :disabled="busy"
              :aria-invalid="!!errors.startTime"
            />
            <p v-if="errors.startTime" class="field-error">{{ errors.startTime }}</p>
          </div>
          <div class="form-field">
            <label for="interview-end">结束时间</label
            ><input
              id="interview-end"
              v-model="form.endTime"
              type="datetime-local"
              :step="TIME_STEP_SECONDS"
              :disabled="busy"
              :aria-invalid="!!errors.endTime"
            />
            <p v-if="errors.endTime" class="field-error">{{ errors.endTime }}</p>
          </div>
        </div>
        <div class="form-field">
          <label for="interview-mode">面试方式</label
          ><select id="interview-mode" v-model="form.mode" :disabled="busy">
            <option :value="INTERVIEW_MODE.ONLINE">线上面试</option>
            <option :value="INTERVIEW_MODE.OFFLINE">线下面试</option>
          </select>
          <p v-if="errors.mode" class="field-error">{{ errors.mode }}</p>
        </div>
        <template v-if="form.mode === INTERVIEW_MODE.ONLINE"
          ><div class="form-field">
            <label for="interview-platform">线上平台</label
            ><input
              id="interview-platform"
              v-model="form.platform"
              :maxlength="INTERVIEW_LIMITS.PLATFORM"
              :disabled="busy"
              placeholder="例如：腾讯会议"
            />
            <p v-if="errors.platform" class="field-error">{{ errors.platform }}</p>
          </div>
          <div class="form-field">
            <label for="interview-link">会议链接</label
            ><input
              id="interview-link"
              v-model="form.meetingUrl"
              type="url"
              :maxlength="INTERVIEW_LIMITS.MEETING_URL"
              :disabled="busy"
              placeholder="https://"
            />
            <p v-if="errors.meetingUrl" class="field-error">{{ errors.meetingUrl }}</p>
          </div></template
        >
        <div v-else class="form-field">
          <label for="interview-address">面试地址</label
          ><input
            id="interview-address"
            v-model="form.address"
            :maxlength="INTERVIEW_LIMITS.ADDRESS"
            :disabled="busy"
            placeholder="请填写详细地址"
          />
          <p v-if="errors.address" class="field-error">{{ errors.address }}</p>
        </div>
        <div class="form-field">
          <label for="interview-note">给求职者的说明 <span>选填</span></label
          ><textarea
            id="interview-note"
            v-model="form.candidateNote"
            :maxlength="INTERVIEW_LIMITS.NOTE"
            :disabled="busy"
            rows="3"
            placeholder="例如需准备的材料或到访说明"
          />
          <p v-if="errors.candidateNote" class="field-error">{{ errors.candidateNote }}</p>
        </div>
        <p v-if="writeError" class="field-error" role="alert">{{ writeError }}</p>
        <p v-if="requiresRefresh" class="manager-hint">
          请关闭窗口并刷新投递与安排，再核实是否已经保存。
        </p>
        <footer class="form-actions">
          <button type="button" class="app-button" :disabled="busy" @click="dialogOpen = false">
            暂不保存</button
          ><button type="submit" class="app-button primary" :disabled="busy || requiresRefresh">
            {{ busy ? '正在保存' : '保存面试安排' }}
          </button>
        </footer>
      </form>
    </el-dialog>
    <el-dialog
      v-model="cancelOpen"
      title="取消面试"
      width="min(460px, calc(100vw - 24px))"
      :close-on-click-modal="false"
      :before-close="beforeClose"
      destroy-on-close
    >
      <form class="interview-form" novalidate @submit.prevent="confirmCancel">
        <p class="form-time-note">取消后保留历史记录，求职者将看到取消原因。</p>
        <div class="form-field">
          <label for="interview-cancel-reason">取消原因</label
          ><textarea
            id="interview-cancel-reason"
            v-model="cancelReason"
            :maxlength="INTERVIEW_LIMITS.CANCEL_REASON"
            :disabled="busy"
            rows="4"
          />
          <p v-if="cancelError" class="field-error">{{ cancelError }}</p>
        </div>
        <p v-if="writeError" class="field-error" role="alert">{{ writeError }}</p>
        <footer class="form-actions">
          <button type="button" class="app-button" :disabled="busy" @click="cancelOpen = false">
            保留安排</button
          ><button type="submit" class="app-button primary" :disabled="busy || requiresRefresh">
            {{ busy ? '正在取消' : '确认取消面试' }}
          </button>
        </footer>
      </form>
    </el-dialog>
  </section>
</template>
<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getApplicationInterviews,
  createApplicationInterview,
  updateApplicationInterview,
  cancelApplicationInterview,
} from '@/api/application'
import {
  APPLICATION_STATUS,
  INTERVIEW_MODE,
  INTERVIEW_LIMITS,
  INTERVIEW_TIMING,
} from '@/constants/application'
import {
  applicationData,
  isApplicationId,
  interviewTiming,
  interviewPayload,
  validateInterviewForm,
} from '@/utils/application'
import { useApplicationClock } from '@/composables/useApplicationClock'
import ApplicationInterviewCard from '@/components/application/ApplicationInterviewCard.vue'
import '@/assets/application.css'
const props = defineProps({
  applicationId: { type: [Number, String], required: true },
  applicationStatus: { type: Number, required: true },
  context: { type: Object, required: true },
})
const emit = defineEmits(['busy-change', 'refresh-application'])
const TIME_STEP_SECONDS = 0.001
const items = ref([]),
  loading = ref(false),
  busy = ref(false),
  readError = ref(''),
  writeError = ref(''),
  requiresRefresh = ref(false)
const dialogOpen = ref(false),
  cancelOpen = ref(false),
  selected = ref(null),
  cancelTarget = ref(null),
  cancelReason = ref(''),
  cancelError = ref(''),
  errors = ref({})
const form = reactive({
  startTime: '',
  endTime: '',
  mode: INTERVIEW_MODE.ONLINE,
  platform: '',
  meetingUrl: '',
  address: '',
  candidateNote: '',
})
const { now, sync } = useApplicationClock()
let readSequence = 0,
  controller,
  alive = true
const terminal = computed(() =>
  [APPLICATION_STATUS.HIRED, APPLICATION_STATUS.REJECTED].includes(props.applicationStatus),
)
const operable = computed(
  () =>
    props.applicationStatus === APPLICATION_STATUS.INTERVIEW &&
    !loading.value &&
    !requiresRefresh.value &&
    Number.isFinite(now.value),
)
const hasOpen = computed(() =>
  items.value.some((item) =>
    [INTERVIEW_TIMING.UPCOMING, INTERVIEW_TIMING.ONGOING].includes(
      interviewTiming(item, now.value),
    ),
  ),
)
const canCreate = computed(() => operable.value && !busy.value && !hasOpen.value)
const canEdit = (item) =>
  operable.value && interviewTiming(item, now.value) === INTERVIEW_TIMING.UPCOMING
const canCancel = (item) =>
  operable.value &&
  [INTERVIEW_TIMING.UPCOMING, INTERVIEW_TIMING.ONGOING].includes(interviewTiming(item, now.value))
const loadInterviews = async () => {
  controller?.abort()
  controller = new AbortController()
  const sequence = ++readSequence,
    id = props.applicationId
  loading.value = true
  readError.value = ''
  items.value = []
  try {
    if (!isApplicationId(id)) throw new Error('投递编号无效')
    const data = applicationData(await getApplicationInterviews(id, { signal: controller.signal }))
    if (sequence !== readSequence) return false
    if (
      !data ||
      String(data.applicationId) !== String(id) ||
      !Array.isArray(data.items) ||
      data.items.some(
        (item) =>
          !isApplicationId(item.id) ||
          String(item.applicationId) !== String(id) ||
          !Number.isSafeInteger(item.version) ||
          item.version < 0,
      )
    )
      throw new Error('面试安排响应异常，请重新读取')
    sync(data)
    items.value = data.items
    requiresRefresh.value = false
    writeError.value = ''
    return true
  } catch (cause) {
    if (sequence === readSequence && cause.code !== 'ERR_CANCELED') {
      readError.value = cause.message || '面试安排读取失败'
      requiresRefresh.value = true
    }
    return false
  } finally {
    if (sequence === readSequence) loading.value = false
  }
}
const refresh = () => {
  if (requiresRefresh.value) emit('refresh-application')
  else loadInterviews()
}
const openCreate = () => {
  if (!canCreate.value) return
  selected.value = null
  errors.value = {}
  writeError.value = ''
  Object.assign(form, {
    startTime: '',
    endTime: '',
    mode: INTERVIEW_MODE.ONLINE,
    platform: '',
    meetingUrl: '',
    address: '',
    candidateNote: '',
  })
  dialogOpen.value = true
}
const openEdit = (item) => {
  if (!canEdit(item) || busy.value) return
  selected.value = { ...item }
  errors.value = {}
  writeError.value = ''
  Object.assign(form, {
    startTime: item.startTime,
    endTime: item.endTime,
    mode: item.mode,
    platform: item.platform || '',
    meetingUrl: item.meetingUrl || '',
    address: item.address || '',
    candidateNote: item.candidateNote || '',
  })
  dialogOpen.value = true
}
const openCancel = (item) => {
  if (!canCancel(item) || busy.value) return
  cancelTarget.value = { ...item }
  cancelReason.value = ''
  cancelError.value = ''
  writeError.value = ''
  cancelOpen.value = true
}
const beforeClose = (done) => {
  if (!busy.value) done()
}
const performWrite = async (operation, successMessage, closeDialog) => {
  busy.value = true
  writeError.value = ''
  try {
    applicationData(await operation())
    if (!alive) return
    closeDialog()
    ElMessage.success(successMessage)
    if (!(await loadInterviews()) && alive)
      writeError.value = '操作已成功，但安排刷新失败，请重新读取后再操作。'
  } catch (cause) {
    if (alive) {
      writeError.value = cause.message || '操作结果暂未确认'
      requiresRefresh.value = true
    }
  } finally {
    if (alive) busy.value = false
  }
}
const save = async () => {
  if (
    busy.value ||
    requiresRefresh.value ||
    props.applicationStatus !== APPLICATION_STATUS.INTERVIEW
  )
    return
  errors.value = validateInterviewForm(form, now.value)
  if (Object.keys(errors.value).length) return
  const id = props.applicationId,
    previous = selected.value,
    payload = interviewPayload(form, previous?.version)
  await performWrite(
    () =>
      previous
        ? updateApplicationInterview(id, previous.id, payload)
        : createApplicationInterview(id, payload),
    previous ? '面试安排已更新' : '面试已安排',
    () => {
      dialogOpen.value = false
    },
  )
}
const confirmCancel = async () => {
  if (
    busy.value ||
    requiresRefresh.value ||
    !cancelTarget.value ||
    props.applicationStatus !== APPLICATION_STATUS.INTERVIEW
  )
    return
  const reason = cancelReason.value.trim()
  cancelError.value = !reason
    ? '请填写取消原因'
    : reason.length > INTERVIEW_LIMITS.CANCEL_REASON
      ? `取消原因不能超过${INTERVIEW_LIMITS.CANCEL_REASON}个字符`
      : ''
  if (cancelError.value) return
  const id = props.applicationId,
    item = cancelTarget.value
  await performWrite(
    () => cancelApplicationInterview(id, item.id, { version: item.version, reason }),
    '面试已取消',
    () => {
      cancelOpen.value = false
    },
  )
}
watch(
  () => form.mode,
  (mode) => {
    if (mode === INTERVIEW_MODE.ONLINE) form.address = ''
    else {
      form.platform = ''
      form.meetingUrl = ''
    }
  },
)
watch(busy, (value) => emit('busy-change', value), { flush: 'sync' })
watch(
  () => props.applicationId,
  () => loadInterviews(),
  { immediate: true },
)
onBeforeUnmount(() => {
  alive = false
  readSequence++
  controller?.abort()
  emit('busy-change', false)
})
</script>
<style scoped>
.company-interviews {
  border-top: 1px solid #edf1f4;
  margin-top: 26px;
  padding-top: 22px;
}
.manager-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
}
.manager-heading h2 {
  margin: 0 0 5px;
  font-size: 19px;
}
.manager-heading p,
.manager-hint {
  font-size: 13px;
  color: #718497;
  line-height: 1.8;
  margin: 0 0 13px;
}
.manager-tools {
  display: flex;
  gap: 9px;
  flex-shrink: 0;
}
.manager-conflict {
  font-size: 13px;
  color: #b04e47;
  line-height: 1.8;
  margin-top: 15px;
}
.manager-conflict p {
  margin-bottom: 5px;
}
.interview-form {
  color: #34475d;
  font:
    14px/1.6 'Microsoft YaHei',
    Arial,
    sans-serif;
}
.form-time-note {
  font-size: 13px;
  color: #718497;
  margin: 0 0 20px;
}
.time-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.form-field {
  margin-bottom: 18px;
  min-width: 0;
}
.form-field label {
  display: block;
  margin-bottom: 7px;
  font-size: 13px;
  font-weight: 550;
}
.form-field label span {
  color: #8a99a8;
  font-weight: 400;
  font-size: 12px;
}
.form-field input,
.form-field select,
.form-field textarea {
  display: block;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #d9e5e7;
  border-radius: 6px;
  padding: 9px 10px;
  background: white;
  color: #34475d;
  font: inherit;
  min-width: 0;
}
.form-field input:focus,
.form-field textarea:focus,
.form-field select:focus {
  outline: 2px solid #87dfc6;
  border-color: #00a779;
}
.form-field textarea {
  resize: vertical;
}
.field-error {
  font-size: 12px;
  color: #b04e47;
  margin: 6px 0 0;
  line-height: 1.7;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 8px;
}
.interview-form .app-button {
  --app-green: #00a779;
  --app-green-dark: #008d68;
  cursor: pointer;
}
.interview-form .app-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
.interview-form .manager-hint {
  margin-top: 10px;
}
@media (max-width: 600px) {
  .manager-heading {
    align-items: flex-start;
    flex-direction: column;
  }
  .manager-tools {
    flex-wrap: wrap;
  }
  .time-fields {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>
