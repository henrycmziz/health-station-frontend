import request from '@/utils/request'

// 提交答案
export function submitAnswer(data) {
  return request({
    url: '/questionnaire/answer/submit',
    method: 'post',
    data: data
  })
}

// 获取 某问题 的 答案列表
export function getAnswerList(query) {
  return request({
    url: '/questionnaire/answer/analysis',
    method: 'get',
    params: query
  })
}

export function getWriteValue(query) {
  return request({
    url: '/questionnaire/answer/list',
    method: 'get',
    params: query
  })
}
