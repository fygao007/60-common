/**
 * DSUserPicker - 选人组件
 * 支持组织架构树 + 人员列表 + 已选列表
 */

(function () {
  // 模拟组织架构数据
  const orgTree = [
    {
      id: 'org-1',
      label: '信息学院',
      count: 45,
      children: [
        { id: 'org-1-1', label: '计算机系', count: 18 },
        { id: 'org-1-2', label: '软件工程系', count: 12 },
        { id: 'org-1-3', label: '网络工程系', count: 15 }
      ]
    },
    {
      id: 'org-2',
      label: '管理学院',
      count: 38,
      children: [
        { id: 'org-2-1', label: '工商管理系', count: 20 },
        { id: 'org-2-2', label: '会计系', count: 18 }
      ]
    },
    {
      id: 'org-3',
      label: '外国语学院',
      count: 22,
      children: [
        { id: 'org-3-1', label: '英语系', count: 12 },
        { id: 'org-3-2', label: '日语系', count: 10 }
      ]
    }
  ];

  // 模拟人员数据
  const allUsers = [
    { id: 'user-001', name: '张三', dept: '信息学院 / 计算机系', jobNo: '001', orgId: 'org-1-1' },
    { id: 'user-002', name: '李四', dept: '信息学院 / 计算机系', jobNo: '002', orgId: 'org-1-1' },
    { id: 'user-003', name: '王五', dept: '信息学院 / 软件工程系', jobNo: '003', orgId: 'org-1-2' },
    { id: 'user-004', name: '赵六', dept: '信息学院 / 网络工程系', jobNo: '004', orgId: 'org-1-3' },
    { id: 'user-005', name: '钱七', dept: '管理学院 / 工商管理系', jobNo: '005', orgId: 'org-2-1' },
    { id: 'user-006', name: '孙八', dept: '管理学院 / 会计系', jobNo: '006', orgId: 'org-2-2' },
    { id: 'user-007', name: '周九', dept: '外国语学院 / 英语系', jobNo: '007', orgId: 'org-3-1' },
    { id: 'user-008', name: '吴十', dept: '外国语学院 / 日语系', jobNo: '008', orgId: 'org-3-2' },
    { id: 'user-009', name: '郑十一', dept: '信息学院 / 计算机系', jobNo: '009', orgId: 'org-1-1' },
    { id: 'user-010', name: '陈十二', dept: '信息学院 / 软件工程系', jobNo: '010', orgId: 'org-1-2' }
  ];

  function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function renderTreeNode(node, level = 0) {
    const hasChildren = node.children && node.children.length > 0;
    return `
      <div class="ds-tree-node" data-id="${escapeHtml(node.id)}" data-level="${level}">
        ${hasChildren ? '<span class="ds-tree-node__toggle">▶</span>' : '<span class="ds-tree-node__toggle" style="visibility:hidden">▶</span>'}
        <span class="ds-tree-node__label">${escapeHtml(node.label)}</span>
        ${node.count ? `<span class="ds-tree-node__count">(${node.count})</span>` : ''}
        ${hasChildren ? `<div class="ds-tree-node__children">${node.children.map(child => renderTreeNode(child, level + 1)).join('')}</div>` : ''}
      </div>
    `;
  }

  function renderUserRow(user, isSelected) {
    return `
      <tr class="ds-user-picker__row ${isSelected ? 'is-selected' : ''}" data-id="${escapeHtml(user.id)}">
        <td style="width:40px">
          <span class="ds-user-picker__checkbox ${isSelected ? 'is-checked' : ''}" data-user-id="${escapeHtml(user.id)}"></span>
        </td>
        <td>${escapeHtml(user.name)}</td>
        <td>${escapeHtml(user.jobNo)}</td>
        <td>${escapeHtml(user.dept)}</td>
      </tr>
    `;
  }

  function renderSelectedItem(user) {
    return `
      <div class="ds-user-picker__selected-item" data-id="${escapeHtml(user.id)}">
        <div class="ds-user-picker__selected-info">
          <div class="ds-user-picker__selected-name">${escapeHtml(user.name)}</div>
          <div class="ds-user-picker__selected-dept">${escapeHtml(user.dept)}</div>
        </div>
        <button class="ds-user-picker__selected-remove" type="button" aria-label="移除">×</button>
      </div>
    `;
  }

  function renderModal(state) {
    const filteredUsers = state.query
      ? allUsers.filter(u => u.name.includes(state.query) || u.jobNo.includes(state.query))
      : state.activeOrgId
        ? allUsers.filter(u => u.orgId === state.activeOrgId || u.dept.includes(state.activeOrgId.replace('org-', '').split('-').slice(1).join('/')))
        : allUsers;

    const selectedUsers = state.selectedIds.map(id => allUsers.find(u => u.id === id)).filter(Boolean);

    return `
      <div class="ds-user-picker__overlay">
        <div class="ds-user-picker__modal">
          <div class="ds-user-picker__header">
            <h3>选择人员</h3>
            <button class="ds-user-picker__close" type="button" aria-label="关闭">×</button>
          </div>
          <div class="ds-user-picker__body">
            <div class="ds-user-picker__tree-panel">
              <div class="ds-user-picker__panel-head">
                <h4 class="ds-user-picker__panel-title">组织架构</h4>
              </div>
              <div class="ds-user-picker__tree">
                ${orgTree.map(node => renderTreeNode(node)).join('')}
              </div>
            </div>
            <div class="ds-user-picker__table-panel">
              <div class="ds-user-picker__search">
                <input class="ds-user-picker__search-input" type="text" placeholder="搜索姓名 / 工号" value="${escapeHtml(state.query)}" />
              </div>
              <div class="ds-user-picker__table">
                <table>
                  <thead>
                    <tr>
                      <th style="width:40px">
                        <span class="ds-user-picker__checkbox ${selectedUsers.length > 0 && selectedUsers.length === filteredUsers.length ? 'is-checked' : selectedUsers.length > 0 ? 'is-indeterminate' : ''}" data-action="toggle-all"></span>
                      </th>
                      <th>姓名</th>
                      <th>工号</th>
                      <th>部门</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${filteredUsers.length > 0
                      ? filteredUsers.map(user => renderUserRow(user, state.selectedIds.includes(user.id))).join('')
                      : `<tr><td colspan="4"><div class="ds-user-picker__table-empty">暂无数据</div></td></tr>`
                    }
                  </tbody>
                </table>
              </div>
            </div>
            <div class="ds-user-picker__selected-panel">
              <div class="ds-user-picker__panel-head">
                <h4 class="ds-user-picker__panel-title">已选人员</h4>
                ${selectedUsers.length > 0 ? '<button class="ds-button ds-button--link" type="button" data-action="clear-all">清空</button>' : ''}
              </div>
              <div class="ds-user-picker__selected-list">
                ${selectedUsers.length > 0
                  ? selectedUsers.map(user => renderSelectedItem(user)).join('')
                  : '<div class="ds-user-picker__selected-empty">暂无已选人员</div>'
                }
              </div>
            </div>
          </div>
          <div class="ds-user-picker__footer">
            <div class="ds-user-picker__footer-info">已选择 <strong>${selectedUsers.length}</strong> 人</div>
            <div class="ds-user-picker__footer-actions">
              <button class="ds-button ds-button--default" type="button" data-action="cancel">取消</button>
              <button class="ds-button ds-button--primary" type="button" data-action="confirm">确定</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderTrigger(root, state) {
    const selectedUsers = state.selectedIds.map(id => allUsers.find(u => u.id === id)).filter(Boolean);
    const hasValue = selectedUsers.length > 0;
    const disabled = root.classList.contains('is-disabled');

    root.classList.toggle('has-value', hasValue);

    const triggerHtml = `
      <button class="ds-user-picker__trigger" type="button" ${disabled ? 'disabled' : ''} aria-haspopup="dialog" aria-expanded="${root.classList.contains('is-open')}">
        ${hasValue
          ? `<span class="ds-user-picker__count">${selectedUsers.length}</span><span class="ds-user-picker__text">${selectedUsers.slice(0, 2).map(u => u.name).join('、')}${selectedUsers.length > 2 ? '...' : ''}</span>`
          : `<span class="ds-user-picker__placeholder">${root.dataset.placeholder || '请选择人员'}</span>`
        }
        ${hasValue && !disabled ? '<span class="ds-user-picker__clear" role="button" tabindex="-1" aria-label="清除"></span>' : ''}
        <span class="ds-user-picker__arrow" aria-hidden="true"></span>
      </button>
    `;

    if (root.classList.contains('is-open')) {
      root.innerHTML = triggerHtml + renderModal(state);
    } else {
      root.innerHTML = triggerHtml;
    }

    // 更新输出显示
    if (root.classList.contains('js-user-picker-live')) {
      const output = document.querySelector('.js-user-picker-output');
      if (output) {
        output.textContent = hasValue
          ? selectedUsers.map(u => `${u.name}(${u.jobNo})`).join('、')
          : '未选择';
      }
    }
  }

  function initUserPicker(root) {
    const state = {
      selectedIds: (root.dataset.value || '').split(',').filter(Boolean),
      activeOrgId: null,
      query: '',
      expandedNodes: []
    };

    renderTrigger(root, state);

    root.addEventListener('click', (e) => {
      if (root.classList.contains('is-disabled')) return;

      // 清除按钮
      if (e.target.closest('.ds-user-picker__clear')) {
        e.stopPropagation();
        state.selectedIds = [];
        renderTrigger(root, state);
        return;
      }

      // 触发器
      const trigger = e.target.closest('.ds-user-picker__trigger');
      if (trigger && !root.classList.contains('is-open')) {
        root.classList.add('is-open');
        renderTrigger(root, state);
        return;
      }

      // 关闭按钮
      if (e.target.closest('.ds-user-picker__close')) {
        root.classList.remove('is-open');
        renderTrigger(root, state);
        return;
      }

      // 取消按钮
      if (e.target.closest('[data-action="cancel"]')) {
        root.classList.remove('is-open');
        renderTrigger(root, state);
        return;
      }

      // 确定按钮
      if (e.target.closest('[data-action="confirm"]')) {
        root.classList.remove('is-open');
        renderTrigger(root, state);
        return;
      }

      // 清空按钮
      if (e.target.closest('[data-action="clear-all"]')) {
        state.selectedIds = [];
        renderTrigger(root, state);
        return;
      }

      // 全选/取消全选
      const toggleAllCheckbox = e.target.closest('[data-action="toggle-all"]');
      if (toggleAllCheckbox) {
        const filteredUsers = state.query
          ? allUsers.filter(u => u.name.includes(state.query) || u.jobNo.includes(state.query))
          : state.activeOrgId
            ? allUsers.filter(u => u.orgId === state.activeOrgId)
            : allUsers;

        const allSelected = filteredUsers.every(u => state.selectedIds.includes(u.id));
        if (allSelected) {
          state.selectedIds = state.selectedIds.filter(id => !filteredUsers.find(u => u.id === id));
        } else {
          filteredUsers.forEach(u => {
            if (!state.selectedIds.includes(u.id)) {
              state.selectedIds.push(u.id);
            }
          });
        }
        renderTrigger(root, state);
        return;
      }

      // 单行勾选
      const rowCheckbox = e.target.closest('.ds-user-picker__checkbox[data-user-id]');
      if (rowCheckbox) {
        const userId = rowCheckbox.dataset.userId;
        const index = state.selectedIds.indexOf(userId);
        if (index > -1) {
          state.selectedIds.splice(index, 1);
        } else {
          state.selectedIds.push(userId);
        }
        renderTrigger(root, state);
        return;
      }

      // 移除已选
      const removeBtn = e.target.closest('.ds-user-picker__selected-remove');
      if (removeBtn) {
        const item = removeBtn.closest('.ds-user-picker__selected-item');
        const userId = item.dataset.id;
        state.selectedIds = state.selectedIds.filter(id => id !== userId);
        renderTrigger(root, state);
        return;
      }

      // 树节点展开/收起
      const treeNode = e.target.closest('.ds-tree-node');
      if (treeNode) {
        const toggle = e.target.closest('.ds-tree-node__toggle');
        if (toggle && treeNode.querySelector('.ds-tree-node__children')) {
          treeNode.classList.toggle('is-expanded');
          return;
        }

        // 点击节点筛选
        const nodeId = treeNode.dataset.id;
        state.activeOrgId = nodeId;
        state.query = '';

        // 更新树节点选中状态
        root.querySelectorAll('.ds-tree-node').forEach(n => n.classList.remove('is-active'));
        treeNode.classList.add('is-active');

        renderTrigger(root, state);
      }
    });

    // 搜索输入
    root.addEventListener('input', (e) => {
      if (e.target.classList.contains('ds-user-picker__search-input')) {
        state.query = e.target.value;
        state.activeOrgId = null;
        root.querySelectorAll('.ds-tree-node').forEach(n => n.classList.remove('is-active'));
        renderTrigger(root, state);
      }
    });

    // ESC 关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && root.classList.contains('is-open')) {
        root.classList.remove('is-open');
        renderTrigger(root, state);
      }
    });
  }

  // 初始化所有选人组件
  document.querySelectorAll('.ds-user-picker').forEach(initUserPicker);

  // 点击外部关闭
  document.addEventListener('click', (e) => {
    document.querySelectorAll('.ds-user-picker.is-open').forEach((root) => {
      if (!root.contains(e.target)) {
        root.classList.remove('is-open');
        const trigger = root.querySelector('.ds-user-picker__trigger');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
        root.querySelector('.ds-user-picker__overlay')?.remove();
      }
    });
  });

  // 暴露全局初始化函数
  window.DSUserPicker = { init: initUserPicker };

  // 渲染静态弹窗预览（用于展示弹窗布局）
  function renderStaticModalPreview(container) {
    const state = {
      selectedIds: ['user-001', 'user-002'],
      activeOrgId: 'org-1-1',
      query: '',
      expandedNodes: ['org-1']
    };

    const filteredUsers = state.activeOrgId
      ? allUsers.filter(u => u.orgId === state.activeOrgId)
      : allUsers;

    const selectedUsers = state.selectedIds.map(id => allUsers.find(u => u.id === id)).filter(Boolean);

    container.innerHTML = `
      <div class="ds-user-picker__header">
        <h3>选择人员</h3>
        <button class="ds-user-picker__close" type="button" aria-label="关闭">×</button>
      </div>
      <div class="ds-user-picker__body">
        <div class="ds-user-picker__tree-panel">
          <div class="ds-user-picker__panel-head">
            <h4 class="ds-user-picker__panel-title">组织架构</h4>
          </div>
          <div class="ds-user-picker__tree">
            ${orgTree.map(node => `
              <div class="ds-tree-node ${node.id === 'org-1' ? 'is-expanded' : ''}" data-id="${node.id}">
                <span class="ds-tree-node__toggle">▶</span>
                <span class="ds-tree-node__label">${node.label}</span>
                <span class="ds-tree-node__count">(${node.count})</span>
                <div class="ds-tree-node__children">
                  ${node.children.map(child => `
                    <div class="ds-tree-node ${child.id === state.activeOrgId ? 'is-active' : ''}" data-id="${child.id}">
                      <span class="ds-tree-node__toggle" style="visibility:hidden">▶</span>
                      <span class="ds-tree-node__label">${child.label}</span>
                      <span class="ds-tree-node__count">(${child.count})</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="ds-user-picker__table-panel">
          <div class="ds-user-picker__search">
            <input class="ds-user-picker__search-input" type="text" placeholder="搜索姓名 / 工号" value="" />
          </div>
          <div class="ds-user-picker__table">
            <table>
              <thead>
                <tr>
                  <th style="width:40px">
                    <span class="ds-user-picker__checkbox is-indeterminate" data-action="toggle-all"></span>
                  </th>
                  <th>姓名</th>
                  <th>工号</th>
                  <th>部门</th>
                </tr>
              </thead>
              <tbody>
                ${filteredUsers.map(user => renderUserRow(user, state.selectedIds.includes(user.id))).join('')}
              </tbody>
            </table>
          </div>
        </div>
        <div class="ds-user-picker__selected-panel">
          <div class="ds-user-picker__panel-head">
            <h4 class="ds-user-picker__panel-title">已选人员</h4>
            <button class="ds-button ds-button--link" type="button" data-action="clear-all">清空</button>
          </div>
          <div class="ds-user-picker__selected-list">
            ${selectedUsers.map(user => renderSelectedItem(user)).join('')}
          </div>
        </div>
      </div>
      <div class="ds-user-picker__footer">
        <div class="ds-user-picker__footer-info">已选择 <strong>${selectedUsers.length}</strong> 人</div>
        <div class="ds-user-picker__footer-actions">
          <button class="ds-button ds-button--default" type="button">取消</button>
          <button class="ds-button ds-button--primary" type="button">确定</button>
        </div>
      </div>
    `;
  }

  // 初始化静态预览
  document.querySelectorAll('.js-user-picker-modal-preview').forEach(renderStaticModalPreview);
})();