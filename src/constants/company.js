// value 与后端枚举名称一致，label 只用于展示。
const options = (values) => Object.entries(values).map(([value, label]) => ({ value, label }))
export const COMPANY_OPTIONS = Object.freeze({
  industry: options({
    ENTERPRISE_SERVICES: '企业服务',
    INTERNET: '互联网',
    SOFTWARE: '计算机软件',
    E_COMMERCE: '电子商务',
    ARTIFICIAL_INTELLIGENCE: '人工智能',
    SMART_HARDWARE: '智能硬件',
    MANUFACTURING: '制造业',
    EDUCATION: '教育培训',
    LIFE_SERVICES: '生活服务',
    OTHER: '其他',
  }),
  employeeSize: options({
    UNDER_20: '20人以下',
    FROM_20_TO_99: '20–99人',
    FROM_100_TO_499: '100–499人',
    FROM_500_TO_999: '500–999人',
    FROM_1000_TO_9999: '1000–9999人',
    AT_LEAST_10000: '10000人以上',
  }),
  financingStage: options({
    UNFUNDED: '未融资',
    ANGEL: '天使轮',
    SERIES_A: 'A轮',
    SERIES_B: 'B轮',
    SERIES_C: 'C轮',
    SERIES_D_OR_LATER: 'D轮及以上',
    LISTED: '已上市',
    NOT_REQUIRED: '不需要融资',
    UNDISCLOSED: '暂不披露',
  }),
  companyNature: options({
    PRIVATE: '民营企业',
    STATE_OWNED: '国有企业',
    FOREIGN_OWNED: '外资企业',
    JOINT_VENTURE: '合资企业',
    PUBLIC_INSTITUTION: '事业单位',
    OTHER: '其他',
  }),
  businessStatus: options({
    EXISTING: '存续',
    OPERATING: '在业',
    OPEN: '开业',
    OTHER: '其他',
    UNCONFIRMED: '待核实',
  }),
  restPolicy: options({
    TWO_DAYS_OFF: '双休',
    ONE_DAY_OFF: '单休',
    ALTERNATING_WEEKENDS: '大小周',
    SHIFT_BASED: '排班轮休',
    JOB_SPECIFIC: '以岗位为准',
  }),
  overtimePolicy: options({
    PROJECT_BASED: '按项目情况安排',
    USUALLY_NONE: '通常不加班',
    OCCASIONAL: '偶尔加班',
    JOB_SPECIFIC: '以岗位为准',
  }),
  benefits: options({
    SOCIAL_INSURANCE_HOUSING_FUND: '五险一金',
    PAID_ANNUAL_LEAVE: '带薪年假',
    HEALTH_CHECK: '定期体检',
    MEAL_ALLOWANCE: '餐补',
    HOLIDAY_BENEFITS: '节日福利',
    YEAR_END_BONUS: '年终奖',
    SUPPLEMENTAL_MEDICAL_INSURANCE: '补充医疗保险',
    TRANSPORT_ALLOWANCE: '交通补助',
    EMPLOYEE_TRAVEL: '员工旅游',
    LEARNING_TRAINING: '学习培训',
    STOCK_OPTIONS: '股票期权',
    FLEXIBLE_WORK: '弹性工作',
  }),
  qualificationType: options({
    BUSINESS_LICENSE: '营业执照',
    INDUSTRY_CERTIFICATE: '行业资质',
    OTHER: '其他材料',
  }),
})
export const COMPANY_ADMISSION = Object.freeze({
  PENDING: '入驻待审核',
  APPROVED: '入驻已通过',
  REJECTED: '入驻未通过',
})
export const COMPANY_REGISTRATION = Object.freeze({
  UNVERIFIED: '未核验',
  PENDING: '待审核',
  VERIFIED: '已核验',
  REJECTED: '审核未通过',
})
export const COMPANY_REVIEW = Object.freeze({
  PENDING: '待审核',
  APPROVED: '审核通过',
  REJECTED: '审核未通过',
})
export const REVIEW_DECISION = Object.freeze({ APPROVE: 'APPROVE', REJECT: 'REJECT' })
export const COMPANY_FILE = Object.freeze({
  MAX_PHOTOS: 6,
  MAX_PHOTO_BYTES: 3 * 1024 * 1024,
  MAX_QUALIFICATION_BYTES: 10 * 1024 * 1024,
  TIMEOUT: 30000,
  PHOTO_ACCEPT: '.jpg,.jpeg,.png',
  QUALIFICATION_ACCEPT: '.jpg,.jpeg,.png,.pdf',
})
export const COMPANY_PAGE = Object.freeze({ FIRST: 1, SIZE: 10, JOB_PREVIEW_SIZE: 2 })
export const REVIEW_COMMENT_MAX = 500
const field = (key, label, type = 'text', max, required = false) => ({
  key,
  label,
  type,
  max,
  required,
})
export const COMPANY_SECTIONS = [
  {
    key: 'basic',
    title: '基本信息',
    hint: '简称展示品牌，公司全称识别经营主体。带 * 的为必填项。',
    fields: [
      field('name', '企业简称 / 品牌', 'text', 100, true),
      field('fullName', '公司全称', 'text', 200, true),
      field('industry', '所属行业', 'select', null, true),
      field('employeeSize', '人员规模', 'select', null, true),
      field('financingStage', '融资阶段', 'select'),
      field('companyNature', '企业性质', 'select'),
      field('city', '所在城市 / 区域', 'text', 50, true),
      field('website', '企业官网', 'url', 255),
      field('address', '实际办公地址', 'text', 255, true),
      field('commuteDescription', '交通与到访说明', 'text', 500),
      field('description', '公司简介', 'textarea', 2000, true),
    ],
  },
  {
    key: 'registration',
    title: '工商信息',
    hint: '工商资料真实变化会提交新版本核验，不会自动取消原有企业准入。',
    fields: [
      field('foundedDate', '成立日期', 'date'),
      field('legalRepresentative', '法定代表人', 'text', 100),
      field('registeredCapital', '注册资本（含币种）', 'text', 100),
      field('businessStatus', '经营状态', 'select'),
      field('creditCode', '统一社会信用代码', 'text', 18),
      field('registeredAddress', '注册地址', 'text', 255),
      field('businessScope', '经营范围', 'textarea', 2000),
    ],
  },
  {
    key: 'experience',
    title: '工作体验',
    hint: '填写实际提供的制度与福利，具体适用范围可在补充说明中说明。',
    fields: [
      field('workStartTime', '上班时间', 'time'),
      field('workEndTime', '下班时间', 'time'),
      field('restPolicy', '休息制度', 'select'),
      field('overtimePolicy', '加班情况', 'select'),
      field('benefits', '企业福利', 'benefits'),
      field('workNotes', '制度与福利补充说明', 'textarea', 2000),
    ],
  },
  {
    key: 'story',
    title: '产品与团队',
    hint: '选填。介绍具体业务与团队，未填写的内容不在求职者主页显示。',
    fields: [
      field('productName', '产品 / 品牌名称', 'text', 200),
      field('productDescription', '产品介绍', 'textarea', 2000),
      field('teamName', '团队 / 管理者名称', 'text', 200),
      field('teamRole', '介绍类型 / 管理者职务', 'text', 100),
      field('teamBio', '团队 / 管理者简介', 'textarea', 2000),
    ],
  },
]
export const COMPANY_FIELDS = COMPANY_SECTIONS.flatMap((section) =>
  section.fields.map((item) => ({ ...item, section: section.key })),
)
