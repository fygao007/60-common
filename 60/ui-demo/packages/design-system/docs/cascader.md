# Cascader / 级联选择器

MasterGo 设计来源：

```text
https://mastergo.com/goto/T3OjETME?page_id=39:5072&file=139272150501659
```

## 用途

`DSCascader` 用于省市区、组织层级、专业目录等树形数据的逐级选择。

## 能力

- 多列级联：父级选项展开下一列，叶子项点击完成选择。
- 路径展示：选中后展示完整路径。
- 搜索：支持按完整路径搜索叶子节点。
- 状态：默认、已选择、展开、禁用、错误、空数据。
- 交互：点击展开、列内选择、搜索选择、清除、外部点击关闭、`Esc` 关闭。

## React 用法

```jsx
<DSCascader
  clearable
  searchable
  placeholder="请选择省 / 市 / 区"
  options={[
    {
      label: '浙江省',
      value: 'zhejiang',
      children: [
        {
          label: '杭州市',
          value: 'hangzhou',
          children: [{ label: '西湖区', value: 'xihu' }],
        },
      ],
    },
  ]}
/>
```

预览页：`ui-demo/components/form-cascader-states.html`。
