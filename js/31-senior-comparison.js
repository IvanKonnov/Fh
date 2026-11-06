/* ═══ NAVLIFE · SENIOR COMPARISON ═══
   Сравнение с прошлым собой. Добавляется в модалку отчёта.
*/
(function(){
'use strict';
const N = window.__nav;
if (!N){ console.error('[SENIOR] __nav not found'); return; }
const qs = (s, r=document) => r.querySelector(s);

function getComparisons(){
  const S = N.S;
  const today = new Date();
  const out = [];
  
  // Streak и дела
  const totalDone = S.navlife.schedule.filter(i => i.completed).length;
  const lastSessions = S.neurofit.totalSessions;
  const totalMinutes = Math.round(S.neurofit.totalMs / 60000);
  
  const createdAt = S.shared.createdAt || (function(){
    // Fallback — самая ранняя запись сессии
    const sessions = S.neurofit.sessions || [];
    if (sessions.length){
      const first = sessions.reduce((a, b) => a.t < b.t ? a : b);
      return new Date(first.t);
    }
    return new Date(Date.now() - 30 * 86400000);
  })();
  
  const daysInApp = Math.max(1, Math.floor((Date.now() - createdAt.getTime()) / 86400000));
  
  if (totalDone > 0){
    out.push({
      icon: '📋',
      text: `Ты закрыл <b>${totalDone}</b> ${plural(totalDone, 'дело', 'дела', 'дел')} за всё время.`
    });
  }
  
  if (S.neurofit.bestStreak > 0){
    out.push({
      icon: '🔥',
      text: `Лучшая серия — <b>${S.neurofit.bestStreak}</b> ${plural(S.neurofit.bestStreak, 'день', 'дня', 'дней')} подряд. Текущая — ${S.neurofit.streak}.`
    });
  }
  
  if (lastSessions > 0){
    out.push({
      icon: '🧠',
      text: `Ты тренировал мозг <b>${lastSessions}</b> ${plural(lastSessions, 'раз', 'раза', 'раз')} — это <b>${totalMinutes}</b> минут.`
    });
  }
  
  if (S.breathing && S.breathing.totalSessions > 0){
    out.push({
      icon: '🌬️',
      text: `Дыхательных практик — <b>${S.breathing.totalSessions}</b>. Это ${Math.round(S.breathing.totalMs/60000)} минут спокойствия.`
    });
  }
  
  const habits = S.habits || [];
  if (habits.length){
    const totalHabitMarks = habits.reduce((s, h) => s + Object.keys(h.log || {}).length, 0);
    if (totalHabitMarks > 0){
      out.push({
        icon: '✅',
        text: `Привычки отмечены <b>${totalHabitMarks}</b> ${plural(totalHabitMarks, 'раз', 'раза', 'раз')}.`
      });
    }
  }
  
  if (daysInApp >= 7){
    out.push({
      icon: '📅',
      text: `Ты в NavLife <b>${daysInApp}</b> ${plural(daysInApp, 'день', 'дня', 'дней')}. Прогресс копится — продолжай.`
    });
  }
  
  return out;
}

function plural(n, one, few, many){
  const a = Math.abs(n) % 100;
  if (a >= 11 && a <= 19) return many;
  const l = a % 10;
  if (l === 1) return one;
  if (l >= 2 && l <= 4) return few;
  return many;
}

/* ═══ Патчим Reports.open — добавляем блок ═══ */
setTimeout(() => {
  if (!window.Reports || !window.Reports.open){
    console.warn('[SENIOR] Reports not ready');
    return;
  }
  
  const origOpen = window.Reports.open;
  
  window.Reports.open = function(){
    origOpen.call(this);
    
    setTimeout(() => {
      const modal = document.querySelector('#modal-root .modal:last-child');
      if (!modal) return;
      if (modal.querySelector('[data-senior-block]')) return;
      
      const comparisons = getComparisons();
      if (!comparisons.length) return;
      
      const block = document.createElement('div');
      block.setAttribute('data-senior-block', '');
      block.style.cssText = 'margin-top:16px;padding-top:16px;border-top:1px solid var(--line)';
      block.innerHTML = `
        <div class="tiny" style="margin-bottom:10px;letter-spacing:.08em">ТЫ VS ТЫ ПРОШЛЫЙ</div>
        <div style="padding:14px 16px;background:var(--amber-soft);border-radius:12px">
          ${comparisons.map(c => `
            <div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:${c === comparisons[comparisons.length-1] ? '0' : '10px'}">
              <div style="font-size:18px;flex-shrink:0">${c.icon}</div>
              <div style="flex:1;font-size:12.5px;line-height:1.55;color:var(--amber-dim)">${c.text}</div>
            </div>
          `).join('')}
        </div>
      `;
      
      // Вставляем перед кнопками
      const btnRow = Array.from(modal.children).find(el => 
        el.querySelector && el.querySelector('#repGen, #repCancel')
      );
      if (btnRow && btnRow.parentNode){
        btnRow.parentNode.insertBefore(block, btnRow);
      } else {
        modal.appendChild(block);
      }
    }, 80);
  };
  
  console.log('[Senior Comparison] patched Reports.open');
}, 1200);
})();