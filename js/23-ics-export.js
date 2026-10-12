/* ═══ NAVLIFE · ICS EXPORT ═══ */
(function(){
'use strict';
const N = window.__nav;
if (!N){ console.error('[ICS] __nav not found'); return; }
const qs = (s, r=document) => r.querySelector(s);

function pad(n){ return String(n).padStart(2,'0'); }

function dateToICS(ds, time){
  /* ds = 'YYYY-MM-DD', time = 'HH:MM' */
  const [y,m,d] = ds.split('-');
  const [h,mi] = time.split(':');
  return `${y}${m}${d}T${h}${mi}00`;
}
function nowICS(){
  const d = new Date();
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}
function escapeICS(s){
  return String(s||'').replace(/[\\;,]/g, m => '\\'+m).replace(/\n/g, '\\n');
}

function generateICS(daysAhead){
  const today = N.todayKey();
  const endDate = new Date(); endDate.setDate(endDate.getDate() + daysAhead);
  const endStr = N.fmtDate(endDate);

  const events = N.S.navlife.schedule.filter(i => i.date >= today && i.date <= endStr);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NavLife//RU',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:NavLife',
    'X-WR-TIMEZONE:Europe/Moscow'
  ];

  events.forEach(ev => {
    const uid = `navlife-${ev.id}-${ev.date}@navlife.app`;
    const prog = ev.programId ? N.S.navlife.programs.find(p => p.id === ev.programId) : null;
    const desc = prog ? `Программа: ${prog.title}` : '';

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${nowICS()}`);
    lines.push(`DTSTART:${dateToICS(ev.date, ev.startTime)}`);
    lines.push(`DTEND:${dateToICS(ev.date, ev.endTime)}`);
    lines.push(`SUMMARY:${escapeICS(ev.title)}`);
    if (desc) lines.push(`DESCRIPTION:${escapeICS(desc)}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function downloadICS(daysAhead){
  const ics = generateICS(daysAhead);
  const blob = new Blob([ics], {type:'text/calendar;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `navlife-${N.todayKey()}.ics`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  N.toast(`События за ${daysAhead} дней сохранены`);
  N.SFX.win();
}

function openICSModal(){
  let daysAhead = 60;

  N.openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom:6px">📅 В календарь</div>
    <p class="muted" style="margin-bottom:18px">Экспорт всех событий в формате .ics — импортируется в Google Calendar, Apple Calendar, Outlook.</p>

    <div class="field">
      <label>Период вперёд</label>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:6px">
        ${[30,60,90].map(n => `
          <button type="button" data-days="${n}" style="
            padding:14px 8px;border-radius:12px;font-size:14px;font-weight:600;
            background:${daysAhead===n?'var(--moss)':'var(--paper)'};
            color:${daysAhead===n?'#fff':'var(--ink)'};
            border:1.5px solid ${daysAhead===n?'var(--moss)':'var(--line)'};
            cursor:pointer;
          ">${n} дней</button>`).join('')}
      </div>
    </div>

    <div style="padding:12px 14px;background:var(--paper);border-radius:10px;font-size:12.5px;color:var(--ink-soft);line-height:1.55;margin-bottom:16px">
      <b style="color:var(--ink)">Как импортировать:</b><br>
      • <b>Google Calendar:</b> Настройки → Импорт и экспорт → выбрать файл<br>
      • <b>Apple Calendar:</b> Двойной клик по файлу — откроется автоматически<br>
      • <b>Outlook:</b> Файл → Открыть → Импорт
    </div>

    <div style="display:flex;gap:10px">
      <button class="btn btn-ghost btn-full" id="icsCancel" type="button">Отмена</button>
      <button class="btn btn-primary btn-full btn-lg" id="icsGen" type="button">Скачать .ics</button>
    </div>
  `, m => {
    m.querySelectorAll('[data-days]').forEach(b => b.onclick = () => {
      daysAhead = +b.dataset.days;
      N.SFX.tap();
      m.querySelectorAll('[data-days]').forEach(x => {
        const on = +x.dataset.days === daysAhead;
        x.style.background = on ? 'var(--moss)' : 'var(--paper)';
        x.style.color = on ? '#fff' : 'var(--ink)';
        x.style.borderColor = on ? 'var(--moss)' : 'var(--line)';
      });
    });
    m.querySelector('#icsCancel').onclick = () => N.closeModal(m);
    m.querySelector('#icsGen').onclick = () => {
      N.closeModal(m);
      setTimeout(() => downloadICS(daysAhead), 200);
    };
  });
}

window.App.hooks.afterGo.push(name => {
  if (name !== 'profile') return;
  setTimeout(() => {
    const host = qs('#screens');
    if (!host || host.querySelector('[data-ics-btn]')) return;
    const card = document.createElement('button');
    card.className = 'card tappable';
    card.setAttribute('data-ics-btn', '');
    card.type = 'button';
    card.style.cssText = 'width:100%;text-align:left';
    card.innerHTML = `
      <div class="between">
        <div>
          <div class="h3" style="margin-bottom:2px">📅 В календарь (.ics)</div>
          <div class="muted" style="font-size:12.5px">Импорт в Google / Apple Calendar</div>
        </div>
        <div style="font-size:18px;color:var(--ink-mute)">›</div>
      </div>`;
    card.onclick = () => { N.SFX.tap(); openICSModal(); };

    const cards = host.querySelectorAll('.card');
    const dataCard = Array.from(cards).find(c => c.textContent.includes('Экспорт') && c.textContent.includes('Импорт'));
    if (dataCard && dataCard.parentNode){
      dataCard.parentNode.insertBefore(card, dataCard.nextSibling);
    } else {
      host.appendChild(card);
    }
  }, 100);
});

window.ICS = { open: openICSModal, generate: generateICS, download: downloadICS };
console.log('[ICS] loaded');
})();