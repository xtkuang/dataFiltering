import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Select, Spin, Input, Tooltip } from 'antd'
import type { SelectProps } from 'antd'
import debounce from 'lodash/debounce'
import useStores from '@/stores'
import { exportDataToExcel } from '../../../../server/src/controller/home-controller'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
const { Search } = Input
export interface DebounceSelectProps<ValueType = any>
  extends Omit<SelectProps<ValueType | ValueType[]>, 'options' | 'children'> {
  fetchOptions: (search: string) => Promise<ValueType[]>
  debounceTimeout?: number
}

function DebounceSelect<
  ValueType extends {
    key?: string
    label: React.ReactNode
    value: string | number
  } = any
>({
  fetchOptions,
  debounceTimeout = 800,
  ...props
}: DebounceSelectProps<ValueType>) {
  const [fetching, setFetching] = useState(false)
  const [options, setOptions] = useState<ValueType[]>([])
  const fetchRef = useRef(0)

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: string) => {
      fetchRef.current += 1
      const fetchId = fetchRef.current
      setOptions([])
      setFetching(true)

      fetchOptions(value).then((newOptions) => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return
        }

        setOptions(newOptions)
        setFetching(false)
      })
    }

    return debounce(loadOptions, debounceTimeout)
  }, [fetchOptions, debounceTimeout])

  return (
    <>
      <Search placeholder="input search text" onSearch={debounceFetcher} />
      <Select
        labelInValue
        filterOption={false}
        onSearch={debounceFetcher}
        notFoundContent={fetching ? <Spin size="small" /> : null}
        {...props}
        options={options}
        style={{ position: 'absolute', right: '0', width: '0' }}
      />
    </>
  )
}

// Usage of DebounceSelect
interface UserValue {
  label: string
  value: string
}

async function fetchUserList(username: string): Promise<UserValue[]> {
  console.log('fetching user', username)

  return fetch('https://randomuser.me/api/?results=5')
    .then((response) => response.json())
    .then((body) =>
      body.results.map(
        (user: {
          name: { first: string; last: string }
          login: { username: string }
        }) => ({
          label: `${user.name.first} ${user.name.last}`,
          value: user.login.username,
        })
      )
    )
}

const App: React.FC = observer(() => {
  const { ermData } = useStores()
  const [value, setValue] = useState<UserValue[]>([])
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [fetching, setFetching] = useState(false)
  const [options, setOptions] = useState<any[]>([])

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
