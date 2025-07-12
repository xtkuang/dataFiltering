import React, { useCallback, useState, useMemo } from 'react'
import { Select, Input, Card, Tag, Modal, List, Typography } from 'antd'
import type { SelectProps } from 'antd'

import useStores from '@/stores'

import { observer } from 'mobx-react'
import { toJS } from 'mobx'
// import { debounce } from 'lodash'
const { Search } = Input
const { Text } = Typography

export interface DebounceSelectProps<ValueType = any>
  extends Omit<SelectProps<ValueType | ValueType[]>, 'options' | 'children'> {
  fetchOptions: (search: string) => Promise<ValueType[]>
  debounceTimeout?: number
}
function debounce(handle: Function, delay: number) {
  let timer: NodeJS.Timeout | null = null

  return function (...args: any) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      handle(...args)
      timer = null
    }, delay)
  }
}

const App: React.FC = observer(() => {
  const { ermData } = useStores()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [materialModalVisible, setMaterialModalVisible] = useState(false)
  const [forceUpdate, setForceUpdate] = useState(0)

  const debounceSearch = useCallback(
    //在组件重新渲染时不会重新创建防抖函数。
    debounce((value: string) => {
      search(value)
    }, 1000),
    []
  )

  const search = async (value: string) => {
    ermData.resetSearchData()
    setSearchValue(value)
    setLoading(true)
    await ermData.searchText(value).then((res) => {
      const data = res.data
      for (const item in data) {
        data[item].map((item: any) => {
          ermData.addSearchData({
            label: item.id + '|' + item.search,
            value: item.id,
          })
        })
      }
    })
    setLoading(false)
  }

  // 获取当前选中工位的物料统计 - 只统计当前选中工位的物料
  const materialStats = useMemo(() => {
    // 只有选中了工位才显示物料统计
    if (!ermData.selectedWorkstation) return []

    const stats: { category: string; count: number; materials: any[] }[] = []
    const categoryMap = new Map<string, any[]>()

    try {
      // 只统计当前选中工位的物料
      ermData.selectedWorkstation.materials?.forEach((material) => {
        const category = material.category || '未分类'
        if (!categoryMap.has(category)) {
          categoryMap.set(category, [])
        }
        categoryMap.get(category)!.push(material)
      })

      categoryMap.forEach((materials, category) => {
        stats.push({
          category,
          count: materials.length,
          materials,
        })
      })

      return stats.sort((a, b) => b.count - a.count)
    } catch (error) {
      console.error('获取物料统计时出错:', error)
      return []
    }
  }, [ermData.selectedWorkstation, forceUpdate])

  const totalMaterials = useMemo(() => {
    return materialStats.reduce((sum, stat) => sum + stat.count, 0)
  }, [materialStats])

  return (
    <div
      style={{
        position: 'relative',
        maxHeight: 'calc(100vh - 100px)',
        overflow: 'hidden',
      }}>
      <Select
        open={open} // 控制下拉框的显示
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)} // 失去焦点时收起下拉框
        style={{
          position: 'absolute',
          zIndex: 9,
          top: '0',
          right: '0',
          width: '100%',
        }}
        optionRender={(option: any) => {
          const [label, search] = option.label.split('|')
          const [project, equipment, workstation, material] = label.split('=')
          const highlightedSearch = search.replace(
            new RegExp(`(${searchValue})`, 'gi'),
            (match: any) =>
              `<strong style="font-weight: bold;font-size: 16px; background-color: #FAD7A1;">${match}</strong>`
          )

          return (
            <div key={option.value + option.label}>
              <div dangerouslySetInnerHTML={{ __html: highlightedSearch }} />
              <div style={{ fontSize: '10px' }}>
                {`${project ? `项目:${project} ` : ''} ${
                  equipment ? `设备:${equipment} ` : ''
                } ${workstation ? `工位:${workstation} ` : ''} ${
                  material ? `物料:${material} ` : ''
                }`}
              </div>
            </div>
          )
        }}
        options={toJS(ermData.searchData)}
        // notFoundContent={fetching ? <Spin size="small" /> : null}
        value={null}
        onSelect={(value: any) => {
          setOpen(false)
          ermData.setSelected(value)
          setForceUpdate((prev) => prev + 1)
        }}
      />
      <Search
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          marginBottom: '4px',
        }}
        placeholder="input search text"
        onFocus={() => setOpen(true)}
        loading={loading}
        onBlur={() => setOpen(false)}
        onChange={async (e) => {
          debounceSearch(e.target.value)
        }}
        onSearch={async (value) => {
          await search(value)
        }}
      />

      {/* 物料统计展示区域 - 只有选中工位时才显示 */}
      {ermData.selectedWorkstation && (
        <Card size="small" style={{}}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Text strong style={{ fontSize: '13px' }}>
                {ermData.selectedProject?.name}
                {ermData.selectedEquipment &&
                  ` - ${ermData.selectedEquipment.name}`}
                {ermData.selectedWorkstation &&
                  ` - ${ermData.selectedWorkstation.name}`}
                {' - 物料统计'}
              </Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                共 {totalMaterials} 个物料
              </Text>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                flexWrap: 'wrap',
              }}>
              {materialStats.length === 0 ? (
                <Text type="secondary">暂无物料数据</Text>
              ) : (
                <>
                  {materialStats.slice(0, 3).map((stat, index) => (
                    <Tag
                      key={stat.category}
                      color={
                        index === 0 ? 'blue' : index === 1 ? 'green' : 'orange'
                      }
                      style={{ fontSize: '11px', padding: '2px 6px' }}>
                      {stat.category}: {stat.count}
                    </Tag>
                  ))}
                  {materialStats.length > 3 && (
                    <Tag
                      color="default"
                      style={{
                        cursor: 'pointer',
                        fontSize: '11px',
                        padding: '2px 6px',
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setMaterialModalVisible(true)
                      }}>
                      +{materialStats.length - 3} 更多
                    </Tag>
                  )}
                </>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* 物料详情弹窗 */}
      <Modal
        title={`${ermData.selectedProject?.name || ''}${
          ermData.selectedEquipment
            ? ` - ${ermData.selectedEquipment.name}`
            : ''
        }${
          ermData.selectedWorkstation
            ? ` - ${ermData.selectedWorkstation.name}`
            : ''
        } - 工位物料详情`}
        open={materialModalVisible}
        onCancel={() => setMaterialModalVisible(false)}
        footer={null}
        width={800}>
        {materialStats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Text type="secondary">暂无物料数据</Text>
          </div>
        ) : (
          <List
            dataSource={materialStats}
            renderItem={(stat) => (
              <List.Item>
                <div style={{ width: '100%' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}>
                    <Tag color="blue" style={{ fontSize: '14px' }}>
                      {stat.category}
                    </Tag>
                    <Text strong>{stat.count} 个物料</Text>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: '8px',
                    }}>
                    {stat.materials.map((material) => (
                      <Card size="small" key={material.id}>
                        <div>
                          <Text strong>{material.name}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            型号: {material.modelNumber || '无'}
                          </Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            品牌: {material.brand || '无'}
                          </Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            均价: ¥{material.averagePrice || 0}
                          </Text>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </Modal>
    </div>
  )
})

export default App
