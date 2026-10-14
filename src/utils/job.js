import { JOB_SALARY_UNIT_OPTIONS } from '@/constants/job'

// 与后端 JobSaveDTO 对齐。详情中的 id、companyId、status 和时间字段不属于保存内容。
const JOB_SAVE_FIELDS = Object.freeze([
  'title',
  'description',
  'salaryMin',
  'salaryMax',
  'city',
  'experience',
  'education',
  'category',
  'team',
  'headcount',
  'employment',
  'workMode',
  'address',
  'salaryUnit',
  'negotiable',
  'summary',
  'responsibilities',
  'requirements',
  'bonus',
  'requiredSkills',
  'preferredSkills',
  'benefits',
  'deadline',
])

/**
 * 新建请求对象，保留 null、false、空字符串等原值，不修改表单对象。
 * 本函数筛选字段；表单的数据类型转换和发布必填校验由页面负责。
 */
export const toJobSavePayload = (form) =>
  Object.fromEntries(JOB_SAVE_FIELDS.map((field) => [field, form[field]]))

/** 草稿允许部分薪资为空，缺失值不能展示成 0，也不猜测薪资单位。 */
export const formatJobSalary = (job) => {
  if (job.negotiable) return '薪资面议'
  const { salaryMin: min, salaryMax: max } = job
  if (min == null && max == null) return '薪资待填写'
  const amount =
    min != null && max != null
      ? `${min.toLocaleString()}–${max.toLocaleString()}`
      : min != null
        ? `${min.toLocaleString()} 起`
        : `${max.toLocaleString()} 以内`
  const unit = JOB_SALARY_UNIT_OPTIONS.find((option) => option.value === job.salaryUnit)?.label
  return `${amount} ${unit ?? '（单位待填写）'}`
}
