// 与后端 ApplicationStatus 对齐；仅控制界面入口，最终权限和迁移由后端校验。
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
// 允许向前跳级；同状态、回退和终态变更均不允许，不能用数值大小代替状态机。
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
