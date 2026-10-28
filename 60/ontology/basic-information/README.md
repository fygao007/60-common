# 教职工基本信息字段与字典库

当前版本：`1.0.0`

本目录把《基本信息确认字段.xlsx》的完整基本信息主表与 `V1.0.0_20260610_1501__rsmodelpubZxbz.sql` 的校标字典整理为可被其他业务复用的 ontology 资产。

## 资产

- `basic-information-fields.json`：158 个基本信息字段，保留原字段编码、名称、分组、顺序和控件，并补充标准字段 ID、类型、分级、生命周期、语义目标和字典状态。
- `dictionary-catalog.json`：SQL 中 145 套字典、6,583 个唯一代码值；原始 6,592 行全部可对账，重复代码保留在 `duplicateCodes`。
- `field-dictionary-bindings.json`：77 个选择字段与字典或外部主数据的显式绑定。
- `field-dictionary-matrix.md`：便于业务评审的完整字段—字典对应表。
- `analysis-summary.json`：覆盖率、分组统计、待确认项和源数据告警。
- 三个 `*.schema.json`：字段库、字典库和绑定库的 JSON Schema。

## 其他业务如何引用

业务不得复制字段中文名或自行维护同名下拉项。应引用稳定字段 ID：

```text
StaffBasicInformation.xbdm   → RS.ZXBZ.XB
StaffBasicInformation.zjlx   → RS.ZXBZ.SFZJLX
StaffBasicInformation.szdwdm → Organization（组织主数据）
```

运行时可使用 `@wisedu/hr-domain/basic-information`：

```js
import {
  getBasicInformationField,
  getFieldDictionaryBinding,
  listDictionaryValues,
  resolveDictionaryValue,
} from '@wisedu/hr-domain/basic-information'

const field = getBasicInformationField('XBDM')
const binding = getFieldDictionaryBinding(field.fieldId)
const options = listDictionaryValues(binding.dictionaryId)
```

新增业务字段统一登记在 `business-field-extensions.json`。语义相同的字段通过 `extends: "StaffBasicInformation.<code>"` 继承；业务只能增加本域约束或展示配置，不得改变基础字段的数据类型、分级和字典语义。完整规则见 `ontology/governance/field-reuse-policy.md`。

## 字典绑定结论

- `bound`：59 个，SQL 中存在语义明确的字典。
- `external-master-data`：7 个。出生地、籍贯引用行政区划；所在单位引用组织主数据；学科引用学科主数据。
- `review-required`：11 个。工人技术工种/等级、计算机/英语水平、部分工资与绩效等级、在职状态和雇员等级在 SQL 中没有可安全确认的对应字典。

禁止用名称相似替代业务确认。例如“工人技术等级”不能直接等同于通用岗位等级，“执行统发工资类别”也不能由薪级字典推导。

## 源数据问题

1. `RS.ZXBZ.CGLY` 的代码 `13`、`14`、`15`、`16` 各对应两套不同含义。
2. `RS.ZXBZ.QDFS` 的代码 `1`、`9` 各对应两套不同含义。
3. Excel 的旧字段对照区 H:L 存在 `#NAME?`；本次仅以 A:G 的正式字段区为来源。
4. `JZGBH` 与 `ZGH` 都指向 `Person.employeeNumber`，接入时需确认一个权威字段，另一个作为旧系统别名，不能生成两个工号属性。

冲突字典状态为 `review-required`。查询歧义代码时运行时返回 `ambiguous-code`，业务不得静默选择第一条。

## 生成和校验

解析源文件：

```text
node scripts/build-basic-info-ontology.mjs \
  --workbook-json=<artifact-tool 导出的 workbook-values.json> \
  --sql=<字典 SQL 路径>
```

一致性校验：`node scripts/validate-basic-info-ontology.mjs`。

业务字段登记修改后执行 `node scripts/sync-basic-info-package-data.mjs`，再运行一致性校验。
