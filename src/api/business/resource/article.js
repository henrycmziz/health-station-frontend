import request from '@/utils/request'

// 查询健康小知识列表
export function listArticle(query) {
  return request({
    url: '/resource/article/list',
    method: 'get',
    params: query
  })
}

// 查询健康小知识详细
export function getArticle(id) {
  return request({
    url: '/resource/article/' + id,
    method: 'get'
  })
}

// 新增健康小知识
export function addArticle(data) {
  return request({
    url: '/resource/article',
    method: 'post',
    data: data
  })
}

// 修改健康小知识
export function updateArticle(data) {
  return request({
    url: '/resource/article',
    method: 'put',
    data: data
  })
}

// 修改健康小知识状态
export function changeArticleStatus(data) {
  return request({
    url: '/resource/article/changeStatus',
    method: 'put',
    data: data
  })
}

// 删除健康小知识
export function delArticle(id) {
  return request({
    url: '/resource/article/' + id,
    method: 'delete'
  })
}
