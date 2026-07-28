import request from '@/utils/request'

// 求职者投递岗位
export const applyJob = (data) => {
    return request.post('/application', data)
}

// 企业查看收到的投递
export const getApplicationList = () => {
    return request.get('/application/my')
}

// 查看投递详情
export const getApplicationDetail = (id) => {
    return request.get(`/application/${id}`)
}

// 修改投递状态
export const updateApplicationStatus = (id, data) => {
    return request.put(`/application/${id}/status`, data)
}