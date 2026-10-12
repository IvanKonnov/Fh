/* ═══ NAVLIFE · HABITS ↔ SCHEDULE · v2.0 · надёжная связка ═══ */
(function(){
'use strict';
const N = window.__nav;
if (!N){ console.error('[HS-LINK] __nav not found'); return; }
const qs = (s, r=document) => r.querySelector(s);
const qsa = (s, r=document) => Array.from(r.querySelectorAll(s));
const _esc = (s) => String(s??'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function links(){ return N.S.navlife.habitLinks = N.S.navlife.habitLinks || {}; }
function save(){ N.saveState(); }

function addMinutes(hhmm, m){
  const [h, mm] = hhmm.split(':').map(Number);
  const total = h*60 + mm + m;
  return String(Math.floor(total/60) % 24).padStart(2,'0') + ':' + String(total % 60).padStart(2,'0');
}

/* Создать базовый пункт для привычки */
function createBaseForHabit(habit, time){
  const base = N.S.navlife.baseRoutine || (N.S.navlife.baseRoutine = []);
  const oldId = links()[habit.id];
  if (oldId){
    N.S.navlife.baseRoutine = base.filter(b => b.id !== oldId);
    /* Снимем skip — чтобы базовые события перегенерились */
    const baseSkip = N.S.navlife.baseSkip || {};
    Object.keys(baseSkip).forEach(k => {
      if (k.endsWith('|' + oldId)) delete baseSkip[k];
    });
  }
  const newId = 'base_hab_' + Math.random().toString(36).slice(2,8);
  base.push({
    id: newId,
    title: `${habit.emoji || '✅'} ${habit.title}`,
    startTime: time,
    endTime: addMinutes(time, 15),
    habitId: habit.id,
    programTitle: undefined
  });
  base.sort((a,b) => N.toMin(a.startTime) - N.toMin(b.startTime));
  links()[habit.id] = newId;
  save();
  if (N.syncBaseEvents) N.syncBaseEvents();
  return newId;
}

/* Удалить связь */
function removeBaseForHabit(habit){
  const baseId = links()[habit.id];
  if (!baseId) return;
  N.S.navlife.baseRoutine = (N.S.navlife.baseRoutine || []).filter(b => b.id !== baseId);
  delete links()[habit.id];
  /* Снимаем skip на сегодня и будущее */
  const baseSkip = N.S.navlife.baseSkip || {};
  Object.keys(baseSkip).forEach(k => {
    if (k.endsWith('|' + baseId)) delete baseSkip[k];
  });
  /* Удаляем сегодняшние события, привязанные к этому baseRef */
  N.S.navlife.schedule = N.S.navlife.schedule.filter(s => !(s.fromBase && s.baseRef === baseId));
  save();
  if (N.syncBaseEvents) N.syncBaseEvents();
}

/* Найти сегодняшнее событие для привычки */
function findTodayEventForHabit(habit){
  const baseId = links()[habit.id];
  if (!baseId) return null;
  const ds = N.todayKey();
  return N.S.navlife.schedule.find(s =>
    s.date === ds && s.fromBase && (s.baseRef === baseId)
  ) || null;
}

/* Двусторонняя синхронизация */
function syncHabitToSchedule(habit, isDone){
  const ev = findTodayEventForHabit(habit);
  if (!ev) return;
  ev.completed = isDone;
  save();
}

function syncScheduleToHabit(scheduleItem, isDone){
  if (!scheduleItem || !scheduleItem.fromBase || !scheduleItem.baseRef) return;
  const baseId = scheduleItem.baseRef;
  const habitId = Object.keys(links()).find(k => links()[k] === baseId);
  if (!habitId) return;
  const habit = (N.S.habits || []).find(h => h.id === habitId);
  if (!habit) return;
  habit.log = habit.log || {};
  const ds = scheduleItem.date;
  const target = habit.target || 1;
  const cur = habit.log[ds] || 0;
  if (isDone && cur < target){
    habit.log[ds] = target;
    save();
  } else if (!isDone && cur >= target){
    habit.log[ds] = 0;
    save();
  }
}

/* Перехват Habits.toggle */
const _toggleOrig = window.Habits && window.Habits.toggle;
if (_toggleOrig){
  window.Habits.toggle = function(id){
    const h = (N.S.habits || []).find(x => x.id === id);
    if (!h) return _toggleOrig.call(this, id);
    const wasDone = ((h.log || {})[N.todayKey()] || 0) >= (h.target || 1);
    _toggleOrig.call(this, id);
    syncHabitToSchedule(h, !wasDone);
    if (links()[id]){
      setTimeout(() => N.go(N.currentScreen || 'today'), 60);
    }
  };
}

/* Перехват completeScheduleItem */
const _completeOrig = N.completeScheduleItem;
N.completeScheduleItem = function(id, done){
  if (done === undefined) done = true;
  const it = N.S.navlife.schedule.find(i => i.id === id);
  if (it) syncScheduleToHabit(it, done);
  return _completeOrig.call(this, id, done);
};

/* ═══════════════════════════════════════════════════════════════════
   ИНЖЕКТ СЕКЦИИ СВЯЗКИ В МОДАЛКУ ПРИВЫЧКИ
   Работаем через capture-фазу + setTimeout, потому что 10-habits.js
   вызывает openEditModal локально (не через window.Habits)
   ═══════════════════════════════════════════════════════════════════ */
let lastEditId = undefined; /* undefined = не открыта, null = новая, id = редактирование */

function injectSection(){
  const modal = document.querySelector('#modal-root .modal');
  if (!modal) return;
  if (modal.querySelector('[data-hs-link-section]')) return;
  /* Проверим, что это точно модалка привычки — есть input hbTitle */
  if (!modal.querySelector('#hbTitle')) return;

  const isEd = !!lastEditId;
  const habit = isEd ? (N.S.habits || []).find(x => x.id === lastEditId) : null;
  const baseId = habit ? links()[habit.id] : null;
  const base = baseId ? (N.S.navlife.baseRoutine || []).find(b => b.id === baseId) : null;
  const linked = !!base;
  const timeVal = base ? base.startTime : '21:00';

  const section = document.createElement('div');
  section.setAttribute('data-hs-link-section', '');
  section.style.cssText = 'padding:12px 14px;background:var(--paper);border-radius:12px;margin-bottom:14px';
  section.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:12px">
      <div style="flex:1;min-width:0">
        <div class="h3" style="font-size:13.5px;margin-bottom:2px">🔗 Связать с расписанием</div>
        <div class="muted" style="font-size:11.5px;line-height:1.4">Создаст событие в базовом дне. Отметки будут синхронизированы.</div>
      </div>
      <div class="switch ${linked?'on':''}" data-hs-switch></div>
    </div>
    <div data-hs-time-wrap style="display:${linked?'block':'none'};margin-top:10px">
      <label style="display:block;font-size:11.5px;font-weight:600;color:var(--ink-soft);margin-bottom:4px">Время события</label>
      <input type="time" data-hs-time value="${timeVal}" style="width:100%;padding:8px 12px;border:1px solid var(--line);border-radius:9px;background:var(--surface);color:var(--ink);font-size:14px">
    </div>
  `;

  /* Вставляем перед блоком с кнопками — ищем #hbSave */
  const saveBtn = modal.querySelector('#hbSave');
  const btnRow = saveBtn ? saveBtn.parentNode : null;
  if (btnRow && btnRow.parentNode){
    btnRow.parentNode.insertBefore(section, btnRow);
  } else {
    modal.appendChild(section);
  }

  const sw = section.querySelector('[data-hs-switch]');
  const timeWrap = section.querySelector('[data-hs-time-wrap]');
  sw.onclick = () => {
    sw.classList.toggle('on');
    timeWrap.style.display = sw.classList.contains('on') ? 'block' : 'none';
    N.SFX.tap(); N.buzz(6);
  };
}

/* Capture-фаза клика — определяем, что открывается модалка привычки */
document.addEventListener('click', e => {
  const editBtn = e.target.closest('[data-edit-habit]');
  const addBtn = e.target.closest('#addHabit, #addFirstHabit');
  if (editBtn){
    lastEditId = editBtn.dataset.editHabit;
    setTimeout(injectSection, 80);
  } else if (addBtn){
    lastEditId = null;
    setTimeout(injectSection, 80);
  }
}, true);

/* Capture-фаза клика по сохранению — применяем связь */
document.addEventListener('click', e => {
  const saveBtn = e.target.closest('#hbSave');
  if (!saveBtn) return;
  const modal = saveBtn.closest('.modal');
  if (!modal) return;
  const section = modal.querySelector('[data-hs-link-section]');
  if (!section) return;
  const sw = section.querySelector('[data-hs-switch]');
  const timeInput = section.querySelector('[data-hs-time]');
  const linked = sw && sw.classList.contains('on');
  const time = timeInput ? timeInput.value : '21:00';
  const editId = lastEditId;

  /* Оригинальный onclick сохранит привычку — дадим 80мс */
  setTimeout(() => {
    let habit;
    if (editId){
      habit = (N.S.habits || []).find(h => h.id === editId);
    } else {
      /* Новая — берём последнюю в массиве */
      const arr = N.S.habits || [];
      habit = arr[arr.length - 1];
    }
    if (!habit) return;

    if (linked){
      createBaseForHabit(habit, time);
    } else {
      removeBaseForHabit(habit);
    }
    N.go('habits');
  }, 80);
}, true);

/* Сброс состояния при закрытии модалки */
document.addEventListener('click', e => {
  if (e.target.closest('.modal-backdrop') || e.target.closest('#hbCancel')){
    setTimeout(() => { lastEditId = undefined; }, 250);
  }
}, true);

console.log('[HS-Link] v2.0 loaded');
})();