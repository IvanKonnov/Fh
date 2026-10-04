/* ═══ NAVLIFE · STREAK FREEZE ═══ */
(function(){
'use strict';
const N = window.__nav;
const { saveState, todayKey, fmtDate, openModal, closeModal, toast, SFX, buzz, esc } = N;

const MAX_PER_MONTH = 2;
const MONTH_KEY = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
};

function info(){
  const f = N.S.freezer || { uses: MAX_PER_MONTH, monthKey: '', log: [] };
  const mk = MONTH_KEY();
  if (f.monthKey !== mk){
    f.monthKey = mk;
    f.uses = MAX_PER_MONTH;
    N.S.freezer = f;
    saveState();
  }
  return { available: f.uses, max: MAX_PER_MONTH, log: f.log || [], monthKey: f.monthKey };
}

function tryAutoFreeze(lastDay, todayDay){
  if (!lastDay) return false;
  const f = N.S.freezer || { uses: MAX_PER_MONTH, monthKey: '', log: [] };
  const mk = MONTH_KEY();
  if (f.monthKey !== mk){ f.monthKey = mk; f.uses = MAX_PER_MONTH; }
  if (f.uses <= 0){ N.S.freezer = f; return false; }

  const last = new Date(lastDay + 'T00:00:00');
  const today = new Date(todayDay + 'T00:00:00');
  const gap = Math.round((today - last) / 86400000);

  if (gap === 2){
    f.uses -= 1;
    f.log = f.log || [];
    const missed = new Date(last); missed.setDate(missed.getDate() + 1);
    f.log.push({ date: fmtDate(missed), usedAt: Date.now() });
    N.S.freezer = f;
    saveState();
    SFX.badge();
    buzz([20,40,20]);
    toast(`❄️ Заморозка использована — серия сохранена`, 3200, 'gold');
    return true;
  }
  N.S.freezer = f;
  return false;
}

function openModal_(){
  const inf = info();
  const f = N.S.freezer;
  const log = (f.log || []).slice(-6).reverse();
  openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom:6px">❄️ Заморозка серии</div>
    <p class="muted" style="margin-bottom:18px">
      Если пропустил день — серия не сбросится. Доступно ${MAX_PER_MONTH} раза в месяц.
    </p>

    <div class="card" style="padding:18px;background:linear-gradient(135deg,#8FAE9B,#5E7D6B);color:#F4F2EA;border:none">
      <div class="between">
        <div>
          <div class="tiny" style="color:rgba(255,255,255,.8)">ДОСТУПНО СЕЙЧАС</div>
          <div style="font-family:'Fraunces',serif;font-size:42px;font-weight:600;color:#F3E3C8;line-height:1;margin-top:6px">${inf.available} <span style="font-size:20px;color:rgba(255,255,255,.6)">/ ${MAX_PER_MONTH}</span></div>
        </div>
        <div class="freezer-pips">
          ${Array.from({length: MAX_PER_MONTH}).map((_, i) => `<div class="freezer-pip ${i < inf.available ? 'alive' : 'used'}">${i < inf.available ? '❄️' : '·'}</div>`).join('')}
        </div>
      </div>
    </div>

    ${log.length ? `
      <div class="tiny" style="margin:18px 0 10px">ИСПОЛЬЗОВАНО</div>
      ${log.map(l => `<div style="padding:10px 14px;background:var(--paper);border-radius:10px;margin-bottom:6px;font-size:13px">
        ❄️ <b>${esc(l.date)}</b> — серия сохранена
      </div>`).join('')}
    ` : '<p class="muted" style="font-size:12.5px;text-align:center;margin:20px 0">Пока ни разу не использовалась</p>'}

    <p class="muted" style="font-size:12.5px;line-height:1.55;margin-top:16px">
      Заморозка срабатывает автоматически, когда ты пропускаешь ровно один день подряд.
      Всё, что нужно — не заходить на следующий день. Серия не сбросится.
    </p>

    <button class="btn btn-primary btn-full btn-lg" id="frClose" type="button" style="margin-top:16px">Понятно</button>
  `, m => {
    m.querySelector('#frClose').onclick = () => closeModal(m);
  });
}

window.Freezer = { info, tryAutoFreeze, openModal: openModal_ };
})();