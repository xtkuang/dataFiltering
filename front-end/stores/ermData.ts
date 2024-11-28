import { makeAutoObservable, runInAction } from 'mobx'
import type {
  ProjectType,
  EquipmentType,
  WorkstationType,
  MaterialType,
} from './modules'
import DataFilterApi from '@/api/dataFilter.api'

const mockData: ProjectType[] = [
  {
    id: '1',
    name: '项目A',
    code: 'A001',
    category: '类型1',
    equipments: [
      {
        id: '1',
        name: '设备A',
        type: '类型A',
        projectId: '1',
        workstations: [
          {
            id: '1',
            name: '工位A',
            type: '类型1',
            designHours: 10,
            electHours: 5,
            assemblyHours: 8,
            equipmentId: '1',
            materials: [
              {
                id: '1',
                code: 'M001',
                name: '物料A',
                category: '分类1',
                modelNumber: '型号A',
                brand: '品牌A',
                lowestPrice: 100,
                highestPrice: 150,
                averagePrice: 125,
                workstationId: '1',
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

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

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
    this.getRemoteData()
    // this.getErmData(mockData)
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
    console.log(this.selectedProject)
  }
  setSelectedEquipment(equipmentIndex: number) {
    if (this.selectedProject) {
      this.selectedEquipment = this.selectedProject?.equipments[equipmentIndex]
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
    }
  }
  async getRemoteData() {
    return DataFilterApi.getData().then((res) => {
      runInAction(() => {
        this.ermData = res.data as ProjectType[]
      })
    })
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
