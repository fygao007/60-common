# 深职大智慧人事本体

当前版本：`0.3.0`（基本信息字段与字典库）

本目录定义 60 系统跨应用共享的人事语义，第一期覆盖人员、组织、岗位、任职、招聘和进校。它不是数据库表结构，也不替代交易系统；它用于统一概念、标识、关系、事件、数据来源、敏感等级和跨系统映射。

## 设计原则

1. 人员、候选人、账号分离：候选人被录用后通过事件转化并关联人员，不直接改名覆盖。
2. 组织、岗位、岗位编制分离：岗位描述职责，岗位编制表达可占用资源，任职关系表达人在一段时间内的实际任用。
3. 当前状态由历史事实计算：当前组织、当前岗位、最高职称等是派生值，历史记录不可被覆盖。
4. 事实必须可溯源：重要事实应记录来源系统、源记录、采集时间和证据文件。
5. 规则必须版本化：资格、指标和流程规则要有生效期，不固化在页面组件中。
6. 权限先于检索：高敏字段不得进入通用全文或向量索引。

## 目录

- `core/entities.yaml`：核心实体和稳定标识。
- `model-library/`：字段级标准模型、JSON 目录和元模型约束；它是字段定义的权威来源。
- `basic-information/`：教职工基本信息 158 字段、145 套字典、字段—字典绑定及复用接口。
- `core/relationships.yaml`：实体关系及时间语义。
- `core/events.yaml`：招聘、进校和任职事件。
- `vocabularies/core-vocabularies.yaml`：核心分类维度。
- `vocabularies/organization-vocabularies.yaml`：组织机构领域词表、组织类别和层级定义。
- `mappings/field-mappings.yaml`：现有资料字段到本体的映射草案。
- `mappings/rsjxdad-table-mappings.yaml`：教学档案袋应用现网物理表到标准实体的映射草案、缺口和待新增实体提案。
- `mappings/organization-field-mappings.yaml`：组织机构表（T_RS_JGGL_XZJG、T_RS_ZXBZ_DW）到组织实体的字段映射。
- `sources/legacy-schemas/`：现网应用物理表结构的原样快照，只作来源留存，不作字段定义引用。
- `sources/organization-structure-data.json`：组织机构数据快照（355条记录）。
- `governance/data-classification.yaml`：数据分级与索引约束。
- `governance/identifier-rules.md`：统一人员 ID、领域 ID 与旧系统编号映射规则。
- `sources/source-registry.yaml`：定义依据及权威性。
- `queries/competency-questions.yaml`：本体必须能够回答的问题。
- `docs/60-system-refactoring.md`：当前 60 工程的改造清单。

## 状态说明

`0.1.0` 是供业务、产品和研发共同评审的版本，尚未绑定实际数据库表。带 `confirmation: required` 的定义必须由对应业务负责人确认后才能进入生产接口或规则。
