import request from '@/utils/request'
import { toCompanySavePayload } from '@/utils/company'
import { readCompanyFile } from '@/utils/companyFile'
import { COMPANY_FILE } from '@/constants/company'

// 查询当前用户企业信息
export const getMyCompany = () => {
  return request.get('/company')
}

// 修改企业信息
export const updateCompany = (data) => {
  return request.put('/company', toCompanySavePayload(data))
}

export const getCompanyPreview = () => request.get('/company/preview')
export const getPublicCompany = (id) => request.get(`/company/${id}/profile`)
export const getPublicCompanyJobs = (id, params = {}) =>
  request.get(`/company/${id}/jobs`, { params })
export const getCompanyPhotos = () => request.get('/company/photos')
export const deleteCompanyPhoto = (id) => request.delete(`/company/photos/${id}`)
export const getCompanyQualifications = () => request.get('/company/qualifications')
export const removeCompanyQualification = (id) => request.delete(`/company/qualifications/${id}`)
const upload = (path, file, fields = {}) => {
  const data = new FormData()
  data.append('file', file)
  Object.entries(fields).forEach(([key, value]) => data.append(key, value))
  return request.post(path, data, { timeout: COMPANY_FILE.TIMEOUT })
}
export const uploadCompanyPhoto = (file) => upload('/company/photos', file)
export const uploadCompanyQualification = (file, qualificationType) =>
  upload('/company/qualifications', file, { qualificationType })
const file = (path, config = {}) =>
  request
    .get(path, { ...config, responseType: 'blob', timeout: COMPANY_FILE.TIMEOUT })
    .then(readCompanyFile)
export const getCompanyPhotoFile = (id, config) => file(`/company/photos/${id}/file`, config)
export const getCompanyQualificationFile = (id) => file(`/company/qualifications/${id}/file`)
export const getMyRegistrationReviews = (params = {}) =>
  request.get('/company/registration-reviews', { params })
export const getMyQualificationReviews = (params = {}) =>
  request.get('/company/qualification-reviews', { params })
