import React, { useCallback, useState } from 'react'
import { Select, Input } from 'antd'
import type { SelectProps } from 'antd'

import useStores from '@/stores'

import { observer } from 'mobx-react'
import { toJS } from 'mobx'
// import { debounce } from 'lodash'
const { Search } = Input
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
  const debounceSearch = useCallback(
    //在组件重新渲染时不会重新创建防抖函数。
    debounce((value: string) => {
      search(value)
    }, 1000),
    []
  )
  const search = async (value: string) => {
    console.log('search:', value)
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
      console.log(ermData.searchData)
    })
    setLoading(false)
  }
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
        loading={loading}
        onBlur={() => setOpen(false)}
        onChange={async (e) => {
          debounceSearch(e.target.value)
          // debounce(() => {
          //   console.log('debounce : ' + e.target.value)
          //   // await search(e.target.value)
          // }, 1000)()
        }}
        onSearch={async (value) => {
          await search(value)
        }}
      />
    </>
  )
})

export default App
