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
  async getPriceDataByProjectCode(projectCode: string) {
    return request('/erm/getPriceByProjectCode', {
      method: 'POST',
      data: {
        projectCode,
      },
    })
  }
  async exportExcel(exportArray: string[]) {
    return request(`/erm/exportByCode`, {
      method: 'POST',
      responseType: 'arraybuffer',
      headers: {},
      data: {
        exportArray,
      },
    })
    // return request.post(`/erm/exportByCode`, {
    //   exportArray,
    // })
  }
}
const dataFilterApi = new DataFilterApi()
export default dataFilterApi
