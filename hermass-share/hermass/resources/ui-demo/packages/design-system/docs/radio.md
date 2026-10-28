# Radio / 单选

MasterGo 设计来源：

```text
mastergo://getd2c/139272150501659-4096-70064
```

## 用途

`DSRadioGroup` 用于互斥选项选择，适合表单、筛选区、弹窗配置和权限范围设置。

## 能力

- 单选：同组内仅允许一个选项被选中。
- 排列：支持横向排列和纵向排列。
- 状态：默认、选中、聚焦、禁用、错误。
- 交互：支持点击切换、方向键切换、真实 `input[type="radio"]` 表单提交。

## React 用法

```jsx
<DSRadioGroup
  name="visibleScope"
  defaultValue="public"
  options={[
    { value: 'public', label: '公开' },
    { value: 'internal', label: '内部' },
    { value: 'admin', label: '仅管理员' },
  ]}
/>
```

纵向排列：

```jsx
<DSRadioGroup
  vertical
  defaultValue="college"
  options={[
    { value: 'college', label: '按学院展示' },
    { value: 'major', label: '按专业展示' },
    { value: 'tutor', label: '按导师展示' },
  ]}
/>
```

预览页：`ui-demo/components/form-radio-group-states.html`。
