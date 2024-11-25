import prisma from '../prisma'
import * as XLSX from 'xlsx'

import koaBody from 'koa-body'
import * as fs from 'fs'
//import { Context } from 'koa';
class DataFilteringService {
  async parseExcel(files: any) {
    try {
      const filePath = files.file.filepath
      console.log(filePath)
      const fileBuffer = fs.readFileSync(filePath)
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      const rows = data.slice(4)
      //console.log(rows);

      for (const row of rows) {
        const ifexist = await prisma.project.findFirst({
          where: {
            code: String(row[2]),
          },
        })
        if (ifexist) {
          continue
        } else {
          const project = await prisma.project.create({
            data: {
              code: String(row[2] || ''),
              name: String(row[3] || ''),
              category: String(row[1] || ''),
            },
          })
        }
      }
      for (const row of rows) {
        if (!row[2]) continue

        const equipment = await prisma.equipment.create({
          data: {
            code: String(row[4] || ''),
            name: String(row[5] || ''),
            type: String(row[6] || ''), //设备标准化属性
            //classify:String(rows[7] ||""),
            projectId: (
              await prisma.project.findFirst({
                where: {
                  code: String(row[2]),
                },
              })
            ).code,
          },
        })
        const workStation = await prisma.workstation.create({
          data: {
            code: String(row[8] || ''),
            name: String(row[9] || ''),
            type: String(row[10] || ''), //工位标准化属性
            designHours: Number(row[11] || 0),
            electHours: Number(row[12] || 0),
            assemblyHours: Number(row[13] || 0),
            equipmentId: equipment.id,
          },
        })
        const material = await prisma.material.create({
          data: {
            code: String(rows[14] || ''),
            name: String(rows[15] || ''),
            category: String(rows[16] || ''),
            modelNumber: String(rows[17] || ''),
            requestNumber: String(rows[18] || ''),
            brand: String(rows[18] || ''),
            lowestPrice: Number(rows[19] || 0),
            highestPrice: Number(rows[20] || 0),
            averagePrice: Number(rows[21] || 0),

            workstation: {
              connect: {
                id: workStation.id,
              },
            },
          },
        })
      }
      console.log('数据解析完成')
      return data
    } catch (error) {
      console.error(error)
    }
  }

  async getData(params: any) {
    const data = await prisma.project.findMany({
      where: {
        name: params.projectName || '', //项目名称
        id: params.projectCode || '', //项目编号
        //classfy:params.classfy || "",
        equipments: {
          some: {
            name: params.equipmentName || '', //设备名称
            type: params.equipmentType || '', //设备类型
            workstations: {
              some: {
                name: params.workStationName || '',
                type: params.workStationType || '', //工位类型
                designHours: params.designHours || 0, //设计工时
                electHours: params.electHours || 0, //电工工时
                assemblyHours: params.assemblyHours || 0, //装配工时
                materials: {
                  some: {
                    name: params.materialName || '',
                    modelNumber: params.materialModelNumber || '', //物料型号
                    category: params.materialCategory || '', //物料分类
                  },
                },
              },
            },
          },
        },
      },
    })
    return data
  }
  async inputData(params: any) {
    const data = await prisma.project.create({
      data: {
        name: params.projectName || '',
        code: params.projectCode || '',
        category: params.projectCategory || '',
      },
    })
    return data
  }
}

export default new DataFilteringService()
