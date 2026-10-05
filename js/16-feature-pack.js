/* ═══ NAVLIFE · FEATURE PACK · v3.5 ═══ */
(function(){
'use strict';
const N = window.__nav;
if (!N){ console.error('[FEATURE-PACK] __nav not found'); return; }
const { go, saveState, toast, openModal, closeModal, todayKey, fmtDate, esc, toMin, nutritionToday, SFX, buzz } = N;

if ('serviceWorker' in navigator && location.protocol !== 'file:'){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => console.warn('[SW]', err.message));
  });
}

/* ═══ Splash ═══ */
(function splash(){
  const sp = document.createElement('div');
  sp.innerHTML = `
    <div style="text-align:center;animation:splashIn .6s cubic-bezier(.22,1,.36,1)">
      <div style="font-size:56px;line-height:1;margin-bottom:12px">🧭</div>
      <div style="font-family:'Fraunces',serif;font-size:22px;font-weight:600">NavLife</div>
      <div style="font-size:11.5px;opacity:.55;margin-top:6px;letter-spacing:.14em;text-transform:uppercase">маршрут дня</div>
    </div>`;
  sp.style.cssText = `position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:var(--paper);transition:opacity .5s ease;pointer-events:none`;
  document.body.appendChild(sp);
  const st = document.createElement('style');
  st.textContent = '@keyframes splashIn{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:none}}';
  document.head.appendChild(st);
  setTimeout(() => {
    sp.style.opacity = '0';
    setTimeout(() => sp.remove(), 520);
  }, 400);
})();

/* ═══ Notification permission ═══ */
async function requestNotifPerm(){
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  try {
    const p = await Notification.requestPermission();
    return p === 'granted';
  } catch(e){ return false; }
}
window.requestNotifPerm = requestNotifPerm;

/* ═══ Уведомления с настраиваемыми интервалами ═══
   Для каждого незавершённого события проверяем:
   прошло ли ровно N минут до старта (где N из S.shared.notificationLeadTimes).
   Ключ дедупликации: eventId + leadMinutes, чтобы каждый интервал стрелял 1 раз.
*/
function tickNotifications(){
  if (!N.S.shared.notifications) return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const ds = todayKey();
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const leadTimes = N.S.shared.notificationLeadTimes || [1,5];

  N.S.navlife.schedule
    .filter(i => i.date === ds && !i.completed)
    .forEach(it => {
      const start = toMin(it.startTime);
      const diff = start - nowMin;

      // Проверяем каждый интервал
      leadTimes.forEach(lead => {
        // Окно ±1 минута, чтобы точно сработать
        if (diff === lead){
          const key = `${it.id}|${lead}`;
          N.S.meta.notifShown = N.S.meta.notifShown || {};
          if (N.S.meta.notifShown[key]) return;
          N.S.meta.notifShown[key] = Date.now();
          saveState();
          try {
            const timeLabel = lead === 1 ? 'через минуту'
                           : lead === 60 ? 'через час'
                           : `через ${lead} мин`;
            new Notification(`NavLife · ${timeLabel}`, {
              body: `${it.startTime} — ${it.title}`,
              icon: 'icon.svg',
              tag: key
            });
          } catch(e){}
        }
      });
    });
}
setInterval(tickNotifications, 30000);

/* ═══ Защита от пропусков ═══ */
function checkMissedDays(){
  const S = N.S;
  const today = todayKey();
  const last = S.meta.lastVisitDate;
  S.meta.lastVisitDate = today;
  saveState();
  if (!last || last === today || S.meta.missedDaysShown) return;
  const days = Math.round((new Date(today) - new Date(last)) / 86400000);
  if (days >= 2){
    S.meta.missedDaysShown = true;
    saveState();
    setTimeout(() => openWelcomeBack(days), 900);
  }
}
function openWelcomeBack(days){
  openModal(`
    <div class="modal-handle"></div>
    <div style="text-align:center;padding:16px 4px 8px">
      <div style="font-size:56px;margin-bottom:14px">🌱</div>
      <div class="h2" style="margin-bottom:10px">С возвращением</div>
      <p class="muted" style="max-width:340px;margin:0 auto 24px;font-size:14px">
        Тебя не было ${days} ${days < 5 ? 'дня' : 'дней'}. Это нормально — жизнь бывает разной.
        Давай просто начнём сегодня, без вины и без давления.
      </p>
      <button class="btn btn-primary btn-full btn-lg" id="wbOk" type="button">Начать сегодня</button>
    </div>`, m => {
    const b = m.querySelector('#wbOk');
    if (b) b.onclick = () => { closeModal(m); toast('Рады видеть 👋'); SFX.ok(); buzz(12); };
  });
}

/* ═══ Итог дня ═══ */
function checkEndOfDay(force){
  const S = N.S;
  const ds = todayKey();
  if (!force && S.meta.endOfDayShown && S.meta.endOfDayShown[ds]) return;
  const now = new Date();
  const nowMin = now.getHours()*60 + now.getMinutes();
  const items = S.navlife.schedule.filter(i => i.date === ds);
  if (!force && items.length === 0) return;
  const done = items.filter(i => i.completed).length;
  const allDone = items.length > 0 && done === items.length;
  const isLateEvening = nowMin >= 21*60 + 30;
  if (!force && !isLateEvening && !allDone) return;

  S.meta.endOfDayShown = S.meta.endOfDayShown || {};
  S.meta.endOfDayShown[ds] = true;
  saveState();

  const nut = nutritionToday();
  const goals = S.nutrition.goals;
  const sessionsToday = S.neurofit.sessions.filter(s => s.d === ds).length;
  const streak = S.neurofit.streak;
  const leftover = items.filter(i => !i.completed);
  const tomorrow = (() => { const d = new Date(); d.setDate(d.getDate()+1); return fmtDate(d); })();
  const sleep = S.sleep[ds];

  openModal(`
    <div class="modal-handle"></div>
    <div style="text-align:center;padding:8px 0 4px">
      <div class="tiny" style="letter-spacing:.16em;color:var(--moss)">ИТОГ ДНЯ</div>
      <div class="h2" style="margin:10px 0 6px;font-size:24px">Хорошая работа</div>
      <p class="muted" style="margin-bottom:22px">Вот что получилось сегодня</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
      <div class="stat" style="padding:14px"><b>${done} / ${items.length}</b><span>дел выполнено</span></div>
      <div class="stat" style="padding:14px"><b>${sessionsToday}</b><span>тренировок мозга</span></div>
      <div class="stat" style="padding:14px"><b>${nut.kcal}</b><span>ккал из ${goals.calories}</span></div>
      <div class="stat" style="padding:14px"><b>${nut.water}</b><span>мл воды из ${goals.water}</span></div>
    </div>
    <div style="text-align:center;padding:16px;background:var(--amber-soft);border-radius:14px;margin-bottom:18px">
      <div class="tiny" style="color:var(--amber-dim);margin-bottom:6px">СЕРИЯ</div>
      <div style="font-family:'Fraunces',serif;font-size:32px;font-weight:600;color:var(--amber-dim);line-height:1">🔥 ${streak}</div>
      <div class="tiny" style="color:var(--amber-dim);margin-top:4px">${streak === 1 ? 'день' : streak < 5 ? 'дня' : 'дней'} подряд</div>
    </div>
    ${!sleep ? `<button class="btn btn-ghost btn-full" id="eodSleep" type="button" style="margin-bottom:12px">😴 Записать сон</button>` : ''}
    ${leftover.length ? `
      <div style="padding:14px 16px;background:var(--paper);border-radius:14px;margin-bottom:14px">
        <div class="tiny" style="margin-bottom:8px">ОСТАЛОСЬ НА СЕГОДНЯ</div>
        <div style="font-size:13.5px;line-height:1.55;color:var(--ink-soft)">${leftover.map(i => esc(i.title)).join(' · ')}</div>
      </div>
      <p class="muted" style="margin-bottom:14px;text-align:center;font-size:12.5px">
        Перенести невыполненное в расписание на завтра?
      </p>
      <div style="display:flex;gap:10px">
        <button class="btn btn-ghost btn-full" id="eodSkip" type="button">Оставить</button>
        <button class="btn btn-primary btn-full" id="eodMove" type="button">Перенести (${leftover.length})</button>
      </div>` : `
      <button class="btn btn-primary btn-full btn-lg" id="eodClose" type="button">Отлично!</button>`}
  `, m => {
    const bMove = m.querySelector('#eodMove');
    if (bMove) bMove.onclick = () => {
      let cnt = 0;
      leftover.forEach(it => {
        N.S.navlife.schedule.push({
          id: 'sch_' + Math.random().toString(36).slice(2,9),
          title: it.title, type: it.type || 'task',
          startTime: it.startTime, endTime: it.endTime,
          date: tomorrow, completed: false,
          programId: it.programId || null,
          goalStepId: it.goalStepId || null,
          fromBase: false, fromRecurring: false
        });
        it.completed = true;
        cnt++;
      });
      saveState();
      closeModal(m);
      toast(`Перенесено на завтра: ${cnt}`);
      SFX.win();
      go('today');
    };
    const bSkip = m.querySelector('#eodSkip');
    if (bSkip) bSkip.onclick = () => closeModal(m);
    const bClose = m.querySelector('#eodClose');
    if (bClose) bClose.onclick = () => { closeModal(m); SFX.win(); };
    const bSleep = m.querySelector('#eodSleep');
    if (bSleep) bSleep.onclick = () => { closeModal(m); setTimeout(() => window.Sleep && window.Sleep.open(), 200); };
  });
}
window.checkEndOfDay = checkEndOfDay;

setTimeout(() => { checkMissedDays(); }, 500);

setInterval(() => {
  const ds = todayKey();
  if (!N.S.meta.endOfDayShown || !N.S.meta.endOfDayShown[ds]){
    const now = new Date();
    if (now.getHours()*60 + now.getMinutes() >= 21*60 + 30){
      if (N.currentScreen === 'today') checkEndOfDay(false);
    }
  }
}, 60000);

document.addEventListener('click', () => {
  setTimeout(() => {
    const ds = todayKey();
    if (N.S.meta.endOfDayShown && N.S.meta.endOfDayShown[ds]) return;
    const items = N.S.navlife.schedule.filter(i => i.date === ds);
    if (items.length > 3 && items.every(i => i.completed) && N.currentScreen === 'today'){
      checkEndOfDay(false);
    }
  }, 400);
});

console.log('[NavLife] Feature Pack loaded ✓');
})();