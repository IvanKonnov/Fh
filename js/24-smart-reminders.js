/* ═══ NAVLIFE · SMART REMINDERS · напоминания о пропущенном ═══ */
(function(){
'use strict';
const N = window.__nav;
if (!N){ console.error('[SMART] __nav not found'); return; }

const CHECK_INTERVAL = 60000; // раз в минуту
const MISS_AFTER_MIN = 15;

function pad2(n){ return String(n).padStart(2,'0'); }

/* ═══ Проверка: есть ли пропущенное событие ═══ */
function findMissed(){
  if (!N.S.shared.notifications) return null;
  const ds = N.todayKey();
  const now = new Date();
  const nowMin = now.getHours()*60 + now.getMinutes();
  const sent = N.S.meta.missedNotifSent = N.S.meta.missedNotifSent || {};

  const candidates = N.S.navlife.schedule.filter(i =>
    i.date === ds &&
    !i.completed &&
    (i.type === 'task' || !i.type)
  );

  for (const ev of candidates){
    const start = N.toMin(ev.startTime);
    const diff = nowMin - start;
    if (diff >= MISS_AFTER_MIN && diff <= 180){
      const key = `${ev.id}|${ds}`;
      if (sent[key]) continue;
      sent[key] = true;
      N.saveState();
      return ev;
    }
  }
  return null;
}

/* ═══ Отправить уведомление ═══ */
async function checkAndNotify(){
  const ev = findMissed();
  if (!ev) return;

  /* Если браузер не поддерживает — просто покажем тост и модалку */
  const canNotif = ('Notification' in window) && Notification.permission === 'granted';

  if (canNotif){
    try {
      const n = new Notification('NavLife · Пропущено', {
        body: `${ev.startTime} — ${ev.title}. Всё ещё в плане?`,
        icon: 'icon.svg',
        tag: `missed-${ev.id}`,
        requireInteraction: true,
        silent: false,
        data: { eventId: ev.id, date: N.todayKey() }
      });
      n.onclick = () => {
        window.focus();
        openMissedModal(ev);
        n.close();
      };
    } catch(e){}
  }

  /* Если приложение открыто — показать модалку сразу */
  if (!document.hidden){
    openMissedModal(ev);
  }
}

/* ═══ Модалка с 3 вариантами ═══ */
function openMissedModal(ev){
  if (document.querySelector('[data-missed-modal]')) return;
  /* Не показываем в настройках/модалках */
  if (document.querySelector('#modal-root.open')) return;

  const layer = N.openModal(`
    <div class="modal-handle" data-missed-modal></div>
    <div style="text-align:center;padding:6px 0 6px">
      <div style="font-size:44px;margin-bottom:10px">⏰</div>
      <div class="h2" style="margin-bottom:6px">Пропущено?</div>
      <p class="muted" style="margin-bottom:16px">Событие уже началось ${MISS_AFTER_MIN} мин назад</p>
      <div style="padding:14px 16px;background:var(--paper);border-radius:12px;margin-bottom:18px;text-align:left">
        <div style="font-family:'Fraunces',serif;font-size:16px;font-weight:600;margin-bottom:4px">${N.esc(ev.title)}</div>
        <div class="muted" style="font-size:12.5px">${ev.startTime}–${ev.endTime}</div>
      </div>
    </div>

    <div style="display:grid;gap:8px">
      <button class="btn btn-primary btn-full btn-lg" data-missed-done type="button">✓ Сделал</button>
      <button class="btn btn-ghost btn-full" data-missed-snooze type="button">⏱ Отложить на час</button>
      <button class="btn btn-ghost btn-full" data-missed-skip type="button" style="color:var(--rust)">✕ Пропустить сегодня</button>
    </div>
  `, m => {
    m.querySelector('[data-missed-done]').onclick = () => {
      N.closeModal(m);
      N.completeScheduleItem(ev.id, true);
      N.toast('Отмечено ✓');
    };
    m.querySelector('[data-missed-snooze]').onclick = () => {
      /* Сдвигаем на 1 час вперёд */
      const [h, mm] = ev.startTime.split(':').map(Number);
      const [eh, em] = ev.endTime.split(':').map(Number);
      const dur = (eh*60 + em) - (h*60 + mm);
      const newStart = h*60 + mm + 60;
      const newEnd = newStart + dur;
      const fmt = (t) => pad2(Math.floor(t/60)%24) + ':' + pad2(t%60);
      ev.startTime = fmt(newStart);
      ev.endTime = fmt(newEnd);
      /* Сбрасываем метку уведомления — вдруг опять просрочится */
      const sent = N.S.meta.missedNotifSent || {};
      delete sent[`${ev.id}|${ev.date}`];
      N.saveState();
      N.closeModal(m);
      N.toast(`Отложено до ${ev.startTime}`);
    };
    m.querySelector('[data-missed-skip]').onclick = () => {
      /* Помечаем как completed с пометкой skipped */
      ev.completed = true;
      ev.skipped = true;
      N.saveState();
      N.closeModal(m);
      N.toast('Пропущено');
    };
  });
}

/* ═══ Запуск ═══ */
setInterval(checkAndNotify, CHECK_INTERVAL);
setTimeout(checkAndNotify, 8000);

console.log('[Smart Reminders] loaded');
})();