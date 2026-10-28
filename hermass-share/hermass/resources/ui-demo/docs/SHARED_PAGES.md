# 公共页面与个性化页面

## 三种页面模式

### shared

页面直接使用 `@wisedu/shared-pages` 中的公共页面模块。公共模块修改后，所有 `shared` 和引用它的 `hybrid` 页面同时生效。

### custom

页面在自身 Demo 目录独立实现，不引用公共页面模块。公共页面修改不得影响它。

### hybrid

页面使用公共页面主体，并通过公共页面明确开放的扩展点添加个性内容。公共主体随公共模块更新，个性内容只存在于当前页面目录。

## 注册规则

所有页面类型登记在 `specs/page-compositions.json`：

```json
{
  "pageId": "product-a.staff-manage",
  "path": "demos/product-a/hr/staff-manage/staff-manage.html",
  "mode": "hybrid",
  "basePageRef": "shared.staff-list",
  "extensions": ["toolbarAfter", "detailExtra"]
}
```

公共页面同时登记模块和允许的扩展点：

```json
{
  "id": "shared.staff-list",
  "module": "@wisedu/shared-pages/staff-list",
  "allowedExtensions": ["toolbarAfter", "columnsAfter", "detailExtra"]
}
```

## 边界

- 公共页面放在 `packages/shared-pages/`，不放进设计系统。
- 设计系统只负责通用 UI；公共页面可以包含稳定业务流程。
- `custom` 页面禁止导入 `@wisedu/shared-pages`。
- `hybrid` 页面只能使用已登记扩展点，禁止覆盖公共页面内部 CSS、DOM 和状态。
- 扩展使用 ontology `fieldRef` 和设计系统组件，不能复制公共页面字段、菜单或 Mock。
- 公共页面不得导入任何 `demos/` 文件。
- 页面模式变更必须修改注册表并通过校验。

## 变更影响

```text
修改公共页面
├─ shared：全部生效
├─ hybrid：公共主体生效，个性扩展保留
└─ custom：完全不受影响
```
