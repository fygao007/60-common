# 组织机构数据整理说明

## 版本
0.3.1 (2026-09-04)

## 概述
本次更新将组织机构数据（T_RS_JGGL_XZJG、T_RS_ZXBZ_DW、T_RS_ZXBZ_DWLB）整理到 ontology 项目中，便于其他模块引用。

## 新增文件

### 1. 数据源快照
- **sources/legacy-schemas/organization-tables.json**
  - 三张表的结构定义
  - 字段说明和用途
  - 数据质量备注

- **sources/organization-structure-data.json**
  - 355 条组织记录的完整快照
  - 6 个组织类别定义
  - 统计信息和数据分析

### 2. 词表定义
- **vocabularies/organization-vocabularies.yaml**
  - OrganizationCategory（组织大类）：深圳职业技术大学、党政教辅机构、教学单位、产学研单位、后勤服务企业、其他
  - OrganizationLevel（组织层级）：校级、院级/部门级、专业群/科室级、专业/小组级
  - OrganizationStatus（组织状态）：在用、暂停、已撤销
  - 映射规则和转换逻辑

### 3. 字段映射
- **mappings/organization-field-mappings.yaml**
  - T_RS_JGGL_XZJG 到 Organization 实体的详细映射
  - T_RS_ZXBZ_DW 到 Organization 实体的映射
  - 数据质量问题分析
  - 转换规则定义

## 更新文件

### 1. core/entities.yaml
扩展 Organization 实体定义：
- 新增字段：organizationCode（编码）、nameEn（英文名称）、shortName（简称）
- 新增字段：organizationCategory（组织大类）、level（组织层级）
- 新增字段：parentOrganizationId（上级组织）
- 新增字段：responsibilities（组织职责）
- 新增字段：establishedDate/establishmentDocument（成立信息）
- 新增字段：abolishedDate/abolishmentDocument（撤销信息）
- 新增字段：isActive（启用状态）、sortOrder（排序）
- 新增关系：parentOf（层级关系）、affiliatedTo（挂靠关系）

### 2. vocabularies/core-vocabularies.yaml
新增词表：
- OrganizationCategory（组织大类）
- OrganizationLevel（组织层级）
- OrganizationStatus（组织状态）

### 3. sources/source-registry.yaml
注册新数据源：
- organization-structure-tables（表结构快照）
- organization-structure-data（数据快照）

### 4. README.md
更新目录结构，增加组织机构相关文件说明

## 数据特点

### 组织编码规则
- 一级单位：1-999（如 100、300）
- 二级单位：父代码 + 两位序号（如 107、319）
- 三级单位：父代码 + 三位序号（如 319012）

### 组织类别体系
- 1xx：党政教辅机构
- 3xx：教学单位
- 4xx：产学研单位
- 9xx：后勤及其他

### 组织层级
- 共 4 层
- 通过 CC 字段表达层级深度
- 通过 LS 字段建立父子关系

## 数据质量问题

1. **两表数据重复**
   - T_RS_JGGL_XZJG 和 T_RS_ZXBZ_DW 记录数完全相同（355条）
   - 需业务确认两表区别和使用场景

2. **生命周期字段缺失**
   - 大部分记录缺少成立日期（CLRQ）和撤销日期（CXRQ）
   - 需补充完善历史信息

3. **层级字段语义重叠**
   - CC（层次）和 JB（级别）含义接近但取值不一致
   - 需明确业务区别

4. **挂靠关系数据不完整**
   - GKGX 字段绝大部分为空
   - 如需支持双重领导需补充数据

## 引用方式

其他模块可通过以下方式引用组织数据：

```yaml
# 引用组织实体定义
entityRef: Organization
source: core/entities.yaml

# 引用组织词表
vocabularyRef: OrganizationCategory
source: vocabularies/organization-vocabularies.yaml

# 引用字段映射
mappingRef: T_RS_JGGL_XZJG
source: mappings/organization-field-mappings.yaml

# 引用数据快照
dataSource: organization-structure-data
source: sources/organization-structure-data.json
```

## 待确认事项

1. T_RS_JGGL_XZJG 与 T_RS_ZXBZ_DW 的使用边界和优先级
2. CC（层次）与 JB（级别）字段的业务区别
3. 挂靠关系（GKGX/SFGK）的完整性和使用场景
4. 组织生命周期信息的补充来源

## 下一步工作

1. 与业务确认两张组织表的区别和使用场景
2. 补充组织生命周期历史数据
3. 建立组织层级关系验证机制
4. 完善挂靠关系数据和关系建模
