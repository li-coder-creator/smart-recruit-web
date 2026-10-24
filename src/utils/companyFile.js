import { companyError } from '@/utils/company'

// 文件接口的业务错误可能仍是 HTTP 200 + JSON Blob，不能当文件下载。
export async function readCompanyFile(response) {
  const contentType = String(
    response.headers?.['content-type'] || response.data?.type || '',
  ).toLowerCase()
  if (contentType.includes('json')) {
    let body
    try {
      body = JSON.parse(await response.data.text())
    } catch {
      throw new Error('文件响应解析失败')
    }
    throw new Error(body.message || '文件读取失败')
  }
  if (!['image/png', 'image/jpeg', 'application/pdf'].some((type) => contentType.startsWith(type)))
    throw new Error('文件响应格式不正确')
  return response.data
}
export async function fileError(error) {
  if (error?.response?.data instanceof Blob) {
    try {
      return JSON.parse(await error.response.data.text()).message || companyError(error)
    } catch {
      return companyError(error)
    }
  }
  return companyError(error)
}
export async function downloadCompanyFile(loader, filename) {
  try {
    const blob = await loader()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename || '企业材料'
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch (error) {
    throw new Error(await fileError(error), { cause: error })
  }
}
