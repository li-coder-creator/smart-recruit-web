import { COMPANY_FIELDS, COMPANY_OPTIONS, COMPANY_FILE } from '@/constants/company'

export const companyLabel = (key, value) =>
  value == null || value === ''
    ? '待完善'
    : (COMPANY_OPTIONS[key]?.find((item) => item.value === value)?.label ?? String(value))
export const companyFieldLabel = (key) =>
  COMPANY_FIELDS.find((item) => item.key === key)?.label ?? key
export const companyError = (error) =>
  error?.response?.data?.message || error?.message || '操作失败，请稍后重试'
export const companyTime = (value) => (value ? String(value).replace('T', ' ').slice(0, 19) : '—')
export const safeWebsite = (value) => {
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null
  } catch {
    return null
  }
}

// 创建独立副本：取消编辑不改变正在展示的资料；不携带系统字段。
export const createCompanyForm = (profile = {}) => ({
  ...Object.fromEntries(
    COMPANY_FIELDS.map(({ key, type }) => [
      key,
      type === 'benefits' ? [...(profile[key] ?? [])] : (profile[key] ?? ''),
    ]),
  ),
  profileVersion: profile.profileVersion ?? null,
})
export const toCompanySavePayload = (form) => ({
  ...Object.fromEntries(
    COMPANY_FIELDS.map(({ key, type }) => [
      key,
      type === 'benefits'
        ? [...(form[key] ?? [])]
        : typeof form[key] === 'string'
          ? form[key].trim() || null
          : (form[key] ?? null),
    ]),
  ),
  profileVersion: form.profileVersion,
})
export function validateCompanyForm(form) {
  const value = toCompanySavePayload(form)
  const issues = []
  const issue = (key, message) =>
    issues.push({
      key,
      message,
      section: COMPANY_FIELDS.find((item) => item.key === key)?.section ?? 'basic',
    })
  for (const field of COMPANY_FIELDS) {
    if (field.required && !value[field.key]) issue(field.key, `请填写${field.label}`)
    if (field.max && value[field.key]?.length > field.max)
      issue(field.key, `${field.label}不能超过 ${field.max} 个字符`)
    if (
      field.type === 'select' &&
      value[field.key] &&
      !COMPANY_OPTIONS[field.key].some((item) => item.value === value[field.key])
    )
      issue(field.key, `请重新选择${field.label}`)
  }
  if (!Number.isSafeInteger(value.profileVersion) || value.profileVersion < 0)
    issue('profileVersion', '资料版本缺失，请重新读取后编辑')
  if (value.website && !safeWebsite(value.website))
    issue('website', '官网须为完整的 http:// 或 https:// 地址')
  if (value.creditCode && !/^[0-9A-Z]{18}$/.test(value.creditCode))
    issue('creditCode', '信用代码须为18位大写字母或数字')
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  if (value.foundedDate && value.foundedDate > today) issue('foundedDate', '成立日期不能晚于今天')
  if (Boolean(value.workStartTime) !== Boolean(value.workEndTime))
    issue('workStartTime', '上班和下班时间须同时填写或同时清空')
  if (value.productDescription && !value.productName)
    issue('productName', '填写产品介绍时须填写产品名称')
  if ((value.teamRole || value.teamBio) && !value.teamName)
    issue('teamName', '填写职务或团队介绍时须填写团队名称')
  if (
    new Set(value.benefits).size !== value.benefits.length ||
    value.benefits.some((code) => !COMPANY_OPTIONS.benefits.some((item) => item.value === code))
  )
    issue('benefits', '福利选项重复或无效，请重新选择')
  return issues
}
export function validateCompanyFile(file, photo = false) {
  const extensions = photo ? /\.(jpg|jpeg|png)$/i : /\.(jpg|jpeg|png|pdf)$/i
  if (!extensions.test(file.name))
    return photo ? '办公照片仅支持 JPG / PNG' : '资质仅支持 JPG / PNG / PDF'
  if (!file.size) return '不能上传空文件'
  if (file.size > (photo ? COMPANY_FILE.MAX_PHOTO_BYTES : COMPANY_FILE.MAX_QUALIFICATION_BYTES))
    return photo ? '照片不能超过 3 MiB' : '资质不能超过 10 MiB'
  return ''
}
