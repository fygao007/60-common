# Tag 流程状态标签

设计来源：

`mastergo://getd2c/139272150501659-5414-57305`

用于现场自定义流程状态，并在待办卡片、已结事项表格和 IM 聊天卡片中保持一致语义。

## 状态映射

| 阶段 | 语义 | 色调 | 示例 |
|---|---|---|---|
| 流程前 | 默认 | `neutral` | 未开始、未提交、草稿 |
| 流程中 | 默认 | `primary` | 进行中、处理中、待审核、待审批、待处理 |
| 流程后 | 正向 | `success` | 已完成、已转发、已移交、已委派、已跳转、补正发起、补正回复、已通过 |
| 流程后 | 负向 | `danger` | 已退回、已驳回、已终止、强行终止、待重新提交、不通过 |
| 流程后 | 负向取消 | `neutral` | 已撤回、已取消、已撤销 |
| 失效 | 默认 | `neutral` | 已作废、已失效、已过期、报名已结束 |

失效是外部条件变化导致流程失去业务意义，用户无需操作，不使用危险色。

## 交互规则

- 标签是只读状态展示，不承担跳转、筛选、删除或流程操作。
- 悬浮、聚焦和按下不改变标签颜色或业务语义。
- 标签由业务状态驱动更新，用户不能直接编辑标签。
- 需要操作时使用独立按钮、链接或卡片点击区域。
- 不按个人偏好随意指定颜色；优先通过 `status` 自动映射。

## React 用法

自动映射流程状态：

```jsx
<DSTag status="待审核" />
<DSTag status="已通过" variant="icon" />
<DSTag status="不通过" variant="stamp" />
```

明确指定色调：

```jsx
<DSTag color="primary">自定义处理中</DSTag>
<DSTag color="success" variant="icon">已办结</DSTag>
```

状态工具：

```jsx
import { getProcessStatusTone, PROCESS_STATUS_GROUPS } from '@wisedu/design-system'

const tone = getProcessStatusTone('已退回') // danger
```

## API

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `status` | `string` | - | 流程状态，自动映射色调 |
| `color / tone` | `'neutral' \| 'primary' \| 'success' \| 'danger' \| 'warning' \| 'info'` | 自动映射 | 显式色调 |
| `variant` | `'filled' \| 'icon' \| 'stamp'` | `'filled'` | 使用场景形态 |
| `icon` | `ReactNode \| false` | 默认状态图标 | 自定义或隐藏 `icon` 形态图标 |
| `children` | `ReactNode` | `status` | 标签内容 |

交互预览：`ui-demo/components/tag-components.html`。
