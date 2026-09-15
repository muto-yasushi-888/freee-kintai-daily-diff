// ==UserScript==
// @name         freee勤怠 - 日次過不足表示
// @namespace    local
// @version      2.0.1
// @description  freee勤怠の勤務記録一覧に、1日あたりの所定労働時間に対する過不足時間を自動表示します
// @author       muto-yasushi-888
// @match        https://p.secure.freee.co.jp/*
// @run-at       document-idle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @updateURL    https://raw.githubusercontent.com/muto-yasushi-888/freee-kintai-daily-diff/main/freee-kintai-daily-diff.user.js
// @downloadURL  https://raw.githubusercontent.com/muto-yasushi-888/freee-kintai-daily-diff/main/freee-kintai-daily-diff.user.js
// ==/UserScript==

(function () {
  'use strict';
  const SETTING_KEY = 'standardHoursPerDay';
  const DEFAULT_HOURS = 8;
  const MARKER = 'data-daily-diff';

  const askHours = (current) => {
    const input = window.prompt(
      '1日の所定労働時間を入力してください（時間単位、小数OK: 例 7.5 = 7時間30分）',
      current != null ? String(current) : String(DEFAULT_HOURS)
    );
    if (input === null) return current ?? DEFAULT_HOURS;
    const parsed = parseFloat(input);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      window.alert('入力値が不正なため、デフォルトの8時間を使用します。');
      return DEFAULT_HOURS;
    }
    return parsed;
  };

  const getStandardHours = () => {
    let hours = GM_getValue(SETTING_KEY, null);
    if (hours == null) {
      hours = askHours(null);
      GM_setValue(SETTING_KEY, hours);
    }
    return hours;
  };

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

    const standardHours = getStandardHours();
    const standardMin = Math.round(standardHours * 60);
    const label = `日次過不足(${standardHours}h)`;

    const diff = total - days * standardMin;
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
      <div class="label">${label}</div>
      <div class="body" data-test="日次過不足" style="color:${color};"><span class="hour-min"><span class="hour-min__hour"><span class="hour-min__value">${sign}${hour}</span><span class="hour-min__unit">時間</span></span><span class="hour-min__min"><span class="hour-min__value">${min}</span><span class="hour-min__unit">分</span></span></span></div>`;
    shortageItem.insertAdjacentElement('afterend', item);
  };

  GM_registerMenuCommand('所定労働時間を変更', () => {
    const current = GM_getValue(SETTING_KEY, DEFAULT_HOURS);
    GM_setValue(SETTING_KEY, askHours(current));
    render();
  });

  const mo = new MutationObserver(() => render());
  mo.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('hashchange', render);
  render();
})();
