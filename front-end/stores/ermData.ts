import { makeAutoObservable, runInAction, toJS } from 'mobx'
import type {
  ProjectType,
  EquipmentType,
  WorkstationType,
  MaterialType,
} from './modules'
import DataFilterApi from '@/api/dataFilter.api'

class ErmData {
  ermData: ProjectType[] = []
  projectClassList: string[] = [
    '泵',
    '阀',
    '换热器',
    '电机',
    '汽车组件',
    '医疗',
    '检测',
    '家具',
    '厨房',
    '卫浴',
    '改造搬迁',
    '军工重工',
    '其他',
  ]
  martialClassList: string[] = [
    '机加工件',
    '钣金件',
    '机械标准件',
    '电气标准件',
  ]
  selectedProject: ProjectType | null = null
  selectedEquipment: EquipmentType | null = null
  selectedWorkstation: WorkstationType | null = null
  selectedMaterial: MaterialType | null = null

  searchData: any[] = []
  exportTree: any
  exportArray: any[] = []
  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
    // this.getRemoteData()
    // this.getErmData(mockData)
  }
  async searchText(query: string) {
    return DataFilterApi.searchText(query)
  }
  initExportTree() {
    this.exportTree = this.ermData.map((project) => ({
      id: project.id,
      code: project.code,
      selected: false,
      children: project.equipments.map((equipment) => ({
        id: equipment.id,
        code: equipment.code,
        selected: false,
        children: equipment.workstations.map((workstation) => ({
          id: workstation.id,
          code: workstation.code,
          selected: false,
          children: workstation.materials.map((material) => ({
            id: material.id,
            code: material.code,
            selected: false,
            children: [],
          })),
        })),
      })),
    }))
  }
  setExportTree(changedNodeList: string[], selected: boolean = true) {
    // this.exportProjectCode = code
    // this.exportArray = []
    // console.log(selected)
    for (const node of changedNodeList) {
      const [projectCode, equipmentCode, workstationCode, materialCode] =
        node.split('=')
      console.log(projectCode, equipmentCode, workstationCode, materialCode)
      if (!projectCode) {
        continue
      }
      const project = this.exportTree.find(
        (item: any) => item.code === projectCode
      )
      // console.log(project)
      if (!equipmentCode) {
        project.selected = selected
        project.children.forEach((equipment: any) => {
          equipment.selected = selected
          equipment.children.forEach((workstation: any) => {
            workstation.selected = selected
            workstation.children.forEach((material: any) => {
              material.selected = selected
            })
          })
        })
        continue
      }
      const equipment = project.children.find(
        (item: any) => item.code === equipmentCode
      )
      if (!workstationCode) {
        equipment.selected = selected
        equipment.children.forEach((workstation: any) => {
          workstation.selected = selected
          workstation.children.forEach((material: any) => {
            material.selected = selected
          })
        })
        continue
      }
      const workstation = equipment.children.find(
        (item: any) => item.code === workstationCode
      )
      if (!materialCode) {
        workstation.selected = selected
        workstation.children.forEach((material: any) => {
          material.selected = selected
        })
        continue
      }
      const material = workstation.children.find(
        (item: any) => item.code === materialCode
      )
      material.selected = selected
    }
    // console.log(this.exportTree)
    const list = this.traverseExportTree(this.exportTree)
    console.log(list)
    this.exportArray = list
  }
  //遍历exportTree
  traverseExportTree(tree: any) {
    const selectedList: string[] = []
    for (const item of tree) {
      if (item.selected) {
        selectedList.push(item.id)
      }

      // 递归遍历子节点
      if (item.children) {
        const list = this.traverseExportTree(item.children)
        selectedList.push(...list)
      }
    }

    return selectedList
  }
  // getExportArray(tree: any): string[] {
  //   const selectedList: string[] = []
  //   for (const item of tree) {
  //     if (item.selected && item.children.length === 0) {
  //       selectedList.push(item.id)
  //     }

  //     // 递归遍历子节点
  //     if (item.children) {
  //       const list = this.getExportArray(item.children)
  //       selectedList.push(...list)
  //     }
  //   }
  //   return selectedList
  // }
  resetExportArray() {
    this.initExportTree()
    this.exportArray = []
  }
  async exportExcel() {
    return DataFilterApi.exportExcel(this.exportArray)
    // if (this.exportProjectCode) {
    //   return DataFilterApi.exportExcel(this.exportProjectCode)
    // }
  }
  addSearchData(data: any) {
    this.searchData.push(data)
  }
  resetSearchData() {
    this.searchData = []
  }
  getDataType(
    data: ProjectType | EquipmentType | WorkstationType | MaterialType
  ) {
    if (!data) {
      return null
    }
    if ('equipments' in data) {
      return 'project'
    }
    if ('workstations' in data) {
      return 'equipment'
    }
    if ('materials' in data) {
      return 'workstation'
    }
    return 'material'
  }
  uploadExcel(files: any) {
    return DataFilterApi.uploadExcel(files)
  }
  getErmData(data: ProjectType[]) {
    this.ermData = data
    return this.ermData
  }
  setSelectedProject(projectIndex: number) {
    this.selectedProject = this.ermData[projectIndex]
  }
  setSelectedEquipment(equipmentIndex: number) {
    if (this.selectedProject) {
      this.selectedEquipment = this.selectedProject?.equipments[equipmentIndex]
    }
  }
  setSelected(code: string) {
    const codes = code.split('=')

    const project = this.ermData.find((item) => item.code === codes[0])
    if (project) {
      this.selectedProject = project
      this.selectedEquipment = null
      this.selectedWorkstation = null
      this.selectedMaterial = null
    }
    const equipment = project?.equipments.find((item) => item.code === codes[1])
    if (equipment) {
      this.selectedEquipment = equipment
      this.selectedWorkstation = null
      this.selectedMaterial = null
    }
    const workstation = equipment?.workstations.find(
      (item) => item.code === codes[2]
    )
    if (workstation) {
      this.selectedWorkstation = workstation
      this.selectedMaterial = null
    }
    const material = workstation?.materials.find(
      (item) => item.code === codes[3]
    )
    if (material) {
      this.selectedMaterial = material
    }
  }
  setSelectedWorkstation(workstationIndex: number) {
    if (this.selectedEquipment) {
      this.selectedWorkstation =
        this.selectedEquipment?.workstations[workstationIndex]
    }
  }
  setSelectedMaterial(materialIndex: number) {
    if (this.selectedWorkstation) {
      this.selectedMaterial = this.selectedWorkstation?.materials[materialIndex]
      console.log(this.selectedMaterial)
    }
  }
  async getRemoteData() {
    return DataFilterApi.getData().then((res) => {
      runInAction(() => {
        this.ermData = res.data as ProjectType[]
        this.initExportTree()
      })
    })
  }
  async getPrice() {
    const price = await DataFilterApi.getPriceDataByProjectCode([
      this.selectedProject?.code as string,
    ]).then((res) => {
      runInAction(() => {
        this.selectedProject?.equipments.forEach((equipment) => {
          equipment.workstations.forEach((workstation) => {
            workstation.materials.forEach((material) => {
              const price = res.data.find(
                (item: any) => item.materialCode === material.code
              ) as {
                materialCode: string
                highestPrice: number
                lowestPrice: number
                averagePrice: number
              }
              if (price) {
                material.highestPrice = price.highestPrice
                material.lowestPrice = price.lowestPrice
                material.averagePrice = price.averagePrice
              }
            })
          })
        })
      })
      return res.data
    })
    return price.data
  }

  get randerEquipmentData() {
    return this.selectedProject?.equipments
  }
  get randerWorkstationData() {
    return this.selectedEquipment?.workstations
  }
  get randerMaterialData() {
    return this.selectedWorkstation?.materials
  }
  get randerProjects() {
    return this.ermData
  }
  // getParent(data: ermData) {
  //   const type = this.getDataType(data)
  //   if (type === 'material') {
  //   }
  //   // switch (type) {
  //   //   case 'project':
  //   //     return this.ermData
  //   //   case 'equipment':
  //   //     return this.ermData.find((item) => item.equipments.includes((data as equipmentType).id))
  //   //   case 'workstation':
  //   //     return this.ermData.find((item) => item.equipments.includes((data as workstationType).equipmentId))
  //   //   case 'material':
  //   //     return this.ermData.find((item) => item.workstations.includes((data as materialType).workstationId))
  //   // }
  // }
}
export default ErmData
