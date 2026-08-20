import request from '@/utils/request'

// =========================
// 用户管理
// =========================

// 查询用户列表
export const getAdminUserList = (params) => {
    return request.get('/admin/user', {
        params
    })
}

// 查询用户详情
export const getAdminUserDetail = (id) => {
    return request.get(`/admin/user/${id}`)
}


// =========================
// 企业管理
// =========================

// 查询待审核企业
export const getPendingCompanyList = (params) => {
    return request.get('/admin/company/pending', {
        params
    })
}

// 查询企业列表
export const getAdminCompanyList = (params) => {
    return request.get('/admin/company', {
        params
    })
}

// 查询企业详情
export const getAdminCompanyDetail = (id) => {
    return request.get(`/admin/company/${id}`)
}

// 审核通过
export const approveCompany = (id) => {
    return request.put(`/admin/company/${id}/approve`)
}

// 审核拒绝
export const rejectCompany = (id) => {
    return request.put(`/admin/company/${id}/reject`)
}