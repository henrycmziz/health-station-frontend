import request from '@/utils/request'

// 删除服务器文件
export function delFile(data) {
  return request({
    url: 'common/delete',
    method: 'delete',
    data: data
  })
}
