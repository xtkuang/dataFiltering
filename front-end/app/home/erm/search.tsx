import React, { useState } from 'react'
import { Select, Input } from 'antd'
import type { SelectProps } from 'antd'

import useStores from '@/stores'

import { observer } from 'mobx-react'
import { toJS } from 'mobx'
const { Search } = Input
export interface DebounceSelectProps<ValueType = any>
  extends Omit<SelectProps<ValueType | ValueType[]>, 'options' | 'children'> {
  fetchOptions: (search: string) => Promise<ValueType[]>
  debounceTimeout?: number
}

const App: React.FC = observer(() => {
  const { ermData } = useStores()

  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  return (
    <>
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
                {`项目:${project} 设备:${equipment} 工位:${workstation} 物料:${material} 中`}
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
        }}
        // ... 其他属性保持不变 ...
      />
      <Search
        style={{ position: 'relative', zIndex: 10, width: '100%' }}
        placeholder="input search text"
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        // loading={true}

        onSearch={async (value) => {
          ermData.resetSearchData()
          setSearchValue(value)

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
            console.log(ermData.searchData)
          })
        }}
      />
    </>
  )
})

export default App
