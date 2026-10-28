# 产品设计默认使用标准字段

## 最短使用路径

做表单、列表或详情页之前先查字段：

```text
node scripts/find-standard-field.mjs 性别
node scripts/find-standard-field.mjs 证件类型
node scripts/find-standard-field.mjs SZDWDM
```

查询结果会返回标准 `fieldId`、字段类型、字典/主数据和数据分级。

## 产品代码

单个字段：

```js
import { defineProductField } from '@wisedu/hr-domain/basic-information'

const genderField = defineProductField('StaffBasicInformation.xbdm', {
  required: true,
  placeholder: '请选择性别',
})
```

返回对象自动包含：

- `fieldRef`：标准字段引用；
- `label`、`dataType`、`classification`；
- `binding`：字典或主数据绑定；
- `options`：已启用的标准字典项；
- `product`：当前产品允许增加的必填、只读、显隐、提示等配置。

一组表单字段：

```js
import { defineProductFieldSet } from '@wisedu/hr-domain/basic-information'

export const applicantBasicFields = defineProductFieldSet([
  { fieldRef: 'StaffBasicInformation.xm', product: { required: true } },
  { fieldRef: 'StaffBasicInformation.xbdm', product: { required: true } },
  { fieldRef: 'StaffBasicInformation.zjlx', product: { required: true } },
  { fieldRef: 'StaffBasicInformation.zjhm', product: { required: true } },
  { fieldRef: 'StaffBasicInformation.szdwdm', product: { helpText: '引用组织主数据' } },
])
```

## 页面组件如何消费

```jsx
const field = defineProductField('XBDM', { required: true })

<DSSelect
  name={field.fieldRef}
  label={field.product.label || field.label}
  required={field.product.required}
  options={field.options.map(({ code, label }) => ({ value: code, label }))}
/>
```

`SZDWDM` 等主数据字段的 `options` 为空，组件应根据 `referenceTarget: "Organization"` 调用组织主数据选择器，不能把组织名称写成页面私有数组。

## 允许和禁止

产品层允许覆盖：`required`、`readOnly`、`hidden`、展示名称、占位语、帮助文本、默认值和组件展示参数。

产品层禁止覆盖：`dataType`、`classification`、`dictionaryId`、`semanticTarget`。例如下面的定义会直接报错：

```js
defineProductField('XBDM', { dictionaryId: 'MyGenderOptions' })
```

## 没找到字段时

1. 不要直接在页面创建字段和下拉数组。
2. 在 `ontology/basic-information/business-field-extensions.json` 登记。
3. 若只是标准字段的业务用法，使用 `business-extension + extends`。
4. 只有标准库确实没有该语义时，才使用 `business-specific`。
5. 同步并运行 ontology 校验后再进入产品代码。
