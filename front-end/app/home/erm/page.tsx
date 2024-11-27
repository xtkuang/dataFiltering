'use client'
import {
  Table,
  Row,
  Col,
  Button,
  Upload,
  message,
  Space,
  Input,
  Modal,
} from 'antd'
import { ColumnsType } from 'antd/es/table'
import { observer } from 'mobx-react'
import { SearchOutlined, UploadOutlined } from '@ant-design/icons'
import type { InputRef, TableColumnType, TableProps, UploadProps } from 'antd'
import Highlighter from 'react-highlight-words'
import useStores from '@/stores'
import Cookies from 'js-cookie'
import {
  DataType,
  ProjectType,
  EquipmentType,
  WorkstationType,
  MaterialType,
} from '@/stores/modules'
import { useEffect, useRef } from 'react'
import { useState } from 'react'
import { FilterDropdownProps } from 'antd/es/table/interface'
import { getToken } from '@/utils/cookie'
const { Search } = Input
export default observer(function Home() {
  useEffect(() => {
    ermData.getRemoteData().then((res) => {
      // ermData.ermData = res as any as ProjectType[]
    })
  }, [])
  const { ermData } = useStores()
  const projectColumns = [
    { title: '项目编号', dataIndex: 'code' },
    { title: '项目名称', dataIndex: 'name' },
  ]

  const equipmentColumns = [
    { title: '设备编号', dataIndex: 'code' },
    { title: '设备名称', dataIndex: 'name' },
    { title: '设备类型', dataIndex: 'type' },
  ]

  const workstationColumns = [
    { title: '工位编号', dataIndex: 'id' },
    { title: '工位名称', dataIndex: 'name' },
    { title: '工位属性', dataIndex: 'type' },
    { title: '设计工时', dataIndex: 'designHours' },
    { title: '电气工时', dataIndex: 'electHours' },
    { title: '装配工时', dataIndex: 'assemblyHours' },
  ]

  const materialColumns = [
    { title: '物料分类', dataIndex: 'category', align: 'center' },
    { title: '物料编号', dataIndex: 'code', align: 'center' },
    { title: '物料名称', dataIndex: 'name', align: 'center' },
    { title: '型号/图号', dataIndex: 'modelNumber', align: 'center' },
    { title: '需求数量', dataIndex: 'requestNumber', align: 'center' },
    { title: '品牌', dataIndex: 'brand', align: 'center' },
    { title: '最低价', dataIndex: 'lowestPrice', align: 'center' },
    { title: '最高价', dataIndex: 'highestPrice', align: 'center' },
    { title: '均价', dataIndex: 'averagePrice', align: 'center' },
  ]
  return (
    <>
      <div className="flex flex-col justify-between h-full gap-4 pb-4">
        <div className="basis-1/12 flex gap-4">
          <UploadButton />
          <ExportButton></ExportButton>
          <Search
            placeholder="input search text"
            onSearch={(value, e, info) => {
              console.log(info?.source, value)
            }}
            style={{ width: 200 }}
          />
        </div>
        <div className="basis-5/12 flex flex-row gap-4">
          <div className="basis-3/12">
            <ErmTable
              columns={projectColumns}
              dataSource={ermData.randerProjects}
              callBack={(index) => {
                ermData.setSelectedProject(index)
              }}
            />
          </div>
          <div className="basis-3/12">
            <ErmTable
              columns={equipmentColumns}
              dataSource={ermData.randerEquipmentData}
              callBack={(index) => {
                ermData.setSelectedEquipment(index)
              }}
            />
          </div>
          <div className="basis-6/12">
            <ErmTable
              columns={workstationColumns}
              dataSource={ermData.randerWorkstationData}
              callBack={(index) => {
                ermData.setSelectedWorkstation(index)
              }}
            />
          </div>
        </div>
        <div className="basis-5/12">
          <ErmTable
            columns={materialColumns}
            dataSource={ermData.randerMaterialData}
            callBack={(index) => {
              ermData.setSelectedMaterial(index)
            }}
          />
        </div>
      </div>
    </>
  )
})
function ErmTable({
  columns,
  dataSource,
  callBack,
}: {
  columns: ColumnsType<DataType>
  dataSource: DataType[] | undefined
  callBack: (index: number) => void
}) {
  const [searchText, setSearchText] = useState('')
  const [searchedColumn, setSearchedColumn] = useState('')
  const searchInput = useRef<InputRef>(null)
  const [select, setSelect] = useState([])
  type DataIndex =
    | keyof ProjectType
    | keyof EquipmentType
    | keyof WorkstationType
    | keyof MaterialType
  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps['confirm'],
    dataIndex: DataIndex
  ) => {
    confirm()
    setSearchText(selectedKeys[0])
    setSearchedColumn(dataIndex)
  }

  const handleReset = (clearFilters: () => void) => {
    clearFilters()
    setSearchText('')
  }
  const rowSelection: TableProps<DataType>['rowSelection'] = {
    // onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
    //   console.log(
    //     `selectedRowKeys: ${selectedRowKeys}`,
    //     'selectedRows: ',
    //     selectedRows
    //   )
    // },
    onSelect: (selected, type, changeRows) => {
      console.log('选中的行:', selected, type, changeRows)
    },
    getCheckboxProps: (record: DataType) => ({
      disabled: record.name === 'Disabled User', // Column configuration not to be checked
      name: record.name,
    }),
  }
  const getColumnSearchProps = (
    dataIndex: DataIndex
  ): TableColumnType<DataType> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}>
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}>
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false })
              setSearchText((selectedKeys as string[])[0])
              setSearchedColumn(dataIndex)
            }}>
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close()
            }}>
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex as keyof DataType]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100)
        }
      },
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  })
  columns = columns.map((column) => {
    if ('dataIndex' in column) {
      return {
        ...column,
        // ...getColumnSearchProps(column.dataIndex as DataIndex),
        ellipsis: true,
      }
    }
    return column
  })
  // const addEllipsis = (columns: ColumnsType<DataType>) => {
  //   return columns.map((col) => {
  //     return {
  //       ...col,
  //       ellipsis: true,
  //     }
  //   })
  // }
  // addEllipsis(columns)
  const [tableHeight, setTableHeight] = useState(500)
  const tableRef = useRef(null)
  useEffect(() => {
    if (tableRef.current) {
      const header = tableRef.current
      console.log(header)
      // setTableHeight(window.innerHeight - (tableRef.current as HTMLElement).offsetTop - 100)
    }
  }, [window.innerHeight])
  return (
    <Table
      ref={tableRef}
      rowSelection={{ ...rowSelection }}
      size="small"
      pagination={false}
      style={{ width: '100%' }}
      dataSource={dataSource}
      columns={columns}
      sticky={true}
      rowKey={(record) => record.id}
      onRow={(record, index) => {
        return {
          onClick: () => callBack(index ?? 0),
        }
      }}
      // scroll={{ y: 500 }}
    />
  )
}
const props: UploadProps = {
  name: 'file',
  method: 'post',
  // data: (file) => {
  //   return {
  //     file,
  //   }
  // },
  withCredentials: true,
  action: process.env.NEXT_PUBLIC_BASE_URL + '/upload',
  headers: {
    authorization: 'Bearer ' + getToken(),
  },
  accept: '.xlsx,.xls',
  onChange(info) {
    if (info.file.status !== 'uploading') {
      console.log(info.file, info.fileList)
    }
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`)
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`)
    }
  },
}

const UploadButton: React.FC = () => {
  return (
    <Upload {...props}>
      <Button icon={<UploadOutlined />}>导入Excel</Button>
    </Upload>
  )
}
const ExportButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showExcel, setShowExcel] = useState(false)
  const showModal = () => {
    setIsModalOpen(true)
  }

  const handleOk = () => {
    // 这里添加导出逻辑
    message.success('导出成功')
    setIsModalOpen(false)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }
  const columns = [
    { title: '项目编号', dataIndex: 'code' },
    { title: '项目名称', dataIndex: 'name' },
    { title: '设备编号', dataIndex: 'equipmentCode' },
    { title: '设备名称', dataIndex: 'equipmentName' },
    { title: '工位编号', dataIndex: 'workstationCode' },
    { title: '工位名称', dataIndex: 'workstationName' },
    { title: '物料编号', dataIndex: 'materialCode' },
    { title: '物料名称', dataIndex: 'materialName' },
    { title: '需求数量', dataIndex: 'requestNumber' },
  ]
  return (
    <>
      <Button onClick={showModal}>导出Excel</Button>
      {/* <Modal
        wrapClassName="w-full"
        open={showExcel}
        modalRender={(node) => node}>
        <Table columns={columns} dataSource={[]}></Table>
      </Modal> */}

      <Modal
        title="导出确认"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}>
        <p>确定要导出当前选中的数据吗?</p>
      </Modal>
    </>
  )
}
