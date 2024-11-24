import {
  hello,
  helloName,
  getPersonInfo,
  postTest,
  uploadFile,
} from './controller/home-controller'
import { getUser, login, register } from './controller/user.controller'
import FileUploadService from './service/fileUpload.service';
import { Context } from 'koa';
import dataFiltering from './service/dataFiltering.service';
export default [
  { path: '/', type: 'get', action: hello },
  { path: '/person/:name', type: 'get', action: helloName },
  { path: '/info', type: 'get', action: getPersonInfo },
  { path: '/post', type: 'post', action: postTest },
  { path: '/user/login', type: 'post', action: login },
  { path: '/user/register', type: 'post', action: register},
  { path: '/upload', type: 'post', action: uploadFile},
  {path:'/dataFiltering',type:'get',action:dataFiltering.getData},
  {path:'/user/info',type:'get',action:getUser}
]
