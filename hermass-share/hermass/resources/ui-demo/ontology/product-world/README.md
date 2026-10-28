# 产品世界模型

产品世界模型是业务调研、Demo 和需求文档的共同来源。禁止先写页面、再从页面反推需求。

## 生成链路

```text
调研来源 → 角色/目标/痛点 → 业务场景 → 字段引用 + 模板 + 组件
                                      ├─ Demo 页面
                                      └─ 需求文档
```

每个场景一个 JSON，必须包含：调研来源、角色、目标、主流程、异常流程、页面模板、菜单引用、字段引用、组件、业务规则和验收标准。

- 字段只能引用 ontology 中已有的 `fieldRef`。
- 模板只能引用 `specs/page-template-catalog.json` 中已有模板。
- 组件只能引用 `@wisedu/design-system` 公共出口。
- 菜单只能引用已注册的 `menuId:featureKey`。
- 调研中尚未确认的内容进入 `openQuestions`，不能伪装成确定需求。

运行：

```bash
npm run validate:product-world
npm run generate:requirement -- ontology/product-world/scenarios/<scene>.json
npm run generate:demo-context -- ontology/product-world/scenarios/<scene>.json
```

`demo-context.json` 会解析完整字段定义、模板要求、组件清单和页面约束，作为任意模型生成 Demo 的唯一输入。生成的需求文档与 Demo 必须保留场景 ID 和版本，以便相互追溯。
