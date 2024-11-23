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
                id:String(rows[1] ||""),
                name:String(rows[2]||""),
                classify:String(rows[3] || ""),
                //classfy:"供应商"
            }
        });
        for(const row of rows){
            if(!row[2])continue;
            const equipment=await prisma.equipment.create({
                data:{
                    name:String(rows[5] || ""),
                    type:String(rows[6] || ""),
                    //classify:String(rows[7] ||""),
                    projectId:project.id
                }
            })
            const workStation=await prisma.workstation.create({
                data:{
                    id:String(rows[8] || ""),
                    name:String(rows[9] || ""),
                    type: String(rows[10] || ""),
                    designHours:Number(rows[11] || 0),
                    electHours: Number(rows[12] ||0),
                    assemblyHours:Number(rows[13] || 0),
                    equipmentId:equipment.id
                }
            })
            const material=await prisma.material.create({
                data:{
                    code:String(rows[14]||""),
                    name:String(rows[15]||""),
                    classify:String(rows[16]||""),
                    type: String(rows[17] ||""),
                    
                    brand:String(rows[18] || ""),
                    lowestPrice: Number(rows[19] || 0),
                    highestPrice: Number(rows[20] || 0),
                    averagePrice: Number(rows[21] || 0),
                    
                    workstation:{
                        connect:{
                            id:workStation.id
                        }
                    }
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
                name:params.projectName || "",
                id:params.projectCode || "",
                //classfy:params.classfy || "",
                equipments:{
                    some:{
                        name:params.equipmentName || "",
                        type:params.equipmentType || "",
                        workstations:{
                            some:{
                                name:params.workStationName || "",
                                type:params.workStationType || "",
                                designHours:params.designHours || 0,
                                electHours:params.electHours || 0,
                                assemblyHours:params.assemblyHours || 0,
                                materials:{
                                    some:{
                                        name:params.materialName || "",
                                        classify:params.materialClassify || "",
                                        type:params.materialType || "",
                                    }
                                }
                            }
                        }
                    },
                },
                
            }
        })
        return data;
    }
}

export default new DataFilteringService();