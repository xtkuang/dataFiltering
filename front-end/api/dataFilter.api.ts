import request from '@/utils/request'

class DataFilterApi {
  async getData() {
    return request.get('/dataFiltering')
  }
  async uploadExcel(files: any) {
    return request.post('/upload', { files })
  }
  async searchText(query: string) {
    return request.get(`/erm/search?query=${query}`)
  }
  async exportExcel(exportArray: string[]) {
    return request.post(`/erm/export`, { exportArray })
  }
}
const dataFilterApi = new DataFilterApi()
export default dataFilterApi
