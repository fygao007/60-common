# Select / 选择器

MasterGo 设计来源：

```text
mastergo://getd2c/139272150501659-4050-77616
mastergo://getd2c/139272150501659-5259-45739
```

## 用途

`DSSelect` 用于表单、筛选区、表格单元格编辑和弹窗表单中的单选、多选和搜索选择。

## 能力

- 单选：展示占位、选中值、下拉面板、选中项。
- 多选：展示标签、支持多项选中。
- 搜索：打开后在触发器内输入关键词并过滤选项。
- 清除：有值时可展示清除按钮。
- 图标：使用 `ui-demo/assets/select-icons/` 中的 MasterGo 导出图标。
- 交互：支持点击展开、选项切换、外部点击关闭、`Esc` 关闭、多选标签单项移除。
- 状态：默认、悬浮、聚焦、展开、禁用、错误、空数据。
- 兼容：传入 `children` 或 `native` 时继续渲染原生 `<select>`。

## React 用法

```jsx
<DSSelect
  placeholder="请选择项目类型"
  defaultValue="人才项目"
  clearable
  options={[
    { value: '人才项目', label: '人才项目' },
    { value: '岗位聘任', label: '岗位聘任' },
    { value: '考核评价', label: '考核评价' },
  ]}
/>
```

多选：

```jsx
<DSSelect
  multiple
  defaultValue={['重点', '启用']}
  options={[
    { value: '重点', label: '重点' },
    { value: '启用', label: '启用' },
    { value: '待审核', label: '待审核' },
  ]}
/>
```

原生兼容：

```jsx
<DSSelect native defaultValue="20" name="pageSize">
  <option value="10">10 条 / 页</option>
  <option value="20">20 条 / 页</option>
</DSSelect>
```

预览页：`ui-demo/components/form-select-states.html`。
