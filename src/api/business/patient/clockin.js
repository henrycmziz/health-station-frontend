import request from '@/utils/request'

// 新增患者打卡计划
export function addPlan(data) {
  return request({
    url: '/patient/clock-in/add-plan',
    method: 'post',
    data: data
  })
}

// 查询患者打卡维护列表
export function clockInHistory(pid) {
  return request({
    url: '/patient/clock-in/' + pid + '/history',
    method: 'get'
  })
}

// 查询患者打卡维护列表
export function listClockIn(query) {
  return request({
    url: '/patient/clock-in/',
    method: 'get',
    params: query
  })
}

// 查询患者打卡维护详细
export function getClockIn(id) {
  return request({
    url: '/patient/clock-in/' + id,
    method: 'get'
  })
}

// 新增患者打卡计划
export function addClockIn(data) {
  return request({
    url: '/patient/clock-in',
    method: 'post',
    data: data
  })
}

// 修改患者打卡维护
export function updateClockIn(data) {
  return request({
    url: '/patient/clock-in',
    method: 'put',
    data: data
  })
}

// 删除患者打卡维护
export function delClockIn(id) {
  return request({
    url: '/patient/clock-in/' + id,
    method: 'delete'
  })
}
