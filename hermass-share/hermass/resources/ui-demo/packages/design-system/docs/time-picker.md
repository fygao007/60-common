# TimePicker / 时间选择器

MasterGo 设计来源：

```text
https://mastergo.com/goto/T51KMAqO?page_id=39:5073&layer_id=1170:06401&file=139272150501659&devMode=true
```

## 用途

`DSTimePicker` 用于表单中的单点时间选择，例如办理时间、开始时间、提醒时间。

## 能力

- 时分选择：默认展示小时和分钟两列。
- 时分秒：可通过 `showSecond` 增加秒列。
- 快捷操作：支持“此刻”和“确定”。
- 状态：默认、已选择、展开、禁用、错误。
- 交互：点击展开、选择列值、清除、外部点击关闭、`Esc` 关闭。

## React 用法

```jsx
<DSTimePicker
  clearable
  defaultValue="09:30"
  placeholder="请选择时间"
/>
```

时分秒：

```jsx
<DSTimePicker showSecond defaultValue="09:30:20" />
```

预览页：`ui-demo/components/form-time-picker-states.html`。
