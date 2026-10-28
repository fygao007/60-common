# AnchorTree 分组锚点树

分组锚点树组件，用于侧边栏导航场景。支持分组折叠/展开、子节点点击高亮、badge 计数、与右侧内容联动。

## 引入

```jsx
import DSAnchorTree from '@wisedu/design-system'
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `groups` | `GroupItem[]` | `defaultGroups` | 分组数据数组 |
| `activeKey` | `string` | - | 当前激活的节点 key（受控） |
| `defaultCollapsed` | `string[]` | `[]` | 默认折叠的分组 key（非受控） |
| `collapsed` | `string[]` | - | 折叠的分组 key（受控） |
| `onToggle` | `(groupKey: string) => void` | - | 分组折叠/展开回调 |
| `onChange` | `(key: string, item: AnchorItem, event) => void` | - | 子节点点击回调 |
| `size` | `'default' \| 'small'` | `'default'` | 尺寸 |
| `bordered` | `boolean` | `false` | 是否显示左侧边框 |
| `className` | `string` | `''` | 自定义类名 |
| `aria-label` | `string` | `'分组锚点树'` | 无障碍标签 |

## 数据结构

### GroupItem

```ts
interface GroupItem {
  key: string           // 分组唯一标识
  title: string         // 分组标题
  badge?: number | string  // 分组右侧徽章（可选）
  children?: AnchorItem[]  // 子节点数组
}
```

### AnchorItem

```ts
interface AnchorItem {
  key: string           // 节点唯一标识
  href: string          // 锚点链接
  title: string         // 节点标题
  disabled?: boolean    // 是否禁用
}
```

## 基础用法

```jsx
const groups = [
  {
    key: 'basic',
    title: '基本信息',
    badge: 3,
    children: [
      { key: 'staffId', href: '#staffId', title: '职工号' },
      { key: 'name', href: '#name', title: '姓名' },
      { key: 'gender', href: '#gender', title: '性别' },
    ],
  },
  {
    key: 'teaching',
    title: '教学情况',
    children: [
      { key: 'course', href: '#course', title: '教学(课程)情况' },
      { key: 'student', href: '#student', title: '指导学生情况' },
    ],
  },
]

<DSAnchorTree
  groups={groups}
  activeKey="staffId"
  bordered
  onChange={(key, item, e) => {
    e.preventDefault()
    // 平滑滚动到 item.href 对应的内容区块
  }}
/>
```

## 折叠状态控制

### 非受控（组件内部管理）

```jsx
<DSAnchorTree
  groups={groups}
  defaultCollapsed={['teaching']}  // 默认折叠 teaching 分组
/>
```

### 受控（外部管理）

```jsx
const [collapsed, setCollapsed] = useState(['teaching'])

<DSAnchorTree
  groups={groups}
  collapsed={collapsed}
  onToggle={(groupKey) => {
    setCollapsed(prev =>
      prev.includes(groupKey)
        ? prev.filter(k => k !== groupKey)
        : [...prev, groupKey]
    )
  }}
/>
```

## 尺寸变体

```jsx
<!-- 默认尺寸 -->
<DSAnchorTree groups={groups} />

<!-- 小尺寸（适用于紧凑侧边栏） -->
<DSAnchorTree groups={groups} size="small" />
```

## 样式类名

| 类名 | 说明 |
|------|------|
| `.ds-anchor-tree` | 根容器 |
| `.ds-anchor-tree--bordered` | 左侧边框模式 |
| `.ds-anchor-tree--small` | 小尺寸 |
| `.ds-anchor-tree__list` | 分组列表 |
| `.ds-anchor-tree__group` | 分组节点 |
| `.ds-anchor-tree__group.is-collapsed` | 折叠状态 |
| `.ds-anchor-tree__group-link` | 分组标题行（可点击折叠） |
| `.ds-anchor-tree__toggle` | 折叠箭头 |
| `.ds-anchor-tree__group-title` | 分组标题文字 |
| `.ds-anchor-tree__group-badge` | 分组徽章 |
| `.ds-anchor-tree__sub` | 子节点列表 |
| `.ds-anchor-tree__item` | 子节点 |
| `.ds-anchor-tree__item.is-active` | 激活状态 |
| `.ds-anchor-tree__item.is-disabled` | 禁用状态 |
| `.ds-anchor-tree__link` | 子节点链接 |

## 与右侧内容联动

典型用法：点击锚点平滑滚动到对应区块，滚动时自动高亮当前区块。

```jsx
const [activeKey, setActiveKey] = useState('staffId')

<DSAnchorTree
  groups={groups}
  activeKey={activeKey}
  bordered
  onChange={(key, item, e) => {
    e.preventDefault()
    const el = document.querySelector(item.href)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveKey(key)
    }
  }}
/>

// 滚动监听更新 activeKey
useEffect(() => {
  const handleScroll = () => {
    const sections = groups.flatMap(g => g.children || [])
    for (const sec of sections) {
      const el = document.querySelector(sec.href)
      if (el && el.getBoundingClientRect().top <= 80) {
        setActiveKey(sec.key)
      }
    }
  }
  window.addEventListener('scroll', handleScroll, { passive: true })
  return () => window.removeEventListener('scroll', handleScroll)
}, [groups])
```

## 演示页面

- HTML 预览：`ui-demo/components/anchor-tree-page.html`