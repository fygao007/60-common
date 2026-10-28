# 招聘管理共享资源

本目录存放招聘管理系统的框架挂载逻辑。

## 文件说明

| 文件 | 用途 |
|------|------|
| `recruitment-frame.js` | 框架2挂载逻辑：角色/菜单配置、路由、页签，封装 `window.RecruitmentFrame.mount()` |

## 参考模板

参照 `../../teaching-portfolio/shared/portfolio-frame.js` 的结构，替换：
- 角色列表与角色信息
- 菜单结构
- 业务相关的样式类名前缀