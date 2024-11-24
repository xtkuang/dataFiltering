'use client'
import { Table, Row, Col, Button, Upload, message, Space, Input } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { observer } from 'mobx-react'
import { SearchOutlined, UploadOutlined } from '@ant-design/icons'
import type { InputRef, TableColumnType, UploadProps } from 'antd'
import Highlighter from 'react-highlight-words'
import useStores from '@/stores'
import {
  DataType,
  ProjectType,
  EquipmentType,
  WorkstationType,
  MaterialType,
} from '@/stores/modules'
import { useRef } from 'react'
import { useState } from 'react'
import { FilterDropdownProps } from 'antd/es/table/interface'
export default observer(function Home() {
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
    { title: '设计工时', dataIndex: 'designHours' },
    { title: '电气工时', dataIndex: 'electHours' },
    { title: '装配工时', dataIndex: 'assemblyHours' },
  ]

  const materialColumns = [
    { title: '物料编号', dataIndex: 'code' },
    { title: '物料名称', dataIndex: 'name' },
    { title: '型号/规格', dataIndex: 'modelNumber' },
    { title: '品牌', dataIndex: 'brand' },
    { title: '最低价', dataIndex: 'lowestPrice' },
    { title: '最高价', dataIndex: 'highestPrice' },
  ]

  return (
    <>
      <Row style={{ marginBottom: '16px' }}>
        <Col flex="1">
          <UploadButton />
        </Col>
      </Row>
      <Row className="h-2/5" style={{ marginBottom: '16px' }} gutter={[16, 16]}>
        <Col flex="1" className="">
          <ErmTable
            columns={projectColumns}
            dataSource={ermData.randerProjects}
            callBack={(index) => {
              ermData.setSelectedProject(index)
            }}
          />
        </Col>
        <Col flex="1">
          <ErmTable
            columns={equipmentColumns}
            dataSource={ermData.randerEquipmentData}
            callBack={(index) => {
              ermData.setSelectedEquipment(index)
            }}
          />
        </Col>
        <Col flex="2">
          <ErmTable
            columns={workstationColumns}
            dataSource={ermData.randerWorkstationData}
            callBack={(index) => {
              ermData.setSelectedWorkstation(index)
            }}
          />
        </Col>
      </Row>
      <Row className="h-2/5">
        <Col flex="1">
          <ErmTable
            columns={materialColumns}
            dataSource={ermData.randerMaterialData}
            callBack={(index) => {
              ermData.setSelectedMaterial(index)
            }}
          />
        </Col>
      </Row>
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
        ...getColumnSearchProps(column.dataIndex as DataIndex),
      }
    }
    return column
  })
  return (
    <Table
      size="small"
      pagination={false}
      style={{ width: '100%' }}
      dataSource={dataSource}
      columns={columns}
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
  action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
  headers: {
    authorization: 'authorization-text',
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

const UploadButton: React.FC = () => (
  <Upload {...props}>
    <Button icon={<UploadOutlined />}>导入Excel</Button>
  </Upload>
)
