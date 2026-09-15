// ==UserScript==
// @name         freee勤怠 - 日次過不足(8h)表示
// @namespace    local
// @version      1.0.0
// @match        https://p.secure.freee.co.jp/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://raw.githubusercontent.com/muto-yasushi-888/freee-kintai-daily-diff/main/freee-kintai-daily-diff.user.js
// @downloadURL  https://raw.githubusercontent.com/muto-yasushi-888/freee-kintai-daily-diff/main/freee-kintai-daily-diff.user.js
// ==/UserScript==
// ====== 設定 ======
// 1日の所定労働時間（時間単位、小数OK: 例 7.5 = 7時間30分）
const STANDARD_HOURS_PER_DAY = 8;
// ==================

(function () {
  'use strict';
  const STANDARD_MIN = Math.round(STANDARD_HOURS_PER_DAY * 60);
  const LABEL = `日次過不足(${STANDARD_HOURS_PER_DAY}h)`;
  const MARKER = 'data-daily-diff';

  const isTarget = () => location.hash.includes('work_records');

  const parseHourMin = (el) => {
    if (!el) return null;
    const h = el.querySelector('.hour-min__hour .hour-min__value');
    const m = el.querySelector('.hour-min__min .hour-min__value');
    if (!h && !m) return null;
    return (h ? +h.textContent : 0) * 60 + (m ? +m.textContent : 0);
  };

  const render = () => {
    if (!isTarget()) return;
    const container = document.querySelector('.items.main-items');
    if (!container) return;

    const daysEl = container.querySelector('[data-test="労働日数"]');
    const totalEl = container.querySelector('[data-test="総勤務時間"]');
    const shortageItem = container.querySelector('[data-test="不足時間"]')?.closest('.item');
    if (!daysEl || !totalEl || !shortageItem) return;

    const days = parseInt(daysEl.textContent, 10);
    const total = parseHourMin(totalEl);
    if (!Number.isFinite(days) || total == null) return;

    const diff = total - days * STANDARD_MIN;
    const abs = Math.abs(diff);
    const hour = Math.floor(abs / 60);
    const min = abs % 60;
    const sign = diff > 0 ? '+' : diff < 0 ? '-' : '';
    const color = diff > 0 ? '#d97706' : diff < 0 ? '#c33' : '#666';

    const existing = container.querySelector(`[${MARKER}]`);
    if (existing) {
      if (existing.dataset.value === String(diff)) return;
      existing.remove();
    }

    const item = document.createElement('div');
    item.className = 'item';
    item.setAttribute(MARKER, '1');
    item.dataset.value = String(diff);
    item.innerHTML = `
      <div class="label">${LABEL}</div>
      <div class="body" data-test="日次過不足" style="color:${color};"><span class="hour-min"><span class="hour-min__hour"><span class="hour-min__value">${sign}${hour}</span><span class="hour-min__unit">時間</span></span><span class="hour-min__min"><span class="hour-min__value">${min}</span><span class="hour-min__unit">分</span></span></span></div>`;
    shortageItem.insertAdjacentElement('afterend', item);
  };

  const mo = new MutationObserver(() => render());
  mo.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('hashchange', render);
  render();
})();
