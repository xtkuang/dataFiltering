import * as multer from 'multer';
import * as xlsx from 'xlsx';
import * as path from 'path';
import koaBody from 'koa-body';
import { Context } from 'koa';

// Configure multer for file uploads
const uploader = koaBody({
	multipart: true,
	formidable: {
		uploadDir: path.join(__dirname, '/uploads'), // 设置文件上传目录
		keepExtensions: true, // 保持文件的后缀
		maxFieldsSize: 20 * 1024 * 1024, // 文件上传大小 MB * KB * B
	},
})

//const upload = multer({ storage: storage });

class FileUploadService {
    uploadFile(ctx:Context) {
        try {
            const files = ctx.request.files;
            const file=files.file;
            const filePath = files.path;
            this.readExcelFile(filePath.toString());
            ctx.body = { message: 'File uploaded successfully' };
        } catch (err) {
            ctx.status = 500;
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