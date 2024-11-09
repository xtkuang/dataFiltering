import {
  hello,
  helloName,
  getPersonInfo,
  postTest,
} from './controller/home-controller'
import { login, register } from './controller/user.controller'
export default [
  { path: '/', type: 'get', action: hello },
  { path: '/person/:name', type: 'get', action: helloName },
  { path: '/info', type: 'get', action: getPersonInfo },
  { path: '/post', type: 'post', action: postTest },
  { path: '/user/login', type: 'post', action: login },
  { path: '/user/register', type: 'post', action: register },
]
