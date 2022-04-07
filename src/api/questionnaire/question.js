import request from '@/utils/request'

// 查询某问卷的所有问题
export function listQuestion(questionnaireId) {
  return request({
    url: '/questionnaire/' + questionnaireId + '/questions',
    method: 'get'
  })
}

// 新增一个问题
export function addOneQuestion(data) {
  return request({
    url: '/questionnaire/' + data.questionnaireId + '/questions',
    method: 'post',
    data: data
  })
}

// 查询问题详细
export function getQuestion(questionnaireId, questionId) {
  return request({
    url: '/questionnaire/' + questionnaireId + '/questions/' + questionId,
    method: 'get'
  })
}

// 修改问题
export function updateQuestion(data) {
  return request({
    url: '/questionnaire/' + data.questionnaireId + '/questions',
    method: 'put',
    data: data
  })
}

// 删除问题
export function delQuestion(questionnaireId, questionId) {
  return request({
    url: '/questionnaire/' + questionnaireId + '/questions/' + questionId,
    method: 'delete'
  })
}
