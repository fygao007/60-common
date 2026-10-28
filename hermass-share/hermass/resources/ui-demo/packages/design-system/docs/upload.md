# DSUpload 上传组件

## 设计来源

- MasterGo：`mastergo://getd2c/139272150501659-1259-36938`
- 原始提取：`.mastergo/upload/`
- React：`ui-demo/packages/design-system/src/Upload/index.jsx`
- 样式：`ui-demo/packages/design-system/src/Upload/index.css`
- 交互预览：`ui-demo/components/upload-components.html`

## 组件定位

`DSUpload` 是通用附件上传组件，覆盖文件选择、传输状态和结果操作。
`DSImportUpload` 仍保留为导入向导专用组合组件，不承担通用上传 API。

## 形态

- `mode="button"`：按钮式上传入口，高度 `32px`。
- `mode="dragger"`：拖拽上传区域，默认宽 `320px`、高 `150px`。
- `listType="text"`：文字文件列表，适合普通附件。
- `listType="picture-card"`：`160px × 120px` 图片或文件卡片。
- `draggerSize="compact"`：`160px × 120px`，图片卡片模式默认使用。
- `draggerSize="large"`：`320px × 150px`，带辅助说明的上传区域。

## 状态

- Default：虚线边框 `#B9BAC2` 或按钮边框 `#DCDCE0`。
- Hover：上传区域和按钮边框使用 `#333FFF`。
- Press：上传区域边框使用 `#2E39E5`。
- Disabled：背景 `#F6F6F7`，文字和图标置灰，禁止选择、拖拽和操作。
- Uploading：展示主色进度条及“取消上传”。
- Done：展示文件名、大小以及预览、下载、删除操作。
- Error：使用 `#FFF6F6` 背景与 `#FA5151` 边框，支持重新上传。

## 交互规则

1. 点击按钮或拖拽区域打开原生文件选择器。
2. 拖入文件时使用 Hover 边框；离开或释放后恢复。
3. 聚焦拖拽区域后可粘贴剪贴板中的文件。
4. `beforeUpload` 返回 `false` 时阻止文件加入列表。
5. 未提供 `request` 时，文件选择完成后直接进入 `done` 状态。
6. 提供 `request` 时先进入 `uploading`；通过 `onProgress(percent)` 更新进度。
7. `request` 成功后进入 `done`，抛出异常后进入 `error`。
8. 上传中删除行为视为取消，并触发 `onCancel`。
9. 失败状态点击“重新上传”后重新调用 `request`。
10. 删除前可通过异步 `onRemove` 返回 `false` 阻止操作。
11. 达到 `maxCount` 后隐藏上传入口。

## 基础用法

```jsx
import { DSUpload } from '@wisedu/design-system'

<DSUpload
  mode="button"
  multiple
  accept=".pdf,.doc,.docx"
  defaultFiles={[
    { uid: '1', name: '申请材料.pdf', size: 3686, status: 'done' },
  ]}
  onPreview={handlePreview}
  onDownload={handleDownload}
/>
```

## 自定义上传请求

```jsx
<DSUpload
  mode="dragger"
  listType="picture-card"
  accept="image/*"
  maxCount={4}
  request={async (file, { onProgress }) => {
    return uploadFile(file, {
      onProgress: (event) => onProgress(event.percent),
    })
  }}
  beforeUpload={(file) => file.size <= 20 * 1024 * 1024}
/>
```

## 文件数据

```ts
type UploadFile = {
  uid: string
  name: string
  size?: number
  type?: string
  status?: 'uploading' | 'done' | 'error'
  percent?: number
  url?: string
  thumbnail?: string
  response?: unknown
  error?: Error | string
  raw?: File
}
```

## 主要属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `files` | 受控文件列表 | - |
| `defaultFiles` | 非受控初始文件列表 | `[]` |
| `mode` | `button` 或 `dragger` | `button` |
| `listType` | `text` 或 `picture-card` | `text` |
| `draggerSize` | `compact` 或 `large` | 随列表类型 |
| `accept` | 原生文件类型限制 | - |
| `multiple` | 是否允许多选 | `false` |
| `maxCount` | 最大文件数 | - |
| `disabled` | 禁用全部上传和操作 | `false` |
| `description` | 上传入口辅助说明 | - |
| `request` | 自定义异步上传请求 | - |
| `beforeUpload` | 上传前校验，可返回 Promise | - |
| `onChange` | 文件列表或状态变化 | - |
| `onPreview` | 预览文件 | - |
| `onDownload` | 下载文件 | - |
| `onRemove` | 删除或取消前钩子 | - |
| `onRetry` | 点击重新上传 | - |
| `onCancel` | 取消上传 | - |
