import { API_SUCCESS_CODE } from '@/utils/request'
import { formatJobSalary } from '@/utils/job'
import {
  APPLICATION_STATUS,
  APPLICATION_TIME_ZONE,
  APPLICATION_UTC_OFFSET,
  INTERVIEW_MODE,
  INTERVIEW_STATUS,
  INTERVIEW_TIMING,
  INTERVIEW_LIMITS,
} from '@/constants/application'

export const applicationData = (response) => {
  if (response?.data?.code !== API_SUCCESS_CODE)
    throw new Error(response?.data?.message || '接口响应格式异常，请重新读取')
  return response.data.data
}
export const isApplicationId = (value) =>
  (typeof value === 'string' && /^[1-9]\d*$/.test(value)) ||
  (Number.isSafeInteger(value) && value > 0)
export const localTimeEpoch = (value) => {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?$/.test(value)
  )
    return NaN
  // LocalDateTime 的服务器元数据可能带纳秒，浏览器读取时降到毫秒精度。
  return Date.parse(value.replace(/(\.\d{3})\d+$/, '$1') + APPLICATION_UTC_OFFSET)
}
export const formatApplicationTime = (value, dateOnly = false) =>
  Number.isFinite(localTimeEpoch(value))
    ? value.replace('T', ' ').slice(0, dateOnly ? 10 : 16)
    : '—'
export const formatApplicationSalary = (item) =>
  item?.jobAvailable === false ? '薪资信息不可用' : formatJobSalary(item || {})
export const applicationResumeLabel = (item) =>
  item.resumeAvailable === false ? '原简历已不可用' : item.resumeTitle?.trim() || '简历名称未填写'
export const applicationStatusLabel = (item) =>
  item.status === APPLICATION_STATUS.REJECTED ? '未通过' : item.statusText || '状态暂不可用'
export const safeMeetingUrl = (value) => {
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) && url.hostname ? url.href : null
  } catch {
    return null
  }
}
export const interviewTiming = (item, now) => {
  if (item.status === INTERVIEW_STATUS.CANCELLED) return INTERVIEW_TIMING.CANCELLED
  if (item.status !== INTERVIEW_STATUS.SCHEDULED) return null
  const start = localTimeEpoch(item.startTime),
    end = localTimeEpoch(item.endTime)
  if (!Number.isFinite(now) || !Number.isFinite(start) || !Number.isFinite(end) || end <= start)
    return null
  return now < start
    ? INTERVIEW_TIMING.UPCOMING
    : now < end
      ? INTERVIEW_TIMING.ONGOING
      : INTERVIEW_TIMING.EXPIRED
}
export const interviewCountdown = (item, now) => {
  const timing = interviewTiming(item, now)
  if (timing === INTERVIEW_TIMING.ONGOING) return '面试正在进行'
  if (timing !== INTERVIEW_TIMING.UPCOMING) return '请刷新查看最新安排'
  const minuteMs = 60 * 1000,
    hourMs = 60 * minuteMs,
    dayMs = 24 * hourMs
  const remaining = localTimeEpoch(item.startTime) - now
  if (remaining >= dayMs) return `还有 ${Math.ceil(remaining / dayMs)} 天`
  if (remaining >= hourMs) {
    const minutes = Math.ceil(remaining / minuteMs)
    return `还有 ${Math.floor(minutes / 60)} 小时 ${minutes % 60} 分钟`
  }
  return remaining >= minuteMs ? `还有 ${Math.ceil(remaining / minuteMs)} 分钟` : '即将开始'
}
export const normalizeInterviewInput = (value) =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) ? value + ':00' : value
export const validateInterviewForm = (form, now) => {
  const inputTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?$/
  const startInput = normalizeInterviewInput(form.startTime)
  const endInput = normalizeInterviewInput(form.endTime)
  const errors = {},
    start = inputTimePattern.test(startInput) ? localTimeEpoch(startInput) : NaN,
    end = inputTimePattern.test(endInput) ? localTimeEpoch(endInput) : NaN
  if (!Number.isFinite(now)) errors.startTime = '请先刷新面试安排以核对当前时间'
  else if (!Number.isFinite(start) || start <= now)
    errors.startTime = '开始时间必须晚于当前北京时间'
  if (!Number.isFinite(end) || end <= start) errors.endTime = '结束时间必须晚于开始时间'
  const text = (value) => (typeof value === 'string' ? value.trim() : '')
  if (form.mode === INTERVIEW_MODE.ONLINE) {
    if (!text(form.platform)) errors.platform = '请填写线上平台'
    if (!safeMeetingUrl(text(form.meetingUrl)))
      errors.meetingUrl = '请填写有效的 http 或 https 会议链接'
  } else if (form.mode === INTERVIEW_MODE.OFFLINE) {
    if (!text(form.address)) errors.address = '请填写线下面试地址'
  } else errors.mode = '请选择面试方式'
  const limits = {
    platform: INTERVIEW_LIMITS.PLATFORM,
    meetingUrl: INTERVIEW_LIMITS.MEETING_URL,
    address: INTERVIEW_LIMITS.ADDRESS,
    candidateNote: INTERVIEW_LIMITS.NOTE,
  }
  for (const [field, limit] of Object.entries(limits))
    if (text(form[field]).length > limit) errors[field] = `内容不能超过${limit}个字符`
  return errors
}
export const interviewPayload = (form, version) => {
  const clean = (value) => (typeof value === 'string' && value.trim() ? value.trim() : null)
  const online = form.mode === INTERVIEW_MODE.ONLINE
  const payload = {
    startTime: normalizeInterviewInput(form.startTime),
    endTime: normalizeInterviewInput(form.endTime),
    mode: form.mode,
    platform: online ? clean(form.platform) : null,
    meetingUrl: online ? clean(form.meetingUrl) : null,
    address: online ? null : clean(form.address),
    candidateNote: clean(form.candidateNote),
  }
  if (version !== undefined) payload.version = version
  return payload
}
export const requireServerTime = (data) => {
  const epoch = localTimeEpoch(data?.serverTime)
  if (data?.timeZone !== APPLICATION_TIME_ZONE || !Number.isFinite(epoch))
    throw new Error('服务器时间暂不可用，请重新读取')
  return epoch
}
