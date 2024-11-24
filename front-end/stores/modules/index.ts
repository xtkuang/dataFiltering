// 定义项目数据结构
interface ProjectType {
  id: string // 项目唯一标识符
  name: string // 项目名称
  code: string // 项目编号，唯一
  category: string // 项目分类
  equipments: EquipmentType[] // 关联的设备列表
  createdAt: Date // 创建时间
  updatedAt: Date // 更新时间
}

// 定义设备数据结构
interface EquipmentType {
  id: string // 设备唯一标识符
  name: string // 设备名称
  type: string // 设备类型
  projectId: string // 关联的项目ID
  workstations: WorkstationType[] // 关联的工位列表
  createdAt: Date // 创建时间
  updatedAt: Date // 更新时间
}

// 定义工位数据结构
interface WorkstationType {
  id: string // 工位唯一标识符
  name: string // 工位名称
  type: string // 工位类型
  designHours: number // 设计工时
  electHours: number // 电气工时
  assemblyHours: number // 装配工时
  equipmentId: string // 关联的设备ID
  materials: MaterialType[] // 关联的物料列表
  createdAt: Date // 创建时间
  updatedAt: Date // 更新时间
}

// 定义物料数据结构
interface MaterialType {
  id: string // 物料唯一标识符
  code: string // 物料编号
  name: string // 物料名称
  category: string // 物料分类
  modelNumber: string // 型号/图号
  brand: string // 品牌
  lowestPrice: number // 最低价
  highestPrice: number // 最高价
  averagePrice: number // 均价
  workstationId: string // 关联的工位ID
  createdAt: Date // 创建时间
  updatedAt: Date // 更新时间
}
type DataType = ProjectType | EquipmentType | WorkstationType | MaterialType

export type {
  ProjectType,
  EquipmentType,
  WorkstationType,
  MaterialType,
  DataType,
}
