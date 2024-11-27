import request from '@/utils/request'

class DataFilterApi {
  async getData() {
    return request.get('/dataFiltering')
  }
  async uploadExcel(files: any) {
    return request.post('/upload', { files })
  }
}
export default new DataFilterApi()
