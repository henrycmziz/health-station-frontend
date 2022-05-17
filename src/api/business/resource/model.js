import request from '@/utils/request'

// 查询患者康复模型列表
export function listModel(query) {
  return request({
    url: '/resource/model/list',
    method: 'get',
    params: query
  })
}

// 查询患者康复模型详细
export function getModel(id) {
  return request({
    url: '/resource/model/' + id,
    method: 'get'
  })
}

// 新增患者康复模型
export function addModel(data) {
  return request({
    url: '/resource/model',
    method: 'post',
    data: data
  })
}

// 修改患者康复模型
export function updateModel(data) {
  return request({
    url: '/resource/model',
    method: 'put',
    data: data
  })
}

// 修改患者康复模型状态
export function changeModelStatus(data) {
  return request({
    url: '/resource/model/changeStatus',
    method: 'put',
    data: data
  })
}

// 删除患者康复模型
export function delModel(id) {
  return request({
    url: '/resource/model/' + id,
    method: 'delete'
  })
}
