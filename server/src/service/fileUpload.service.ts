import * as multer from 'multer';
import * as xlsx from 'xlsx';
import * as path from 'path';
//import koaBody from 'koa-body';
import { Context } from 'koa';
import dataFilteringService from './dataFiltering.service';
import { fileURLToPath } from 'url';

// Configure multer for file uploads

//const upload = multer({ storage: storage });

class FileUploadService {
    uploadFile(ctx:Context) {
        try {
            const files = ctx.request.files;
            const file=files.file;
            const filePath=files.path;
            console.log(filePath);
            const excel=this.readExcelFile(filePath.toString());
            ctx.body = { message: 'File uploaded successfully' };
            dataFilteringService.parseExcel(excel);
        } catch (err) {
            console.log(ctx.request.files.path);
            ctx.status = 500;
            console.log(err);
            
            ctx.body = { error: err.message };
        }
    }

    readExcelFile(filePath: string) {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);
        console.log(data); // Process the data as needed
    }
}

export default new FileUploadService(); 