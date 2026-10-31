// 与后端 ApplicationStatus 对齐；入口展示不替代后端权限与状态机校验。
export const APPLICATION_STATUS = Object.freeze({
  PENDING: 0,
  SCREENING: 1,
  INTERVIEW: 2,
  HIRED: 3,
  REJECTED: 4,
})
export const APPLICATION_STATUS_META = Object.freeze({
  [APPLICATION_STATUS.PENDING]: Object.freeze({ label: '待处理', tagType: 'info' }),
  [APPLICATION_STATUS.SCREENING]: Object.freeze({ label: '筛选中', tagType: 'primary' }),
  [APPLICATION_STATUS.INTERVIEW]: Object.freeze({ label: '面试', tagType: 'warning' }),
  [APPLICATION_STATUS.HIRED]: Object.freeze({ label: '录用', tagType: 'success' }),
  [APPLICATION_STATUS.REJECTED]: Object.freeze({ label: '拒绝', tagType: 'danger' }),
})
export const APPLICATION_TRANSITIONS = Object.freeze({
  [APPLICATION_STATUS.PENDING]: Object.freeze([
    APPLICATION_STATUS.SCREENING,
    APPLICATION_STATUS.INTERVIEW,
    APPLICATION_STATUS.HIRED,
    APPLICATION_STATUS.REJECTED,
  ]),
  [APPLICATION_STATUS.SCREENING]: Object.freeze([
    APPLICATION_STATUS.INTERVIEW,
    APPLICATION_STATUS.HIRED,
    APPLICATION_STATUS.REJECTED,
  ]),
  [APPLICATION_STATUS.INTERVIEW]: Object.freeze([
    APPLICATION_STATUS.HIRED,
    APPLICATION_STATUS.REJECTED,
  ]),
  [APPLICATION_STATUS.HIRED]: Object.freeze([]),
  [APPLICATION_STATUS.REJECTED]: Object.freeze([]),
})
export const MY_APPLICATION_STATUS_META = Object.freeze({
  ...APPLICATION_STATUS_META,
  [APPLICATION_STATUS.REJECTED]: Object.freeze({ label: '未通过', tagType: 'danger' }),
})
export const APPLICATION_FILTERS = Object.freeze([
  { value: null, label: '全部', countKey: 'totalCount' },
  { value: APPLICATION_STATUS.PENDING, label: '待处理', countKey: 'pendingCount' },
  { value: APPLICATION_STATUS.SCREENING, label: '筛选中', countKey: 'screeningCount' },
  { value: APPLICATION_STATUS.INTERVIEW, label: '面试', countKey: 'interviewCount' },
  { value: APPLICATION_STATUS.HIRED, label: '录用', countKey: 'hiredCount' },
  { value: APPLICATION_STATUS.REJECTED, label: '未通过', countKey: 'rejectedCount' },
])
export const APPLICATION_DATE_RANGES = Object.freeze([
  { value: 'LAST_30_DAYS', label: '最近30天' },
  { value: 'LAST_7_DAYS', label: '最近7天' },
  { value: 'ALL', label: '全部时间' },
])
export const APPLICATION_DEFAULT_PAGE = 1
export const APPLICATION_PAGE_SIZE = 10
export const APPLICATION_KEYWORD_LIMIT = 100
export const APPLICATION_SEARCH_DELAY_MS = 300
export const APPLICATION_CLOCK_TICK_MS = 1000
export const APPLICATION_TIME_ZONE = 'Asia/Shanghai'
export const APPLICATION_UTC_OFFSET = '+08:00'
export const INTERVIEW_MODE = Object.freeze({ ONLINE: 'ONLINE', OFFLINE: 'OFFLINE' })
export const INTERVIEW_STATUS = Object.freeze({ SCHEDULED: 'SCHEDULED', CANCELLED: 'CANCELLED' })
export const INTERVIEW_TIMING = Object.freeze({
  UPCOMING: 'UPCOMING',
  ONGOING: 'ONGOING',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
})
export const INTERVIEW_TIMING_META = Object.freeze({
  UPCOMING: { label: '待开始', tone: 'upcoming' },
  ONGOING: { label: '进行中', tone: 'ongoing' },
  EXPIRED: { label: '已过期', tone: 'expired' },
  CANCELLED: { label: '已取消', tone: 'cancelled' },
})
export const INTERVIEW_LIMITS = Object.freeze({
  PLATFORM: 50,
  MEETING_URL: 1000,
  ADDRESS: 255,
  NOTE: 500,
  CANCEL_REASON: 500,
})
