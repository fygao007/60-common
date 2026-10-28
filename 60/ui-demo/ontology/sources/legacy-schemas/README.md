# 现网物理表结构快照

本目录留存各应用现网已落地的数据库表结构，用途只有两个：**溯源**和**映射输入**。

## 边界

1. 这里的文件不是本体模型。列名是物理列名，不具备本体语义。
2. 不得在页面、接口、事件或 Mock 数据中直接引用本目录的列名。字段定义一律以
   `model-library/entity-field-models.json` 为准，人员基本信息以
   `basic-information/basic-information-fields.json` 为准。
3. 快照按采集时间原样保存，不随本体演进而修改。现网表结构变化时新增一份快照并更新
   `capturedAt`，不覆盖历史结论。
4. 每份快照必须在 `sources/source-registry.yaml` 登记，`authority` 取 `system-export`。
5. 快照与本体的对应关系写在 `mappings/` 下的映射文件里，不写在快照内部。

## 当前快照

| 文件 | 应用 | 采集日期 | 表数 | 映射文件 |
|---|---|---|---|---|
| `rsjxdad-table-inventory.json` | rsjxdad 教学档案袋 | 2026-08-18 | 19 | `mappings/rsjxdad-table-mappings.yaml` |
