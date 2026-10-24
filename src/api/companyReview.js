import request from '@/utils/request'
import { COMPANY_FILE } from '@/constants/company'
import { readCompanyFile } from '@/utils/companyFile'

// 两类审核分别封装，避免把材料 ID / 工商版本发送到错误接口。
export const getRegistrationReviews = (params) =>
  request.get('/admin/company/registration-reviews', { params })
export const getRegistrationReview = (id) =>
  request.get(`/admin/company/registration-reviews/${id}`)
export const decideRegistrationReview = (id, { decision, registrationVersion, reviewComment }) =>
  request.put(`/admin/company/registration-reviews/${id}/decision`, {
    decision,
    registrationVersion,
    reviewComment,
  })
export const getQualificationReviews = (params) =>
  request.get('/admin/company/qualification-reviews', { params })
export const getQualificationReview = (id) =>
  request.get(`/admin/company/qualification-reviews/${id}`)
export const decideQualificationReview = (id, { decision, reviewComment }) =>
  request.put(`/admin/company/qualification-reviews/${id}/decision`, { decision, reviewComment })
export const getReviewOriginal = (id) =>
  request
    .get(`/admin/company/qualification-reviews/${id}/file`, {
      responseType: 'blob',
      timeout: COMPANY_FILE.TIMEOUT,
    })
    .then(readCompanyFile)
