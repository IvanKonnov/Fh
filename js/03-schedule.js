/* ═══ NAVLIFE · SCHEDULE (День / Неделя / Месяц) ═══ */
(function(){
'use strict';
const N = window.__nav;
const { go, saveState, esc, toMin, uid, todayKey, fmtDate, dateLabel,
        dowShort, monNames, SFX, buzz, toast, openModal, closeModal,
        itemsForDate, ensureBaseForDate, findGoalStep, completeScheduleItem,
        $, $$, clamp, fmtMinToClock } = N;

function renderSchedule(){
  ensureBaseForDate(N.S.navlife.viewDate);
  const mode = N.S.viewMode || 'day';
  const root = document.createElement('div');
  root.className = 'screen';

  root.innerHTML = `
    <div class="h1" style="margin-bottom:16px">Расписание</div>
    <div data-view-switch style="display:flex;gap:6px;margin-bottom:16px">
      ${[['day','День'],['week','Неделя'],['month','Месяц']].map(([k,l]) =>
        `<button class="food-tab ${mode===k?'on':''}" data-vm="${k}" type="button" style="flex:1">${l}</button>`
      ).join('')}
    </div>
    <div id="sched-content"></div>
  `;
  const content = root.querySelector('#sched-content');
  if (mode === 'day')        content.innerHTML = renderDayHtml();
  else if (mode === 'week')  content.innerHTML = renderWeekHtml();
  else                       content.innerHTML = renderMonthHtml();

  root.querySelectorAll('[data-vm]').forEach(b => b.onclick = () => {
    N.S.viewMode = b.dataset.vm; saveState(); SFX.tap(); go('schedule');
  });

  if (mode === 'day') bindDayHandlers(root);
  if (mode === 'week') bindWeekHandlers(root);
  if (mode === 'month') bindMonthHandlers(root);

  return root;
}

function renderDayHtml(){
  const ds = N.S.navlife.viewDate;
  const items = itemsForDate(ds);
  const isToday = ds === todayKey();
  const dLabel = dateLabel(ds);
  return `
    <div class="sched-toolbar">
      <div class="date-switch">
        <button class="icon-btn" id="prevDay" type="button">‹</button>
        <div class="dlabel">${dLabel}</div>
        <button class="icon-btn" id="nextDay" type="button">›</button>
      </div>
      <button class="btn btn-primary btn-sm" id="addEvent" type="button">+ Событие</button>
    </div>
    ${isToday ? '<div class="date-hint today">✓ Это сегодня</div>'
              : '<button class="btn btn-ghost btn-sm btn-full" id="todayJump" type="button" style="margin-bottom:14px">↩ Вернуться к сегодня</button>'}
    ${items.length ? '<p class="sched-hint">Удерживай и тяни <b>↕</b> — перемещай по времени</p>' : ''}
    <div class="card sched-list" id="schedList" style="padding:8px 14px">
      ${items.length ? items.map(it => {
        const prog = it.programId ? N.S.navlife.programs.find(p => p.id === it.programId) : null;
        const gs = it.goalStepId ? findGoalStep(it.goalStepId) : null;
        return `<div class="sched-row" data-id="${it.id}">
          <div class="sched-time"><b>${it.startTime}</b>${it.endTime}</div>
          <div class="sched-main">
            <div class="sched-title ${it.completed?'done':''}">${esc(it.title)}</div>
            <div class="sched-tags">
              ${prog ? `<span class="tag-chip program">${esc(prog.title)}</span>` : ''}
              ${gs ? `<span class="tag-chip goal">${esc(gs.goal.title)}</span>` : ''}
              ${it.fromRecurring ? '<span class="tag-chip">повтор</span>' : ''}
              ${it.fromBase ? '<span class="tag-chip">база</span>' : ''}
            </div>
          </div>
          <div class="sched-actions" data-no-drag>
            ${!it.completed
              ? `<button class="icon-btn" style="width:34px;height:34px;font-size:13px" data-complete="${it.id}" type="button">✓</button>`
              : `<button class="icon-btn" style="width:34px;height:34px;font-size:13px" data-uncomplete="${it.id}" type="button">↺</button>`}
            <button class="icon-btn" style="width:34px;height:34px;font-size:13px" data-edit="${it.id}" type="button">✎</button>
            <button class="icon-btn btn-danger" style="width:34px;height:34px;font-size:13px" data-del="${it.id}" type="button">✕</button>
          </div>
        </div>`;
      }).join('') : '<div style="padding:32px 12px;text-align:center" class="muted">Пусто. Добавь первое событие.</div>'}
    </div>
    <div class="card" style="margin-top:14px">
      <div class="between" style="margin-bottom:12px">
        <div>
          <div class="h3">Базовый распорядок</div>
          <p class="muted" style="font-size:12.5px;margin-top:4px">Появляется на 60 дней вперёд.</p>
        </div>
        <button class="btn btn-line btn-sm" id="addBase" type="button">+ Пункт</button>
      </div>
      <ul class="base-list">
        ${N.S.navlife.baseRoutine.map(b => `<li>
          <time>${b.startTime}</time>
          <span style="flex:1">${esc(b.title)}${b.programTitle ? ` <span class="tag-chip program" style="margin-left:6px">${esc(b.programTitle)}</span>` : ''}</span>
          <button class="icon-btn btn-danger" style="width:30px;height:30px;font-size:12px" data-delbase="${b.id}" type="button">✕</button>
        </li>`).join('') || '<li class="muted">Пока нет пунктов.</li>'}
      </ul>
    </div>
    <div style="height:20px"></div>`;
}

function bindDayHandlers(root){
  $('#prevDay', root).onclick = () => {
    const dd = new Date(N.S.navlife.viewDate+'T00:00:00');
    dd.setDate(dd.getDate()-1);
    N.S.navlife.viewDate = fmtDate(dd); saveState(); go('schedule');
  };
  $('#nextDay', root).onclick = () => {
    const dd = new Date(N.S.navlife.viewDate+'T00:00:00');
    dd.setDate(dd.getDate()+1);
    N.S.navlife.viewDate = fmtDate(dd); saveState(); go('schedule');
  };
  const tj = $('#todayJump', root);
  if (tj) tj.onclick = () => { N.S.navlife.viewDate = todayKey(); saveState(); go('schedule'); };
  $('#addEvent', root).onclick = () => openEventModal(null);
  $('#addBase', root).onclick = openBaseModal;

  root.addEventListener('click', e => {
    if (root._dragJustEnded){ root._dragJustEnded = false; return; }
    const c = e.target.closest('[data-complete]');
    if (c){ completeScheduleItem(c.dataset.complete, true); return; }
    const u = e.target.closest('[data-uncomplete]');
    if (u){ completeScheduleItem(u.dataset.uncomplete, false); return; }
    const ed = e.target.closest('[data-edit]');
    if (ed){ openEventModal(ed.dataset.edit); return; }
    const dl = e.target.closest('[data-del]');
    if (dl){
      const it = N.S.navlife.schedule.find(i => i.id === dl.dataset.del);
      if (!it) return;
      if (confirm('Удалить событие?')){
        if (it.fromBase && it.baseRef && it.date >= todayKey()) N.S.navlife.baseSkip[`${it.date}|${it.baseRef}`] = true;
        N.S.navlife.schedule = N.S.navlife.schedule.filter(i => i.id !== it.id);
        saveState(); go('schedule');
      }
      return;
    }
    const db = e.target.closest('[data-delbase]');
    if (db){
      N.S.navlife.baseRoutine = N.S.navlife.baseRoutine.filter(b => b.id !== db.dataset.delbase);
      N.syncBaseEvents && N.syncBaseEvents();
      saveState(); go('schedule');
      toast('Пункт удалён');
    }
  });
  setupDragDrop(root);
}

function renderWeekHtml(){
  const base = N.S.navlife.viewDate || todayKey();
  const d0 = new Date(base+'T00:00:00');
  const dow = (d0.getDay() + 6) % 7;
  const mon = new Date(d0); mon.setDate(d0.getDate() - dow);

  const days = [];
  for (let i = 0; i < 7; i++){
    const d = new Date(mon); d.setDate(mon.getDate()+i);
    const ds = fmtDate(d);
    const items = itemsForDate(ds);
    days.push({ d, ds, isToday: ds === todayKey(), items, dow: dowShort[d.getDay()] });
  }
  const end = new Date(mon); end.setDate(mon.getDate()+6);
  const label = `${mon.getDate()} ${monNames[mon.getMonth()].slice(0,3)} — ${end.getDate()} ${monNames[end.getMonth()].slice(0,3)}`;

  let selected = N.S.navlife.viewDate;
  if (!days.find(d => d.ds === selected)){
    const today = todayKey();
    selected = days.find(d => d.ds === today) ? today : days[0].ds;
  }
  const selDay = days.find(d => d.ds === selected) || days[0];

  return `
    <div class="week-nav">
      <button class="icon-btn" id="wkPrev" type="button">‹</button>
      <div class="week-nav__label">${label}</div>
      <button class="icon-btn" id="wkNext" type="button">›</button>
    </div>
    <div class="week-days">
      ${days.map(d => `
        <button class="week-day ${d.ds === selected ? 'sel' : ''} ${d.isToday ? 'today' : ''}"
                data-pick-day="${d.ds}" type="button">
          <span class="week-day__dow">${d.dow}</span>
          <span class="week-day__num">${d.d.getDate()}</span>
          <span class="week-day__dot ${d.items.length ? 'has' : ''}"></span>
          <span class="week-day__cnt">${d.items.length || ''}</span>
        </button>
      `).join('')}
    </div>
    <div class="week-events__title">
      ${esc(dateLabel(selDay.ds))}
      <small>· ${selDay.items.length} ${selDay.items.length === 1 ? 'событие' : 'событий'}</small>
    </div>
    <div id="week-events-list">
      ${selDay.items.length ? selDay.items.map(it => {
        const now = new Date();
        const nowMin = now.getHours()*60 + now.getMinutes();
        const isNow = selDay.isToday && !it.completed && toMin(it.startTime) <= nowMin && nowMin < toMin(it.endTime);
        return `<div class="week-event ${it.completed?'done':''} ${isNow?'now':''}">
          <div class="week-event__time"><b>${it.startTime}</b>${it.endTime}</div>
          <div class="week-event__title">${esc(it.title)}</div>
          ${it.programId ? '<span class="week-event__tag">прогр.</span>' : ''}
          ${it.completed ? '<span class="week-event__tag">✓</span>' : ''}
        </div>`;
      }).join('') : '<div class="week-events__empty">В этот день пусто</div>'}
    </div>
    <button class="btn btn-ghost btn-sm btn-full" id="goDayView" type="button" style="margin-top:14px">Открыть этот день полностью →</button>
  `;
}

function bindWeekHandlers(root){
  root.querySelector('#wkPrev').onclick = () => {
    const d = new Date(N.S.navlife.viewDate+'T00:00:00');
    d.setDate(d.getDate() - 7);
    N.S.navlife.viewDate = fmtDate(d);
    saveState(); go('schedule');
  };
  root.querySelector('#wkNext').onclick = () => {
    const d = new Date(N.S.navlife.viewDate+'T00:00:00');
    d.setDate(d.getDate() + 7);
    N.S.navlife.viewDate = fmtDate(d);
    saveState(); go('schedule');
  };
  root.querySelectorAll('[data-pick-day]').forEach(b => b.onclick = () => {
    N.S.navlife.viewDate = b.dataset.pickDay;
    saveState(); SFX.tap(); go('schedule');
  });
  root.querySelector('#goDayView').onclick = () => {
    N.S.viewMode = 'day';
    saveState(); go('schedule');
  };
}

function renderMonthHtml(){
  const base = N.S.navlife.viewDate || todayKey();
  const bd = new Date(base+'T00:00:00');
  const y = bd.getFullYear(), mo = bd.getMonth();
  const startDow = (new Date(y, mo, 1).getDay() + 6) % 7;
  const daysIn = new Date(y, mo+1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysIn; d++) cells.push(new Date(y, mo, d));
  while (cells.length % 7) cells.push(null);

  const label = `${monNames[mo][0].toUpperCase()}${monNames[mo].slice(1)} ${y}`;
  const today = todayKey();

  let selected = N.S.navlife.viewDate;
  const selDate = new Date(selected+'T00:00:00');
  if (selDate.getFullYear() !== y || selDate.getMonth() !== mo){
    selected = (new Date().getFullYear() === y && new Date().getMonth() === mo) ? today : fmtDate(new Date(y, mo, 1));
  }
  const selItems = itemsForDate(selected);
  const MOOD_EMO = {1:'😞',2:'😐',3:'🙂',4:'😄',5:'🤩'};

  return `
    <div class="week-nav">
      <button class="icon-btn" id="moPrev" type="button">‹</button>
      <div class="week-nav__label">${label}</div>
      <button class="icon-btn" id="moNext" type="button">›</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:8px">
      ${['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d =>
        `<div style="text-align:center;font-size:10.5px;font-weight:700;color:var(--ink-mute);letter-spacing:.06em">${d}</div>`
      ).join('')}
    </div>
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:16px">
      ${cells.map(c => {
        if (!c) return '<div></div>';
        const ds = fmtDate(c);
        const isToday = ds === today;
        const isSel = ds === selected;
        const items = N.S.navlife.schedule.filter(x => x.date === ds);
        const done = items.filter(x => x.completed).length;
        const allDone = items.length > 0 && done === items.length;
        const mood = N.S.mood[ds];
        const mem = mood ? MOOD_EMO[mood.m] : null;
        return `<button data-mo-date="${ds}" type="button" style="
          aspect-ratio:1;border-radius:10px;padding:2px;cursor:pointer;
          background:${isSel ? 'var(--moss-soft)' : (isToday ? 'var(--amber-soft)' : 'var(--surface-raised)')};
          border:2px solid ${isSel ? 'var(--moss)' : (isToday ? 'var(--amber)' : 'var(--line)')};
          display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;
          transition:all .15s;
        ">
          <div style="font-family:'Fraunces',serif;font-size:13px;font-weight:600;color:${isSel ? 'var(--moss)' : (isToday ? 'var(--amber-dim)' : 'var(--ink)')}">${c.getDate()}</div>
          <div style="display:flex;gap:2px;align-items:center;height:10px">
            ${allDone ? '<span style="width:4px;height:4px;border-radius:50%;background:var(--moss)"></span>' : ''}
            ${mem ? `<span style="font-size:9px;line-height:1">${mem}</span>` : ''}
          </div>
        </button>`;
      }).join('')}
    </div>
    <div class="week-events__title">
      ${esc(dateLabel(selected))}
      <small>· ${selItems.length}</small>
    </div>
    <div>
      ${selItems.length ? selItems.map(it => {
        const now = new Date();
        const nowMin = now.getHours()*60 + now.getMinutes();
        const isNow = selected === today && !it.completed && toMin(it.startTime) <= nowMin && nowMin < toMin(it.endTime);
        return `<div class="week-event ${it.completed?'done':''} ${isNow?'now':''}">
          <div class="week-event__time"><b>${it.startTime}</b>${it.endTime}</div>
          <div class="week-event__title">${esc(it.title)}</div>
          ${it.completed ? '<span class="week-event__tag">✓</span>' : ''}
        </div>`;
      }).join('') : '<div class="week-events__empty">Пусто</div>'}
    </div>
    <button class="btn btn-ghost btn-sm btn-full" id="goDayView" type="button" style="margin-top:14px">Открыть этот день полностью →</button>
  `;
}

function bindMonthHandlers(root){
  root.querySelector('#moPrev').onclick = () => {
    const d = new Date(N.S.navlife.viewDate+'T00:00:00');
    d.setMonth(d.getMonth() - 1);
    N.S.navlife.viewDate = fmtDate(d);
    saveState(); go('schedule');
  };
  root.querySelector('#moNext').onclick = () => {
    const d = new Date(N.S.navlife.viewDate+'T00:00:00');
    d.setMonth(d.getMonth() + 1);
    N.S.navlife.viewDate = fmtDate(d);
    saveState(); go('schedule');
  };
  root.querySelectorAll('[data-mo-date]').forEach(cell => {
    cell.onclick = () => {
      N.S.navlife.viewDate = cell.dataset.moDate;
      saveState(); SFX.tap(); go('schedule');
    };
  });
  root.querySelector('#goDayView').onclick = () => {
    N.S.viewMode = 'day';
    saveState(); go('schedule');
  };
}

function setupDragDrop(root){
  const list = root.querySelector('#schedList');
  if (!list) return;
  const PX_PER_MIN = 1.2, SNAP = 5;
  let dragState = null, dragJustEnded = false;

  const cleanup = () => {
    if (dragState){
      clearTimeout(dragState.holdTimer);
      if (dragState.row){ dragState.row.classList.remove('dragging'); dragState.row.style.transform = ''; dragState.row.style.zIndex = ''; }
      if (dragState.badge) dragState.badge.remove();
    }
    $$('.sched-row', list).forEach(r => r.classList.remove('drag-ghost'));
    dragState = null;
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onUp);
    document.removeEventListener('touchcancel', onUp);
  };
  const onMove = ev => {
    if (!dragState) return;
    const y = ev.touches ? ev.touches[0].clientY : ev.clientY;
    const dy = y - dragState.startY;
    if (!dragState.active && Math.abs(dy) > 5){ clearTimeout(dragState.holdTimer); cleanup(); return; }
    if (!dragState.active) return;
    if (ev.cancelable) ev.preventDefault();
    const minutesDelta = Math.round(dy / PX_PER_MIN / SNAP) * SNAP;
    const newStart = clamp(dragState.startMin + minutesDelta, 0, 1440 - dragState.durationMin);
    const newEnd = newStart + dragState.durationMin;
    dragState.moved = true;
    dragState.row.style.transform = `translateY(${(newStart-dragState.startMin)*PX_PER_MIN}px)`;
    if (dragState.badge) dragState.badge.textContent = `${fmtMinToClock(newStart)} – ${fmtMinToClock(newEnd)}`;
    dragState.newStart = newStart; dragState.newEnd = newEnd;
  };
  const onUp = () => {
    if (!dragState){ cleanup(); return; }
    const st = dragState;
    if (st.active && st.moved){
      const it = N.S.navlife.schedule.find(x => x.id === st.id);
      if (it){
        it.startTime = fmtMinToClock(st.newStart);
        it.endTime = fmtMinToClock(st.newEnd);
        saveState(); SFX.ok();
        if (st.newStart !== st.startMin) toast(`Перенеслось на ${fmtMinToClock(st.newStart)}`);
      }
      dragJustEnded = true; cleanup();
      setTimeout(() => go('schedule'), 80);
    } else if (st.active){
      dragJustEnded = true; cleanup(); openEventModal(st.id);
    } else { cleanup(); }
  };
  const onStart = (row, ev) => {
    if (ev.target.closest('[data-no-drag]') || ev.target.closest('button')) return;
    const id = row.dataset.id;
    const it = N.S.navlife.schedule.find(x => x.id === id);
    if (!it) return;
    const clientY = ev.touches ? ev.touches[0].clientY : ev.clientY;
    dragState = {
      id, row, it, startY: clientY,
      startMin: toMin(it.startTime),
      durationMin: toMin(it.endTime) - toMin(it.startTime),
      active:false, moved:false, badge:null, holdTimer:null,
      newStart: toMin(it.startTime), newEnd: toMin(it.endTime)
    };
    dragState.holdTimer = setTimeout(() => {
      if (!dragState) return;
      dragState.active = true;
      row.classList.add('dragging');
      $$('.sched-row', list).forEach(r => { if (r !== row) r.classList.add('drag-ghost'); });
      buzz([8,20,8]); SFX.tap();
      const badge = document.createElement('div');
      badge.className = 'sched-time-badge';
      badge.textContent = `${it.startTime} – ${it.endTime}`;
      row.appendChild(badge);
      dragState.badge = badge;
    }, 220);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, {passive:false});
    document.addEventListener('touchend', onUp);
    document.addEventListener('touchcancel', onUp);
  };
  $$('.sched-row', list).forEach(row => {
    row.addEventListener('mousedown', ev => onStart(row, ev));
    row.addEventListener('touchstart', ev => onStart(row, ev), {passive:true});
  });
  root.addEventListener('click', e => {
    if (dragJustEnded){
      dragJustEnded = false;
      e.stopPropagation(); e.preventDefault();
      root._dragJustEnded = true;
      setTimeout(() => { root._dragJustEnded = false; }, 50);
    }
  }, true);
}

function openEventModal(editId){
  const it = editId ? N.S.navlife.schedule.find(i => i.id === editId) : null;
  const isEd = !!it;
  openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom:16px">${isEd?'Изменить':'Новое событие'}</div>
    <div class="field"><label>Название</label><input id="evTitle" value="${it?esc(it.title):''}" placeholder="Например, Английский"></div>
    <div class="field-row">
      <div class="field"><label>Начало</label><input id="evStart" type="time" value="${it?it.startTime:'09:00'}"></div>
      <div class="field"><label>Конец</label><input id="evEnd" type="time" value="${it?it.endTime:'09:30'}"></div>
    </div>
    <div class="field"><label>Тип</label>
      <select id="evType">
        <option value="task" ${it && it.type==='task'?'selected':''}>Задача</option>
        <option value="event" ${it && it.type==='event'?'selected':''}>Событие</option>
      </select>
    </div>
    <div class="field"><label>Повторение</label>
      <select id="evRepeat">
        <option value="none">Нет</option>
        <option value="daily">Ежедневно</option>
        <option value="every_other_day">Через день</option>
        <option value="weekly">По дням недели</option>
      </select>
    </div>
    <div class="field" id="weekField" style="display:none">
      <label>Дни недели</label>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        ${dowShort.map((d,i) => `<label style="display:flex;align-items:center;gap:4px;font-size:13px;padding:4px 8px;border:1px solid var(--line);border-radius:8px"><input type="checkbox" class="wcb" value="${i}"> ${d}</label>`).join('')}
      </div>
    </div>
    <div class="field"><label>Программа</label>
      <select id="evProg"><option value="">— нет —</option>${N.S.navlife.programs.map(p => `<option value="${p.id}" ${it && it.programId===p.id?'selected':''}>${esc(p.title)}</option>`).join('')}</select>
    </div>
    <div style="display:flex;gap:10px;margin-top:8px">
      ${isEd ? `<button class="btn btn-line btn-danger" id="evDel" type="button">Удалить</button>` : ''}
      <button class="btn btn-ghost btn-full" id="evCancel" type="button">Отмена</button>
      <button class="btn btn-primary btn-full" id="evSave" type="button">Сохранить</button>
    </div>`, m => {
    const rep = m.querySelector('#evRepeat');
    const wf = m.querySelector('#weekField');
    if (it && it.repeatRule){
      if (it.repeatRule === 'daily') rep.value = 'daily';
      else if (it.repeatRule === 'every_other_day') rep.value = 'every_other_day';
      else if (it.repeatRule.startsWith('weekly_')) rep.value = 'weekly';
    }
    rep.onchange = () => { wf.style.display = rep.value === 'weekly' ? 'block' : 'none'; };
    if (rep.value === 'weekly'){
      wf.style.display = 'block';
      const days = (it && it.repeatRule && it.repeatRule.startsWith('weekly_')) ? it.repeatRule.split('_')[1].split(',').map(Number) : [];
      m.querySelectorAll('.wcb').forEach(cb => { cb.checked = days.includes(+cb.value); });
    }
    m.querySelector('#evCancel').onclick = () => closeModal(m);
    m.querySelector('#evSave').onclick = () => {
      const title = m.querySelector('#evTitle').value.trim();
      if (!title){ toast('Введи название'); return; }
      const start = m.querySelector('#evStart').value || '09:00';
      const end = m.querySelector('#evEnd').value || '09:30';
      const type = m.querySelector('#evType').value;
      const programId = m.querySelector('#evProg').value || null;
      let rr = rep.value;
      if (rr === 'weekly'){
        const days = [];
        m.querySelectorAll('.wcb:checked').forEach(cb => days.push(cb.value));
        if (!days.length){ toast('Выберите день'); return; }
        rr = 'weekly_' + days.join(',');
      } else if (rr === 'none') rr = null;
      if (isEd){
        if (it.repeatRule){
          const today = todayKey();
          N.S.navlife.schedule = N.S.navlife.schedule.filter(x => !(
            x.id !== it.id && x.title === it.title && x.startTime === it.startTime &&
            x.endTime === it.endTime && x.fromRecurring && x.date >= today
          ));
        }
        Object.assign(it, { title, startTime: start, endTime: end, type, programId, repeatRule: rr });
      } else {
        N.S.navlife.schedule.push({
          id: uid('sch'), title, type, startTime: start, endTime: end,
          date: N.S.navlife.viewDate, completed: false, programId, goalStepId: null,
          fromBase: false, fromRecurring: false, repeatRule: rr || null
        });
      }
      saveState();
      if (rr && N.ensureRecurringEvents) N.ensureRecurringEvents();
      saveState();
      closeModal(m); go('schedule'); toast('Сохранено');
    };
    const del = m.querySelector('#evDel');
    if (del) del.onclick = () => {
      if (it.fromBase && it.baseRef && it.date >= todayKey()) N.S.navlife.baseSkip[`${it.date}|${it.baseRef}`] = true;
      N.S.navlife.schedule = N.S.navlife.schedule.filter(i => i.id !== it.id);
      saveState(); closeModal(m); go('schedule');
    };
  });
}
function openBaseModal(){
  openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom:16px">Пункт базового дня</div>
    <div class="field"><label>Название</label><input id="bTitle" placeholder="Например, Зарядка"></div>
    <div class="field-row">
      <div class="field"><label>Начало</label><input id="bStart" type="time" value="08:00"></div>
      <div class="field"><label>Конец</label><input id="bEnd" type="time" value="08:15"></div>
    </div>
    <div class="field"><label>Программа</label>
      <select id="bProg"><option value="">— нет —</option>${N.S.navlife.programs.map(p => `<option value="${esc(p.title)}">${esc(p.title)}</option>`).join('')}</select>
    </div>
    <div style="display:flex;gap:10px;margin-top:8px">
      <button class="btn btn-ghost btn-full" id="bCancel" type="button">Отмена</button>
      <button class="btn btn-primary btn-full" id="bSave" type="button">Добавить</button>
    </div>`, m => {
    m.querySelector('#bCancel').onclick = () => closeModal(m);
    m.querySelector('#bSave').onclick = () => {
      const title = m.querySelector('#bTitle').value.trim();
      if (!title){ toast('Введи название'); return; }
      N.S.navlife.baseRoutine.push({
        id: uid('base'), title,
        startTime: m.querySelector('#bStart').value,
        endTime: m.querySelector('#bEnd').value,
        programTitle: m.querySelector('#bProg').value || undefined
      });
      N.S.navlife.baseRoutine.sort((a,b) => toMin(a.startTime) - toMin(b.startTime));
      if (N.syncBaseEvents) N.syncBaseEvents();
      saveState(); closeModal(m); go('schedule');
      toast('Добавлено');
    };
  });
}

window.App.registerScreen('schedule', renderSchedule);
window.openEventModal = openEventModal;
window.openBaseModal = openBaseModal;
})();