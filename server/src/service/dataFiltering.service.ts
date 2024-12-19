import prisma from '../prisma'
import * as XLSX from 'xlsx'

//import koaBody from 'koa-body'
import * as fs from 'fs'
import { Equipment, Project, Workstation, Material } from '@prisma/client'
import { CustomError } from 'src/error'
//import { Context } from 'koa';
class DataFilteringService {
  async parseExcel(files: any) {
    try {
      const filePath = files.file.filepath

      const fileBuffer = fs.readFileSync(filePath)
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      const rows = data.slice(4)

      let n = 0
      await this.insertData(rows)
      // for (const row of rows) {
      //   const ifexist_project = await prisma.project.findFirst({
      //     where: {
      //       code: String(row[2]),
      //     },
      //     include: {
      //       equipments: true,
      //     },
      //   })
      //   const ifexist_equipment = await prisma.equipment.findFirst({
      //     where: {
      //       code: String(row[4]),
      //     },
      //     include: {
      //       workstations: true,
      //     },
      //   })
      //   const ifexist_workStation = await prisma.workstation.findFirst({
      //     where: {
      //       code: String(row[7]),
      //     },
      //     include: {
      //       materials: true,
      //     },
      //   })
      //   if (ifexist_project && !ifexist_equipment && !ifexist_workStation) {
      //     await prisma.project.update({
      //       where: {
      //         code: ifexist_project.code,
      //       },
      //       data: {
      //         equipments: {
      //           create: {
      //             code: String(row[4]) || '',
      //             name: String(row[5]) || '',
      //             type: String(row[6]) || '',
      //             workstationCode: String(row[7]) || '',
      //           },
      //         },
      //       },
      //     })
      //     const workStation = await prisma.workstation.create({
      //       data: {
      //         code: String(row[7]) || '',
      //         name: String(row[8]) || '',
      //         type: String(row[9]) || '',
      //         designHours: Number(row[10] || 0),
      //         electHours: Number(row[11] || 0),
      //         assemblyHours: Number(row[12] || 0),
      //         equipmentCode: String(row[4]) || '',
      //       },
      //     })
      //     const material = await prisma.material.create({
      //       data: {
      //         code: String(row[13] || ''),
      //         name: String(row[14] || ''),
      //         modelNumber: String(row[15] || ''),
      //         requestNumber: String(row[16] || ''),
      //         brand: String(row[17] || ''),
      //         category: String(row[18] || ''),
      //         lowestPrice: Number(row[19] || 0),
      //         highestPrice: Number(row[20] || 0),
      //         averagePrice: Number(row[21] || 0),
      //         workstationCode: workStation.code,
      //       },
      //     })
      //   } else if (
      //     ifexist_project &&
      //     ifexist_equipment &&
      //     !ifexist_workStation
      //   ) {
      //     await prisma.equipment.update({
      //       where: {
      //         id: ifexist_equipment.id,
      //         code: ifexist_equipment.code,
      //       },
      //       data: {
      //         workstations: {
      //           create: {
      //             code: String(row[7]) || '',
      //             name: String(row[8]) || '',
      //             type: String(row[9]) || '',
      //             designHours: Number(row[10] || 0),
      //             electHours: Number(row[11] || 0),
      //             assemblyHours: Number(row[12] || 0),
      //             //equipmentCode:ifexist_equipment.code
      //           },
      //         },
      //       },
      //     })
      //   } else if (
      //     ifexist_project &&
      //     ifexist_equipment &&
      //     ifexist_workStation
      //   ) {
      //     const ifexist_material = await prisma.material.findFirst({
      //       where: {
      //         code: String(row[13] || ''),
      //       },
      //     })
      //     if (!ifexist_material) {
      //       await prisma.workstation.update({
      //         where: {
      //           code: ifexist_workStation.code,
      //           id: ifexist_workStation.id,
      //         },
      //         data: {
      //           materials: {
      //             create: {
      //               code: String(row[13] || ''),
      //               name: String(row[14] || ''),
      //               modelNumber: String(row[15] || ''),
      //               requestNumber: String(row[16] || ''),
      //               brand: String(row[17] || ''),
      //               category: String(row[18] || ''),
      //               lowestPrice: Number(row[19] || 0),
      //               highestPrice: Number(row[20] || 0),
      //               averagePrice: Number(row[21] || 0),
      //               //workstationCode:ifexist_workStation.code
      //             },
      //           },
      //         },
      //       })
      //     } else {
      //       console.log('数据已存在')
      //     }
      //   } else if (
      //     !ifexist_project &&
      //     !ifexist_equipment &&
      //     !ifexist_workStation
      //   ) {
      //     const project = await prisma.project.create({
      //       data: {
      //         code: String(row[2]) || '',
      //         name: String(row[3]) || '',
      //         category: String(row[1]) || '',
      //         equipments: {
      //           create: {
      //             code: String(row[4]) || '',
      //             name: String(row[5]) || '',
      //             type: String(row[6]) || '',
      //             workstationCode: String(row[7]) || '',
      //             workstations: {
      //               create: {
      //                 code: String(row[7]) || '',
      //                 name: String(row[8]) || '',
      //                 type: String(row[9]) || '',
      //                 designHours: Number(row[10] || 0),
      //                 electHours: Number(row[11] || 0),
      //                 assemblyHours: Number(row[12] || 0),
      //                 //equipmentCode:String(row[4])||"",
      //                 materials: {
      //                   create: {
      //                     code: String(row[13] || ''),
      //                     name: String(row[14] || ''),
      //                     modelNumber: String(row[15] || ''),
      //                     requestNumber: String(row[16] || ''),
      //                     brand: String(row[17] || ''),
      //                     category: String(row[18] || ''),
      //                     lowestPrice: Number(row[19]) || 0,
      //                     highestPrice: Number(row[20]) || 0,
      //                     averagePrice: Number(row[21]) || 0,
      //                   },
      //                 },
      //               },
      //             },
      //           },
      //         },
      //       },
      //     })
      //   }
      // }
      console.log('数据解析完成')
      n++
      return data
    } catch (error) {
      console.error(error)
      throw new CustomError(501, '数据解析失败')
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
  async resetTable() {
    await prisma.material.deleteMany()
    await prisma.workstation.deleteMany()
    await prisma.equipment.deleteMany()
    await prisma.project.deleteMany()
  }
  async searchAllTables(searchString: string) {
    searchString = searchString.trim()

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { name: { contains: searchString } },
          { code: { contains: searchString } },
          { category: { contains: searchString } },
        ],
      },
      select: {
        name: true,
        code: true,
        category: true,
        id: true,
        // 其他需要的字段
      },
    })

    const equipments = await prisma.equipment.findMany({
      where: {
        OR: [
          { name: { contains: searchString } },
          { code: { contains: searchString } },
          { type: { contains: searchString } },
        ],
      },
      select: {
        name: true,
        code: true,
        type: true,
        id: true,
        // 其他需要的字段
      },
    })

    const workstations = await prisma.workstation.findMany({
      where: {
        OR: [
          { name: { contains: searchString } },
          { code: { contains: searchString } },
          { type: { contains: searchString } },
        ],
      },
      select: {
        name: true,
        code: true,
        type: true,
        id: true,
        // 其他需要的字段
      },
    })

    const materials = await prisma.material.findMany({
      where: {
        OR: [
          { name: { contains: searchString } },
          { code: { contains: searchString } },
          { category: { contains: searchString } },
          { modelNumber: { contains: searchString } },
          { brand: { contains: searchString } },
        ],
      },
      select: {
        name: true,
        code: true,
        id: true,
        category: true,
        modelNumber: true,
        brand: true,
        // 其他需要的字段
      },
    })

    // 手动添加 search 字段，指明匹配的字段
    const addSearchField = (
      items: any[],
      searchString: string,
      fields: string[]
    ) => {
      return items.map((item) => {
        const matchedField = fields.find((field) =>
          item[field]?.includes(searchString)
        )
        return {
          ...item,
          search: matchedField ? item[matchedField] : null, // 将 search 字段设置为匹配的字段值
        }
      })
    }

    return {
      projects: addSearchField(projects, searchString, [
        'name',
        'code',
        'category',
      ]),
      equipments: addSearchField(equipments, searchString, [
        'name',
        'code',
        'type',
      ]),
      workstations: addSearchField(workstations, searchString, [
        'name',
        'code',
        'type',
      ]),
      materials: addSearchField(materials, searchString, [
        'name',
        'code',
        'category',
        'modelNumber',
        'brand',
      ]),
    }
  }
  async insertData(rows: any) {
    const existedProject = await prisma.project.findMany()
    const existedEquipment = await prisma.equipment.findMany()
    const existedWorkStation = await prisma.workstation.findMany()
    const existedMaterial = await prisma.material.findMany()
    const projectList: Project[] = []
    const equipmentList: Equipment[] = []
    const workStationList: Workstation[] = []
    const materialList: Material[] = []
    for (const row of rows) {
      if (!row[2] || !row[4] || !row[7] || !row[13]) {
        console.log('数据缺失:', row)
        continue
      }
      const projectId = String(row[2])
      const equipmentId = projectId + '=' + String(row[4])
      const workStationId =
        projectId + '=' + String(row[4]) + '=' + String(row[7])
      const materialId =
        projectId +
        '=' +
        String(row[4]) +
        '=' +
        String(row[7]) +
        '=' +
        String(row[13])
      if (
        !existedProject.some((project) => project.id === projectId) &&
        !projectList.some((project) => project.id === projectId)
      ) {
        projectList.push({
          id: projectId,
          name: String(String(row[3])) || '',
          code: String(String(row[2])) || '',
          category: String(String(row[1])) || '',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
      if (
        !existedEquipment.some((equipment) => equipment.id === equipmentId) &&
        !equipmentList.some((equipment) => equipment.id === equipmentId)
      ) {
        equipmentList.push({
          id: equipmentId,
          name: String(row[5]) || '',
          code: String(row[4]) || '',
          type: String(row[6]) || '',
          projectId: projectId,

          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
      if (
        !existedWorkStation.some(
          (workStation) => workStation.id === workStationId
        ) &&
        !workStationList.some((workStation) => workStation.id === workStationId)
      ) {
        workStationList.push({
          id: workStationId,
          name: String(row[8]) || '',
          code: String(row[7]) || '',
          type: String(row[9]) || '',
          designHours: Number(row[10]) || 0,
          electHours: Number(row[11]) || 0,
          assemblyHours: Number(row[12]) || 0,
          equipmentId: equipmentId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
      if (
        !existedMaterial.some((material) => material.id === materialId) &&
        !materialList.some((material) => material.id === materialId)
      ) {
        materialList.push({
          id: materialId,
          name: row[14] as string,
          code: row[13] as string,
          modelNumber: String(row[15]) || '',
          requestNumber: String(row[16]) || '',
          brand: String(row[17]) || '',
          category: String(row[18]) || '',
          lowestPrice: Number(row[19]) || 0,
          highestPrice: Number(row[20]) || 0,
          averagePrice: Number(row[21]) || 0,
          workstationId: workStationId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      } else {
        console.log('数据已存在：', materialId)
      }
    }
    await prisma.project.createMany({
      data: projectList,
    })
    await prisma.equipment.createMany({
      data: equipmentList,
    })
    await prisma.workstation.createMany({
      data: workStationList,
    })
    await prisma.material.createMany({
      data: materialList,
    })
  }
  async exportDataToExcel(projectCode: string[] | undefined) {
    try {
      // 获取项目数据
      const projects = await prisma.project.findMany({
        include: {
          equipments: {
            // 确保包含 equipments
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
          code: projectCode ? { in: projectCode } : undefined,
        },
      })

      // 构建Excel数据
      const excelData = []
      for (const project of projects) {
        for (const equipment of project.equipments) {
          for (const workstation of equipment.workstations) {
            for (const material of workstation.materials) {
              excelData.push({
                项目名称: project.name,
                项目编号: project.code,
                项目分类: project.category,
                设备编号: equipment.code,
                设备名称: equipment.name,
                设备类型: equipment.type,
                工位编号: workstation.code,
                工位名称: workstation.name,
                工位类型: workstation.type,
                设计工时: workstation.designHours,
                电气工时: workstation.electHours,
                装配工时: workstation.assemblyHours,
                物料编号: material.code,
                物料名称: material.name,
                需求数量: material.requestNumber,
                物料分类: material.category,
                型号图号: material.modelNumber,
                品牌: material.brand,
                最低价: material.lowestPrice,
                最高价: material.highestPrice,
                均价: material.averagePrice,
              })
            }
          }
        }
      }

      // 创建工作簿
      const worksheet = XLSX.utils.json_to_sheet(excelData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, '数据')
      const fileBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'buffer',
      })
      // 写入Excel文件
      return fileBuffer
    } catch (error) {
      console.error('导出数据时出错:', error)
    }
  }
}

export default new DataFilteringService()
