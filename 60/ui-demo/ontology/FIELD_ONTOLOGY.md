# 字段 ontology 使用规范

## 唯一来源

所有业务表、接口、事件、表单、列表、详情和 Mock 数据的字段，都必须先登记在 `ontology/`。

- 通用实体字段：`ontology/model-library/entity-field-models.json`
- 教职工基础信息：`ontology/basic-information/basic-information-fields.json`
- 尚未标准化的业务扩展：`ontology/basic-information/business-field-extensions.json`
- 领域专属模型：放入对应的 `ontology/<domain>/`，并登记进统一目录后再使用

运行时代码位于 `packages/hr-domain/data/`，它只是 ontology 的同步产物，不是编辑源。

## 模块调用

```js
import { defineTableColumns, defineOntologyFields } from '@wisedu/hr-domain/fields'

export const columns = defineTableColumns([
  'Course.name',
  { fieldRef: 'Course.courseCode', product: { width: 160 } },
])

export const formFields = defineOntologyFields([
  { fieldRef: 'StaffBasicInformation.xm', product: { required: true } },
])
```

模块只允许覆盖必填、只读、显隐、展示名称、提示、宽度、对齐、排序和渲染方式等展示约束。字段类型、数据分级、字典、引用目标和语义不得在模块中重定义。

## 新增字段流程

1. 搜索 ontology，确认没有同义字段。
2. 在对应领域 ontology 文件登记字段。
3. 运行 `npm run sync:field-ontology`。
4. 运行 `npm run validate:field-ontology`。
5. 页面、接口或 Mock 使用完整 `fieldRef` 引用。

禁止在页面中直接维护 `{ dataIndex, title }`、`{ name, label, type }` 等字段定义副本。
