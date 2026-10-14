// 后端 JobStatus 保存数值编码；用于展示岗位状态。
export const JOB_STATUS = Object.freeze({
  ACTIVE: 0,
  PAUSED: 1,
  ENDED: 2,
  DRAFT: 3,
})

export const JOB_STATUS_META = Object.freeze({
  [JOB_STATUS.ACTIVE]: Object.freeze({ label: '招聘中', tagType: 'success' }),
  [JOB_STATUS.PAUSED]: Object.freeze({ label: '暂停招聘', tagType: 'warning' }),
  [JOB_STATUS.ENDED]: Object.freeze({ label: '已结束', tagType: 'info' }),
  [JOB_STATUS.DRAFT]: Object.freeze({ label: '草稿', tagType: 'info' }),
})

// 后端 JobListFilter 接收枚举名称；用于企业列表的 filter 查询参数。
export const JOB_FILTER = Object.freeze({
  ALL: 'ALL',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  ENDED: 'ENDED',
  DRAFT: 'DRAFT',
})

export const JOB_FILTER_OPTIONS = Object.freeze([
  Object.freeze({ value: JOB_FILTER.ALL, label: '全部' }),
  Object.freeze({ value: JOB_FILTER.ACTIVE, label: JOB_STATUS_META[JOB_STATUS.ACTIVE].label }),
  Object.freeze({ value: JOB_FILTER.PAUSED, label: JOB_STATUS_META[JOB_STATUS.PAUSED].label }),
  Object.freeze({ value: JOB_FILTER.ENDED, label: JOB_STATUS_META[JOB_STATUS.ENDED].label }),
  Object.freeze({ value: JOB_FILTER.DRAFT, label: JOB_STATUS_META[JOB_STATUS.DRAFT].label }),
])

// 请求传枚举名称，页面展示中文单位。
export const JOB_SALARY_UNIT = Object.freeze({
  MONTH: 'MONTH',
  DAY: 'DAY',
  YEAR: 'YEAR',
})

export const JOB_SALARY_UNIT_OPTIONS = Object.freeze([
  Object.freeze({ value: JOB_SALARY_UNIT.MONTH, label: '元/月' }),
  Object.freeze({ value: JOB_SALARY_UNIT.DAY, label: '元/日' }),
  Object.freeze({ value: JOB_SALARY_UNIT.YEAR, label: '元/年' }),
])

export const JOB_PAGINATION = Object.freeze({
  FIRST_PAGE: 1,
  DEFAULT_SIZE: 10,
  PAGE_SIZES: Object.freeze([10, 20, 50]),
})
