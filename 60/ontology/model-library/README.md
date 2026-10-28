# 标准实体字段模型库

当前版本：`1.0.0`

本库是 60 系统人员、组织、岗位、招聘和进校领域的标准字段目录。它同时服务于接口设计、页面字段绑定、数据集成、权限控制、数据质量校验和 AI 检索治理。

## 权威来源与产物

- 唯一可编辑源：`ontology/model-library/entity-field-models.json`
- 运行时同步产物：`packages/hr-domain/data/entity-field-models.json`
- 元模型约束：`entity-model.schema.json`
- 同步命令：`npm run sync:field-ontology`
- 一致性校验：`npm run validate:field-ontology`
- 完整性校验：`node scripts/validate-entity-model-library.mjs`

字段必须先修改本目录的 JSON，再同步到运行时包。禁止从业务代码反向覆盖 ontology。`ontology/core/entities.yaml` 保留为概念层摘要；发生字段级差异时，以本模型库为准。

## 覆盖范围

模型库当前覆盖：

- 人员：`Person`、`PersonIdentity`、`EmploymentAssignment`、`Contract`
- 组织岗位：`Organization`、`Position`、`PositionSlot`
- 招聘进校：`Candidate`、`RecruitmentPlan`、`RecruitmentPosition`、`Application`、`OnboardingCase`
- 治理审计：`LegacyIdentifier`、`HREvent`
- 教学档案：`Course`、`TeachingAssignment`、`CoursePortfolio`、`EnterprisePractice`、`TeachingAchievement`、`TrainingExperience`、`ProfessionalAppointment`、`PortfolioSubmission`、`PortfolioReview`

每个字段至少定义：字段 ID、中文名称、数据类型、是否必填、是否可空、数据分级、是否可修改和检索策略。概念字段还需定义词表，引用字段还需定义目标实体。

## 接入规则

1. API、事件和页面状态使用模型中的英文 `field.id`，中文名称只用于展示。
2. 新字段必须先进入模型库，再进入页面或接口；不得长期保留页面私有同义字段。
3. 存量字段通过 `ontology/mappings/field-mappings.yaml` 记录来源和映射状态。
4. `restricted` 字段不得进入通用列表、日志、URL、全文索引或向量索引。
5. 标准引用保存目标实体 ID；名称、编码可作为当时快照，但不能替代引用。
6. 破坏性变更提升主版本；新增可选字段提升次版本；仅文档修订提升补丁版本。

## 运行时使用

```js
import { getEntityModel, getFieldModel, validateEntityRecord } from '@wisedu/hr-domain/models'

const personModel = getEntityModel('Person')
const employeeNumber = getFieldModel('Person', 'employeeNumber')
const result = validateEntityRecord('Person', payload)
```

`validateEntityRecord` 默认拒绝未登记字段；PATCH 场景可传 `{ partial: true }`。
