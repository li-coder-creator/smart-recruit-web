import request from '@/utils/request'


// 查询当前用户企业信息
export const getMyCompany = () => {

  return request.get('/company')

}


// 修改企业信息
export const updateCompany = (data) => {

  return request.put('/company', data)

}