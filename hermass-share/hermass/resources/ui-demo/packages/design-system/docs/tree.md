# Tree 树形目录

`DSTree` 用于展示两级及以上的层级目录，适合组织、分类和配置导航场景。

```jsx
<DSTree
  dataSource={[
    {
      key: 'basic',
      title: '基本信息',
      children: [{ key: 'profile', title: '个人信息' }],
    },
  ]}
  selectedKey="profile"
  defaultExpandedKeys={['basic']}
  onSelect={(key, node) => setSelectedKey(key)}
/>
```

## 约束

- 节点必须提供稳定且唯一的 `key`。
- 目录展开状态通过 `expandedKeys` / `onExpand` 受控，或使用 `defaultExpandedKeys`。
- 选中状态通过 `selectedKey` / `onSelect` 管理。
- 节点可配置 `draggable` 和 `actions`；拖拽结果通过 `onDrop` 交给业务更新数据顺序。
- 组件负责层级缩进、展开按钮、选中态、键盘操作和无障碍语义，业务页面不得复制内部 DOM 或覆盖 `.ds-tree*` 样式。
