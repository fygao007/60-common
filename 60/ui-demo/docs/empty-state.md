# 缺省页组件规范

## 组件

- `DSEmptyState`：基础缺省状态，负责原因图片、状态文案和可恢复操作。
- `DSEmptyGuide`：高级空状态引导，负责指定操作、多个步骤、推荐方案和跳过入口。

## 基础类型

| `type` | 默认文案 | 推荐操作 |
| --- | --- | --- |
| `data` | 暂无数据 | 新建，仅在当前用户可创建时展示 |
| `todo` | 暂无待办 | 无 |
| `permission` | 暂无权限 | 申请权限，仅在存在申请流程时展示 |
| `network` | 网络异常 | 重新加载 |
| `message` | 暂无消息 | 无 |
| `search` | 暂无搜索结果 | 清除筛选 |
| `maintenance` | 维护中 | 通常无操作 |
| `load-failed` | 加载失败 | 重新加载 |

基础态图片尺寸为 `100 × 100`，图片与主文案间距为 `8px`，文案使用 `14px / 22px` 和 `#737585`。表格等紧凑区域可使用 `compact`。

## 交互规则

1. 先说明真实原因，禁止将权限、网络、搜索无结果等状态统一写成“暂无数据”。
2. 只有操作能立即恢复当前状态时才展示按钮，按钮必须触发真实回调。
3. 重试期间传入 `actionLoading`，避免重复请求；失败后仍保留当前错误态。
4. 图片为装饰内容时保持空 `alt`；图片承担业务信息时通过 `imageAlt` 提供替代文本。
5. 高级引导的完成状态由业务受控，组件不自行修改业务数据。

## React 示例

```jsx
import { DSEmptyState, DSEmptyGuide } from '@wisedu/design-system'

<DSEmptyState
  type="network"
  description="请检查网络连接后重新加载"
  onAction={reload}
  actionLoading={loading}
/>

<DSEmptyGuide
  title="导入已有配置"
  description="按步骤完成模板导出和数据导入"
  skipText="跳过，直接在线编辑"
  onSkip={openEditor}
  steps={[
    { key: 'export', title: '导出模板', actionText: '导出', actionType: 'export', onAction: exportTemplate },
    { key: 'import', title: '导入配置', actionText: '导入', actionType: 'import', onAction: importConfig },
  ]}
/>
```

预览见 `ui-demo/components/empty-state-components.html`。
