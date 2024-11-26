import request from '@/utils/request'

class DataFilterApi {
  async getData() {
    return request.get('/dataFiltering')
  }
}
export default new DataFilterApi()
