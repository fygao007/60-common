---
name: field-ontology
description: 字段铁律与检索。Hermass Step 1 需求梳理时使用：所有字段必须回溯 ontology 单源，语义相同必须 fieldRef 引用，新字段登记 business-field-extensions.json，禁止发明字段。
---

# 字段铁律与检索（ontology 单源）

> 字段单源目录（独立于 UI Demo）：`${ONTOLOGY_ROOT}`

## 铁律

1. **所有表字段必须先进入 ontology，再由其他模块通过 `fieldRef` 调用。** 页面、接口、Mock、菜单和业务包不得各自创建字段定义副本。
2. 语义相同的字段**必须** `fieldRef: "StaffBasicInformation.<code>"` 引用，不得重新定义中文同义字段、类型或下拉字典。
3. 业务只加必填/只读/显隐/提示语等产品约束时用 `defineProductField`；不得覆盖标准数据类型、数据分级、字典和语义目标。
4. 标准库不存在时登记到 `${ONTOLOGY_ROOT}/basic-information/business-field-extensions.json`：优先 `business-extension`，确属新语义才用 `business-specific`。

## 检索步骤（Step 1 必做）

```bash
# 在 UI Demo 目录 ${UI_DEMO_ROOT} 下执行
node "${UI_DEMO_ROOT}/scripts/find-standard-field.mjs" <字段名称或编码>
```

- 人员基本信息字段查 `${ONTOLOGY_ROOT}/basic-information/basic-information-fields.json` 或 `@wisedu/hr-domain/basic-information`
- 通用实体字段用 `Entity.field`，基础信息字段用 `StaffBasicInformation.code`
- 列表列用 `@wisedu/hr-domain/fields` 的 `defineTableColumns()` 生成，表单字段用 `defineOntologyFields()` 生成
- 页面只能加展示约束，不得重定义字段类型、标签、字典、分级、引用目标或语义

## 新增/修改字段后的命令链（缺一不可）

在 UI Demo 目录 `${UI_DEMO_ROOT}` 下执行：

```bash
npm run sync:field-ontology
npm run validate:field-ontology
node "${UI_DEMO_ROOT}/scripts/sync-basic-info-package-data.mjs"
node "${UI_DEMO_ROOT}/scripts/validate-basic-info-ontology.mjs"
node --test "${UI_DEMO_ROOT}/packages/hr-domain/test/basic-information.test.mjs"
```

## 输出要求

- 需求卡中的字段一律给出 `fieldRef` 或扩展登记记录，未确认的字段语义写入 `research.openQuestions`，不得当作确定需求。
- 详细规则见字段单源目录的 `${ONTOLOGY_ROOT}/FIELD_ONTOLOGY.md` 与 UI Demo 目录的 `${UI_DEMO_ROOT}/docs/product-field-usage.md`。
