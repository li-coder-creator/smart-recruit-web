import request from '@/utils/request'

// 登录
export const login = (data) => {
    return request.post('/user/login', data)
}

// 注册
export const register = (data) => {
    return request.post('/user/register', data)
}

// 获取用户信息
export const getUserInfo = () => {
    return request.get('/user/info')
}

// 修改资料
export const updateUserInfo = (data) => {
    return request.put('/user/info', data)
}

// 修改密码
export const updatePassword = (data) => {
    return request.patch('/user/password', data)
}