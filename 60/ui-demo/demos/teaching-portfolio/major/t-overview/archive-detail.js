/* 我的教学档案 · 档案详情 SPA（页内视图切换，不整页刷新） */
(function () {
  var ARCHIVE_DATA = {
    "基本信息": {
      // 基本信息详情页采用「左侧头像卡 + 右侧分组常展示 + 编辑抽屉」的布局，
      // 与其余 7 个档案的锚点布局不同，由 buildBasicInfo() 单独渲染。
      detail: "basicInfo",
      title: "基本信息",
      summary: "个人基础信息、任职资格与基本档案",
      // 左侧固定头像卡
      profile: {
        name: "金晓智",
        jobNo: "20150234",
        college: "电子与通信工程学院",
        title: "副教授",
        avatarColor: "#3565ea"
      },
      groups: [
        { key: "base", title: "基本信息", source: "人事系统", items: [
          { label: "职工号", value: "20150234" },
          { label: "姓名", value: "金晓智" },
          { label: "性别", value: "男" },
          { label: "年龄", value: "39" },
          { label: "出生年月", value: "1986-03" },
          { label: "民族", value: "汉族" },
          { label: "政治面貌", value: "中共党员" },
          { label: "所属部门", value: "电子与通信工程学院" },
          { label: "岗位类型", value: "专任教师（教学科研型）" },
          { label: "初次来校时间", value: "2015-07" },
          { label: "专任教师类型", value: "专任教师" },
          { label: "联系方式", value: "0755-2603**** / jinxz@****.edu.cn" }
        ] },
        { key: "study", title: "学习信息", source: "人事系统", items: [
          { label: "最高学历", value: "博士研究生" },
          { label: "学位类型", value: "工学博士" },
          { label: "毕业院校", value: "华南理工大学" },
          { label: "毕业专业", value: "信息与通信工程" },
          { label: "海外学习经历", value: "2023-10 至 2024-04，英国伦敦大学学院访学" }
        ] },
        { key: "title", title: "职称信息", source: "人事系统", items: [
          { label: "当前职称", value: "副教授" },
          { label: "职称等级", value: "教授系列副高" },
          { label: "评审时间", value: "2021-12" },
          { label: "评审单位", value: "深圳职业技术大学" }
        ] },
        { key: "cert", title: "资格证书信息", source: "人事系统", subGroups: [
          { title: "高等学校教师资格证", held: true, items: [
            { label: "证书编号", value: "201544017***0008" },
            { label: "发证单位", value: "广东省教育厅" },
            { label: "取得时间", value: "2016-09" },
            { label: "附件", value: "教师资格证.pdf", type: "file" }
          ] },
          { title: "双师型教师认定", held: true, items: [
            { label: "证书编号", value: "SZ-SS-2024-0231" },
            { label: "发证单位", value: "广东省教育厅职教处" },
            { label: "取得时间", value: "2024-06" },
            { label: "认定等级", value: "高级" },
            { label: "附件", value: "双师型认定.pdf", type: "file" }
          ] },
          { title: "技能等级证书", held: false, items: [] },
          { title: "行业资质证书", held: true, items: [
            { label: "证书编号", value: "RC-2019-1142" },
            { label: "发证单位", value: "中国通信工业协会" },
            { label: "取得时间", value: "2019-03" },
            { label: "附件", value: "行业资质证.pdf", type: "file" }
          ] },
          { title: "职业资格证书", held: false, items: [] },
          { title: "技能证书", held: true, items: [
            { label: "证书编号", value: "SC-2022-5567" },
            { label: "发证单位", value: "人社部职业技能鉴定中心" },
            { label: "取得时间", value: "2022-11" },
            { label: "附件", value: "技能证书.pdf", type: "file" }
          ] }
        ] },
        { key: "dev", title: "个人发展信息", source: "教学档案袋维护", items: [
          { label: "个人成长规划", value: "聚焦集成电路测试与智能传感方向，三年内冲击省级教学创新团队，建设 1 门省级在线精品课程。", type: "full" },
          { label: "专业领域", value: "嵌入式系统、智能硬件、集成电路测试", type: "full" },
          { label: "专业特长", value: "硬件在环测试、低功耗电路设计、产教融合实训课程开发", type: "full" }
        ] }
      ]
    },
    "教学信息": {
      detail: "teachingInfo",
      title: "教学信息",
      summary: "授课课程、教学任务与课堂教学记录",
      groups: [
        { title: "教育初心及育人理念", source: "档案袋维护", items: [
          { label: "教育初心", value: "以学生成长为中心，推动职业教育教学质量提升" },
          { label: "育人理念", value: "知识传授与能力培养并重，注重职业素养与创新意识" }
        ] },
        { title: "课程基本信息", source: "教务系统", items: [
          { label: "课程名称", value: "嵌入式系统开发" },
          { label: "课程性质", value: "专业核心课" },
          { label: "授课班级", value: "电子信息 2024 级 1 班" },
          { label: "总学时", value: "96" }
        ] },
        { title: "教学设计与实施", source: "教务系统", items: [
          { label: "教学目标", value: "培养学生掌握嵌入式系统设计、调试及应用能力" },
          { label: "教学方法", value: "项目驱动 + 案例教学 + 线上线下混合" },
          { label: "课程思政", value: "树立工匠精神与责任意识" }
        ] },
        { title: "教学效果", source: "教务系统", items: [
          { label: "平均评教", value: "94.1 分" },
          { label: "学生成绩", value: "优秀率 38%" },
          { label: "课堂反馈", value: "课程内容与实训要求匹配度较高" }
        ] }
      ]
    },
    "企业实践": {
      detail: "enterprisePractice",
      title: "企业实践",
      summary: "企业锻炼、挂职实践与产学合作经历",
      groups: [
        { title: "企业实践记录", source: "人事系统", items: [
          { label: "企业名称", value: "联科精密电子股份有限公司" },
          { label: "企业统一信用代码", value: "91440300MA5K1C8X6L" },
          { label: "所属行业", value: "电子信息制造" },
          { label: "实践开始日期", value: "2024-07-01" },
          { label: "实践结束日期", value: "2024-08-30" },
          { label: "实践岗位", value: "硬件测试工程师" },
          { label: "实践内容", value: "参与智能硬件测试流程、生产现场工艺诊断与岗位能力调研" },
          { label: "实践成果", value: "完成智能硬件测试流程优化方案" },
          { label: "转化内容", value: "更新课程项目案例与企业真实测试任务单" },
          { label: "附件", value: "企业实践鉴定表.pdf" }
        ] }
      ]
    },
    "成果与荣誉": {
      detail: "achievementsHonors",
      title: "成果与荣誉",
      summary: "教学科研成果、获奖与荣誉称号",
      groups: [
        { title: "教学成果", source: "教务系统", items: [
          { label: "成果名称", value: "《嵌入式系统开发》课程改革项目" },
          { label: "获奖级别", value: "校级优秀教学成果奖" },
          { label: "获奖年份", value: "2025" }
        ] }
      ]
    },
    "进修（访学）培训": {
      title: "进修（访学）培训",
      summary: "进修访学、专业培训与学习提升经历",
      detail: "training",
      groups: [
        { title: "培训记录", source: "教务系统", items: [
          { label: "培训名称", value: "职业教育教学创新研修" },
          { label: "培训机构", value: "教育部职业院校教师素质提高计划" },
          { label: "培训时长", value: "120 学时" }
        ] }
      ]
    },
    "社会服务与影响力": {
      title: "社会服务与影响力",
      summary: "社会服务、技术服务与行业影响力",
      detail: "socialService",
      groups: [
        { title: "社会服务记录", source: "人事系统", items: [
          { label: "服务项目", value: "智能制造实训基地建设" },
          { label: "服务对象", value: "深圳市中小企业" },
          { label: "影响范围", value: "覆盖 12 家企业" }
        ] }
      ]
    },
    "任职情况": {
      title: "任职情况",
      summary: "职务任职、岗位聘任与履职情况",
      detail: "appointment",
      groups: [
        { title: "任职记录", source: "教务系统", items: [
          { label: "任职部门", value: "电子与通信工程学院" },
          { label: "职务", value: "课程群负责人" },
          { label: "任职时间", value: "2022-09 至今" }
        ] }
      ]
    },
    "其他教育工作": {
      title: "其他教育工作",
      summary: "其他与教育教学相关的工作材料",
      detail: "otherEducation",
      groups: [
        { title: "其他教育工作", source: "教务系统", items: [
          { label: "工作名称", value: "第二课堂实践项目" },
          { label: "工作内容", value: "组织学生参加电子设计竞赛训练" },
          { label: "成果", value: "获得校级一等奖" }
        ] }
      ]
    }
  };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;");
  }

  function fieldHtml(label, value) {
    var text = value == null || value === "" ? "–" : esc(value);
    return '<div class="ds-readonly-field"><span class="ds-readonly-field__label"><span>' + esc(label) + '</span></span><div class="ds-readonly-field__content">' + text + '</div></div>';
  }

  function groupHtml(group) {
    var items = (group.items || []).map(function (item) {
      return fieldHtml(item.label, item.value);
    }).join("");
    return '<div class="tad-sub"><div class="tad-sub__head"><span class="tad-sub__t">' + esc(group.title) + '</span>' + (group.source ? '<span class="tad-sub__src">' + esc(group.source) + '</span>' : "") + '</div><div class="ds-readonly-form ds-readonly-form--2-column"><div class="ds-readonly-form__grid">' + items + '</div></div></div>';
  }

  var BACK_ICON = '<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M4.5666184640625005 6.416479784374999H11.6669521640625V7.583146584375H4.5666184640625005L7.6956181640625 10.712146784375L6.8707852640625 11.536979684375L2.3336181640625 6.999813084375L6.8707852640625 2.462646484375L7.6956181640625 3.287479874375L4.5666184640625005 6.416479784374999Z" fill="currentColor" /></svg>';

  function build(folder) {
    var cat = ARCHIVE_DATA[folder];
    if (!cat) return "";

    var sections = (cat.groups || []).map(function (group, index) {
      return '<section class="tad-sec" id="tad-sec-' + index + '">' +
        '<div class="ds-group-title" role="heading" aria-level="2"><div class="ds-group-title__main"><span class="ds-group-title__text">' + esc(group.title) + '</span></div>' + (group.source ? '<div class="ds-group-title__extra">' + esc(group.source) + '</div>' : "") + '</div>' +
        '<div class="tad-sec__body">' + groupHtml(group) + '</div>' +
        '</section>';
    }).join("");

    var anchors = (cat.groups || []).map(function (group, index) {
      return '<li class="ds-anchor__item' + (index === 0 ? ' is-active' : '') + '" style="--ds-anchor-depth: 0" data-sid="tad-sec-' + index + '"><a class="ds-anchor__link" href="#tad-sec-' + index + '"><span>' + esc(group.title) + '</span></a></li>';
    }).join("");

    return '<header class="ds-sub-page-header ds-sub-page-header--surface">' +
      '<button class="ds-sub-page-header__back" type="button" aria-label="返回" data-archive-back><span class="ds-sub-page-header__back-icon">' + BACK_ICON + '</span><span class="ds-sub-page-header__back-label">返回</span></button>' +
      '<span class="ds-sub-page-header__divider" aria-hidden="true"></span>' +
      '<div class="ds-sub-page-header__title-wrap"><h1 class="ds-sub-page-header__title">' + esc(cat.title) + '</h1></div></header>' +
      '<div class="tad-shell"><div class="tad-main">' + sections + '</div>' +
      '<aside class="tad-aside"><nav class="ds-anchor ds-anchor--vertical ds-anchor--bordered ds-anchor--offset" aria-label="分组锚点"><ol class="ds-anchor__list">' + anchors + '</ol></nav></aside></div>';
  }

  var home, detail, io, savedScroll = 0;

  function scrollEl() {
    var hosts = [].slice.call(document.querySelectorAll('*'));
    for (var i = 0; i < hosts.length; i++) {
      if (hosts[i].shadowRoot && hosts[i].shadowRoot.querySelector('.frame2-content')) {
        return hosts[i].shadowRoot.querySelector('.frame2-content');
      }
    }
    return document.scrollingElement || document.documentElement;
  }

  function setupSpy() {
    if (io) {
      io.disconnect();
      io = null;
    }
    var anchors = [].slice.call(detail.querySelectorAll('.ds-anchor__item'));
    var map = {};
    anchors.forEach(function (a) {
      var s = a.getAttribute('data-sid');
      if (s) map[s] = a;
    });
    var secs = [].slice.call(detail.querySelectorAll('.tad-sec'));
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) {
            anchors.forEach(function (a) {
              a.classList.remove('is-active');
            });
            if (map[e.target.id]) {
              map[e.target.id].classList.add('is-active');
            }
          }
        });
      }, { rootMargin: '-8% 0px -80% 0px' });
      secs.forEach(function (s) {
        io.observe(s);
      });
    }
  }

  function ensure() {
    if (!home) {
      home = document.getElementById('archiveHome');
      detail = document.getElementById('archiveDetail');
    }
  }

  function openDetail(folder) {
    ensure();
    // 「基本信息」为独立一级详情页，整页跳转而非页内 SPA
    var cat = ARCHIVE_DATA[folder];
    if (cat && cat.detail === 'basicInfo') {
      window.location.href = 'basic-info.html';
      return;
    }
    if (cat && cat.detail === 'teachingInfo') {
      window.location.href = 'teaching-info.html';
      return;
    }
    if (cat && cat.detail === 'enterprisePractice') {
      window.location.href = 'enterprise-practice.html';
      return;
    }
    if (cat && cat.detail === 'achievementsHonors') {
      window.location.href = 'achievements-honors.html';
      return;
    }
    if (cat && cat.detail === 'training') {
      window.location.href = 'training.html';
      return;
    }
    if (cat && cat.detail === 'socialService') {
      window.location.href = 'social-service.html';
      return;
    }
    if (cat && cat.detail === 'appointment') {
      window.location.href = 'appointment.html';
      return;
    }
    if (cat && cat.detail === 'otherEducation') {
      window.location.href = 'other-education.html';
      return;
    }
    var html = build(folder);
    if (!html) return;
    savedScroll = scrollEl().scrollTop || 0;
    detail.innerHTML = html;
    home.hidden = true;
    detail.hidden = false;
    scrollEl().scrollTop = 0;
    setupSpy();
  }

  function closeDetail() {
    ensure();
    detail.hidden = true;
    home.hidden = false;
    detail.innerHTML = '';
    if (io) {
      io.disconnect();
      io = null;
    }
    scrollEl().scrollTop = savedScroll;
  }

  document.__openArchiveDetail = openDetail;
  document.__closeArchiveDetail = closeDetail;
  window.__openArchiveDetail = openDetail;
  window.__closeArchiveDetail = closeDetail;

  document.addEventListener('click', function (e) {
    var card = e.target.closest('.tpd-fcard');
    if (card) {
      e.preventDefault();
      openDetail(card.dataset.folder);
      return;
    }

    var back = e.target.closest('[data-archive-back]');
    if (back) {
      e.preventDefault();
      closeDetail();
      return;
    }

    var link = e.target.closest('.ds-anchor__link');
    if (link && link.getAttribute('href') && link.getAttribute('href').charAt(0) === '#') {
      e.preventDefault();
      var target = document.getElementById(link.getAttribute('href').slice(1));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
})();
