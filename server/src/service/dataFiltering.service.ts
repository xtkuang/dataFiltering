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
      let n = 0
      for (const row of rows) {
        const ifexist_project = await prisma.project.findFirst({
          where: {
            code: String(row[2]),
          },
          include: {
            equipments: true,
          },
        })
        const ifexist_equipment = await prisma.equipment.findFirst({
          where: {
            code: String(row[4]),
          },
          include: {
            workstations: true,
          },
        })
        const ifexist_workStation = await prisma.workstation.findFirst({
          where: {
            code: String(row[7]),
          },
          include: {
            materials: true,
          },
        })
        if (ifexist_project && !ifexist_equipment && !ifexist_workStation) {
          await prisma.project.update({
            where: {
              code: ifexist_project.code,
            },
            data: {
              equipments: {
                create: {
                  code: String(row[4]) || '',
                  name: String(row[5]) || '',
                  type: String(row[6]) || '',
                  workstationCode: String(row[7]) || '',
                },
              },
            },
          })
          const workStation = await prisma.workstation.create({
            data: {
              code: String(row[7]) || '',
              name: String(row[8]) || '',
              type: String(row[9]) || '',
              designHours: Number(row[10] || 0),
              electHours: Number(row[11] || 0),
              assemblyHours: Number(row[12] || 0),
              equipmentCode: String(row[4]) || '',
            },
          })
          const material = await prisma.material.create({
            data: {
              code: String(row[13] || ''),
              name: String(row[14] || ''),
              modelNumber: String(row[15] || ''),
              requestNumber: String(row[16] || ''),
              brand: String(row[17] || ''),
              category: String(row[18] || ''),
              lowestPrice: Number(row[19] || 0),
              highestPrice: Number(row[20] || 0),
              averagePrice: Number(row[21] || 0),
              workstationCode: workStation.code,
            },
          })
        } else if (
          ifexist_project &&
          ifexist_equipment &&
          !ifexist_workStation
        ) {
          await prisma.equipment.update({
            where: {
              id: ifexist_equipment.id,
              code: ifexist_equipment.code,
            },
            data: {
              workstations: {
                create: {
                  code: String(row[7]) || '',
                  name: String(row[8]) || '',
                  type: String(row[9]) || '',
                  designHours: Number(row[10] || 0),
                  electHours: Number(row[11] || 0),
                  assemblyHours: Number(row[12] || 0),
                  //equipmentCode:ifexist_equipment.code
                },
              },
            },
          })
        } else if (
          ifexist_project &&
          ifexist_equipment &&
          ifexist_workStation
        ) {
          const ifexist_material = await prisma.material.findFirst({
            where: {
              code: String(row[13] || ''),
            },
          })
          if (!ifexist_material) {
            await prisma.workstation.update({
              where: {
                code: ifexist_workStation.code,
                id: ifexist_workStation.id,
              },
              data: {
                materials: {
                  create: {
                    code: String(row[13] || ''),
                    name: String(row[14] || ''),
                    modelNumber: String(row[15] || ''),
                    requestNumber: String(row[16] || ''),
                    brand: String(row[17] || ''),
                    category: String(row[18] || ''),
                    lowestPrice: Number(row[19] || 0),
                    highestPrice: Number(row[20] || 0),
                    averagePrice: Number(row[21] || 0),
                    //workstationCode:ifexist_workStation.code
                  },
                },
              },
            })
          } else {
            console.log('数据已存在')
          }
        } else if (
          !ifexist_project &&
          !ifexist_equipment &&
          !ifexist_workStation
        ) {
          const project = await prisma.project.create({
            data: {
              code: String(row[2]) || '',
              name: String(row[3]) || '',
              category: String(row[1]) || '',
              equipments: {
                create: {
                  code: String(row[4]) || '',
                  name: String(row[5]) || '',
                  type: String(row[6]) || '',
                  workstationCode: String(row[7]) || '',
                  workstations: {
                    create: {
                      code: String(row[7]) || '',
                      name: String(row[8]) || '',
                      type: String(row[9]) || '',
                      designHours: Number(row[10] || 0),
                      electHours: Number(row[11] || 0),
                      assemblyHours: Number(row[12] || 0),
                      //equipmentCode:String(row[4])||"",
                      materials: {
                        create: {
                          code: String(row[13] || ''),
                          name: String(row[14] || ''),
                          modelNumber: String(row[15] || ''),
                          requestNumber: String(row[16] || ''),
                          brand: String(row[17] || ''),
                          category: String(row[18] || ''),
                          lowestPrice: Number(row[19]) || 0,
                          highestPrice: Number(row[20]) || 0,
                          averagePrice: Number(row[21]) || 0,
                        },
                      },
                    },
                  },
                },
              },
            },
          })
        }
      }
      console.log('数据解析完成')
      n++
      return data
    } catch (error) {
      console.error(error)
    }
  } //数据解析服务

  async getData(params: any) {
    const data = await prisma.project.findMany({
      include: {
        equipments: {
          include: {
            workstations: {
              include: {
                materials: true,
              },
            },
          },
        },
      },
      where: {
        name: params.projectName ? { contains: params.projectName } : undefined, //项目名称
        code: params.projectCode ? { contains: params.projectCode } : undefined, //项目编号
        //classfy:params.classfy || "",
        category: params.projectCategory
          ? { contains: params.projectCategory }
          : undefined, //项目分类
        equipments: {
          some: {
            code: params.equipmentCode
              ? { contains: params.equipmentCode }
              : undefined, //设备编号
            name: params.equipmentName
              ? { contains: params.equipmentName }
              : undefined, //设备名称
            type: params.equipmentType
              ? { contains: params.equipmentType }
              : undefined, //设备类型

            workstations: {
              some: {
                code: params.workStationCode
                  ? { contains: params.workStationCode }
                  : undefined, //工位编号
                name: params.workStationName
                  ? { contains: params.workStationName }
                  : undefined, //工位名称
                type: params.workStationType
                  ? { contains: params.workStationType }
                  : undefined, //工位类型
                designHours: params.designHours || undefined, //设计工时
                electHours: params.electHours || undefined, //电工工时
                assemblyHours: params.assemblyHours || undefined, //装配工时
                materials: {
                  some: {
                    code: params.materialCode
                      ? { contains: params.materialCode }
                      : undefined, //物料编号
                    name: params.materialName
                      ? { contains: params.materialName }
                      : undefined,
                    modelNumber: params.materialModelNumber
                      ? { contains: params.materialModelNumber }
                      : undefined, //物料型号
                    category: params.materialCategory
                      ? { contains: params.materialCategory }
                      : undefined, //物料分类
                  },
                },
              },
            },
          },
        },
      },
    })
    console.log(data)
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
