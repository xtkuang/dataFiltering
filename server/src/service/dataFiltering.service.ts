import prisma from '../prisma';
import * as XLSX from 'xlsx';
import { Multer } from 'multer';
import koaBody from 'koa-body';
//import { Context } from 'koa';
class DataFilteringService {

    async parseExcel(files:any) {
       
       try {
        const workbook=XLSX.read(files.buffer);
        const worksheet=workbook.Sheets[0];
        const data=XLSX.utils.sheet_to_json(worksheet,{header:1});
        const rows=data.slice(4);
        const project =await prisma.project.create({
            data:{
                projectName:"导入项目",
                projectCode:rows[1] || "",

                classfy:"供应商"
            }
        });
        for(const row of rows){
            if(!row[2])continue;
            const equipment=await prisma.equipment.create({
                data:{
                    name:row[2] || "",
                    type:row[4] || "",
                    projectId:project.id
                }
            })
            const workStation=await prisma.workstation.create({
                data:{
                    name:row[6] || "",
                    type:row[7] || "",
                    designHours:row[8] || 0,
                    electHousrs: row[9] ||0,
                    assemblyHours:row[10] || 0,
                    equipmentId:equipment.id
                }
            })
            const material=await prisma.material.create({
                data:{
                    name:row[11] || "",
                    classify:row[12] || "",
                    type:row[13] || "",
                    brand:row[14] || "",
                    lowestPrice:row[15] || 0,
                    highestPrice:row[16] || 0,
                    averagePrice:row[17] || 0,
                    code:row[18] || "",
                    workstationId:workStation.id
                }
            })
        }
        return data;
       } catch (error) {
        console.error(error);
       }


    }
    
    async getData(params:any){
        const data=await prisma.project.findMany({
            where:{
                projectName:params.projectName || "",
                projectCode:params.projectCode || "",
                classfy:params.classfy || "",
                material:{
                    name:params.materialName || "",
                    classify:params.materialClassify || "",
                    type:params.materialType || "",
                },
                workStation:{
                    name:params.workStationName || "",
                    type:params.workStationType || "",
                }
            }
        })
        return data;
    }
}

export default new DataFilteringService();