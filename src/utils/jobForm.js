import { JOB_SALARY_UNIT } from '@/constants/job'

export const JOB_INTEGER_MAX = 2147483647
export const JOB_NUMBER_MIN = 1
// 长度与后端 JobValidationConstants 对齐；下拉允许自定义，兼容历史文本。
export const JOB_FORM_SECTIONS = [
  {
    title: '基本信息',
    fields: [
      { key: 'title', label: '岗位名称', max: 100, required: true },
      {
        key: 'category',
        label: '岗位类别',
        max: 50,
        publish: true,
        options: ['技术研发', '算法与数据', '产品与设计', '运营', '市场与销售'],
      },
      { key: 'team', label: '所属团队', max: 100 },
      { key: 'headcount', label: '招聘人数', type: 'number' },
      {
        key: 'employment',
        label: '用工类型',
        max: 20,
        publish: true,
        options: ['全职', '实习', '兼职', '劳务'],
      },
    ],
  },
  {
    title: '工作地点',
    fields: [
      { key: 'city', label: '工作城市', max: 50, publish: true },
      {
        key: 'workMode',
        label: '办公方式',
        max: 20,
        publish: true,
        options: ['现场办公', '混合办公', '远程办公'],
      },
      { key: 'address', label: '详细地址', max: 255, publish: true, wide: true },
    ],
  },
  {
    title: '岗位内容',
    fields: [
      { key: 'summary', label: '一句话介绍', max: 255, wide: true },
      { key: 'responsibilities', label: '岗位职责', type: 'textarea', publish: true, wide: true },
      { key: 'requirements', label: '任职要求', type: 'textarea', publish: true, wide: true },
      { key: 'bonus', label: '加分项', type: 'textarea', wide: true },
    ],
  },
  {
    title: '任职条件与福利',
    fields: [
      { key: 'requiredSkills', label: '必备技能', max: 500, publish: true },
      { key: 'preferredSkills', label: '加分技能', max: 500 },
      {
        key: 'experience',
        label: '经验要求',
        max: 50,
        options: ['经验不限', '在校生', '应届生', '1–3年', '3–5年', '5年以上'],
      },
      {
        key: 'education',
        label: '学历要求',
        max: 50,
        options: ['不限', '大专', '本科', '硕士', '博士'],
      },
      { key: 'benefits', label: '福利亮点', max: 255, wide: true },
    ],
  },
]

export const createJobForm = () => ({
  title: '',
  description: null,
  category: '',
  team: '',
  headcount: JOB_NUMBER_MIN,
  employment: '全职',
  city: '',
  workMode: '现场办公',
  address: '',
  salaryUnit: JOB_SALARY_UNIT.MONTH,
  salaryMin: null,
  salaryMax: null,
  negotiable: false,
  summary: '',
  responsibilities: '',
  requirements: '',
  bonus: '',
  requiredSkills: '',
  preferredSkills: '',
  experience: '',
  education: '',
  benefits: '',
  deadline: null,
})

export const normalizeJobForm = (form) =>
  Object.fromEntries(
    Object.keys(createJobForm()).map((key) => {
      let value = form[key]
      if (typeof value === 'string') value = value.trim() || null
      if (value === undefined) value = null
      if (form.negotiable && ['salaryMin', 'salaryMax'].includes(key)) value = null
      return [key, value]
    }),
  )

// 北京时间日历日期与后端 LocalDate 对齐，避免 UTC 截日导致提前一天。
const today = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

export const validateJobForm = (data, forPublish) => {
  const errors = {}
  for (const section of JOB_FORM_SECTIONS)
    for (const field of section.fields) {
      const value = data[field.key]
      if ((field.required || (forPublish && field.publish)) && !value)
        errors[field.key] = '请填写' + field.label
      else if (field.max && value?.length > field.max)
        errors[field.key] = field.label + '不能超过' + field.max + '个字符'
    }
  for (const key of ['headcount', 'salaryMin', 'salaryMax']) {
    const value = data[key]
    if (
      value != null &&
      (!Number.isInteger(value) || value < JOB_NUMBER_MIN || value > JOB_INTEGER_MAX)
    ) {
      errors[key] = '请输入 1 到 ' + JOB_INTEGER_MAX + ' 之间的整数'
    }
  }
  if (forPublish && !data.negotiable) {
    if (data.salaryMin == null) errors.salaryMin = '请填写最低薪资，或选择面议'
    if (data.salaryMax == null) errors.salaryMax = '请填写最高薪资，或选择面议'
    if (data.salaryMin != null && data.salaryMax != null && data.salaryMin > data.salaryMax)
      errors.salaryMax = '最高薪资不能小于最低薪资'
  }
  if (forPublish && data.deadline && data.deadline < today())
    errors.deadline = '截止日期不能早于今天'
  return errors
}
