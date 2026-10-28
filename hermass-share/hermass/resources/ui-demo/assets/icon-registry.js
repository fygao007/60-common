(function () {
  const scriptUrl = document.currentScript?.src || "";
  const iconPath = scriptUrl ? new URL("./icons/", scriptUrl).href : "./assets/icons/";
  const icons = {
    search: "search-line.svg",
    home: "home-fill.svg",
    prepare: "archive-2-fill.svg",
    master: "master-fill.svg",
    doctor: "doctor-fill.svg",
    camp: "tent-fill.svg",
    recommend: "quill-pen-ai-fill.svg",
    hkmt: "gangaotai-fill.svg",
    exam: "应用.svg",
    skin: "t-shirt-2-line.svg",
    download: "download-line.svg",
    settings: "settings-line.svg",
    refresh: "refresh.png",
    fullscreen: "fullscreen.png",
    closeAllTabs: "close-all-tabs.png",
    arrowDown: "arrow-down-s-line.svg",
    calendar: "calendar-line.svg",
    clock: "time-line.png",
    uploadCloud: "upload-cloud-2-line.svg"
  };

  const inlineIcons = {
    collapse: '<span class="collapse-mark" aria-hidden="true"><span class="collapse-line"></span><span class="collapse-arrow"></span></span>',
    chevronUp: '<svg viewBox="0 0 16 16" fill="none"><path d="m4 10 4-4 4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chevronDown: '<svg viewBox="0 0 16 16" fill="none"><path d="m4 6 4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chevronRight: '<svg viewBox="0 0 16 16" fill="none"><path d="m6 4 4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    homeOutline: '<svg viewBox="0 0 18 18" fill="none"><path d="M3.375 7.425 9 3.05l5.625 4.375v7.2a.75.75 0 0 1-.75.75h-9.75a.75.75 0 0 1-.75-.75v-7.2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M7.125 15.375v-4.5h3.75v4.5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    flow: '<svg viewBox="0 0 16 16" fill="none"><path d="M4.11349629375,11.9999660390625C4.39576239375,11.1999921390625,5.15185139375,10.6649990390625,6.00016309375,10.6649990390625C6.84847399375,10.6649990390625,7.60456369375,11.1999921390625,7.88682939375,11.9999660390625L14.66683009375,11.9999660390625L14.66683009375,13.3333000390625L7.88682939375,13.3333000390625C7.60456369375,14.1332730390625,6.84847449375,14.6682660390625,6.00016309375,14.6682660390625C5.15185169375,14.6682660390625,4.39576289375,14.1332730390625,4.11349629375,13.3333000390625L1.33349609375,13.3333000390625L1.33349609375,11.9999660390625L4.11349629375,11.9999660390625ZM8.11349629375,7.3332991390625C8.395762393750001,6.5333252390625,9.15185169375,5.9983325390625,10.00016309375,5.9983325390625C10.84847449375,5.9983325390625,11.60456309375,6.5333252390625,11.88682909375,7.3332991390625L14.66683009375,7.3332991390625L14.66683009375,8.666632639062499L11.88682909375,8.666632639062499C11.60456309375,9.4666061390625,10.84847449375,10.0015993390625,10.00016309375,10.0015993390625C9.15185169375,10.0015993390625,8.395762393750001,9.4666061390625,8.11349629375,8.666632639062499L1.33349609375,8.666632639062499L1.33349609375,7.3332991390625L8.11349629375,7.3332991390625ZM4.11349629375,2.6666324390625C4.39576239375,1.8666582090625,5.15185139375,1.3316650390625,6.00016309375,1.3316650390625C6.84847399375,1.331664959589638,7.60456369375,1.8666585690625,7.88682939375,2.6666324390625L14.66683009375,2.6666324390625L14.66683009375,3.9999656390625L7.88682939375,3.9999656390625C7.60456369375,4.7999396390625,6.84847449375,5.3349332390625,6.00016309375,5.3349332390625C5.15185169375,5.3349332390625,4.39576289375,4.7999396390625,4.11349629375,3.9999656390625L1.33349609375,3.9999656390625L1.33349609375,2.6666324390625L4.11349629375,2.6666324390625ZM6.00016309375,3.9999656390625C6.36835289375,3.9999656390625,6.66682959375,3.7014889390625,6.66682959375,3.3332991390625C6.66682959375,2.9651092390625,6.36835289375,2.6666324390625,6.00016309375,2.6666324390625C5.63197279375,2.6666324390625,5.33349609375,2.9651092390625,5.33349609375,3.3332991390625C5.33349609375,3.7014889390625,5.63197279375,3.9999656390625,6.00016309375,3.9999656390625ZM10.00016309375,8.666632639062499C10.36835289375,8.666632639062499,10.66683009375,8.3681559390625,10.66683009375,7.9999656390625C10.66683009375,7.6317758390625,10.36835289375,7.3332991390625,10.00016309375,7.3332991390625C9.63197329375,7.3332991390625,9.33349609375,7.6317758390625,9.33349609375,7.9999656390625C9.33349609375,8.3681559390625,9.63197329375,8.666632639062499,10.00016309375,8.666632639062499ZM6.00016309375,13.3333000390625C6.36835289375,13.3333000390625,6.66682959375,13.0348220390625,6.66682959375,12.6666330390625C6.66682959375,12.2984430390625,6.36835289375,11.9999660390625,6.00016309375,11.9999660390625C5.63197279375,11.9999660390625,5.33349609375,12.2984430390625,5.33349609375,12.6666330390625C5.33349609375,13.0348220390625,5.63197279375,13.3333000390625,6.00016309375,13.3333000390625Z" fill="currentColor"/></svg>',
    rangeArrow: '<svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 6h7m0 0L7 3.5m2.5 2.5L7 8.5" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    switchKnob: '<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6" fill="#FFFFFF"/></svg>',
    textareaResize: '<svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 5L5 11M11 9L9 11" stroke="#9697A3" stroke-width="1" stroke-linecap="round"/></svg>',
    radioOff: '<svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="7" cy="7" r="6.5" fill="#FFFFFF" stroke="#DCDCE0"/></svg>',
    checkboxOff: '<svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="13" height="13" rx="2" fill="#FFFFFF" stroke="#DCDCE0"/></svg>',
    paperclip: '<svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.5 4.5L5.7 9.3a1.5 1.5 0 102.1 2.1l5.4-5.4a3 3 0 10-4.2-4.2L3.6 7.2a4.5 4.5 0 106.3 6.3l4.6-4.6" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  function renderIcons(root = document) {
    root.querySelectorAll("[data-wise-icon]").forEach((node) => {
      const name = node.getAttribute("data-wise-icon");
      if (inlineIcons[name]) {
        node.innerHTML = inlineIcons[name];
      } else if (icons[name]) {
        node.innerHTML = `<img src="${iconPath}${icons[name]}" alt="" />`;
      }
      node.setAttribute("aria-hidden", "true");
    });
  }

  window.WiseIconRegistry = {
    icons,
    inlineIcons,
    renderIcons
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => renderIcons());
  } else {
    renderIcons();
  }
})();
