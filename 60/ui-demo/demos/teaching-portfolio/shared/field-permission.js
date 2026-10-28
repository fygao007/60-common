/**
 * 字段权限推导函数
 * 根据「角色 × 数据来源」两维推导教师端/审核端的字段编辑权限。
 * 权限走全局规则，不进批次配置；批次只引用表，不存权限。
 *
 * 用法（普通 script，挂到 window 全局）：
 *   resolveFieldPermission('teacher', '教务系统') -> 'read'
 *   permissionLabel('edit') -> '可编辑'
 *
 * 角色取值：teacher | chief | dean | major | supervisor | hr | admin | student
 * @returns {'edit' | 'read'} - edit=可编辑，read=只读
 */
;(function (root) {
  function resolveFieldPermission(role, sourceTable) {
    // 审核类角色一律只读
    var auditRoles = ['chief', 'dean', 'major', 'supervisor', 'hr', 'admin']
    if (auditRoles.indexOf(role) > -1) return 'read'

    // 学生只读
    if (role === 'student') return 'read'

    // 教师：根据来源判断
    if (role === 'teacher') {
      var editableSources = ['教学档案袋', '档案袋维护', '数据采集']
      var normalizedSource = String(sourceTable || '').trim()
      for (var i = 0; i < editableSources.length; i++) {
        if (normalizedSource.indexOf(editableSources[i]) > -1) return 'edit'
      }
      // 人事/教务/科研/组织机构等系统来源 → 只读
      return 'read'
    }

    // 默认只读
    return 'read'
  }

  function permissionLabel(permission) {
    return permission === 'edit' ? '可编辑' : '只读'
  }

  root.resolveFieldPermission = resolveFieldPermission
  root.permissionLabel = permissionLabel
})(typeof window !== 'undefined' ? window : this)
