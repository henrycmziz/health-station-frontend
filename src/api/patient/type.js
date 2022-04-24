import request from '@/utils/request'

// 查询患者类型列表
export function listType(query) {
  return request({
    url: '/patient/type/list',
    method: 'get',
    params: query
  })
}

// 查询患者类型列表（排除节点）
export function listTypeExcludeChild(typeId) {
  return request({
    url: '/patient/type/list/exclude/' + typeId,
    method: 'get'
  })
}

// 查询患者类型详细
export function getType(typeId) {
  return request({
    url: '/patient/type/' + typeId,
    method: 'get'
  })
}

// 查询患者类型下拉树结构
export function treeselect() {
  return request({
    url: '/patient/type/treeselect',
    method: 'get'
  })
}

// 根据角色ID查询患者类型树结构
export function roleTypeTreeselect(roleId) {
  return request({
    url: '/patient/type/roleTypeTreeselect/' + roleId,
    method: 'get'
  })
}

// 新增患者类型
export function addType(data) {
  return request({
    url: '/patient/type',
    method: 'post',
    data: data
  })
}

// 修改患者类型
export function updateType(data) {
  return request({
    url: '/patient/type',
    method: 'put',
    data: data
  })
}

// 删除患者类型
export function delType(typeId) {
  return request({
    url: '/patient/type/' + typeId,
    method: 'delete'
  })
}
