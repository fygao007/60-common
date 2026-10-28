var ROLES = [
  { id: 'teacher', role: '专任教师（教学型/教学科研型）', shortRole: '专任教师', user: '金晓智 · 电子与通信工程学院 · 副教授', avatar: '金',
    menus: [
      { label: '档案袋首页', single: true, items: [
        { key: 't-home', label: '档案袋首页' } ] },
      { label: '教学档案管理', single: true, items: [
        { key: 't-overview', label: '教学档案管理' } ] },
      { label: '团队项目管理', single: true, items: [
        { key: 't-team-project', label: '团队项目管理' } ] },
      { label: '我的专业群', single: true, items: [
        { key: 't-major-group', label: '我的专业群' } ] },
      { label: '青蓝合作', single: true, items: [
        { key: 't-blue-coop', label: '青蓝合作' } ] },
      { label: '数据采集', single: true, items: [
        { key: 't-data', label: '数据采集' } ] }
    ] },
  { id: 'student', role: '学生', user: '王梓萌 · 电子信息工程技术 2024 级 · 电子信息专业群', avatar: '王',
    menus: [
      { label: '我的学习', items: [
        { key: 's-courses', label: '我的课程档案' },
        { key: 's-lessons', label: '每堂课记录' },
        { key: 's-cases', label: '问题解决案例库' } ] },
      { label: '我的专业群', items: [
        { key: 's-space', label: '专业群档案空间' } ] }
    ] },
  { id: 'major', role: '专业群带头人', user: '陈立群 · 电子信息专业群带头人 · 嵌入式团队负责人', avatar: '陈',
    menus: [
      { label: '教师教学画像', single: true, items: [
        { key: 'p-review', label: '教师教学画像' } ] },
      { label: '教学档案管理', single: true, items: [
        { key: 't-overview', label: '教学档案管理' } ] },
      { label: '数据采集', single: true, items: [
        { key: 'a-integration', label: '数据采集' } ] },
      { label: '专业群管理', single: true, items: [
        { key: 'p-major-group', label: '专业群管理' } ] }
    ] },
  { id: 'supervisor', role: '督导专家', user: '王慧敏 · 校教学督导委员会', avatar: '督',
    menus: [
      { label: '评阅台', items: [
        { key: 'd-tasks', label: '评阅任务台' },
        { key: 'd-review', label: '在线评阅' } ] }
    ] },
  { id: 'sys', role: '系统管理员', user: '系统管理员 · 信息中心', avatar: '管',
    menus: [
      { label: '专业群管理', single: true, items: [ { key: 'majorGroup', label: '专业群管理' } ] },
      { label: '数据采集', single: true, items: [ { key: 'dataCollection', label: '数据采集' } ] },
      { label: '档案字段设置', single: true, items: [ { key: 'formManagement', label: '档案字段设置' } ] }
    ] }
];
if (window.TeachingPortfolioFrame && window.TeachingPortfolioFrame.ROLES) {
  ROLES = window.TeachingPortfolioFrame.ROLES;
}

/* ═══════════════ 框架2 引擎集成 ═══════════════ */
/* 业务内容、菜单数据(ROLES)、业务闭包均不变；外壳由框架2公共预设渲染 */
var PORTFOLIO_PAGE = window.PORTFOLIO_V3_PAGE || {};
var CURRENT_ROLE = PORTFOLIO_PAGE.role || 'teacher';
var CURRENT_VIEW = PORTFOLIO_PAGE.view || firstViewForRole(CURRENT_ROLE);


function pageConfig() { return window.PORTFOLIO_V3_PAGE || {}; }
function roleById(roleId) { return ROLES.find(function (r) { return r.id === roleId; }) || ROLES[0]; }
function roleItems(role) { return role.menus.reduce(function (list, group) { return list.concat(group.items || []); }, []); }
function firstViewForRole(roleId) { var role = roleById(roleId); var first = roleItems(role)[0]; return first ? first.key : ''; }
function roleHasView(roleId, viewKey) { return roleItems(roleById(roleId)).some(function (item) { return item.key === viewKey; }); }
function labelForView(role, viewKey) { var hit = roleItems(role).find(function (item) { return item.key === viewKey; }); return hit ? hit.label : viewKey; }
function pageHref(roleId, viewKey) {
  if (window.TeachingPortfolioFrame) return window.TeachingPortfolioFrame.pageHref(roleId, viewKey);
  var cfg = pageConfig();
  var targetView = roleHasView(roleId, viewKey) ? viewKey : firstViewForRole(roleId);
  if (!targetView) return '';
  var sysModuleRoutes = {
    overview: 'majorGroup',
    permissions: 'majorGroup',
    majorGroup: 'majorGroup',
    majors: 'majorGroup',
    dataCollection: 'dataCollection',
    collections: 'dataCollection',
    formManagement: 'formManagement',
    fieldAuth: 'formManagement'
  };
  if (roleId === 'sys' && sysModuleRoutes[targetView]) {
    var sysBase = roleId === cfg.role
      ? '../' + 'sys-accounts/sys-accounts.html'
      : '../../' + 'sys/sys-accounts/sys-accounts.html';
    return sysBase + '#' + sysModuleRoutes[targetView];
  }
  if (roleId === cfg.role) return '../' + targetView + '/' + targetView + '.html';
  return '../../' + roleId + '/' + targetView + '/' + targetView + '.html';
}
function pageRoutes(role) {
  if (window.TeachingPortfolioFrame) return window.TeachingPortfolioFrame.pageRoutes(role);
  return roleItems(role).reduce(function (routes, item) {
    routes[item.key] = pageHref(role.id, item.key);
    return routes;
  }, {});
}
function navigateToFeature(key) {
  var href = pageHref(CURRENT_ROLE, key);
  if (href) window.location.href = href;
}

var GROUP_ICONS = {
  '工作台': 'home', '我的画像': 'home', '教师全景信息': 'archive', '教师教学画像': 'archive', '个人信息': 'home',
  '档案袋首页': 'home', '我的教学档案': 'prepare', '教学档案管理': 'prepare', '团队项目管理': 'exam', '青蓝合作': 'recommend', '数据采集': 'prepare',
  '特色档案': 'camp', '其他材料': 'prepare',
  '审核与开放': 'recommend', '目标与画像': 'exam',
  '我的学习': 'prepare', '我的专业群': 'camp',
  '校企档案': 'prepare', '我的贡献': 'exam',
  '教研室空间': 'home', '审核台': 'recommend', '目标管理': 'exam', '团队画像': 'exam', '画像': 'exam',
  '专业群': 'camp', '教学档案质量': 'recommend', '标准管理': 'recommend',
  '评阅台': 'recommend', '学院驾驶舱': 'home', '组织画像': 'exam', '指导意见': 'recommend',
  '评价标准': 'recommend', '数据治理': 'prepare', '统计分析': 'exam',
  '权限管理': 'recommend', '模板管理': 'prepare', '专业群管理': 'camp', '专业群设置': 'camp', '团队建设': 'exam', '系统设置': 'home', '运维': 'prepare',
  '数据采集发布': 'prepare', '数据采集': 'prepare', '字段权限设置': 'home', '档案字段设置': 'recommend'
};

function roleAppMenu(role) {
  if (window.TeachingPortfolioFrame) return window.TeachingPortfolioFrame.roleAppMenu(role);
  return role.menus.map(function (g) {
    if (g.single && g.items && g.items[0]) {
      return {
        key: g.items[0].key,
        label: g.label,
        icon: GROUP_ICONS[g.label] || 'home',
        href: pageHref(role.id, g.items[0].key)
      };
    }
    return {
      key: 'grp:' + g.label, label: g.label, icon: GROUP_ICONS[g.label] || 'home',
      children: g.items.map(function (it) { return { key: it.key, label: it.label, href: pageHref(role.id, it.key) }; })
    };
  });
}

function syncFrameworkRoleSwitch(roleId) {
  if (window.TeachingPortfolioFrame) {
    window.TeachingPortfolioFrame.syncFrameworkRoleSwitch(roleId);
    return;
  }
  var role = ROLES.find(function (r) { return r.id === roleId; }) || ROLES[0];
  var host = document.querySelector('.frame2-stage');
  var root = host && host.shadowRoot;
  if (!root) return;

  var roleLabel = role.shortRole || role.role;
  var current = root.querySelector('[data-current-role]');
  if (current) {
    current.textContent = roleLabel;
    current.title = role.role;
  }

  var menu = root.querySelector('.frame2-role-menu');
  if (!menu) return;
  menu.innerHTML = ROLES.map(function (r) {
    var label = r.shortRole || r.role;
    return '<button class="' + (r.id === roleId ? 'is-active' : '') + '" type="button" role="menuitem" data-portfolio-role="' + r.id + '">' + label + '</button>';
  }).join('');
  menu.querySelectorAll('[data-portfolio-role]').forEach(function (btn) {
    btn.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      var nextRole = btn.getAttribute('data-portfolio-role');
      var next = ROLES.find(function (r) { return r.id === nextRole; });
      switchRole(nextRole);
      toast('已切换至「' + ((next && (next.shortRole || next.role)) || nextRole) + '」业务视角', 'ok');
    }, true);
  });
}

function showView(key) {
  var target = document.querySelector('.pf-view[data-view="' + key + '"]');
  if (!target) { navigateToFeature(key); return; }
  CURRENT_VIEW = key;
  document.querySelectorAll('.pf-view').forEach(function (v) {
    v.classList.toggle('is-visible', v.dataset.view === key);
  });
  if (key === 's-lessons' && typeof renderStuFeed === 'function') renderStuFeed(STU_FILTER);
  try {
    var host = document.querySelector('.frame2-stage');
    var ws = host && host.shadowRoot && host.shadowRoot.querySelector('.frame2-content');
    if (ws) ws.scrollTop = 0;
  } catch (e) {}
}

function mountForRole(roleId) {
  var role = roleById(roleId);
  CURRENT_ROLE = role.id;
  // 部分保留页面（如数据采集）不在统一顶部菜单中，但仍有独立入口。
  // 页面自身存在对应视图时应保持当前页，避免被错误重定向到默认菜单。
  var hasCurrentView = !!document.querySelector('.pf-view[data-view="' + CURRENT_VIEW + '"]');
  var activeKey = roleHasView(role.id, CURRENT_VIEW) || hasCurrentView ? CURRENT_VIEW : firstViewForRole(role.id);
  var activeLabel = labelForView(role, activeKey);
  WiseFramework2.mount({
    root: '.frame2-stage',
    versionLabel: '深圳职业技术大学 · 产品原型 V3.0',
    userName: role.user,
    roleName: '教职工',
    activeApp: 'teaching-portfolio',
    pinHomeTab: false,
    workspaceVariant: 'canvas',
    appMenus: { 'teaching-portfolio': roleAppMenu(role) },
    featureRoutes: pageRoutes(role),
    activeFeature: activeKey,
    tabs: [
      { key: 'home', label: '首页', href: pageHref(role.id, firstViewForRole(role.id)), wiseIcon: 'homeOutline', closable: false },
      { key: activeKey, label: activeLabel, href: pageHref(role.id, activeKey), closable: true }
    ],
    onFeatureChange: function (key) { showView(key); }
  });
  syncFrameworkRoleSwitch(role.id);
  showView(activeKey);
}

/* 兼容既有业务代码：switchRole 仍可用；拆分后跨角色切换会进入对应角色的菜单文件 */
function switchRole(roleId, viewKey) {
  var targetView = viewKey || (roleHasView(roleId, CURRENT_VIEW) ? CURRENT_VIEW : firstViewForRole(roleId));
  window.location.href = pageHref(roleId, targetView);
}

/* ═══════════════ 交互层：通用组件 ═══════════════ */
var toastWrap = document.createElement('div');
toastWrap.className = 'pf-toast-wrap';
document.body.appendChild(toastWrap);

function toast(msg, type, ms) {
  var t = document.createElement('div');
  t.className = 'pf-toast' + (type ? ' ' + type : '');
  t.textContent = msg;
  toastWrap.appendChild(t);
  requestAnimationFrame(function () { t.classList.add('show'); });
  setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.remove(); }, 300); }, ms || 2400);
}

var modalMask = document.createElement('div');
modalMask.className = 'pf-modal-mask';
modalMask.innerHTML = '<div class="pf-modal"><div class="pf-modal-head"><h3></h3><button class="x" type="button">×</button></div><div class="pf-modal-body"></div><div class="pf-modal-foot"><button class="ap-btn" type="button" data-md="cancel">关闭</button><button class="ap-btn primary" type="button" data-md="ok">确定</button></div></div>';
document.body.appendChild(modalMask);
var modalOk = null;
function modal(title, html, opts) {
  opts = opts || {};
  modalMask.querySelector('h3').textContent = title;
  modalMask.querySelector('.pf-modal-body').innerHTML = html;
  modalMask.querySelector('[data-md="ok"]').style.display = opts.onOk ? '' : 'none';
  modalMask.querySelector('[data-md="ok"]').textContent = opts.okText || '确定';
  modalOk = opts.onOk || null;
  modalMask.classList.add('show');
}
function closeModal() { modalMask.classList.remove('show'); modalOk = null; }
modalMask.addEventListener('click', function (e) {
  if (e.target === modalMask || e.target.closest('.x') || e.target.closest('[data-md="cancel"]')) closeModal();
  if (e.target.closest('[data-md="ok"]')) { var fn = modalOk; closeModal(); if (fn) fn(); }
});
function docPreview(name) {
  var ext = (name.match(/\.(\w+)$/) || [0, 'pdf'])[1].toUpperCase();
  modal('材料预览', '<div class="pf-doc-frame"><span class="ext">' + ext + '</span><span>' + name + '</span><span>（演示原型 · 在线预览占位）</span></div><div class="meta"><b>归档编号</b><span>DA-2026-' + Math.floor(1000 + Math.random() * 9000) + '</span><b>完整性校验</b><span>SHA-256 通过 · 版本留痕</span><b>水印</b><span>预览自动加注「仅限校内评审」水印</span></div>');
}

/* ═══════════════ 工具 ═══════════════ */
function V(key) { return document.querySelector('.pf-view[data-view="' + key + '"]'); }
function btnIn(view, text) {
  var list = V(view).querySelectorAll('button');
  for (var i = 0; i < list.length; i++) if (list[i].textContent.indexOf(text) > -1) return list[i];
  return null;
}
function findRowByText(view, txt) {
  var rs = V(view).querySelectorAll('tbody tr');
  for (var i = 0; i < rs.length; i++) if (rs[i].textContent.indexOf(txt) > -1) return rs[i];
  return null;
}
function flash(el) { if (el) { el.classList.remove('pf-row-flash'); void el.offsetWidth; el.classList.add('pf-row-flash'); } }
function fieldVal(view, labelText) {
  var fs = V(view).querySelectorAll('.ap-field');
  for (var i = 0; i < fs.length; i++) {
    if (fs[i].querySelector('label') && fs[i].querySelector('label').textContent.indexOf(labelText) > -1) {
      var c = fs[i].querySelector('input,select,textarea');
      return c ? c.value : '';
    }
  }
  return '';
}
function clearField(view, labelText) {
  var fs = V(view).querySelectorAll('.ap-field');
  for (var i = 0; i < fs.length; i++) {
    if (fs[i].querySelector('label') && fs[i].querySelector('label').textContent.indexOf(labelText) > -1) {
      var c = fs[i].querySelector('input,textarea');
      if (c) c.value = '';
    }
  }
}
var TODAY = '2026-06-12';

/* —— 学生「每堂课记录」· 随手记时间轴数据 —— */
var STU_NOTES = [
  { date: '2026-06-10', time: '14:20', course: '数字电路与逻辑设计', lesson: '第6次 · 触发器', type: '疑问', text: '译码器做存储器地址译码时，地址空间到底怎么分配？下次课问李静老师。', files: ['地址译码草图.png'] },
  { date: '2026-06-09', time: '21:05', course: 'C 语言程序设计', lesson: '第10次 · 指针进阶', type: '思考逻辑', text: '指针的本质是「地址」，把变量想成带门牌号的房间。想改原值，就得把门牌号交给函数——和单片机里读寄存器地址是一个道理，迁移过来很顺。' },
  { date: '2026-06-08', time: '10:30', course: '单片机应用技术', lesson: '第12次 · 串口通信', type: '收获', text: '串口终于调通了。波特率不匹配就乱码，本质是收发双方的采样节奏对不上——时序意识又加深一层。', files: ['串口调试记录.docx', '示波器波形.jpg'] },
  { date: '2026-06-04', time: '15:40', course: '数字电路与逻辑设计', lesson: '第5次 · 译码器', type: '思考逻辑', text: '译码器 = 把二进制编号翻译成一条独热输出。使能端就像单片机的片选 CS，用已知概念理解新概念，一下就通。' },
  { date: '2026-06-02', time: '19:15', course: '模拟电子技术', lesson: '第11次 · 负反馈', type: '笔记', text: '负反馈四种组态：电压串联、电压并联、电流串联、电流并联。判断口诀：看取样（电压/电流）+ 看比较（串联/并联）。' },
  { date: '2026-05-30', time: '11:00', course: '大学英语（四）', lesson: '第2次 · 听力', type: '思考逻辑', text: '听力跟不上，是因为我总想逐词翻译；其实该抓 signpost words 先定位结构——和读电路图先看整体框图再看局部一样，自顶向下。' },
  { date: '2026-05-28', time: '16:20', course: '数字电路与逻辑设计', lesson: '第5次 · 译码器', type: '疑问', text: '组合逻辑的竞争冒险怎么消除？是加滤波，还是改逻辑设计避免毛刺？' },
  { date: '2026-05-27', time: '20:30', course: '单片机应用技术', lesson: '第11次 · PWM', type: '思考逻辑', text: 'PWM 本质是用占空比等效平均电压，频率要远高于电机机械响应否则会抖——和智能车 PID 调速一套原理。疑问：硬件 PWM 为什么比软件翻转 IO 更稳？已记入问题案例。' },
  { date: '2026-05-26', time: '14:10', course: '模拟电子技术', lesson: '第10次 · 共射放大', type: '思考逻辑', text: '静态工作点 Q 设在交流负载线中点，输出摆幅最大、最不失真——像荡秋千要从中间高度起荡才荡得开。' },
  { date: '2026-05-25', time: '09:50', course: 'C 语言程序设计', lesson: '第9次 · 递归', type: '收获', text: '写阶乘忘了 n==0 返回 1，直接栈溢出。终于真懂了：递归 = 自己调用自己 + 终止条件，缺一不可。' },
  { date: '2026-05-23', time: '10:15', course: '大学英语（四）', lesson: '第1次 · 词汇', type: '笔记', text: '整理 50 个学术高频词：significant / demonstrate / hypothesis / consequently… 考试和写作都用得上。' },
  { date: '2026-05-20', time: '15:30', course: '单片机应用技术', lesson: '第10次 · 定时器', type: '笔记', text: '定时器中断三步：配预分频与自动重载、开中断、在中断里清标志位。比 delay 好，不阻塞 CPU。' }
];
var STU_FILTER = '全部';
var STU_PENDING_FILES = [];   /* 记录区已暂存待提交的文件名 */
var STU_EDIT_INDEX = null;    /* 正在编辑的记录索引，null 表示新增 */
function noteTypeClass(t) { return t === '思考逻辑' ? 'think' : t === '疑问' ? 'ask' : t === '收获' ? 'gain' : 'note'; }
function fileTag(name) {
  return '<span class="sl-tag lesson"><span data-wise-icon="paperclip" style="display:inline-flex;width:12px;height:12px;vertical-align:-1px;margin-right:3px"></span>' + name + '</span>';
}
/* 渲染记录区暂存文件 chips */
function renderStuPending() {
  var box = document.getElementById('slCapFiles'); if (!box) return;
  box.innerHTML = STU_PENDING_FILES.map(function (name, i) {
    return '<span class="sl-file-chip"><span data-wise-icon="paperclip" style="display:inline-flex;width:12px;height:12px;vertical-align:-1px"></span>' + name + '<i class="x" data-stu-file-remove="' + i + '">×</i></span>';
  }).join('');
  if (window.WiseIconRegistry) window.WiseIconRegistry.renderIcons(box);
}
function renderStuFeed(filter) {
  STU_FILTER = filter || STU_FILTER || '全部';
  var feed = document.getElementById('slFeed'); if (!feed) return;
  var chips = document.getElementById('slChips');
  if (chips) chips.querySelectorAll('.tp-chip').forEach(function (ch) { ch.classList.toggle('on', ch.textContent.trim() === STU_FILTER); });
  var list = STU_NOTES.filter(function (n) { return STU_FILTER === '全部' || n.course === STU_FILTER; });
  var cnt = document.getElementById('slCount'); if (cnt) cnt.textContent = list.length;
  if (!list.length) { feed.innerHTML = '<p style="color:var(--ap-muted);padding:14px">这门课还没有记录，在上方随手写下第一条课堂思考吧。</p>'; return; }
  feed.innerHTML = list.map(function (n) {
    var idx = STU_NOTES.indexOf(n);
    var filesHtml = (n.files && n.files.length)
      ? '<div class="sl-meta" style="margin-top:7px">' + n.files.map(fileTag).join('') + '</div>'
      : '';
    return '<div class="sl-tl-item"><div class="sl-rail"><span class="sl-dot"></span></div>'
      + '<div class="sl-card"><div class="sl-meta"><span class="sl-time">' + n.date + ' ' + n.time + '</span>'
      + '<span class="sl-tag course">#' + n.course + '</span>'
      + (n.lesson ? '<span class="sl-tag lesson">' + n.lesson + '</span>' : '')
      + '<span class="sl-tag ty-' + noteTypeClass(n.type) + '">#' + n.type + '</span></div>'
      + '<div class="sl-body">' + n.text + '</div>'
      + filesHtml
      + '<div class="sl-acts"><span class="link" data-stu-edit="' + idx + '">编辑</span><span class="link" data-stu-delete="' + idx + '">删除</span></div></div></div>';
  }).join('');
  if (window.WiseIconRegistry) window.WiseIconRegistry.renderIcons(feed);
}
function addStuNote() {
  var ta = document.getElementById('slCapText'); if (!ta) return;
  var txt = (ta.value || '').trim();
  if (!txt) { toast('写点什么再记录吧', 'warn'); return; }
  var course = document.getElementById('slCapCourse').value;
  var type = document.getElementById('slCapType').value;
  var files = STU_PENDING_FILES.slice();
  if (STU_EDIT_INDEX !== null && STU_NOTES[STU_EDIT_INDEX]) {
    /* 编辑：原地更新，保留原时间 */
    var old = STU_NOTES[STU_EDIT_INDEX];
    old.course = course; old.type = type; old.text = txt; old.files = files;
    STU_EDIT_INDEX = null;
  } else {
    STU_NOTES.unshift({ date: TODAY, time: '刚刚', course: course, lesson: '', type: type, text: txt, files: files });
  }
  ta.value = '';
  STU_PENDING_FILES = [];
  renderStuPending();
  if (STU_FILTER !== '全部' && STU_FILTER !== course) STU_FILTER = course;
  renderStuFeed(STU_FILTER);
  if (feedEl()) flash(feedEl().firstChild);
  toast('已记录到《' + course + '》时间轴', 'ok');
}
/* 编辑：弹窗编辑，字段与顶部记录区一致 */
var EM_FILES = [];
function emOptions(selectId, current) {
  var src = document.getElementById(selectId);
  if (!src) return '<option>' + archiveEsc(current || '') + '</option>';
  return Array.prototype.map.call(src.options, function (o) {
    return '<option' + (o.textContent === current ? ' selected' : '') + '>' + o.textContent + '</option>';
  }).join('');
}
function renderEmFiles() {
  var box = document.getElementById('emCapFiles'); if (!box) return;
  box.innerHTML = EM_FILES.map(function (name, i) {
    return '<span class="sl-file-chip"><span data-wise-icon="paperclip" style="display:inline-flex;width:12px;height:12px;vertical-align:-1px"></span>' + name + '<i class="x" data-em-file-remove="' + i + '">×</i></span>';
  }).join('');
  if (window.WiseIconRegistry) window.WiseIconRegistry.renderIcons(box);
}
function editStuNote(idx) {
  var n = STU_NOTES[idx]; if (!n) return;
  EM_FILES = (n.files || []).slice();
  var html = '<div class="sl-cap sl-cap--modal">'
    + '<textarea id="emCapText" placeholder="此刻的课堂思考、疑问或灵感…">' + archiveEsc(n.text || '') + '</textarea>'
    + '<div class="sl-cap-files" id="emCapFiles"></div>'
    + '<div class="sl-cap-bar"><div class="sl-cap-fields">'
    + '<select id="emCapCourse" class="tp-inline-select">' + emOptions('slCapCourse', n.course) + '</select>'
    + '<select id="emCapType" class="tp-inline-select">' + emOptions('slCapType', n.type) + '</select>'
    + '<button class="ap-btn" type="button" id="emCapUpload">上传文件</button>'
    + '<input type="file" id="emCapFile" multiple style="display:none" />'
    + '</div></div></div>';
  modal('编辑记录', html, {
    okText: '保存',
    onOk: function () {
      var ta = document.getElementById('emCapText');
      var txt = ta ? (ta.value || '').trim() : '';
      var note = STU_NOTES[idx]; if (!note) return;
      if (!txt) { toast('写点什么再保存吧', 'warn'); return; }
      note.text = txt;
      note.course = document.getElementById('emCapCourse').value;
      note.type = document.getElementById('emCapType').value;
      note.files = EM_FILES.slice();
      renderStuFeed(STU_FILTER);
      toast('已保存修改', 'ok');
    }
  });
  renderEmFiles();
  /* 弹窗内交互：全局点击委托会跳过 .pf-modal，需就地绑定 */
  var upBtn = document.getElementById('emCapUpload');
  var fileInput = document.getElementById('emCapFile');
  if (upBtn && fileInput) {
    upBtn.addEventListener('click', function () { fileInput.click(); });
    fileInput.addEventListener('change', function () {
      Array.prototype.forEach.call(fileInput.files, function (f) { EM_FILES.push(f.name); });
      fileInput.value = '';
      renderEmFiles();
    });
  }
  var filesBox = document.getElementById('emCapFiles');
  if (filesBox) {
    filesBox.addEventListener('click', function (e) {
      var rm = e.target.closest('[data-em-file-remove]');
      if (rm) { EM_FILES.splice(parseInt(rm.dataset.emFileRemove, 10), 1); renderEmFiles(); }
    });
  }
}
/* 删除：二次确认后从时间轴移除 */
function deleteStuNote(idx) {
  var n = STU_NOTES[idx]; if (!n) return;
  modal('删除记录', '<p style="line-height:1.7">确定删除这条「' + n.course + '」的课堂记录吗？删除后不可恢复。</p>', {
    okText: '删除',
    onOk: function () {
      STU_NOTES.splice(idx, 1);
      STU_EDIT_INDEX = null;
      renderStuFeed(STU_FILTER);
      toast('已删除该记录', 'ok');
    }
  });
}
function feedEl() { return document.getElementById('slFeed'); }

/* ═══════════════ 我的教学档案：二级 / 三级目录 + 字段详情 ═══════════════ */
function F(name, src){ return src ? { name: name, src: src } : { name: name }; }
var SRC_LABEL = { 人事:'人事系统', 教务:'教务系统', 督导:'督导系统', 质保:'质保系统', 科研:'科研系统', 就业:'就业系统', 系统:'系统计算', 附件:'附件上传', 手填:'教学档案袋维护', 人事系统:'人事系统', 教务系统:'教务系统', 科研系统:'科研系统', 研究生系统:'研究生系统', 教学档案袋维护:'教学档案袋维护' };
function fieldEditable(field){ return !field.src || field.src === '附件' || field.src === '教学档案袋维护' || field.src === '手填'; }
function archiveSourceText(item) {
  var srcs = item && item.sourceSystems ? item.sourceSystems : [];
  if (!srcs.length && item && item.fields) {
    item.fields.forEach(function (field) {
      var src = field.src || '教学档案袋维护';
      if (srcs.indexOf(src) === -1) srcs.push(src);
    });
  }
  return srcs.map(function (src) { return SRC_LABEL[src] || src; }).join(' / ');
}
function fallbackValue(name){
  if (/附件/.test(name)) return '已上传 1 个';
  if (/起止/.test(name)) return '2025-03 ~ 2025-08';
  if (/(日期|时间)/.test(name)) return '2025-11-08';
  if (/级别/.test(name)) return '省级';
  if (/(等级|等次|奖等|序列)/.test(name)) return '一等奖';
  if (/(排名|排序)/.test(name)) return '1/5';
  if (/(人数|人次)/.test(name)) return '5';
  if (/经费/.test(name)) return '8 万元';
  if (/工作量/.test(name)) return '120 学时';
  if (/(职工号|工号)/.test(name)) return '2009056';
  if (/电话/.test(name)) return '138****6021';
  if (/是否线上/.test(name)) return '线下';
  if (/(状态|情况)/.test(name)) return '已完成';
  if (/企业/.test(name) && /名称/.test(name)) return '联科精密电子（深圳）有限公司';
  if (/地址/.test(name)) return '深圳市坪山区';
  if (/联系人/.test(name)) return '李工';
  if (/(单位|出版社|机构|颁奖|来源)/.test(name)) return '深圳职业技术大学';
  if (/字数/.test(name)) return '3.2 万字';
  if (/(主\/参编|参编)/.test(name)) return '主编';
  if (/(类型|类别|形式)/.test(name)) return '教学改革';
  if (/(专业|学科)/.test(name)) return '应用电子技术';
  if (/(依托课程|课程体系|课程名称)/.test(name)) return '嵌入式系统开发';
  if (/编号/.test(name)) return 'JX2025-018';
  if (/(角色|身份)/.test(name)) return '负责人';
  if (/层次/.test(name)) return '高职专科';
  if (/年份/.test(name)) return '2025';
  if (/(关键词|主题)/.test(name)) return '岗课赛证、项目化教学';
  return '—';
}

/* mode：single=单条「直接展示」字段；list=多条「表格展示」字段 */
function archiveFields(src, names) {
  var defaultSrc = src || '教学档案袋维护';
  if (Array.isArray(names)) {
    return names.filter(Boolean).map(function (item) {
      if (typeof item === 'object') return { name: item.name, src: item.src || defaultSrc };
      return { name: item, src: defaultSrc };
    });
  }
  return String(names || '').split('|').filter(Boolean).map(function (name) {
    return { name: name, src: defaultSrc };
  });
}
function archiveItem(id, label, sourceSystems, fields) {
  var srcs = Array.isArray(sourceSystems) ? sourceSystems : [sourceSystems || '教学档案袋维护'];
  return {
    id: id,
    label: label,
    sourceSystems: srcs,
    fields: archiveFields(srcs[0], fields),
    sampleTitle: label,
    sampleSummary: '按档案框架展示字段信息。',
    defaultStatus: '已归档'
  };
}
var ARCHIVE_TREE = [
  { id:"archive-basic", label:"教师基本信息", mode:'single', items:[
    archiveItem("basic-profile","基本信息","人事系统",["姓名", "工号", "性别", "年龄", "出生年月", "民族", "政治面貌", "所属学院", "所属专业", "入职时间", "岗位类型", "教师类别（专任/兼职/企业导师）", "办公信息", "联系方式"]),
    archiveItem("basic-domain","基本信息 / 专业领域","教学档案袋维护",["专业领域"]),
    archiveItem("basic-specialty","基本信息 / 专业特长","教学档案袋维护",["专业特长"]),
    archiveItem("basic-growth","基本信息 / 个人成长规划","教学档案袋维护",["个人成长规划"]),
    archiveItem("basic-education","学历信息","人事系统",["最高学历", "学位类型", "毕业院校", "毕业专业", "在读经历", "海外学习经历", "学历认证材料", "学术背景说明"]),
    archiveItem("basic-title","职称信息","人事系统",["当前职称", "职称等级", "评审时间", "评审单位"]),
    archiveItem("basic-teacher-cert","资格证书信息 / 高等学校教师资格证书","人事系统",["教师资格证种类（默认高等学校教师资格证）", "任教学科", "发证日期", "发证单位", "证书编号", "备注", "附件"]),
    archiveItem("basic-dual","资格证书信息 / 双师型教师认定","人事系统",["认定专业大类", "认定专业", "双师等级", "认定中心", "认定年份", "认定通过时间", "发证时间", "发证单位", "证书编号", "有效期", "备注", "附件"]),
    archiveItem("basic-skill-cert","资格证书信息 / 技能等级证书","人事系统",["证书名称", "工种名称", "技术等级", "取得途径", "取得时间", "发证时间", "发证单位", "证书编号", "备注", "附件"]),
    archiveItem("basic-industry-cert","资格证书信息 / 行业资质证书","人事系统",["行业资质名称", "行业类别", "证书等级", "发证单位", "取得时间", "证书编号", "是否注册类证书", "注册类证书有效期", "当前状态", "附件"]),
    archiveItem("basic-vocation-cert","资格证书信息 / 职业资格证书","人事系统",["资格证名称", "职业类别", "资格等级", "发证机构（人社部/行业机构）", "证书编号", "取得时间", "注册状态（是否注册）", "注册有效期", "继续教育记录", "附件", "当前状态"]),
    archiveItem("basic-skill","技能证书","人事系统",["称号名称", "称号类型", "认定标准", "认定机构", "认定时间", "有效期", "对应能力维度", "关联课程/岗位", "附件"]),
    archiveItem("basic-ethics","师德师风承诺书","人事系统",["师德师风承诺书"])
  ]},
  { id:"archive-teaching", label:"教育教学信息", mode:'single', items:[
    archiveItem("teaching-idea","教育初心及育人理念","教学档案袋维护",["教育初心", "育人理念"]),
    archiveItem("teaching-semester","学期授课","教务系统",["课程名称"])
  ]},
  { id:"archive-enterprise", label:"企业实践信息", mode:'single', items:[
    archiveItem("enterprise-practice","企业实践","人事系统",["企业名称", "企业统一信用代码", "所属行业", "实践开始日期", "时间结束日期", "实践内容", "实践成果", "教学转化", "备注", "附件"])
  ]},
  { id:"archive-achievement", label:"成果与荣誉", mode:'single', items:[
    archiveItem("achievement-teaching-research","教研业绩","教务系统",["项目名称", "开始时间", "结束时间", "项目类型", "学科领域", "经费额", "委托单位", "本人角色", "总人数", "本人排名"]),
    archiveItem("research-project","科研业绩 / 科研项目","科研系统",["项目名称", "项目类别", "立项日期", "项目级别", "项目状态", "立项时间", "项目来源", "合同编号", "合同经费", "配套经费", "结项日期", "科研大类", "项目分类", "角色", "完成单位排名", "实际支出金额", "到账经费", "成员人数", "学科领域", "项目批准号", "项目委托单位", "项目类型", "本人排名", "备注", "附件"]),
    archiveItem("research-paper","科研业绩 / 论文","科研系统",["科研大类", "论文名称", "关键字", "成果来源", "发表日期", "字数", "刊物名称", "刊物级别", "ISSN", "影响因子", "SCI学科IF排名", "学校排名", "会议举办单位", "会议名称", "会议地点", "会议级别", "会议开始日期", "会议结束日期", "ISSN/ISBN", "排名", "是否通讯作者", "收录说明", "论文类型", "成员人数", "本人排名", "获奖级别", "是否发表", "卷号", "学科领域", "本人角色", "备注", "附件"]),
    archiveItem("research-patent","科研业绩 / 专利","科研系统",["专利编号", "科研成果类型", "专利名称", "专利类型", "专利状态", "申请人", "申请日期", "专利权人", "是否本校专利", "专利简介", "国家地区", "专利有效期", "备注", "附件"]),
    archiveItem("research-book","科研业绩 / 著作","科研系统",["著作名称", "著作英文名称", "出版社名称", "出版社级别", "出版社所在国家地区", "出版日期", "ISBN号", "字数", "类别", "版次", "学校属名", "第一作者", "著作简介", "一级学科", "学科门类", "成果所属单位", "备注", "附件"]),
    archiveItem("research-award","科研业绩 / 成果获奖","科研系统",["获奖成果名称", "奖励名称", "类型", "获奖级别", "成果获奖等级", "奖励文号", "获奖日期", "获奖金额", "颁奖单位", "一级学科", "学科门类", "成果形式", "单位排名", "所属单位", "备注", "附件"]),
    archiveItem("achievement-course","课程建设成果","教务系统",["精品课程信息", "课程名称", "课程代码", "所属专业", "所属学院", "课程负责人", "参与人员", "建设起止时间", "当前状态"]),
    archiveItem("achievement-textbook","教材建设成果","教务系统",["教材名称", "教材编号", "教材来源", "教材类别", "出版时间", "出版机构", "章节字数", "主/参编", "附件"]),
    archiveItem("achievement-teacher-contest","教师比赛获奖","教务系统",["比赛名称", "获奖时间", "奖等序列", "本人排名"]),
    archiveItem("achievement-student-contest","指导学生参赛获奖","教务系统",["奖项名称", "级别", "等级", "获奖日期", "颁奖单位", "指导学生", "所属单位", "单位排名", "附件"]),
    archiveItem("achievement-other","其他业绩成果","教学档案袋维护",["成果名称", "取得时间", "等级", "本人排名", "备注", "附件"]),
    archiveItem("achievement-honor","其他荣誉与奖励","教学档案袋维护",["内容", "附件"])
  ]},
  { id:"archive-training", label:"进修（访学）培训", mode:'single', items:[
    archiveItem("training-record","培训记录","教务系统",["培训年度", "开始时间", "结束时间", "学时", "培训名称", "培训级别", "培训方式", "培训国家", "培训地点", "培训学时", "组织单位", "附件"]),
    archiveItem("training-study","进修记录","人事系统",["进修单位", "进修专业", "进修类型", "进修形式", "培训类型", "开始时间", "结束时间", "总费用", "进修理由", "备注", "进修性质", "学习方式", "培训学时"]),
    archiveItem("training-visit","访学情况","人事系统",["开始日期", "结束日期", "国家地区", "访学机构", "项目名称", "组织单位"]),
    archiveItem("training-degree","攻读学位情况","人事系统",["毕业院校", "所学专业", "学制", "学习形式", "教育类别", "是否师范生", "学历", "学位", "学科门类", "入学日期", "毕业日期", "学位授予日期", "学位授予单位", "学历授予国家", "学位授予国家", "备注", "附件"])
  ]},
  { id:"archive-service", label:"社会服务与影响力", mode:'single', items:[
    archiveItem("service-transfer","科技成果转化","科研系统",["成果名称", "成果所属单位", "合同编号", "合同名称", "转化方式", "受让单位", "合同金额", "签约日期"]),
    archiveItem("service-school-enterprise","校企合作（产教融合）","教务系统",["项目名称", "合作类型", "合作级别", "状态", "合作开始日期", "合作结束如期"]),
    archiveItem("service-academic-role","重要学术任职情况","教务系统",["任职机构名称", "任职类型", "任职级别", "任职职务", "任职开始时间", "任职结束时间", "备注", "附件"]),
    archiveItem("service-expert-pool","入选专家库情况","人事系统",["专家库名称", "领域", "级别", "时间", "审批单位", "专家编号", "参与评审次数", "附件"]),
    archiveItem("service-part-time","企业兼职情况","人事系统",["企业名称", "兼职岗位", "类型", "所属行业", "兼职开始时间", "兼职结束时间", "兼职内容"]),
    archiveItem("service-lecture","对外培训、讲座情况","人事系统",["活动名称", "类型", "主办单位", "地点", "对象人群", "时间", "时长", "参与人数", "备注", "附件"]),
    archiveItem("service-judge","担任大赛裁判情况","人事系统",["赛事名称", "赛事级别", "担任角色", "主办单位", "时间", "地点", "参赛规模", "备注", "附件"]),
    archiveItem("service-other","其他社会服务","人事系统",["服务名称", "服务类型", "服务单位", "时间", "内容", "影响范围", "备注", "附件"])
  ]},
  { id:"archive-position", label:"任职情况", mode:'single', items:[
    archiveItem("position-class-adviser","担任班主任情况","教务系统",["班级名称", "学生人数", "担任开始时间", "担任结束时间", "工作职责", "备注"]),
    archiveItem("position-graduate-mentor","担任研究生导师情况","研究生系统",["导师类型", "所属学科", "研究生人数", "任职开始时间", "任职结束时间"]),
    archiveItem("position-new-teacher","指导新教师情况","人事系统",["新教师名称", "指导周期", "指导内容", "指导开始时间", "指导结束时间", "新教师考核结果", "所属学院", "备注", "附件"])
  ]},
  { id:"archive-other-education", label:"其他教育工作", mode:'single', items:[
    archiveItem("other-second-class","第二课堂教学","教务系统",["活动名称", "类型", "学生群体", "学时", "时间", "人数", "成果", "备注", "附件"]),
    archiveItem("other-graduation-design","毕业设计指导","教务系统",["学生名称", "学生人数", "课题名称", "课题编号", "指导类型", "指导开始时间", "指导结束时间", "成果形式", "成绩"]),
    archiveItem("other-teaching-work","其他教育教学工作","教务系统",["工作名称", "类型", "工作内容", "时间", "参与人员", "成果", "备注", "附件"]),
    archiveItem("other-international","国际化交流情况","教务系统",["交流项目名称", "国家/地区", "交流类型", "交流开始时间", "交流结束时间", "组织单位", "成果或影响", "备注", "附件"]),
    archiveItem("other-team","参与团队情况","人事系统",["团队名称", "团队类型", "角色", "参与开始时间", "参与结束时间", "团队成果", "所属单位"]),
    archiveItem("other-feature","其他特色工作","人事系统",["工作名称", "工作开始时间", "工作结束时间", "主要内容", "影响或成果", "备注", "附件"])
  ]},
  { id:"archive-electronic-cert", label:"电子证件", mode:'single', items:[
    archiveItem("electronic-cert","电子证件","教学档案袋维护",["教师资格证", "职称证书", "学历证书等"])
  ]}
];
var ARCHIVE_LOOKUP = {};
var ARCHIVE_STATE = { leafId: 'basic-profile', filter: '', selectedRecordIds: {}, collapsedTree: {} };

function archiveRecordSeed(leaf) {
  var values = {};
  for (var i = 0; i < leaf.fields.length; i++) {
    var nm = leaf.fields[i].name;
    values[nm] = (leaf.samples && leaf.samples[nm] != null) ? leaf.samples[nm] : fallbackValue(nm);
  }
  return {
    id: leaf.id + '-seed',
    title: leaf.sampleTitle || leaf.label,
    summary: leaf.sampleSummary || leaf.desc,
    status: leaf.defaultStatus || '已归档',
    updated: '2026-06-10',
    values: values
  };
}
function initArchiveCatalog() {
  ARCHIVE_TREE.forEach(function (group) {
    group.items.forEach(function (leaf) {
      leaf.groupId = group.id;
      leaf.groupLabel = group.label;
      leaf.mode = group.mode;
      if (!leaf.records || !leaf.records.length) leaf.records = [archiveRecordSeed(leaf)];
      ARCHIVE_LOOKUP[leaf.id] = leaf;
      if (!ARCHIVE_STATE.selectedRecordIds[leaf.id] && leaf.records[0]) ARCHIVE_STATE.selectedRecordIds[leaf.id] = leaf.records[0].id;
    });
  });
}
function archiveStatusTag(status) {
  var cls = status.indexOf('缺') > -1 || status.indexOf('待') > -1 ? 'orange' : (status.indexOf('启用') > -1 || status.indexOf('已') > -1 || status.indexOf('正常') > -1 || status.indexOf('进行') > -1 ? 'green' : 'gray');
  return '<span class="ap-tag ' + cls + '">' + status + '</span>';
}
function archiveLeafById(leafId) {
  if (ARCHIVE_LOOKUP[leafId]) return ARCHIVE_LOOKUP[leafId];
  var firstGroup = ARCHIVE_TREE[0];
  return firstGroup && firstGroup.items[0] ? firstGroup.items[0] : null;
}
function archiveSelectedRecord(leaf) {
  var selectedId = ARCHIVE_STATE.selectedRecordIds[leaf.id];
  for (var i = 0; i < leaf.records.length; i++) if (leaf.records[i].id === selectedId) return leaf.records[i];
  return leaf.records[0] || null;
}
function archiveLeafEditable(leaf) {
  for (var i = 0; i < leaf.fields.length; i++) if (fieldEditable(leaf.fields[i])) return true;
  return false;
}
function archiveEsc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function archiveLeafParts(leaf) {
  return leaf.label.split('/').map(function (part) { return part.trim(); }).filter(Boolean);
}
function archiveTreeNode(key, label, depth, options) {
  options = options || {};
  var hasChildren = !!options.hasChildren;
  var collapsed = !!options.collapsed;
  var active = !!options.active;
  var attrs = hasChildren
    ? ' data-archive-tree-toggle="' + archiveEsc(key) + '"'
    : ' data-archive-leaf="' + archiveEsc(options.leafId) + '"';
  return '<div class="ds-transfer__tree-row tp-archive-tree-node' + (active ? ' is-active' : '') + (hasChildren ? ' has-children' : '') + '" style="--ds-transfer-tree-indent:' + (8 + depth * 20) + 'px"' + attrs + ' role="button" tabindex="0">'
    + (hasChildren
      ? '<button class="ds-transfer__tree-toggle" type="button" aria-label="' + (collapsed ? '展开' : '收起') + archiveEsc(label) + '" aria-expanded="' + (!collapsed) + '" data-archive-tree-toggle="' + archiveEsc(key) + '"></button>'
      : '<span class="ds-transfer__tree-spacer"></span>')
    + '<span class="ds-transfer__option-label tp-archive-tree-label">' + archiveEsc(label) + '</span>'
    + '</div>';
}
function archiveTreeKey() {
  return Array.prototype.slice.call(arguments).join('::');
}
function archiveSrcTag(field) {
  if (!field.src) return '<span class="tp-src tp-src--edit">教师维护</span>';
  return '<span class="tp-src">' + (SRC_LABEL[field.src] || field.src) + '</span>';
}
function archiveFormControl(field, value, idx) {
  var val = (value == null ? '' : value);
  if (!fieldEditable(field)) {
    return '<input class="tp-inline-select" data-archive-form-field="' + idx + '" value="' + val + '" readonly style="width:100%;background:#f4f6fa;color:var(--ap-muted)" />';
  }
  if (/(内容|简介|工作任务|说明|清单|原因|改变|服务内容|过程材料|指导日志)/.test(field.name)) {
    return '<textarea class="tp-inline-select" data-archive-form-field="' + idx + '" style="width:100%;height:84px;padding:8px 10px;line-height:20px">' + val + '</textarea>';
  }
  return '<input class="tp-inline-select" data-archive-form-field="' + idx + '" style="width:100%" value="' + val + '" />';
}
function archiveFieldWide(field, value) {
  var val = value == null ? '' : String(value);
  return /(内容|理念|思路|感悟|特色|方向|经历|陈述|摘要|简介|说明|原因|改变|图谱|日志)/.test(field.name) || val.length > 28;
}
function archiveFormRow(cells) {
  var html = '<tr>';
  for (var i = 0; i < 3; i++) {
    var item = cells[i];
    if (!item) {
      html += '<th class="is-empty"></th><td class="is-empty"></td>';
      continue;
    }
    html += '<th><div class="nm">' + item.field.name + '</div></th><td>' + (item.value == null || item.value === '' ? '—' : item.value) + '</td>';
  }
  html += '</tr>';
  return html;
}
function renderArchiveFormTable(leaf, record) {
  var html = leaf.fields.map(function (field) {
    var value = record && record.values ? record.values[field.name] : '';
    var wide = archiveFieldWide(field, value);
    return '<div class="ds-edit-field' + (wide ? ' ds-edit-field--full ds-edit-field--start' : '') + '">'
      + '<label class="ds-edit-field__label"><span>' + archiveEsc(field.name) + '</span></label>'
      + '<div class="ds-edit-field__content"><span class="tp-archive-readonly-value">' + archiveEsc(value == null || value === '' ? '—' : value) + '</span></div>'
      + '</div>';
  }).join('');
  return '<div class="tp-archive-form-wrap tp-archive-standard-form ds-edit-form ds-edit-form--2-column"><div class="ds-edit-form__grid">' + html + '</div></div>';
}
function renderArchiveTreeHtml() {
  var filter = (ARCHIVE_STATE.filter || '').toLowerCase();
  var rows = [];
  ARCHIVE_TREE.forEach(function (group) {
    var leaves = group.items.filter(function (leaf) {
      if (!filter) return true;
      return (leaf.label + group.label).toLowerCase().indexOf(filter) > -1;
    });
    if (!leaves.length) return;
    var groupKey = archiveTreeKey(group.id);
    var groupCollapsed = !filter && !!ARCHIVE_STATE.collapsedTree[groupKey];
    rows.push(archiveTreeNode(groupKey, group.label, 0, { hasChildren: true, collapsed: groupCollapsed }));
    if (groupCollapsed) return;
    var branches = {};
    var branchOrder = [];
    leaves.forEach(function (leaf) {
      var parts = archiveLeafParts(leaf);
      var branch = parts.length > 1 ? parts[0] : '';
      var label = parts.length > 1 ? parts.slice(1).join(' / ') : leaf.label;
      if (!branch) {
        rows.push(archiveTreeNode(leaf.id, label, 1, { leafId: leaf.id, active: ARCHIVE_STATE.leafId === leaf.id }));
        return;
      }
      if (!branches[branch]) {
        branches[branch] = [];
        branchOrder.push(branch);
      }
      branches[branch].push({ leaf: leaf, label: label });
    });
    branchOrder.forEach(function (branch) {
      var branchKey = archiveTreeKey(group.id, branch);
      var branchCollapsed = !filter && !!ARCHIVE_STATE.collapsedTree[branchKey];
      rows.push(archiveTreeNode(branchKey, branch, 1, { hasChildren: true, collapsed: branchCollapsed }));
      if (branchCollapsed) return;
      branches[branch].forEach(function (item) {
        rows.push(archiveTreeNode(item.leaf.id, item.label, 2, { leafId: item.leaf.id, active: ARCHIVE_STATE.leafId === item.leaf.id }));
      });
    });
  });
  return rows.length ? '<div class="ds-transfer__tree tp-archive-standard-tree">' + rows.join('') + '</div>' : '<div class="tp-archive-empty">未找到匹配「' + archiveEsc(ARCHIVE_STATE.filter || '') + '」的分组</div>';
}
function renderArchiveListTable(leaf) {
  var head = leaf.fields.map(function (f) {
    return '<th>' + archiveEsc(f.name) + '</th>';
  }).join('');
  var body;
  if (!leaf.records.length) {
    body = '<tr><td colspan="' + (leaf.fields.length + 3) + '"><div class="tp-archive-empty">暂无数据，点击右上角「+ 新增数据」创建第一条记录。</div></td></tr>';
  } else {
    body = leaf.records.map(function (rec) {
      var tds = leaf.fields.map(function (f, i) {
        var v = rec.values[f.name];
        return '<td' + (i === 0 ? ' class="is-lead"' : '') + '>' + archiveEsc(v == null || v === '' ? '—' : v) + '</td>';
      }).join('');
      return '<tr class="' + (ARCHIVE_STATE.selectedRecordIds[leaf.id] === rec.id ? 'is-selected' : '') + '" data-archive-record-select="1" data-archive-leaf-id="' + leaf.id + '" data-archive-record-id="' + rec.id + '">' + tds
        + '<td>' + archiveStatusTag(rec.status) + '</td>'
        + '<td>' + archiveEsc(rec.updated) + '</td>'
        + '<td><div class="ops"><button type="button" data-archive-record-action="edit" data-archive-leaf-id="' + leaf.id + '" data-archive-record-id="' + rec.id + '">编辑</button><button type="button" data-archive-record-action="delete" data-archive-leaf-id="' + leaf.id + '" data-archive-record-id="' + rec.id + '">删除</button></div></td>'
        + '</tr>';
    }).join('');
  }
  return '<div class="tp-archive-block ds-data-table ds-card ds-data-table--lowcode tp-archive-standard-table">'
    + '<div class="ds-data-table__toolbar"><div class="ds-data-table__title"><strong>数据台账</strong><span>点击表格行可切换上方详情</span></div></div>'
    + '<div class="ds-data-table__wrap"><table class="ds-data-table__table" style="min-width:' + Math.max(720, leaf.fields.length * 140 + 280) + 'px"><thead><tr>' + head + '<th>状态</th><th>更新时间</th><th class="ops-col">操作</th></tr></thead><tbody>' + body + '</tbody></table></div></div>';
}
function renderArchiveSingle(leaf) {
  var rec = archiveSelectedRecord(leaf);
  return '<div class="tp-archive-block ds-form-group"><div class="tp-archive-block__head"><span class="tp-archive-block__bar"></span><h4>' + archiveEsc(leaf.label) + '</h4></div><div class="ds-form-group__content">' + renderArchiveFormTable(leaf, rec) + '</div></div>';
}
function renderArchiveListRecordForm(leaf) {
  var rec = archiveSelectedRecord(leaf);
  if (!rec) return '';
  return '<div class="tp-archive-block ds-form-group"><div class="tp-archive-block__head"><span class="tp-archive-block__bar"></span><h4>' + archiveEsc(rec.title || leaf.label) + '</h4></div><div class="ds-form-group__content">' + renderArchiveFormTable(leaf, rec) + '</div></div>';
}
function archiveLeafExtraHtml(leaf) {
  if (leaf.id === 'semester-overview') {
    var completion = S && S.reflectDone ? '93' : '86';
    var tagText = S && S.reflectDone ? '必选 13 / 14 项' : '必选 12 / 14 项';
    var dash = S && S.reflectDone ? '280.5 301.6' : '281.0 45.7';
    var feedbackTodo = S && S.feedbackRead ? '' : '<div class="tp-todo-item"><span class="ico">评</span><div><h5>专业主任反馈待查看（1 条未读）</h5><p>陈立群 06-05 对 2025-2026 学年档案提出反馈建议</p></div></div>';
    var reflectCheck = S && S.reflectDone
      ? '<div class="tp-check"><span class="st">✓</span>教学反思（' + TODAY + ' 已补传）</div>'
      : '<div class="tp-check miss"><span class="st">!</span>教学反思 ·《嵌入式系统开发》缺</div>';
    var warnTodo = S && S.reflectDone ? '' : '<div class="tp-todo-item warn"><span class="ico">!</span><div><h5>补传《嵌入式系统开发》教学反思</h5><p>必选材料缺项，影响学年档案审核 · 建议本周完成</p></div></div>';
    return '<div class="tp-archive-section"><div class="tp-archive-toolbar"><h4>完整度与提醒</h4><div class="tp-archive-toolbar__meta"><span class="ap-tag blue" data-archive-completion-tag>' + tagText + '</span></div></div><div class="tp-ring-wrap"><div class="tp-ring"><svg width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" fill="none" stroke="#edf1f7" stroke-width="10"/><circle cx="60" cy="60" r="52" fill="none" stroke="#3565ea" stroke-width="10" stroke-linecap="round" stroke-dasharray="' + dash + '"/></svg><div class="num">' + completion + '%<small>完整度</small></div></div><div class="tp-checklist"><div class="tp-check"><span class="st">✓</span>课程标准（2门课程）</div><div class="tp-check"><span class="st">✓</span>课程大纲（2门课程）</div><div class="tp-check"><span class="st">✓</span>教学进度表（2门课程）</div><div class="tp-check"><span class="st">✓</span>教案（2门课程）</div><div class="tp-check"><span class="st">✓</span>课件（2门课程）</div><div class="tp-check"><span class="st">✓</span>试卷与试卷分析</div><div class="tp-check"><span class="st">✓</span>学生评教结果（教务同步）</div><div class="tp-check"><span class="st">✓</span>督导评教记录（质保同步）</div>' + reflectCheck + '<div class="tp-check miss"><span class="st">!</span>同行听课评议 · 本学期缺 1 次</div></div></div><div class="tp-todo">' + warnTodo + feedbackTodo + '<div class="tp-todo-item"><span class="ico">标</span><div><h5>目标节点提醒：教学能力比赛校赛材料</h5><p>所属团队目标 · 截止 2026-06-20，距今 9 天</p></div></div></div></div>';
  }
  return leaf.extraHtml || '';
}
function renderArchiveDetailHtml(leaf) {
  if (leaf.id === 'teaching-semester') return renderSemesterDetail();
  var isSingle = leaf.mode === 'single';
  var editable = archiveLeafEditable(leaf);
  var actions = isSingle
    ? (editable ? '<button class="ap-btn primary" type="button" data-archive-action="edit" data-archive-leaf-id="' + leaf.id + '">编辑</button>' : '')
    : '<button class="ap-btn primary" type="button" data-archive-action="add" data-archive-leaf-id="' + leaf.id + '">+ 新增数据</button>';
  return '<section class="tp-archive-detail is-active" data-archive-detail-pane="' + leaf.id + '">'
    + (actions ? '<div class="tp-archive-actions tp-archive-actions--top">' + actions + '</div>' : '')
    + (isSingle ? renderArchiveSingle(leaf) : (renderArchiveListRecordForm(leaf) + renderArchiveListTable(leaf)))
    + '</section>';
}

/* ═══════════════ 学期授课（以学期课程为主线） ═══════════════ */
var SEMESTER_SECTIONS = [
  { key:'basic',      label:'课程基本信息',       src:'教务系统',       names:["课程号","课程名称","课程负责人","课程类型","课程类别","课程性质","授课形式","授课班级","学分","总学时","课程人数"] },
  { key:'design',     label:'教学设计与实施',     src:'教学档案袋维护', names:["课程计划","课程目标","课程分类","课程状态","学情分析","教学方法","教学备课（教案、课件）","教学随笔","课程思政改革","信息化教学工具","教学改革与创新","课程资源","教学思政","课程思政元素","课程思政教学内容","课程思政教学案例等"] },
  { key:'care',       label:'教师关爱学生情况',   src:'教学档案袋维护', names:["辅导学生","个性化案例"] },
  { key:'effect',     label:'教学效果',           src:'教务系统',       names:["学生上课率","学生成绩","学生代表性作业"] },
  { key:'evaluation', label:'教学评价',           src:'教务系统',       names:["学生评价","督导评价","同行评价"] },
  { key:'reflection', label:'教学反思与优化措施', src:'教学档案袋维护', names:["教学反思","优化举措"] },
  { key:'summary',    label:'课程总结',           src:'教学档案袋维护', names:["总结"] }
];
var SEMESTER_TERMS = [
  { id:'2025-2026-1', label:'2025-2026 学年 第一学期（当前）' },
  { id:'2024-2025-2', label:'2024-2025 学年 第二学期' }
];
var SEMESTER_COURSES = [
  { id:'c-embedded', termId:'2025-2026-1', name:'嵌入式系统开发', values:{
    basic:{ '课程号':'EI3021','课程名称':'嵌入式系统开发','课程负责人':'金晓智','课程类型':'专业核心课','课程类别':'必修','课程性质':'理实一体','授课形式':'线上线下混合','授课班级':'电子2301 / 电子2302','学分':'4','总学时':'64','课程人数':'58' },
    design:{ '课程计划':'已上传（18 周教学进度表）','课程目标':'知识·能力·素质三维目标，对接嵌入式开发岗位','课程分类':'专业核心','课程状态':'进行中','学情分析':'已完成（前序《单片机》达标率 86%）','教学方法':'项目驱动 + 案例教学 + 小组协作','教学备课（教案、课件）':'教案 16 讲 / 课件 16 套','教学随笔':'累计 12 篇','课程思政改革':'已立项校级思政示范课','信息化教学工具':'云课堂 + 虚拟仿真平台','教学改革与创新':'模块化课程重构 + 真实项目案例','课程资源':'微课 42 个 / 题库 360 题','教学思政':'融入工匠精神与安全规范','课程思政元素':'工匠精神 / 安全意识 / 团队协作','课程思政教学内容':'结合国产芯片自主可控案例','课程思政教学案例等':'3 个典型案例' },
    care:{ '辅导学生':'累计 32 人次（含答疑 24 次）','个性化案例':'王梓萌学业帮扶 · 从挂科边缘到良好' },
    effect:{ '学生上课率':'96.5%','学生成绩':'平均 82.4 分，优良率 68%','学生代表性作业':'智能循迹小车等 5 件' },
    evaluation:{ '学生评价':'94.2 分（学院前 10%）','督导评价':'优秀','同行评价':'良好' },
    reflection:{ '教学反思':'项目难度梯度需细化，部分学生在 RTOS 环节掉队','优化举措':'增设分层任务包 + 课前预习微课，下一轮前置 RTOS 基础' },
    summary:{ '总结':'本学期目标达成度高，建议固化项目案例库并申报精品课程。' }
  }},
  { id:'c-mcu', termId:'2025-2026-1', name:'单片机应用技术', values:{
    basic:{ '课程号':'EI2015','课程名称':'单片机应用技术','课程负责人':'金晓智','课程类型':'专业基础课','课程类别':'必修','课程性质':'理实一体','授课形式':'线下','授课班级':'电子2303','学分':'3','总学时':'48','课程人数':'46' },
    design:{ '课程计划':'已上传（16 周）','课程目标':'掌握单片机基础开发能力','课程分类':'专业基础','课程状态':'进行中','教学方法':'讲练结合 + 实训','教学备课（教案、课件）':'教案 12 讲 / 课件 12 套','信息化教学工具':'云课堂' },
    care:{ '辅导学生':'累计 18 人次' },
    effect:{ '学生上课率':'93.1%','学生成绩':'平均 78.6 分' },
    evaluation:{ '学生评价':'90.5 分','督导评价':'良好' },
    reflection:{},
    summary:{}
  }},
  { id:'c-analog', termId:'2024-2025-2', name:'电子技术基础', values:{
    basic:{ '课程号':'EI1008','课程名称':'电子技术基础','课程负责人':'金晓智','课程类型':'专业基础课','课程类别':'必修','课程性质':'理论+实验','授课形式':'线下','授课班级':'电子2401','学分':'4','总学时':'64','课程人数':'52' },
    design:{ '课程计划':'已归档','课程目标':'模拟与数字电路基础','教学方法':'讲授 + 实验' },
    care:{ '辅导学生':'累计 26 人次','个性化案例':'李航竞赛培养' },
    effect:{ '学生上课率':'95.0%','学生成绩':'平均 80.1 分','学生代表性作业':'稳压电源设计 8 件' },
    evaluation:{ '学生评价':'92.0 分','督导评价':'优秀','同行评价':'优秀' },
    reflection:{ '教学反思':'实验课时偏紧','优化举措':'增加开放实验室时段' },
    summary:{ '总结':'整体达成良好，已归档。' }
  }}
];
var SEMESTER_STATE = { termId:'2025-2026-1', courseId:'c-embedded' };

function semesterFields(section) { return archiveFields(section.src, section.names); }
function semesterSectionEditable(section) { return section.src === '教学档案袋维护'; }
function semesterSectionById(key) {
  for (var i = 0; i < SEMESTER_SECTIONS.length; i++) if (SEMESTER_SECTIONS[i].key === key) return SEMESTER_SECTIONS[i];
  return null;
}
function semesterCoursesForTerm(termId) {
  return SEMESTER_COURSES.filter(function (c) { return c.termId === termId; });
}
function semesterCurrentCourse() {
  var list = semesterCoursesForTerm(SEMESTER_STATE.termId);
  var hit = list.filter(function (c) { return c.id === SEMESTER_STATE.courseId; })[0];
  return hit || list[0] || SEMESTER_COURSES[0];
}
function semesterSectionValues(course, key) { return (course.values && course.values[key]) || {}; }
function semesterSectionStat(section, course) {
  var vals = semesterSectionValues(course, section.key);
  var filled = 0;
  semesterFields(section).forEach(function (f) { if (vals[f.name] != null && vals[f.name] !== '') filled++; });
  return { filled: filled, total: section.names.length };
}
function semesterCompletion(course) {
  var total = 0, filled = 0;
  SEMESTER_SECTIONS.forEach(function (section) {
    var st = semesterSectionStat(section, course);
    total += st.total; filled += st.filled;
  });
  return total ? Math.round(filled / total * 100) : 0;
}
function renderSemesterSectionForm(section, course) {
  var vals = semesterSectionValues(course, section.key);
  var html = semesterFields(section).map(function (field) {
    var value = vals[field.name];
    var wide = archiveFieldWide(field, value);
    var empty = (value == null || value === '');
    var display = empty ? '<span class="tp-semester-empty">待维护</span>' : archiveEsc(value);
    return '<div class="ds-edit-field' + (wide ? ' ds-edit-field--full ds-edit-field--start' : '') + '">'
      + '<label class="ds-edit-field__label"><span>' + archiveEsc(field.name) + '</span></label>'
      + '<div class="ds-edit-field__content"><span class="tp-archive-readonly-value">' + display + '</span></div>'
      + '</div>';
  }).join('');
  return '<div class="tp-archive-form-wrap tp-archive-standard-form ds-edit-form ds-edit-form--2-column"><div class="ds-edit-form__grid">' + html + '</div></div>';
}
function renderSemesterDetail() {
  var course = semesterCurrentCourse();
  var termOpts = SEMESTER_TERMS.map(function (t) {
    return '<option value="' + t.id + '"' + (t.id === SEMESTER_STATE.termId ? ' selected' : '') + '>' + archiveEsc(t.label) + '</option>';
  }).join('');
  var courseOpts = semesterCoursesForTerm(SEMESTER_STATE.termId).map(function (c) {
    return '<option value="' + c.id + '"' + (c.id === course.id ? ' selected' : '') + '>' + archiveEsc('《' + c.name + '》') + '</option>';
  }).join('');
  var pct = semesterCompletion(course);
  var barCls = pct >= 90 ? ' green' : (pct >= 70 ? '' : ' orange');
  var basics = semesterSectionValues(course, 'basic');
  var heroMeta = [basics['授课班级'], basics['学分'] ? basics['学分'] + ' 学分' : '', basics['总学时'] ? basics['总学时'] + ' 学时' : '', basics['课程人数'] ? basics['课程人数'] + ' 人' : '', basics['课程负责人'] ? '负责人 ' + basics['课程负责人'] : ''].filter(Boolean).join(' · ');
  var anchors = SEMESTER_SECTIONS.map(function (section) {
    return '<button type="button" class="tp-semester-anchor" data-semester-anchor="' + section.key + '">' + archiveEsc(section.label) + '</button>';
  }).join('');
  var sections = SEMESTER_SECTIONS.map(function (section, i) {
    var editable = semesterSectionEditable(section);
    var srcText = editable ? '教师维护' : ((SRC_LABEL[section.src] || section.src) + ' 同步');
    return '<section class="tp-semester-section" id="sec-' + section.key + '" data-semester-section="' + section.key + '">'
      + '<div class="tp-semester-section__head">'
        + '<span class="tp-archive-block__bar"></span>'
        + '<div class="tp-semester-section__title"><h4><em>' + (i + 1) + '</em>' + archiveEsc(section.label) + '</h4></div>'
        + '<span class="tp-semester-srctag' + (editable ? ' is-edit' : '') + '">' + archiveEsc(srcText) + '</span>'
        + (editable ? '<button type="button" class="ap-btn primary tp-semester-edit" data-semester-edit="' + section.key + '">维护数据</button>' : '')
      + '</div>'
      + '<div class="tp-semester-section__body">' + renderSemesterSectionForm(section, course) + '</div>'
      + '</section>';
  }).join('');
  return '<section class="tp-archive-detail tp-semester is-active" data-archive-detail-pane="teaching-semester">'
    + '<div class="tp-semester-head">'
      + '<div class="tp-semester-picker">'
        + '<label class="tp-semester-picker__item"><span>学期</span><select class="tp-inline-select" data-semester-term>' + termOpts + '</select></label>'
        + '<label class="tp-semester-picker__item"><span>课程</span><select class="tp-inline-select" data-semester-course>' + courseOpts + '</select></label>'
      + '</div>'
      + '<div class="tp-semester-hero">'
        + '<div class="tp-semester-hero__main"><h3>《' + archiveEsc(course.name) + '》' + (basics['课程号'] ? '<span class="ap-tag blue">' + archiveEsc(basics['课程号']) + '</span>' : '') + '</h3><p>' + archiveEsc(heroMeta || '课程基本信息待维护') + '</p></div>'
        + '<div class="tp-semester-hero__meta"><div class="tp-semester-complete"><span>档案完整度</span><div class="tp-bar' + barCls + '"><i style="width:' + pct + '%"></i></div><b>' + pct + '%</b></div></div>'
      + '</div>'
    + '</div>'
    + '<nav class="tp-semester-anchors" aria-label="板块导航">' + anchors + '</nav>'
    + '<div class="tp-semester-sections">' + sections + '</div>'
    + '</section>';
}
function openSemesterEditor(sectionKey) {
  var course = semesterCurrentCourse();
  var section = semesterSectionById(sectionKey);
  if (!section) return;
  var fields = semesterFields(section);
  var vals = semesterSectionValues(course, sectionKey);
  var body = '<div class="ap-form-grid">' + fields.map(function (field, idx) {
    var val = vals[field.name] == null ? '' : vals[field.name];
    return '<div class="ap-field"><label>' + archiveEsc(field.name) + '</label>' + archiveFormControl(field, val, idx) + '</div>';
  }).join('') + '</div>';
  modal('维护数据 · 《' + course.name + '》/ ' + section.label, body, { okText: '保存', onOk: function () {
    if (!course.values) course.values = {};
    if (!course.values[sectionKey]) course.values[sectionKey] = {};
    fields.forEach(function (field, idx) {
      var input = modalMask.querySelector('[data-archive-form-field="' + idx + '"]');
      if (input) course.values[sectionKey][field.name] = input.value.trim();
    });
    renderTeachingArchive('teaching-semester');
    toast('《' + course.name + '》' + section.label + ' 已保存', 'ok');
  } });
}
function renderTeachingArchive(leafId) {
  if (leafId) ARCHIVE_STATE.leafId = leafId;
  var view = V('t-overview');
  if (!view) return;
  var tree = view.querySelector('[data-archive-tree]');
  var detail = view.querySelector('[data-archive-detail]');
  if (!tree || !detail) return;
  tree.innerHTML = renderArchiveTreeHtml();
  detail.innerHTML = renderArchiveDetailHtml(archiveLeafById(ARCHIVE_STATE.leafId));
}
function openArchiveEditor(mode, leafId, recordId) {
  var leaf = archiveLeafById(leafId);
  var record = null;
  for (var i = 0; i < leaf.records.length; i++) if (leaf.records[i].id === recordId) record = leaf.records[i];
  if (mode !== 'add' && !record) record = archiveSelectedRecord(leaf);
  if (mode !== 'add' && !record) { toast('请先选择一条数据', 'warn'); return; }
  var title = mode === 'add' ? '新增数据 · ' + leaf.label : '编辑数据 · ' + (record.title || leaf.label);
  var body = '<div class="ap-form-grid">' + leaf.fields.map(function (field, idx) {
    var val = record && record.values ? (record.values[field.name] || '') : '';
    return '<div class="ap-field"><label>' + field.name + '</label>' + archiveFormControl(field, val, idx) + '</div>';
  }).join('') + '<div class="ap-field"><label>状态</label><select class="tp-inline-select" data-archive-form-status><option' + ((record && record.status === '启用中') ? ' selected' : '') + '>启用中</option><option' + ((record && record.status === '已归档') ? ' selected' : '') + '>已归档</option><option' + ((record && record.status === '待处理') ? ' selected' : '') + '>待处理</option><option' + ((record && record.status === '缺项') ? ' selected' : '') + '>缺项</option></select></div></div>';
  modal(title, body, { okText: mode === 'add' ? '保存新增数据' : '保存修改', onOk: function () {
    var values = {};
    leaf.fields.forEach(function (field, idx) {
      var input = modalMask.querySelector('[data-archive-form-field="' + idx + '"]');
      values[field.name] = input ? input.value.trim() : '';
    });
    var statusEl = modalMask.querySelector('[data-archive-form-status]');
    var status = statusEl ? statusEl.value : '已归档';
    var mainField = leaf.fields[0] ? leaf.fields[0].name : '标题';
    var next = record || { id: leaf.id + '-' + Date.now() };
    next.values = values;
    next.status = status;
    next.updated = TODAY;
    next.title = values['理念主题'] || values['成果/案例名称'] || values['项目名称'] || values['成果名称'] || values['课程名称'] || values['教材名称'] || values['学生姓名'] || values[mainField] || leaf.label + '新记录';
    next.summary = Object.keys(values).filter(function (key) { return values[key]; }).slice(0, 3).map(function (key) { return key + '：' + values[key]; }).join('；') || leaf.desc;
    if (!record) leaf.records.unshift(next);
    ARCHIVE_STATE.selectedRecordIds[leaf.id] = next.id;
    renderTeachingArchive(leaf.id);
    toast(mode === 'add' ? '新增数据已保存' : '数据修改已保存', 'ok');
  } });
}
function deleteArchiveRecord(leafId, recordId) {
  var leaf = archiveLeafById(leafId);
  var targetId = recordId || ARCHIVE_STATE.selectedRecordIds[leaf.id];
  if (!targetId) { toast('请先选择一条数据', 'warn'); return; }
  if (leaf.records.length <= 1) { toast('原型至少保留 1 条示例数据，可先新增后再删除', 'warn'); return; }
  leaf.records = leaf.records.filter(function (record) { return record.id !== targetId; });
  ARCHIVE_STATE.selectedRecordIds[leaf.id] = leaf.records[0] ? leaf.records[0].id : '';
  renderTeachingArchive(leaf.id);
  toast('数据已删除', 'ok');
}
/* Archive catalog initialized during page boot. */

/* ═══════════════ 状态 ═══════════════ */
var S = { reflectDone: false, feedbackRead: false, todo: 3, reviewing: '金晓智', dPending: 4, dDone: 14 };

function updateTodoStat() {
  var stats = V('t-overview').querySelectorAll('.ap-stat');
  if (!stats[2]) return;
  var st = stats[2].querySelector('h3');
  st.innerHTML = S.todo + '<small>项' + (S.feedbackRead ? '' : ' · 1 条反馈未读') + '</small>';
}

/* ═══════════════ 闭环 A：补传教学反思（7 处联动） ═══════════════ */
function completeReflect() {
  if (S.reflectDone) { toast('教学反思已补传，无需重复提交', 'warn'); return; }
  var body = fieldVal('t-reflect', '正文');
  if (!body || !body.trim()) { toast('请填写反思正文后再提交', 'warn'); return; }
  S.reflectDone = true;
  /* 1. 总览 */
  var ov = V('t-overview');
  var ring = ov.querySelector('.tp-ring');
  if (ring) {
    ring.querySelectorAll('circle')[1].setAttribute('stroke-dasharray', '280.5 301.6');
    ring.querySelector('.num').innerHTML = '93%<small>完整度</small>';
  }
  var ovStats = ov.querySelectorAll('.ap-stat');
  if (ovStats[0]) ovStats[0].querySelector('h3').innerHTML = '93<small>%</small>';
  var completionTag = ov.querySelector('[data-archive-completion-tag]');
  if (completionTag) completionTag.textContent = '必选 13 / 14 项';
  var miss = ov.querySelectorAll('.tp-check.miss');
  for (var i = 0; i < miss.length; i++) {
    if (miss[i].textContent.indexOf('教学反思') > -1) {
      miss[i].classList.remove('miss');
      miss[i].innerHTML = '<span class="st">✓</span>教学反思（' + TODAY + ' 已补传）';
    }
  }
  var warn = ov.querySelector('.tp-todo-item.warn');
  if (warn) { warn.remove(); S.todo--; updateTodoStat(); }
  /* 2. 课程档案 */
  var card = V('t-courses').querySelectorAll('.tp-course')[0];
  var ctag = card.querySelector('.ap-tag'); ctag.textContent = '材料 10 / 10'; ctag.className = 'ap-tag green';
  var cbar = card.querySelector('.tp-bar'); cbar.classList.remove('orange'); cbar.classList.add('green');
  cbar.querySelector('i').style.width = '100%';
  var row = findRowByText('t-courses', '学期教学反思');
  if (row) {
    row.innerHTML = '<td>《嵌入式系统开发》2025-2026-1 教学反思</td><td><span class="ap-tag blue">必选</span></td><td>本人填写</td><td>私有</td><td>V1</td><td>' + TODAY + '</td><td><span class="ap-tag green">已归档</span></td><td class="link">预览</td>';
    flash(row);
    row.closest('.ap-panel').querySelector('.ap-panel-head .ap-tag').outerHTML = '<span class="ap-tag green">必选材料齐全</span>';
  }
  /* 3. 反思历史 */
  var hr = findRowByText('t-reflect', '2025-2026-1 教学反思');
  if (hr) {
    var tds = hr.querySelectorAll('td');
    tds[4].textContent = TODAY;
    tds[5].innerHTML = '<span class="ap-tag green">已归档</span>';
    tds[6].textContent = '详情'; flash(hr);
  }
  var ftag = V('t-reflect').querySelector('.ap-panel .ap-panel-head .ap-tag');
  if (ftag) ftag.outerHTML = '<span class="ap-tag green">已补传 ✓</span>';
  /* 4. 专业主任审核台 */
  var pr = findRowByText('p-review', '金晓智');
  if (pr) { var ptds = pr.querySelectorAll('td'); ptds[2].textContent = '13 / 14'; ptds[3].textContent = '93%'; }
  var infos = V('p-review').querySelectorAll('.ap-info-item h4');
  if (infos[0]) infos[0].textContent = '13 / 14（缺：同行听课评议）';
  /* 5. 教研室概览 */
  var rr = findRowByText('r-overview', '金晓智');
  if (rr) {
    var rtds = rr.querySelectorAll('td');
    rtds[1].textContent = '13 / 14';
    var bar = rtds[2].querySelector('.tp-bar i'); if (bar) bar.style.width = '93%';
    var sp = rtds[2].querySelector('span'); if (sp) sp.textContent = '93%';
    rtds[4].innerHTML = '<span class="ap-tag blue">缺听课评议</span>';
  }
  renderTeachingArchive(ARCHIVE_STATE.leafId);
  toast('教学反思已归档 ✓ 档案完整度 86% → 93%，专业主任端、教研室看板已同步更新', 'ok', 4200);
}

/* ═══════════════ 闭环 B：反馈已读 ═══════════════ */
function markFeedbackRead() {
  if (S.feedbackRead) return;
  S.feedbackRead = true;
  var tag = V('t-feedback').querySelector('.ap-tl-item .ap-tag.orange');
  if (tag) tag.remove();
  var head = V('t-feedback').querySelectorAll('.ap-panel-head .ap-tag');
  for (var i = 0; i < head.length; i++) if (head[i].textContent.indexOf('未读') > -1) head[i].outerHTML = '<span class="ap-tag green">全部已读</span>';
  var todos = V('t-overview').querySelectorAll('.tp-todo-item');
  for (var j = 0; j < todos.length; j++) {
    if (todos[j].textContent.indexOf('专业主任反馈待查看') > -1) { todos[j].remove(); S.todo--; }
  }
  updateTodoStat();
  renderTeachingArchive(ARCHIVE_STATE.leafId);
  toast('反馈已标记为已读', 'ok');
}

/* ═══════════════ 闭环 C/D：学生上传 ↔ 教师确认 ═══════════════ */
function studentSubmit() {
  var name = fieldVal('s-upload', '材料名称');
  if (!name || !name.trim()) { toast('请填写材料名称', 'warn'); return; }
  var cat = fieldVal('s-upload', '材料分类');
  var sub = findRowByText('s-submissions', '循迹算法') ? V('s-submissions').querySelector('tbody') : null;
  if (sub) {
    var tr = document.createElement('tr');
    tr.innerHTML = '<td>' + name + '</td><td>' + cat + '</td><td>' + TODAY + '</td><td><span class="ap-tag orange">待确认</span></td><td>—</td>';
    sub.insertBefore(tr, sub.firstChild); flash(tr);
  }
  var club = V('t-club').querySelector('tbody');
  var tr2 = document.createElement('tr');
  tr2.innerHTML = '<td>' + name + '</td><td>王梓萌（2024级）</td><td>' + cat + '</td><td>' + TODAY + '</td><td><span class="ap-tag orange">待确认</span></td><td class="link">确认入档</td>';
  club.insertBefore(tr2, club.firstChild);
  syncClubPendingCount(1);
  clearField('s-upload', '材料名称');
  toast('已提交，待指导教师金晓智确认入档（教师端已同步出现）', 'ok', 3600);
}
function confirmClubRow(row) {
  var tds = row.querySelectorAll('td');
  tds[4].innerHTML = '<span class="ap-tag green">已入档</span>';
  tds[5].textContent = '预览'; flash(row);
  syncClubPendingCount(-1);
  toast('已确认入档，材料沉淀为社团公共资产', 'ok');
}
function syncClubPendingCount(delta) {
  var tags = V('t-club').querySelectorAll('.ap-panel-head .ap-tag');
  for (var i = 0; i < tags.length; i++) {
    var m = tags[i].textContent.match(/(\d+) 条待确认/);
    if (m) {
      var n = parseInt(m[1], 10) + delta;
      if (n > 0) { tags[i].textContent = n + ' 条待确认'; tags[i].className = 'ap-tag orange'; }
      else { tags[i].textContent = '无待确认'; tags[i].className = 'ap-tag green'; }
    }
  }
}

/* ═══════════════ 闭环 E：审核台 → 发送反馈 ═══════════════ */
function startReview(name) {
  S.reviewing = name;
  var panel = V('p-review').querySelectorAll('.ap-panel')[1];
  panel.querySelector('.ap-panel-head h2').innerHTML = '<span class="dot"></span>审核 · ' + name;
  if (name !== '金晓智') {
    panel.querySelector('textarea').value = '';
    panel.querySelector('textarea').placeholder = '请基于 ' + name + ' 的档案完整性与材料质量，给出改进建议（非打分）';
  }
  toast('已载入 ' + name + ' 的学年档案');
}
function sendFeedback() {
  var txt = V('p-review').querySelectorAll('.ap-panel')[1].querySelector('textarea').value;
  if (!txt || !txt.trim()) { toast('请填写反馈建议', 'warn'); return; }
  var row = findRowByText('p-review', S.reviewing);
  if (row) {
    var tds = row.querySelectorAll('td');
    tds[4].innerHTML = '<span class="ap-tag green">已反馈</span>';
    tds[5].textContent = '查看反馈'; flash(row);
  }
  if (S.reviewing === '金晓智') {
    var tl = V('t-feedback').querySelector('.ap-timeline');
    var item = document.createElement('div');
    item.className = 'ap-tl-item current';
    item.innerHTML = '<span class="ap-tl-dot">建</span><div class="ap-tl-body"><h4>专业主任 · 陈立群 <span class="ap-tag blue" style="margin-left:6px">新</span></h4><p>' + TODAY + ' · ' + txt + '</p></div>';
    tl.insertBefore(item, tl.firstChild);
  }
  toast('反馈已发送给 ' + S.reviewing + '（教师端「我收到的反馈」即时可见），审核闭环推进', 'ok', 3600);
}

/* ═══════════════ 闭环 F：目标拆解 ═══════════════ */
function addDecompose() {
  var weight = fieldVal('p-decompose', '个人权重');
  if (!weight || !weight.trim()) { toast('请填写个人权重', 'warn'); return; }
  var goal = fieldVal('p-decompose', '上级指标').replace('（待拆解）', '');
  var person = fieldVal('p-decompose', '责任人');
  var role = fieldVal('p-decompose', '角色').charAt(0);
  var node = fieldVal('p-decompose', '里程碑节点') || '2026-12';
  var tb = V('p-decompose').querySelectorAll('.ap-panel')[1].querySelector('tbody');
  var tr = document.createElement('tr');
  tr.innerHTML = '<td>' + goal + '</td><td>' + person + '</td><td>' + role + '</td><td>' + weight + '</td><td>' + node + '</td><td><div class="tp-dim-bar" style="width:150px"><div class="tp-bar"><i style="width:0%"></i></div><span>0%</span></div></td>';
  tb.appendChild(tr); flash(tr);
  var gr = findRowByText('p-decompose', '横向技术服务');
  if (gr) {
    var st = gr.querySelectorAll('td')[4];
    if (st && st.textContent.indexOf('待拆解') > -1) st.innerHTML = '<span class="ap-tag green">已拆解到人</span>';
  }
  clearField('p-decompose', '个人权重');
  clearField('p-decompose', '里程碑节点');
  toast('已拆解到 ' + person + ' 并发送通知；其档案袋成果将自动回填该指标进度', 'ok', 3400);
}

/* ═══════════════ 闭环 G：督导评分实时计算 ═══════════════ */
var D_WEIGHTS = [0.3, 0.3, 0.2, 0.2];
function recalcSupervisor() {
  var sels = V('d-review').querySelectorAll('tbody select');
  var sum = 0;
  sels.forEach(function (s, i) { sum += parseFloat(s.value) * (D_WEIGHTS[i] || 0); });
  var b = btnIn('d-review', '提交评阅');
  if (b) b.textContent = '提交评阅（综合 ' + sum.toFixed(1) + ' 分）';
}
function submitSupervise() {
  var fb = V('d-review').querySelector('textarea').value;
  if (!fb || !fb.trim()) { toast('文字反馈为必填，请填写帮助教师改进的建议', 'warn'); return; }
  var row = findRowByText('d-tasks', '金晓智');
  if (row) row.remove();
  S.dPending--; S.dDone++;
  var stats = V('d-tasks').querySelectorAll('.ap-stat h3');
  stats[1].innerHTML = S.dDone + '<small>项</small>';
  stats[2].innerHTML = S.dPending + '<small>项 · 最近截止 06-22</small>';
  showView('d-tasks');
  toast('评阅已提交：评分与文字反馈已送达教师档案袋', 'ok', 3200);
}

/* ═══════════════ 画像赋分溯源 ═══════════════ */
var TRACE = {
  '教学实绩': '<b>92 分构成：</b><br/>· 年均课时 412（基准分 30）<br/>· 学生评教 94.1 → 折算 28 分<br/>· 督导评分 92 → 折算 18 分<br/>· 课程标准 2 门 + 主编教材 → 16 分<br/><span style="color:#8a93a6">点击任意一项可打开原始材料（演示略）</span>',
  '育人成效': '<b>95 分构成：</b><br/>· 省技能大赛一等奖（指导教师，2026-04，赋分 12）<br/>· 指导学生授权发明专利 1 项（赋分 3）<br/>· 智能小车协会育人记录 48 份<br/>· 现场工程师班课程负责人',
  '科研与社会服务': '<b>61 分构成：</b><br/>· 校级教改课题在研（赋分 4）<br/>· 近三年无横向到账记录 ← 主要短板<br/><b>系统建议：</b>关注「联科精密电子」在谈技术服务项目（团队负责人可指派）',
  '双师素质': '<b>88 分构成：</b><br/>· 双师型教师（中级）认定（2024-11）<br/>· 企业实践累计 18 天（目标 30 天，进行中）<br/>· 智能硬件产线项目经验 2 项',
  '团队贡献': '<b>82 分构成：</b><br/>· 团队目标承担权重 30%+40%+30%<br/>· 已达成指标贡献分 +12<br/>· 帮带青年教师 1 人（赛项 C 角色）',
  '荣誉影响力': '<b>76 分构成：</b><br/>· 省级奖项 2 项（教学能力比赛、技能大赛指导）<br/>· 校级「教学能手」称号<br/>· 行业协会会员'
};

/* ═══════════════ 全局事件委托 ═══════════════ */
function exportToast(what) {
  toast(what + '生成中…', '', 1200);
  setTimeout(function () { toast(what + '已生成（演示原型，实际环境提供下载）', 'ok'); }, 1300);
}

document.addEventListener('click', function (e) {
  if (e.target.closest('.pf-modal') || e.target.closest('.pf-toast-wrap')) return;

  /* —— 每堂课记录：编辑 —— */
  var stuEdit = e.target.closest('[data-stu-edit]');
  if (stuEdit) { editStuNote(parseInt(stuEdit.dataset.stuEdit, 10)); return; }

  /* —— 每堂课记录：删除 —— */
  var stuDelete = e.target.closest('[data-stu-delete]');
  if (stuDelete) { deleteStuNote(parseInt(stuDelete.dataset.stuDelete, 10)); return; }

  /* —— 每堂课记录：移除暂存文件 —— */
  var stuFileRm = e.target.closest('[data-stu-file-remove]');
  if (stuFileRm) {
    STU_PENDING_FILES.splice(parseInt(stuFileRm.dataset.stuFileRemove, 10), 1);
    renderStuPending();
    return;
  }

  /* —— 每堂课记录：上传文件 —— */
  if (e.target.closest('#slCapUpload')) {
    var fileInput = document.getElementById('slCapFile');
    if (fileInput) {
      if (!fileInput._stuBound) {
        fileInput._stuBound = true;
        fileInput.addEventListener('change', function () {
          Array.prototype.forEach.call(fileInput.files, function (f) { STU_PENDING_FILES.push(f.name); });
          fileInput.value = '';
          renderStuPending();
          toast('已添加文件，点「记录」保存', 'ok');
        });
      }
      fileInput.click();
    }
    return;
  }

  var archiveTreeToggle = e.target.closest('[data-archive-tree-toggle]');
  if (archiveTreeToggle) {
    var treeKey = archiveTreeToggle.dataset.archiveTreeToggle;
    ARCHIVE_STATE.collapsedTree[treeKey] = !ARCHIVE_STATE.collapsedTree[treeKey];
    var archiveView = V('t-overview');
    var archiveTree = archiveView && archiveView.querySelector('[data-archive-tree]');
    if (archiveTree) archiveTree.innerHTML = renderArchiveTreeHtml();
    return;
  }

  var archiveLeafBtn = e.target.closest('[data-archive-leaf]');
  if (archiveLeafBtn) {
    renderTeachingArchive(archiveLeafBtn.dataset.archiveLeaf);
    return;
  }

  var semAnchor = e.target.closest('[data-semester-anchor]');
  if (semAnchor) {
    var secEl = document.getElementById('sec-' + semAnchor.dataset.semesterAnchor);
    if (secEl) secEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    var navWrap = semAnchor.closest('.tp-semester-anchors');
    if (navWrap) navWrap.querySelectorAll('[data-semester-anchor]').forEach(function (a) { a.classList.toggle('is-active', a === semAnchor); });
    return;
  }

  var semEdit = e.target.closest('[data-semester-edit]');
  if (semEdit) {
    openSemesterEditor(semEdit.dataset.semesterEdit);
    return;
  }

  var archiveActionBtn = e.target.closest('[data-archive-action]');
  if (archiveActionBtn) {
    var actionLeafId = archiveActionBtn.dataset.archiveLeafId;
    if (archiveActionBtn.dataset.archiveAction === 'add') openArchiveEditor('add', actionLeafId);
    if (archiveActionBtn.dataset.archiveAction === 'edit') openArchiveEditor('edit', actionLeafId);
    if (archiveActionBtn.dataset.archiveAction === 'delete') deleteArchiveRecord(actionLeafId);
    return;
  }

  var archiveRowAction = e.target.closest('[data-archive-record-action]');
  if (archiveRowAction) {
    var leafId = archiveRowAction.dataset.archiveLeafId;
    var recordId = archiveRowAction.dataset.archiveRecordId;
    ARCHIVE_STATE.selectedRecordIds[leafId] = recordId;
    if (archiveRowAction.dataset.archiveRecordAction === 'edit') openArchiveEditor('edit', leafId, recordId);
    if (archiveRowAction.dataset.archiveRecordAction === 'delete') deleteArchiveRecord(leafId, recordId);
    return;
  }

  var archiveRow = e.target.closest('[data-archive-record-select]');
  if (archiveRow && !e.target.closest('[data-archive-record-action]')) {
    ARCHIVE_STATE.selectedRecordIds[archiveRow.dataset.archiveLeafId] = archiveRow.dataset.archiveRecordId;
    renderTeachingArchive(archiveRow.dataset.archiveLeafId);
    return;
  }

  var archiveTab = e.target.closest('[data-archive-target]');
  if (archiveTab) {
    var archive = archiveTab.closest('.tp-archive-shell');
    var target = archiveTab.dataset.archiveTarget;
    archive.querySelectorAll('[data-archive-target]').forEach(function (tab) {
      tab.classList.toggle('is-active', tab === archiveTab);
    });
    archive.querySelectorAll('[data-archive-pane]').forEach(function (pane) {
      pane.classList.toggle('is-active', pane.dataset.archivePane === target);
    });
    return;
  }

  /* —— 表格链接 —— */
  var link = e.target.closest('td.link');
  if (link) {
    var lt = link.textContent.trim();
    var lview = link.closest('.pf-view').dataset.view;
    var lrow = link.closest('tr');
    if (lt === '预览' || lt === '查看' || lt === '在线预览' || lt === '查看全文' || lt === '明细' || lt === '查看反馈') {
      docPreview(lrow.querySelector('td').textContent.trim().slice(0, 40));
    } else if (lt === '查看课程档案') {
      showView('t-courses'); toast('已进入课程教学档案（演示数据以在授 2 门课程为例）');
    } else if (lt === '去填写' || lt === '继续填写') {
      showView('t-reflect'); toast('已定位到《嵌入式系统开发》教学反思填写');
    } else if (lt === '确认入档') {
      confirmClubRow(lrow);
    } else if (lt === '提醒') {
      toast('已向 ' + lrow.querySelector('td').textContent.trim() + ' 发送补交提醒（站内信 + 企业微信）', 'ok');
    } else if (lt === '开始审核' || lt === '继续审核') {
      startReview(lrow.querySelector('td').textContent.trim());
    } else if (lt === '开始评阅') {
      if (lrow.textContent.indexOf('金晓智') > -1) { showView('d-review'); toast('已进入金晓智《单片机应用技术》评阅'); }
      else toast('演示原型以金晓智的评阅为例，其余任务流程相同');
    } else if (lt === '字段映射') {
      modal('字段映射 · ' + lrow.querySelector('td').textContent.trim(), '<table class="ap-table"><thead><tr><th>来源字段</th><th>平台字段</th><th>转换规则</th></tr></thead><tbody><tr><td>KCMC（课程名称）</td><td>course.name</td><td>直通</td></tr><tr><td>PJF（评教分）</td><td>evaluation.score</td><td>百分制归一</td></tr><tr><td>XQDM（学期代码）</td><td>term.code</td><td>码表映射 V3</td></tr></tbody></table>');
    } else if (lt === '处理' || lt === '处理告警') {
      var st = lrow.querySelector('.ap-tag.orange');
      if (st) st.outerHTML = '<span class="ap-tag green">正常</span>';
      flash(lrow);
      toast('字段变更已确认映射，告警闭环', 'ok');
    } else if (lt === '置顶推荐') {
      link.textContent = '取消置顶';
      lrow.querySelector('td').insertAdjacentHTML('beforeend', '<span class="ap-tag" style="margin-left:6px;color:#8a5a0f;background:#fdf0d5">置顶推荐</span>');
      toast('已置顶推荐，室内教师将优先看到该材料', 'ok');
    } else if (lt === '取消置顶') {
      link.textContent = '置顶推荐';
      var gold = lrow.querySelector('td .ap-tag');
      if (gold) gold.remove();
      toast('已取消置顶');
    } else if (lt === '编辑字段' || lt === '继续编辑') {
      modal('模板字段配置 · ' + lrow.querySelector('td').textContent.trim(), '<table class="ap-table"><thead><tr><th>字段</th><th>类型</th><th>必选</th><th>数据来源</th><th>默认可见</th></tr></thead><tbody><tr><td>课程标准</td><td>附件</td><td>是</td><td>教务同步/手动</td><td>全校（锁定）</td></tr><tr><td>教案</td><td>附件</td><td>是</td><td>手动上传</td><td>教研室</td></tr><tr><td>学生评教结果</td><td>数值</td><td>是</td><td>教务接口</td><td>本人+专业主任</td></tr><tr><td>教学反思</td><td>富文本</td><td>是（仅统计提交）</td><td>手动填写</td><td>私有</td></tr></tbody></table><p style="margin:10px 0 0;font-size:12px;color:#8a93a6">演示原型：字段的增删改、排序与启停在实际环境中均可配置。</p>', { okText: '保存模板', onOk: function () { toast('模板已保存并发布新版本', 'ok'); } });
    } else {
      docPreview(lt);
    }
    return;
  }

  /* —— 总览待办 —— */
  var todo = e.target.closest('.tp-todo-item');
  if (todo) {
    if (todo.textContent.indexOf('教学反思') > -1) { showView('t-reflect'); toast('已定位到反思填写表单'); }
    else if (todo.textContent.indexOf('反馈待查看') > -1) { showView('t-feedback'); }
    else if (todo.textContent.indexOf('目标节点') > -1) { showView('t-kpi'); }
    return;
  }

  /* —— 反馈未读条目 —— */
  var tl = e.target.closest('.pf-view[data-view="t-feedback"] .ap-tl-item');
  if (tl && tl.textContent.indexOf('未读') > -1) { markFeedbackRead(); return; }

  /* —— 画像维度溯源 —— */
  var dimRow = e.target.closest('.pf-view[data-view="t-portrait"] tbody tr');
  if (dimRow) {
    var dim = dimRow.querySelector('td').textContent.trim();
    if (TRACE[dim]) modal('赋分溯源 · ' + dim, TRACE[dim]);
    return;
  }

  /* —— chips —— */
  var chip = e.target.closest('.tp-chip');
  if (chip) {
    var cview = chip.closest('.pf-view').dataset.view;
    if (cview === 't-achievements') {
      chip.parentElement.querySelectorAll('.tp-chip').forEach(function (c) { c.classList.remove('on'); });
      chip.classList.add('on');
      var label = chip.textContent.replace(/（\d+）/, '');
      var map = { '教学竞赛': ['教学竞赛'], '指导学生': ['指导学生', '专利'], '教材与课程': ['教材编写'], '教研项目': ['教研项目'] };
      var cats = map[label];
      V('t-achievements').querySelectorAll('.ap-panel tbody tr').forEach(function (r) {
        var cat = r.querySelectorAll('td')[1] ? r.querySelectorAll('td')[1].textContent.trim() : '';
        r.style.display = (!cats || cats.indexOf(cat) > -1) ? '' : 'none';
      });
    } else if (cview === 's-lessons') {
      renderStuFeed(chip.textContent.trim());
    } else if (cview === 's-courses') {
      chip.parentElement.querySelectorAll('.tp-chip').forEach(function (c) { c.classList.remove('on'); });
      chip.classList.add('on');
      toast('已切换到「' + chip.textContent.trim() + '」（演示原型，结构一致）');
    } else if (chip.textContent.indexOf('方程式赛车队') > -1) {
      toast('演示数据以智能小车协会为例；切换社团后档案结构相同');
    }
    return;
  }

  /* —— 上传 dragger —— */
  var fake = e.target.closest('.tp-dragger');
  if (fake) {
    var fview = fake.closest('.pf-view').dataset.view;
    var fname = (fieldVal(fview, '材料名称') || '新上传材料').trim() || '新上传材料';
    var qtb = fake.closest('.pf-view').querySelector('.tp-up-queue tbody');
    if (qtb) {
      var qtr = document.createElement('tr');
      qtr.innerHTML = '<td>' + fname + '.pdf</td><td>按表单归属自动归位</td><td>1.8 MB</td><td><div class="tp-bar" style="width:110px"><i style="width:0%"></i></div></td><td><span class="ap-tag blue">上传中 0%</span></td>';
      qtb.insertBefore(qtr, qtb.firstChild);
      var p = 0, bar = qtr.querySelector('.tp-bar i'), st2 = qtr.querySelector('.ap-tag');
      var timer = setInterval(function () {
        p += 18 + Math.floor(Math.random() * 14);
        if (p >= 100) {
          p = 100; clearInterval(timer);
          qtr.querySelector('.tp-bar').classList.add('green');
          st2.outerHTML = '<span class="ap-tag green">已归档</span>';
          toast('「' + fname + '.pdf」已按规则自动归位并归档', 'ok');
        }
        bar.style.width = p + '%';
        if (st2.parentElement) st2.textContent = '上传中 ' + p + '%';
      }, 320);
    } else {
      toast('已选择文件，填写完表单后点击提交（演示原型）');
    }
    return;
  }

  /* —— 按钮路由 —— */
  var btn = e.target.closest('button');
  if (!btn || btn.id === 'roleSelect') return;
  var bview = btn.closest('.pf-view') ? btn.closest('.pf-view').dataset.view : null;
  if (!bview) return;
  var t = btn.textContent.trim();

  if (t.indexOf('存为草稿') > -1 || t === '暂存') { toast('已保存草稿（自动保存间隔 60 秒）'); return; }
  if (t.indexOf('导出') > -1 || t.indexOf('报表') > -1) { exportToast(t.replace('+', '').trim()); return; }

  switch (bview) {
    case 't-overview':
      if (t.indexOf('上传材料') > -1) { showView('t-courses'); toast('请在课程教学档案的「上传课程材料」中上传'); }
      break;
    case 't-courses':
      if (t.indexOf('上传课程材料') > -1) {
        var upH = Array.prototype.slice.call(V('t-courses').querySelectorAll('.ap-panel-head h2')).filter(function (h) { return h.textContent.indexOf('上传课程材料') > -1; })[0];
        if (upH) upH.scrollIntoView({ block: 'start' });
        toast('请在「上传课程材料」中选择类型并上传');
      } else if (t === '提交归档') {
        var nm = fieldVal('t-courses', '材料名称');
        if (!nm || !nm.trim()) { toast('请填写材料名称（必填）', 'warn'); return; }
        var vis = V('t-courses').querySelector('input[name="tpv"]:checked').parentElement.textContent.trim();
        var qtb = V('t-courses').querySelector('.tp-up-queue tbody');
        var qtr = document.createElement('tr');
        qtr.innerHTML = '<td>' + nm + '</td><td>《嵌入式系统开发》· ' + fieldVal('t-courses', '材料类型') + '</td><td>1.2 MB</td><td><div class="tp-bar green" style="width:110px"><i style="width:100%"></i></div></td><td><span class="ap-tag green">已归档</span></td>';
        qtb.insertBefore(qtr, qtb.firstChild); flash(qtr);
        clearField('t-courses', '材料名称');
        toast('「' + nm + '」已归档至本课程（可见范围：' + vis + '）', 'ok');
      } else if (t.indexOf('批量导入') > -1) {
        modal('从教务系统批量导入', '<p>检测到教务系统中有以下材料可一键导入（已自动去重）：</p><label style="display:block;margin:8px 0"><input type="checkbox" checked /> 2025-2026-2《单片机应用技术》课程标准</label><label style="display:block;margin:8px 0"><input type="checkbox" checked /> 2025-2026-2 教学进度表（2 门课程）</label><label style="display:block;margin:8px 0"><input type="checkbox" checked /> 2025-2026-1 学生评教结果明细</label>', { okText: '导入 3 份', onOk: function () { toast('已导入 3 份教务材料并自动归位，无需手动填报', 'ok'); } });
      } else if (t === '选择文件') { /* dragger 已处理 */ }
      break;
    case 't-reflect':
      if (t === '提交归档') completeReflect();
      else if (t.indexOf('新建总结') > -1) toast('表单已就绪，填写后提交即可');
      break;
    case 't-achievements':
      if (t === '提交核验') {
        var an = fieldVal('t-achievements', '成果名称');
        if (!an || !an.trim()) { toast('请填写成果名称', 'warn'); return; }
        var atb = V('t-achievements').querySelectorAll('.ap-panel')[1].querySelector('tbody');
        var atr = document.createElement('tr');
        atr.innerHTML = '<td>' + an + '</td><td>' + fieldVal('t-achievements', '成果类别').slice(0, 4) + '</td><td>' + fieldVal('t-achievements', '赛事分级') + ' · ' + fieldVal('t-achievements', '获奖等级') + ' · ' + fieldVal('t-achievements', '本人角色') + '</td><td>' + (fieldVal('t-achievements', '取得时间') || TODAY.slice(0, 7)) + '</td><td><b style="color:var(--blue)">待核验</b></td><td class="link">补传佐证</td><td><span class="ap-tag orange">学院核验中</span></td>';
        atb.insertBefore(atr, atb.firstChild); flash(atr);
        clearField('t-achievements', '成果名称');
        toast('成果已提交学院核验；核验通过后将按校级标准自动赋分，并回填命中的团队目标', 'ok', 3800);
      } else if (t.indexOf('申报材料包') > -1) {
        modal('生成申报材料包', '<p>选择申报场景，系统按模板自动归集已核验成果与佐证：</p><label style="display:block;margin:8px 0"><input type="radio" name="pkg" checked /> 职称评审（副高 → 正高）</label><label style="display:block;margin:8px 0"><input type="radio" name="pkg" /> 省级教学成果奖</label><label style="display:block;margin:8px 0"><input type="radio" name="pkg" /> 教学创新团队申报</label>', { okText: '生成', onOk: function () { exportToast('申报材料包'); } });
      }
      break;
    case 't-club':
    case 't-coop':
      if (t.indexOf('上传材料') > -1) { toast('请在本' + (bview === 't-club' ? '社团' : '工程师班') + '档案内登记上传（演示原型）'); }
      break;
    case 't-feedback':
      if (t.indexOf('提交学年档案审核') > -1) toast('2025-2026 学年档案已处于「专业主任审核中」状态', 'warn');
      break;
    case 't-visibility':
      if (t === '保存设置') toast('开放范围策略已保存，对之后上传的材料生效', 'ok');
      break;
    case 's-space':
      break;
    case 's-courses':
      if (t.indexOf('进入记录') > -1) {
        var card = btn.closest('.ap-mini-card');
        renderStuFeed(card && card.querySelector('h4') ? card.querySelector('h4').textContent.trim() : '全部');
        showView('s-lessons');
      } else if (t.indexOf('每堂课记录') > -1) { showView('s-lessons'); }
      break;
    case 's-lessons':
      if (t === '记录') { addStuNote(); }
      else if (t.indexOf('我的课程档案') > -1) { showView('s-courses'); }
      break;
    case 's-cases':
      if (t === '提交案例') {
        var ct = fieldVal('s-cases', '问题标题');
        if (!ct || !ct.trim()) { toast('请填写问题标题', 'warn'); return; }
        var sol = fieldVal('s-cases', '解决方案') || '（待补充）';
        var src = fieldVal('s-cases', '来源') || '专业群 · 智能车竞赛';
        var srcTag = src.indexOf('课程') > -1 ? 'blue' : 'gray';
        var ctb = V('s-cases').querySelectorAll('.ap-panel')[0].querySelector('tbody');
        var ctr = document.createElement('tr');
        ctr.innerHTML = '<td>' + ct + '</td><td><span class="ap-tag ' + srcTag + '">' + src + '</span></td><td>' + sol.slice(0, 30) + (sol.length > 30 ? '…' : '') + '</td><td>王梓萌（我）· 2024级</td><td>0</td><td class="link">查看全文</td>';
        ctb.insertBefore(ctr, ctb.firstChild); flash(ctr);
        clearField('s-cases', '问题标题');
        toast('案例已入库，下届队员可检索复用 — 这就是传承', 'ok');
      } else if (t.indexOf('记录新案例') > -1) toast('请在下方表单填写案例');
      break;
    case 'p-review':
      if (t === '发送反馈') sendFeedback();
      break;
    case 'p-board':
      if (t.indexOf('一键提醒') > -1) toast('已向 3 位未达标教师发送补交提醒（站内信 + 企业微信）', 'ok');
      break;
    case 'd-review':
      if (t.indexOf('提交评阅') > -1) submitSupervise();
      break;
    case 'a-integration':
      if (t.indexOf('新增接口') > -1) {
        modal('新增数据接口', '<div class="meta"><b>来源系统</b><span><input class="tp-inline-select" style="width:100%" placeholder="如：图书馆系统"/></span><b>同步数据</b><span><input class="tp-inline-select" style="width:100%" placeholder="如：教师著作借阅引用数据"/></span><b>同步频率</b><span><select class="tp-inline-select"><option>每日</option><option>每周</option><option>每月</option></select></span></div>', { okText: '提交对接申请', onOk: function () { toast('对接申请已提交信息中心排期', 'ok'); } });
      }
      break;
    case 'sys-accounts':
      if (t.indexOf('角色授权') > -1) {
        modal('角色授权', '<div class="meta"><b>用户</b><span><input class="tp-inline-select" style="width:100%" placeholder="搜索工号 / 姓名"/></span><b>授予角色</b><span><select class="tp-inline-select" style="width:100%"><option>团队负责人</option><option>产业导师</option><option>校级管理部门</option></select></span><b>生效范围</b><span><input class="tp-inline-select" style="width:100%" placeholder="如：物联网应用创新团队"/></span></div>', { okText: '授权', onOk: function () {
          var stb = V('sys-accounts').querySelectorAll('.ap-panel')[1].querySelector('tbody');
          var str = document.createElement('tr');
          str.innerHTML = '<td>' + TODAY + '</td><td>授予「团队负责人」角色（演示授权）</td><td>管理员-张三</td>';
          stb.insertBefore(str, stb.firstChild); flash(str);
          toast('授权完成，操作已留痕审计', 'ok');
        } });
      }
      break;
  }
});

/* —— change 委托：评分联动 / 切换提示 —— */
document.addEventListener('change', function (e) {
  if (e.target.id === 'roleSelect') return;
  var view = e.target.closest('.pf-view') ? e.target.closest('.pf-view').dataset.view : null;
  if (!view) return;
  if (view === 't-overview' && e.target.closest('[data-semester-term]')) {
    SEMESTER_STATE.termId = e.target.value;
    var firstCourse = semesterCoursesForTerm(SEMESTER_STATE.termId)[0];
    SEMESTER_STATE.courseId = firstCourse ? firstCourse.id : '';
    renderTeachingArchive('teaching-semester');
    return;
  }
  if (view === 't-overview' && e.target.closest('[data-semester-course]')) {
    SEMESTER_STATE.courseId = e.target.value;
    renderTeachingArchive('teaching-semester');
    return;
  }
  if (view === 'd-review' && e.target.tagName === 'SELECT' && e.target.closest('tbody')) { recalcSupervisor(); return; }
  if (view === 't-courses' && e.target.tagName === 'SELECT' && e.target.closest('.ap-actions')) {
    toast('已切换至「' + e.target.value + '」（演示数据以 2025-2026 学年为例）');
    return;
  }
  if (view === 't-visibility' && e.target.tagName === 'SELECT') {
    toast('默认可见范围已调整为「' + e.target.value + '」，保存后生效');
    return;
  }
});

/* —— 案例库搜索过滤 —— */
document.addEventListener('input', function (e) {
  var archiveFilter = e.target.closest('[data-archive-filter]');
  if (archiveFilter) {
    ARCHIVE_STATE.filter = archiveFilter.value.trim();
    var ov = V('t-overview');
    var tree = ov && ov.querySelector('[data-archive-tree]');
    if (tree) tree.innerHTML = renderArchiveTreeHtml();
    return;
  }
  if (e.target.placeholder && e.target.placeholder.indexOf('搜索问题关键词') > -1) {
    var q = e.target.value.trim();
    V('s-cases').querySelectorAll('.ap-panel')[0].querySelectorAll('tbody tr').forEach(function (r) {
      r.style.display = (!q || r.textContent.indexOf(q) > -1) ? '' : 'none';
    });
  }
});

/* —— 同步时间刷新（课程档案手动同步） —— */
document.addEventListener('click', function (e) {
  var act = e.target.closest('.tp-sync-act');
  if (!act) return;
  var bar = act.closest('.tp-sync');
  toast('正在从教务系统同步…');
  setTimeout(function () {
    bar.firstChild.textContent = '⟳ 已从教务系统自动同步：开课信息 2 门、课表、学生评教结果（最近同步 ' + TODAY + ' ' + new Date().toTimeString().slice(0, 5) + '）';
    toast('同步完成，无新增差异', 'ok');
  }, 1200);
});

initArchiveCatalog();
renderTeachingArchive('basic-profile');
mountForRole(CURRENT_ROLE);
