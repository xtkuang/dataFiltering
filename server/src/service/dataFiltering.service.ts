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
      // if (worksheet['!merges'] && worksheet['!merges'].length > 0) {
      //   throw new CustomError(501, '存在合并单元格')
      // }
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      const rows = data.slice(4)

      // 记录错误行信息，增加更详细的错误位置信息
      const errorRows: Array<{
        rowNumber: number
        reason: string
        data: any
        columnInfo?: string // 新增：具体列信息
        cellValue?: any // 新增：具体单元格值
      }> = []

      // 过滤出有效的行数据
      const validRows = rows.filter((row: any, index: number) => {
        const rowNumber = index + 5 // 实际Excel行号（从第5行开始）

        // 跳过空行
        if (!row || row.length === 0 || row.every((cell: any) => !cell)) {
          errorRows.push({
            rowNumber,
            reason: '空行，已跳过',
            data: row,
          })
          return false
        }

        // 检查必填字段，并记录具体缺失的字段
        const missingFields = []
        if (!row[2]) missingFields.push('项目编号(C列)')
        if (!row[4]) missingFields.push('设备编号(E列)')
        if (!row[7]) missingFields.push('工位编号(H列)')
        if (!row[13]) missingFields.push('物料编号(N列)')

        if (missingFields.length > 0) {
          errorRows.push({
            rowNumber,
            reason: `必填字段缺失: ${missingFields.join(', ')}`,
            data: row,
            columnInfo: missingFields.join(', '),
          })
          return false
        }

        // 检查数据类型
        try {
          // 检查工时字段是否为数字（如果存在）
          if (
            row[10] !== undefined &&
            row[10] !== null &&
            row[10] !== '' &&
            isNaN(Number(row[10]))
          ) {
            errorRows.push({
              rowNumber,
              reason: '设计工时不是有效数字',
              data: row,
              columnInfo: 'K列(设计工时)',
              cellValue: row[10],
            })
            return false
          }
          if (
            row[11] !== undefined &&
            row[11] !== null &&
            row[11] !== '' &&
            isNaN(Number(row[11]))
          ) {
            errorRows.push({
              rowNumber,
              reason: '电气工时不是有效数字',
              data: row,
              columnInfo: 'L列(电气工时)',
              cellValue: row[11],
            })
            return false
          }
          if (
            row[12] !== undefined &&
            row[12] !== null &&
            row[12] !== '' &&
            isNaN(Number(row[12]))
          ) {
            errorRows.push({
              rowNumber,
              reason: '装配工时不是有效数字',
              data: row,
              columnInfo: 'M列(装配工时)',
              cellValue: row[12],
            })
            return false
          }

          // 检查价格字段是否为数字（如果存在）
          if (
            row[19] !== undefined &&
            row[19] !== null &&
            row[19] !== '' &&
            isNaN(Number(row[19]))
          ) {
            errorRows.push({
              rowNumber,
              reason: '最低价不是有效数字',
              data: row,
              columnInfo: 'T列(最低价)',
              cellValue: row[19],
            })
            return false
          }
          if (
            row[20] !== undefined &&
            row[20] !== null &&
            row[20] !== '' &&
            isNaN(Number(row[20]))
          ) {
            errorRows.push({
              rowNumber,
              reason: '最高价不是有效数字',
              data: row,
              columnInfo: 'U列(最高价)',
              cellValue: row[20],
            })
            return false
          }
          if (
            row[21] !== undefined &&
            row[21] !== null &&
            row[21] !== '' &&
            isNaN(Number(row[21]))
          ) {
            errorRows.push({
              rowNumber,
              reason: '均价不是有效数字',
              data: row,
              columnInfo: 'V列(均价)',
              cellValue: row[21],
            })
            return false
          }

          // 检查价格逻辑合理性
          if (
            row[19] !== undefined &&
            row[20] !== undefined &&
            row[19] !== null &&
            row[20] !== null &&
            row[19] !== '' &&
            row[20] !== '' &&
            Number(row[19]) > Number(row[20])
          ) {
            errorRows.push({
              rowNumber,
              reason: '最低价不能大于最高价',
              data: row,
              columnInfo: 'T列(最低价)和U列(最高价)',
              cellValue: `最低价: ${row[19]}, 最高价: ${row[20]}`,
            })
            return false
          }
        } catch (error) {
          errorRows.push({
            rowNumber,
            reason: '数据类型转换失败',
            data: row,
            columnInfo: '未知列',
            cellValue: '转换失败',
          })
          return false
        }

        return true
      })

      console.log(
        `总行数: ${rows.length}, 有效行数: ${validRows.length}, 错误行数: ${errorRows.length}`
      )

      // 如果有错误行，输出详细信息
      if (errorRows.length > 0) {
        console.log('=== 错误行详情 ===')
        errorRows.forEach((error) => {
          console.log(`第${error.rowNumber}行: ${error.reason}`)
          if (error.columnInfo) {
            console.log(`错误位置: ${error.columnInfo}`)
          }
          if (error.cellValue !== undefined) {
            console.log(`错误值: ${error.cellValue}`)
          }
          if (error.data && error.data.length > 0) {
            console.log(
              `数据: [${error.data.map((cell: any) => cell || '').join(', ')}]`
            )
          }
        })
        console.log('=== 错误行详情结束 ===')
      }

      // 处理有效数据
      if (validRows.length > 0) {
        try {
          await this.insertData(validRows)
          console.log('有效数据解析完成')
        } catch (insertError) {
          console.error('数据插入失败:', insertError)
          throw new CustomError(502, '数据插入失败: ' + insertError.message)
        }
      } else {
        console.log('没有有效数据需要处理')
      }

      return {
        success: true,
        totalRows: rows.length,
        validRows: validRows.length,
        errorRows: errorRows.length,
        errorDetails: errorRows,
        message: `解析完成。总行数: ${rows.length}, 成功处理: ${validRows.length}, 跳过错误行: ${errorRows.length}`,
      }
    } catch (error) {
      console.error('Excel解析错误:', error)
      if (error instanceof CustomError) {
        throw error
      }
      throw new CustomError(501, '数据解析失败: ' + error.message)
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
  async getDataByCode(params: Array<string>, ifExcel: boolean = false) {
    let count = 0
    let result = []

    for (const param of params) {
      count = param.split('=').length - 1
      if (count == 0) {
        //项目编号，查项目，并插入到result
        const data = await prisma.project.findFirst({
          where: { code: param },
          include: {
            //name:true,
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
        })
        if (data && data.equipments) {
          for (const equipment of data.equipments) {
            if (equipment.workstations) {
              for (const workstation of equipment.workstations) {
                if (workstation.materials) {
                  for (const material of workstation.materials) {
                    result.push({
                      projectName: data.name,
                      projectCode: data.code,
                      projectCategory: data.category,
                      equipmentCode: equipment.code,
                      equipmentName: equipment.name,
                      equipmentType: equipment.type,
                      workstationCode: workstation.code,
                      workstationName: workstation.name,
                      workstationType: workstation.type,
                      workstationDesignHours: workstation.designHours,
                      workstationElectHours: workstation.electHours,
                      workstationAssemblyHours: workstation.assemblyHours,
                      materialCode: material.code,
                      materialName: material.name,
                      materialModelNumber: material.modelNumber,
                      materialCategory: material.category,
                      materialBrand: material.brand,
                      materialLowestPrice: material.lowestPrice,
                      materialHighestPrice: material.highestPrice,
                      materialAveragePrice: material.averagePrice,
                      materialRequestNumber: material.requestNumber,
                    })
                  }
                }
              }
            }
          }
        }
      } else if (count == 1) {
        //设备编号，查设备，并插入到result
        const data = await prisma.equipment.findFirst({
          where: { id: param },
          include: {
            project: true,
            workstations: {
              include: {
                materials: true,
              },
            },
          },
        })
        if (data && data.workstations) {
          //查设备，并插入到result
          for (const workstation of data.workstations) {
            if (workstation.materials) {
              for (const material of workstation.materials) {
                result.push({
                  projectName: data.project.name,
                  projectCode: data.project.code,
                  projectCategory: data.project.category,
                  equipmentCode: data.code,
                  equipmentName: data.name,
                  equipmentType: data.type,
                  workstationCode: workstation.code,
                  workstationName: workstation.name,
                  workstationType: workstation.type,
                  workstationDesignHours: workstation.designHours,
                  workstationElectHours: workstation.electHours,
                  workstationAssemblyHours: workstation.assemblyHours,
                  materialCode: material.code,
                  materialName: material.name,
                  materialModelNumber: material.modelNumber,
                  materialCategory: material.category,
                  materialBrand: material.brand,
                  materialLowestPrice: material.lowestPrice,
                  materialHighestPrice: material.highestPrice,
                  materialAveragePrice: material.averagePrice,
                  materialRequestNumber: material.requestNumber,
                })
              }
            }
          }
        }
      } else if (count == 2) {
        //工位编号，查工位并将包含的物料插入到result
        const data = await prisma.workstation.findFirst({
          where: { id: param },
          include: {
            materials: true,
            equipment: {
              include: {
                project: true,
              },
            },
          },
        })
        if (data && data.materials) {
          //result.push(...data.materials);
          for (const material of data.materials) {
            result.push({
              projectName: data.equipment.project.name,
              projectCode: data.equipment.project.code,
              projectCategory: data.equipment.project.category,
              equipmentCode: data.equipment.code,
              equipmentName: data.equipment.name,
              equipmentType: data.equipment.type,
              workstationCode: data.code,
              workstationName: data.name,
              workstationType: data.type,
              workstationDesignHours: data.designHours,
              workstationElectHours: data.electHours,
              workstationAssemblyHours: data.assemblyHours,
              materialCode: material.code,
              materialName: material.name,
              materialModelNumber: material.modelNumber,
              materialCategory: material.category,
              materialBrand: material.brand,
              materialLowestPrice: material.lowestPrice,
              materialHighestPrice: material.highestPrice,
              materialAveragePrice: material.averagePrice,
              materialRequestNumber: material.requestNumber,
            })
          }
        }
      } else if (count == 3) {
        //物料编号，直接查物料并插入到result
        const data = await prisma.material.findFirst({
          where: { id: param },
          include: {
            workstation: {
              include: {
                equipment: {
                  include: {
                    project: true,
                  },
                },
              },
            },
          },
        })
        if (data) {
          result.push({
            projectName: data.workstation.equipment.project.name,
            projectCode: data.workstation.equipment.project.code,
            projectCategory: data.workstation.equipment.project.category,
            equipmentCode: data.workstation.equipment.code,
            equipmentName: data.workstation.equipment.name,
            equipmentType: data.workstation.equipment.type,
            workstationCode: data.workstation.code,
            workstationName: data.workstation.name,
            workstationType: data.workstation.type,
            materialCode: data.code,
            materialName: data.name,
            materialModelNumber: data.modelNumber,
            materialCategory: data.category,
            materialBrand: data.brand,
            materialLowestPrice: data.lowestPrice,
            materialHighestPrice: data.highestPrice,
            materialAveragePrice: data.averagePrice,
            materialRequestNumber: data.requestNumber,
          })
        }
      }
    }
    if (ifExcel) {
      const excelData = []
      for (const item of result) {
        excelData.push({
          项目名称: item.projectName,
          项目编号: item.projectCode,
          项目分类: item.projectCategory,
          设备编号: item.equipmentCode,
          设备名称: item.equipmentName,
          设备类型: item.equipmentType,
          工位编号: item.workstationCode,
          工位名称: item.workstationName,
          工位类型: item.workstationType,
          设计工时: item.workstationDesignHours,
          电气工时: item.workstationElectHours,
          装配工时: item.workstationAssemblyHours,
          物料编号: item.materialCode,
          物料名称: item.materialName,
          需求数量: item.materialRequestNumber,
          物料分类: item.materialCategory,
          型号图号: item.materialModelNumber,
          品牌: item.materialBrand,
          最低价: item.materialLowestPrice,
          最高价: item.materialHighestPrice,
          均价: item.materialAveragePrice,
        })
      }
      return excelData
    }
    return result
  }
  async getDataByCode_excel(params: Array<string>) {
    let result = []
    let count = 0
    for (const param of params) {
      count = param.split('=').length - 1
      if (count == 3) {
        const data = await prisma.material.findFirst({
          where: { id: param },
          include: {
            workstation: {
              include: {
                equipment: {
                  include: {
                    project: true,
                  },
                },
              },
            },
          },
        })
        if (data) {
          result.push({
            序号: undefined,
            项目名称: data.workstation.equipment.project.name,
            项目编号: data.workstation.equipment.project.code,
            项目分类: data.workstation.equipment.project.category,
            设备编号: data.workstation.equipment.code,
            设备名称: data.workstation.equipment.name,
            设备类型: data.workstation.equipment.type,
            工位编号: data.workstation.code,
            工位名称: data.workstation.name,
            工位类型: data.workstation.type,
            设计工时: data.workstation.designHours,
            电气工时: data.workstation.electHours,
            装配工时: data.workstation.assemblyHours,
            物料编号: data.code,
            物料名称: data.name,
            需求数量: data.requestNumber,
            物料分类: data.category,
            型号图号: data.modelNumber,
            品牌: data.brand,
            最低价: data.lowestPrice,
            最高价: data.highestPrice,
            均价: data.averagePrice,
          })
        }
      } else {
        continue
      }
    }
    return result
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
    try {
      const existedProject = await prisma.project.findMany()
      const existedEquipment = await prisma.equipment.findMany()
      const existedWorkStation = await prisma.workstation.findMany()
      const existedMaterial = await prisma.material.findMany()
      const projectList: Project[] = []
      const equipmentList: Equipment[] = []
      const workStationList: Workstation[] = []
      const materialList: Material[] = []
      const startIndex = 5
      const errorList: Array<{
        rowNumber: number
        materialId: string
        reason: string
      }> = [] //存储重复的料号和错误信息
      let iferror = false //是否存在重复的料号
      let rowID = 5

      for (const [index, row] of rows.entries()) {
        const currentRowNumber = index + startIndex
        rowID++
        try {
          // 注意：这里不再需要检查必填字段，因为在parseExcel中已经过滤过了
          // 但为了安全起见，再次验证数据完整性
          if (!row[2] || !row[4] || !row[7] || !row[13]) {
            console.warn(`第${currentRowNumber}行数据不完整，跳过处理`)
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

          // 检查项目是否已存在
          if (
            !existedProject.some((project) => project.id === projectId) &&
            !projectList.some((project) => project.id === projectId)
          ) {
            projectList.push({
              id: projectId,
              name: String(row[3] || ''),
              code: String(row[2] || ''),
              category: String(row[1] || ''),
              createdAt: new Date(),
              updatedAt: new Date(),
            })
          }

          // 检查设备是否已存在
          if (
            !existedEquipment.some(
              (equipment) => equipment.id === equipmentId
            ) &&
            !equipmentList.some((equipment) => equipment.id === equipmentId)
          ) {
            equipmentList.push({
              id: equipmentId,
              name: String(row[5] || ''),
              code: String(row[4] || ''),
              type: String(row[6] || ''),
              projectId: projectId,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
          }

          // 检查工位是否已存在
          if (
            !existedWorkStation.some(
              (workStation) => workStation.id === workStationId
            ) &&
            !workStationList.some(
              (workStation) => workStation.id === workStationId
            )
          ) {
            workStationList.push({
              id: workStationId,
              name: String(row[8] || ''),
              code: String(row[7] || ''),
              type: String(row[9] || ''),
              designHours: Number(row[10] || 0),
              electHours: Number(row[11] || 0),
              assemblyHours: Number(row[12] || 0),
              equipmentId: equipmentId,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
          }

          // 检查物料是否已存在
          if (
            !existedMaterial.some((material) => material.id === materialId) &&
            !materialList.some((material) => material.id === materialId)
          ) {
            materialList.push({
              id: materialId,
              name: String(row[14] || ''),
              code: String(row[13] || ''),
              modelNumber: String(row[15] || ''),
              requestNumber: String(row[16] || ''),
              brand: String(row[17] || ''),
              category: String(row[18] || ''),
              lowestPrice: Number(row[19] || 0),
              highestPrice: Number(row[20] || 0),
              averagePrice: Number(row[21] || 0),
              workstationId: workStationId,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
          } else {
            // 记录重复的物料，包含行号信息
            console.log(`第${currentRowNumber}行物料数据已存在：`, materialId)
            errorList.push({
              rowNumber: currentRowNumber,
              materialId: materialId,
              reason: '物料编号重复',
            })
            iferror = true
          }
        } catch (rowError) {
          console.error(`处理第${currentRowNumber}行时发生错误:`, rowError)
          errorList.push({
            rowNumber: currentRowNumber,
            materialId: '未知',
            reason: `数据处理错误: ${rowError.message}`,
          })
          iferror = true
          continue // 跳过这一行，继续处理下一行
        }
      }

      // 批量插入数据，使用事务确保数据一致性
      await prisma.$transaction(async (tx) => {
        if (projectList.length > 0) {
          await tx.project.createMany({
            data: projectList,
          })
          console.log(`成功插入 ${projectList.length} 个项目`)
        }

        if (equipmentList.length > 0) {
          await tx.equipment.createMany({
            data: equipmentList,
          })
          console.log(`成功插入 ${equipmentList.length} 个设备`)
        }

        if (workStationList.length > 0) {
          await tx.workstation.createMany({
            data: workStationList,
          })
          console.log(`成功插入 ${workStationList.length} 个工位`)
        }

        if (materialList.length > 0) {
          await tx.material.createMany({
            data: materialList,
          })
          console.log(`成功插入 ${materialList.length} 个物料`)
        }
      })

      console.log('数据插入完成')
      if (iferror) {
        console.log('=== 插入错误详情 ===')
        errorList.forEach((error) => {
          console.log(
            `第${error.rowNumber}行: ${error.reason} - 物料ID: ${error.materialId}`
          )
        })
        console.log('=== 插入错误详情结束 ===')
      }
    } catch (error) {
      console.error('数据插入过程中发生错误:', error)
      throw new CustomError(503, '数据插入失败: ' + error.message)
    }
  }
  async deleteProjectById(projectId: string) {
    try {
      await prisma.$transaction(async (prisma) => {
        // 查询项目下的所有设备
        const equipmentList = await prisma.equipment.findMany({
          where: {
            projectId: projectId,
          },
        })

        // 遍历设备列表，删除关联的工位和物料
        for (const equipment of equipmentList) {
          // 查询设备下的所有工位
          const workStationList = await prisma.workstation.findMany({
            where: {
              equipmentId: equipment.id,
            },
          })

          // 遍历工位列表，删除关联的物料
          for (const workStation of workStationList) {
            await prisma.material.deleteMany({
              where: {
                workstationId: workStation.id,
              },
            })
          }

          // 删除设备下的所有工位
          await prisma.workstation.deleteMany({
            where: {
              equipmentId: equipment.id,
            },
          })
        }

        // 删除项目下的所有设备
        await prisma.equipment.deleteMany({
          where: {
            projectId: projectId,
          },
        })

        // 删除指定项目
        await prisma.project.deleteMany({
          where: {
            id: projectId,
          },
        })
      })
      return '项目删除成功'
    } catch (error) {
      let errorMessage = '删除项目时发生未知错误'
      if (error instanceof Error) {
        if (error.message.includes('Unique constraint failed')) {
          errorMessage = '唯一约束冲突，删除失败，请检查数据'
        } else if (error.message.includes('Foreign key constraint failed')) {
          errorMessage = '外键约束冲突，删除失败，请检查关联数据'
        } else if (error.message.includes('Record to delete does not exist')) {
          errorMessage = '要删除的记录不存在，删除失败'
        } else {
          errorMessage = `删除项目时发生错误: ${error.message}`
        }
      }
      console.error('删除项目时发生错误:', error)
      throw new CustomError(400, errorMessage)
    }
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
  async exportDataToExcel_byCode(params: string[] | undefined) {
    const data = await this.getDataByCode_excel(params)
    //const excelData = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(workbook, worksheet, '数据')
    const fileBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'buffer',
    })
    return fileBuffer
  }
}

export default new DataFilteringService()
