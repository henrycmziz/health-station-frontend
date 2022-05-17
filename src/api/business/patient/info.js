import request from '@/utils/request'
import {praseStrEmpty} from "@/utils/ruoyi";

// 查询患者列表
export function listPatient(query) {
  return request({
    url: '/patient/list',
    method: 'get',
    params: query
  })
}

// 查询患者详细
export function getPatient(userId) {
  return request({
    url: '/patient/' + praseStrEmpty(userId),
    method: 'get'
  })
}

// 新增患者
export function addPatient(data) {
  return request({
    url: '/patient',
    method: 'post',
    data: data
  })
}

// 修改患者
export function updatePatient(data) {
  return request({
    url: '/patient',
    method: 'put',
    data: data
  })
}

// 删除患者
export function delPatient(userId) {
  return request({
    url: '/patient/' + userId,
    method: 'delete'
  })
}

// 患者密码重置
export function resetPatientPwd(userId, password) {
  const data = {
    userId,
    password
  }
  return request({
    url: '/patient/resetPwd',
    method: 'put',
    data: data
  })
}

// 患者状态修改
export function changePatientStatus(userId, status) {
  const data = {
    userId,
    status
  }
  return request({
    url: '/patient/changeStatus',
    method: 'put',
    data: data
  })
}

// // 查询患者个人信息
// export function getPatientProfile() {
//   return request({
//     url: '/patient/profile',
//     method: 'get'
//   })
// }
//
// // 修改患者个人信息
// export function updatePatientProfile(data) {
//   return request({
//     url: '/patient/profile',
//     method: 'put',
//     data: data
//   })
// }

// // 保存授权角色
// export function updateAuthRole(data) {
//   return request({
//     url: '/patient/authRole',
//     method: 'put',
//     params: data
//   })
// }
