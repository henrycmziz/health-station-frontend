import request from '@/utils/request'

// 查询问卷列表
export function listQuestionnaire() {
  return request({
    url: '/questionnaire/list',
    method: 'get'
  })
}

// 新增问卷
export function addQuestionnaire() {
  return request({
    url: '/questionnaire',
    method: 'post',
  })
}

// 保存问卷
export function saveQuestionnaire(data) {
  return request({
    url: '/questionnaire/save',
    method: 'post',
    data: data
  })
}

// 查询问卷详细
export function getQuestionnaire(questionnaireId) {
  return request({
    url: '/questionnaire/' + questionnaireId,
    method: 'get'
  })
}

// 修改问卷
export function updateQuestionnaire(data) {
  return request({
    url: '/questionnaire',
    method: 'put',
    data: data
  })
}

// 修改问卷状态
export function changeQuestionnaireStatus(data) {
  return request({
    url: '/questionnaire/changeStatus',
    method: 'put',
    data: data
  })
}

// 删除问卷
export function delQuestionnaire(questionnaireId) {
  return request({
    url: '/questionnaire/' + questionnaireId,
    method: 'delete'
  })
}
