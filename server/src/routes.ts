import {
  hello,
  helloName,
  getPersonInfo,
  postTest,
} from './controller/home-controller'
import { login, register } from './controller/user.controller'
import express from 'express';
import FileUploadService from './service/fileUpload.service';

const router = express.Router();

router.post('/upload', (req, res) => {
    FileUploadService.uploadFile(req, res);
});

export default router;
