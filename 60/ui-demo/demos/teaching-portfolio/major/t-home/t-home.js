/* ===================== 渲染 ===================== */
function renderPerformance() {
  document.getElementById('perfList').innerHTML = PERFORMANCE_ITEMS.map(function (it) {
    return '<div class="th-perf-item">' +
      '<span class="th-perf-item__label">' + it.label + '</span>' +
      '<strong class="th-perf-item__value">' + it.value + '<small>' + it.unit + '</small></strong>' +
      '</div>';
  }).join('');
}

function renderCourseStats(period) {
  var f = PERIOD_FACTORS[period];
  var palette = ['#6D77F7', '#2ED2CC', '#FDBA4B', '#9270E8', '#FF895F'];
  var rows = COURSE_STATS.map(function (it, idx) {
    return { name: it.name, value: Math.max(1, Math.round(it.value * f)), color: palette[idx % palette.length] };
  });
  var max = Math.max.apply(null, rows.map(function (r) { return r.value; }));
  document.getElementById('courseBars').innerHTML = rows.map(function (r) {
    var w = (r.value / max * 100).toFixed(1);
    return '<div class="th-bar-row">' +
      '<span class="th-bar-row__name">' + r.name + '</span>' +
      '<div class="th-bar-area">' +
        '<div class="th-bar-track"></div>' +
        '<div class="th-bar-fill" style="width:' + w + '%;background:' + r.color + '"></div>' +
        '<span class="th-bar-val" style="left:calc(' + w + '% + 8px)">' + r.value + ' 门</span>' +
      '</div></div>';
  }).join('');
}

function renderGuidance(period) {
  var f = PERIOD_FACTORS[period];
  var items = GUIDANCE_STATS.map(function (it) {
    var c = Math.round(it.count * f);
    return { name: it.name, count: c, unit: it.unit, color: it.color };
  });
  var total = items.reduce(function (s, it) { return s + it.count; }, 0);
  var p1 = total ? Math.round(items[0].count / total * 100) : 0;
  var gradient = 'conic-gradient(' + items[0].color + ' 0 ' + p1 + '%, ' + items[1].color + ' ' + p1 + '% 100%)';
  document.getElementById('guidanceDonut').style.background = gradient;
  document.getElementById('guidanceDonut').innerHTML =
    '<div><strong>' + total + '</strong><span>学生总数</span></div>';
  document.getElementById('guidanceLegend').innerHTML = items.map(function (it) {
    var pct = total ? Math.round(it.count / total * 100) : 0;
    return '<div class="th-legend__item"><i style="background:' + it.color + '"></i>' +
      '<b>' + it.name + ' ' + it.count + it.unit + '</b><span class="pct">' + pct + '%</span></div>';
  }).join('');
}

function renderResearch(period) {
  var f = PERIOD_FACTORS[period];
  document.getElementById('researchCards').innerHTML = RESEARCH_STATS.map(function (it) {
    var v = Math.max(1, Math.round(it.value * f));
    return '<div class="th-rcard ' + it.cls + '">' +
      '<span class="th-rcard__name">' + it.name + '</span>' +
      '<div class="th-rcard__bottom">' +
        '<span class="th-rcard__val">' + v + '<small>' + it.unit + '</small></span>' +
        '<span class="th-rcard__pct">占比 ' + it.percent.toFixed(1) + '%</span>' +
      '</div></div>';
  }).join('');
}

function renderCourses(term) {
  var list = COURSES_BY_TERM[term] || [];
  var rows = list.map(function (c) {
    return '<tr>' +
      '<td><strong>' + c.name + '</strong></td>' +
      '<td>' + c.totalHours + '</td>' +
      '<td>' + c.remainingHours + '</td>' +
      '<td class="th-course-row__action"><button class="th-link-btn" type="button" onclick="notify(\'正在打开课程详情：' + c.name + '\')">详情</button></td>' +
      '</tr>';
  }).join('');
  document.getElementById('courseTable').innerHTML =
    '<table class="ap-table">' +
    '<thead><tr><th>课程名称</th><th>总课时</th><th>剩余课时</th><th>操作</th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table>';
}

function renderCompleteness() {
  var completed = COMPLETENESS_DATA.reduce(function (s, d) { return s + d[1]; }, 0);
  var required = COMPLETENESS_DATA.reduce(function (s, d) { return s + d[2]; }, 0);
  var rate = Math.round(completed / required * 100);
  var C = 2 * Math.PI * 52;
  var ring = document.getElementById('ringValue');
  ring.style.strokeDasharray = (rate / 100 * C).toFixed(2) + ' ' + C.toFixed(2);
  document.getElementById('ringPct').textContent = rate + '%';
  document.getElementById('compList').innerHTML = COMPLETENESS_DATA.map(function (d) {
    var v = Math.round(d[1] / d[2] * 100);
    return '<div class="th-comp-item"><span>' + d[0] + '</span>' +
      '<i><b style="width:' + v + '%"></b></i>' +
      '<strong>' + v + '%</strong></div>';
  }).join('');
}

/* ===================== 交互 ===================== */
function onPeriod(v) { renderCourseStats(v); renderGuidance(v); renderResearch(v); }
function onTerm(v) { renderCourses(v); }

function notify(msg) {
  var wrap = document.querySelector('.pf-toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'pf-toast-wrap';
    document.body.appendChild(wrap);
  }
  var el = document.createElement('div');
  el.className = 'pf-toast ok';
  el.textContent = msg;
  wrap.appendChild(el);
  requestAnimationFrame(function () { el.classList.add('show'); });
  setTimeout(function () { el.remove(); }, 1600);
}

/* ===================== 初始化 ===================== */
renderPerformance();
renderCourseStats('5y');
renderGuidance('5y');
renderResearch('5y');
renderCourses('2025-2026-spring');
renderCompleteness();
