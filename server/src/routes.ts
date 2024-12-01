import {
  hello,
  helloName,
  getPersonInfo,
  postTest,
  uploadFile,
  getData,
  searchText,
  exportDataToExcel,
} from './controller/home-controller'
import {
  getUser,
  login,
  register,
  getUserList,
  logout,
  auth,
  deleteUser,
  updatePassword,
  resetPassword,
  updateUser,
  privateRegister,
} from './controller/user.controller'

import dataFiltering from './service/dataFiltering.service'

export default [
  { path: '/', type: 'get', action: hello },
  { path: '/person/:name', type: 'get', action: helloName },
  { path: '/info', type: 'get', action: getPersonInfo },
  { path: '/post', type: 'post', action: postTest },
  { path: '/user/login', type: 'post', action: login },
  { path: '/user/register', type: 'post', action: register },
  { path: '/upload', type: 'post', action: uploadFile },
  { path: '/dataFiltering', type: 'get', action: getData },
  { path: '/user/info', type: 'get', action: getUser },
  { path: '/user/list', type: 'get', action: getUserList },
  { path: '/user/logout', type: 'post', action: logout },
  { path: '/user/auth', type: 'get', action: auth },
  { path: '/user/delete', type: 'post', action: deleteUser },
  { path: '/user/updatePassword', type: 'post', action: updatePassword },
  { path: '/user/resetPassword', type: 'post', action: resetPassword },
  { path: '/user/update', type: 'post', action: updateUser },
  { path: '/user/privateRegister', type: 'post', action: privateRegister },
  { path: '/erm/search', type: 'get', action: searchText },
  { path: '/erm/reset', type: 'post', action: dataFiltering.resetTable },
  { path: '/erm/export', type: 'get', action: exportDataToExcel },
]
