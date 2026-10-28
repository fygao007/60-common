# 标准字段优先与业务字段登记规则

规则版本：`1.0.0`

## 强制原则

1. 新建业务表、接口、事件、页面和导出前，必须先查询 `StaffBasicInformation` 标准字段库。
2. 语义相同的字段必须引用标准 `fieldId`，不得因字段中文名、数据库列名或页面控件不同而重新定义。
3. 业务需要增加校验、必填条件、默认值或展示配置时，登记为 `business-extension` 并通过 `extends` 指向标准字段。
4. 标准库不存在该语义时，先登记 `business-specific`，完成字段负责人、类型、分级和字典评审后才能进入业务表。
5. 被两个及以上业务域重复使用的业务字段，应评审提升为标准字段；提升后原业务字段进入弃用期并提供迁移映射。
6. 业务扩展不得降低标准字段的数据分级，不得改变标准字典、数据类型和语义目标。
7. 业务数据库列名可以遵循本系统物理命名，但模型、接口和事件必须保留 `fieldId` 引用。

## 引用形式

```json
{
  "column": "APPLICANT_GENDER",
  "fieldRef": "StaffBasicInformation.xbdm"
}
```

业务扩展示例：

```json
{
  "fieldId": "Business.recruitment.applicantGender",
  "fieldKind": "business-extension",
  "ownerDomain": "recruitment",
  "extends": "StaffBasicInformation.xbdm",
  "label": "应聘人性别",
  "classification": "sensitive",
  "status": "active",
  "constraints": { "required": true }
}
```

业务专属字段示例：

```json
{
  "fieldId": "Business.recruitment.interviewScore",
  "fieldKind": "business-specific",
  "ownerDomain": "recruitment",
  "label": "面试成绩",
  "dataType": "number",
  "classification": "sensitive",
  "lifecycle": "stored",
  "status": "draft"
}
```

业务字段统一登记在 `ontology/basic-information/business-field-extensions.json`。不得把业务专属字段直接写入生成的 `basic-information-fields.json`。
