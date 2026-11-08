/* ═══ NAVLIFE · AUTO-SCHEDULE · v2.1 · sync injection ═══ */
(function(){
'use strict';
const N = window.__nav;
if (!N){ console.error('[AUTOSCHED] __nav not found'); return; }
const qs = (s, r=document) => r.querySelector(s);
const qsa = (s, r=document) => Array.from(r.querySelectorAll(s));
const _esc = (s) => String(s??'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function fmtClock(m){
  m = ((m % (24*60)) + 24*60) % (24*60);
  return String(Math.floor(m/60)).padStart(2,'0') + ':' + String(m%60).padStart(2,'0');
}
function toMin(t){
  const [h, m] = (t || '00:00').split(':').map(Number);
  return (h||0)*60 + (m||0);
}

function computeFreeSlots(ds){
  const items = N.S.navlife.schedule
    .filter(i => i.date === ds)
    .sort((a,b) => toMin(a.startTime) - toMin(b.startTime));

  const slots = [];
  let cursor = 7 * 60;
  const dayEnd = 22 * 60;

  items.forEach(it => {
    const start = toMin(it.startTime);
    const end = toMin(it.endTime);
    if (start - cursor >= 15) slots.push({ start: cursor, end: start });
    cursor = Math.max(cursor, end);
  });
  if (dayEnd - cursor >= 15) slots.push({ start: cursor, end: dayEnd });
  return slots;
}

function habitsToSchedule(){
  const ds = N.todayKey();
  const links = N.S.navlife.habitLinks || {};
  const habits = N.S.habits || [];
  return habits.filter(h => {
    if (!links[h.id]) return false;
    const target = h.target || 1;
    const cur = ((h.log || {})[ds] || 0);
    return cur < target;
  });
}

function openEditor(ds, items){
  const freeSlots = computeFreeSlots(ds);
  const usedIds = items.filter(i => i.type === 'habit').map(i => i.habitId);

  const layer = N.openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom:6px">✨ Собрать день</div>
    <p class="muted" style="margin-bottom:14px">Отредактируй время, длительность, отметь нужные. Лишнее — удали.</p>

    <div style="padding:10px 12px;background:var(--moss-soft);border-radius:10px;margin-bottom:14px;font-size:12.5px;color:var(--moss);line-height:1.5">
      📊 На день: <b>${N.S.navlife.schedule.filter(i => i.date === ds).length} событий</b> · <b>${freeSlots.length} свободных окон</b> · <b>${items.length} в плане</b>
    </div>

    <div id="asItems"></div>

    <button class="btn btn-line btn-full btn-sm" id="asAdd" type="button" style="margin-top:10px">+ Добавить</button>

    <div style="display:flex;gap:10px;margin-top:16px">
      <button class="btn btn-ghost btn-full" id="asCancel" type="button">Отмена</button>
      <button class="btn btn-primary btn-full btn-lg" id="asApply" type="button">Применить</button>
    </div>
  `, m => {
    const itemsEl = m.querySelector('#asItems');

    function drawItems(){
      if (!items.length){
        itemsEl.innerHTML = `<div style="text-align:center;padding:24px 12px;color:var(--ink-mute);font-size:13px">
          Ничего не выбрано. Нажми «+ Добавить».
        </div>`;
        updateApplyCount();
        return;
      }
      itemsEl.innerHTML = items.map((it, i) => `
        <div style="padding:12px;background:${it.include ? 'var(--paper)' : 'var(--line-soft)'};border:1px solid ${it.include ? 'var(--line)' : 'var(--line-soft)'};border-radius:12px;margin-bottom:8px;${it.include ? '' : 'opacity:.55'}">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
            <button type="button" data-toggle="${i}" style="
              width:22px;height:22px;border-radius:6px;flex-shrink:0;
              background:${it.include ? 'var(--moss)' : 'transparent'};
              border:1.5px solid ${it.include ? 'var(--moss)' : 'var(--line)'};
              color:#fff;font-size:12px;font-weight:700;cursor:pointer;
              display:grid;place-items:center;
            ">${it.include ? '✓' : ''}</button>
            <div style="flex:1;min-width:0">
              <div style="font-size:13.5px;font-weight:600;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                ${it.emoji || '📋'} ${_esc(it.title)}
              </div>
              <div style="font-size:11px;color:var(--ink-mute);margin-top:2px">
                ${it.type === 'habit' ? 'привычка' : 'вручную'}
              </div>
            </div>
            <button type="button" data-del="${i}" style="
              width:28px;height:28px;border-radius:8px;background:transparent;border:none;
              color:var(--rust);font-size:14px;cursor:pointer;display:grid;place-items:center;
            ">✕</button>
          </div>
          <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:6px">
            <div>
              <div class="tiny" style="font-size:10px;margin-bottom:3px">ВРЕМЯ</div>
              <input type="time" data-time="${i}" value="${it.time}" style="
                width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:8px;
                font-size:13.5px;font-weight:600;background:var(--surface);color:var(--ink);text-align:center;
              ">
            </div>
            <div>
              <div class="tiny" style="font-size:10px;margin-bottom:3px">МИНУТ</div>
              <select data-dur="${i}" style="
                width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:8px;
                font-size:13.5px;font-weight:600;background:var(--surface);color:var(--ink);text-align:center;
              ">
                ${[10,15,20,30,45,60].map(v => `<option value="${v}" ${it.duration === v ? 'selected' : ''}>${v}</option>`).join('')}
              </select>
            </div>
          </div>
          <div data-conflict="${i}" style="display:none;font-size:11px;color:var(--rust);font-weight:600;margin-top:6px"></div>
        </div>
      `).join('');
      bindItems();
      checkConflicts();
      updateApplyCount();
    }

    function bindItems(){
      itemsEl.querySelectorAll('[data-toggle]').forEach(b => b.onclick = () => {
        const i = +b.dataset.toggle;
        items[i].include = !items[i].include;
        N.SFX.tap();
        drawItems();
      });
      itemsEl.querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
        const i = +b.dataset.del;
        if (!confirm(`Удалить «${items[i].title}» из плана?`)) return;
        items.splice(i, 1);
        N.SFX.tap(); N.buzz(6);
        drawItems();
      });
      itemsEl.querySelectorAll('[data-time]').forEach(inp => {
        inp.onchange = () => {
          items[+inp.dataset.time].time = inp.value || '12:00';
          checkConflicts();
        };
      });
      itemsEl.querySelectorAll('[data-dur]').forEach(sel => {
        sel.onchange = () => {
          items[+sel.dataset.dur].duration = +sel.value;
          checkConflicts();
        };
      });
    }

    function checkConflicts(){
      const dayItems = N.S.navlife.schedule.filter(i => i.date === ds);
      items.forEach((it, i) => {
        const el = itemsEl.querySelector(`[data-conflict="${i}"]`);
        if (!el) return;
        if (!it.include){ el.style.display = 'none'; return; }
        const s1 = toMin(it.time);
        const e1 = s1 + it.duration;
        let conflict = null;
        for (const ev of dayItems){
          const s2 = toMin(ev.startTime);
          const e2 = toMin(ev.endTime);
          if (s1 < e2 && e1 > s2){ conflict = ev.title; break; }
        }
        for (let j = 0; j < items.length; j++){
          if (j === i) continue;
          const o = items[j];
          if (!o.include) continue;
          const s2 = toMin(o.time);
          const e2 = s2 + o.duration;
          if (s1 < e2 && e1 > s2){ conflict = `«${o.title}»`; break; }
        }
        if (conflict){
          el.style.display = 'block';
          el.textContent = `⚠ Пересекается с «${conflict}»`;
        } else {
          el.style.display = 'none';
        }
      });
    }

    function updateApplyCount(){
      const applyBtn = m.querySelector('#asApply');
      if (!applyBtn) return;
      const n = items.filter(i => i.include).length;
      applyBtn.textContent = n ? `Применить (${n})` : 'Применить';
      applyBtn.disabled = n === 0;
      applyBtn.style.opacity = n === 0 ? '.5' : '1';
      applyBtn.style.pointerEvents = n === 0 ? 'none' : 'auto';
    }

    const addBtn = m.querySelector('#asAdd');
    addBtn.onclick = () => {
      openAddPicker(ds, usedIds, (newItem) => {
        items.push(newItem);
        if (newItem.type === 'habit') usedIds.push(newItem.habitId);
        N.SFX.ok(); N.buzz(8);
        drawItems();
      });
    };

    m.querySelector('#asCancel').onclick = () => N.closeModal(layer);
    m.querySelector('#asApply').onclick = () => {
      const toApply = items.filter(i => i.include);
      if (!toApply.length) return;
      toApply.forEach(it => {
        N.S.navlife.schedule.push({
          id: 'auto_' + Math.random().toString(36).slice(2,9),
          title: it.title,
          type: 'task',
          startTime: it.time,
          endTime: fmtClock(toMin(it.time) + it.duration),
          date: ds,
          completed: false,
          programId: null,
          goalStepId: null,
          fromBase: false,
          fromRecurring: false,
          habitId: it.habitId || null
        });
      });
      N.saveState();
      N.closeModal(layer);
      N.SFX.win();
      if (window.Haptics) Haptics.play('success');
      N.toast(`Добавлено ${toApply.length} ${toApply.length === 1 ? 'событие' : 'событий'}`);
      setTimeout(() => N.go('schedule'), 100);
    };

    drawItems();
  });
}

function openAddPicker(ds, usedHabitIds, onPick){
  const availableHabits = habitsToSchedule().filter(h => !usedHabitIds.includes(h.id));

  N.openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom:6px">Что добавить?</div>
    <p class="muted" style="margin-bottom:14px">Привычка с привязкой или собственное событие.</p>

    <div id="apHabitsWrap">
      <div class="tiny" style="margin-bottom:6px;letter-spacing:.08em">ПРИВЫЧКИ С ПРИВЯЗКОЙ</div>
      ${availableHabits.length ? availableHabits.map((h, i) => `
        <button type="button" data-pick-habit="${h.id}" style="
          width:100%;text-align:left;padding:12px 14px;border-radius:10px;margin-bottom:6px;
          background:var(--paper);border:1px solid var(--line);cursor:pointer;
          display:flex;align-items:center;gap:10px;
        ">
          <span style="font-size:22px;flex-shrink:0">${h.emoji || '✅'}</span>
          <span style="flex:1;min-width:0">
            <span style="display:block;font-size:13.5px;font-weight:600;color:var(--ink)">${_esc(h.title)}</span>
            <span style="display:block;font-size:11px;color:var(--ink-mute);margin-top:1px">${h.target > 1 ? `цель ${h.target}/день` : 'каждый день'}</span>
          </span>
          <span style="font-size:18px;color:var(--moss);font-weight:700">+</span>
        </button>
      `).join('') : `<div class="muted" style="text-align:center;padding:14px;font-size:12.5px">Все привычки уже добавлены</div>`}
    </div>

    <div class="tiny" style="margin-top:14px;margin-bottom:6px;letter-spacing:.08em">СВОЁ СОБЫТИЕ</div>
    <button type="button" data-pick-manual style="
      width:100%;text-align:left;padding:12px 14px;border-radius:10px;
      background:var(--paper);border:1px dashed var(--moss);cursor:pointer;
      display:flex;align-items:center;gap:10px;
    ">
      <span style="font-size:22px;flex-shrink:0">✍️</span>
      <span style="flex:1">
        <span style="display:block;font-size:13.5px;font-weight:600;color:var(--moss)">Добавить событие вручную</span>
        <span style="display:block;font-size:11px;color:var(--ink-mute);margin-top:1px">Название, время, длительность</span>
      </span>
      <span style="font-size:18px;color:var(--moss);font-weight:700">+</span>
    </button>

    <button class="btn btn-ghost btn-full" data-pick-cancel type="button" style="margin-top:16px">Отмена</button>
  `, m => {
    m.querySelectorAll('[data-pick-habit]').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.pickHabit;
        const h = (N.S.habits || []).find(x => x.id === id);
        if (!h) return;
        const freeSlots = computeFreeSlots(ds);
        const slot = freeSlots[0];
        const time = slot ? fmtClock(slot.start) : '12:00';
        N.closeModal(m);
        onPick({
          type: 'habit',
          habitId: h.id,
          title: h.title,
          emoji: h.emoji || '✅',
          time,
          duration: 15,
          include: true
        });
      };
    });
    m.querySelector('[data-pick-manual]').onclick = () => {
      N.closeModal(m);
      openManualPrompt(ds, onPick);
    };
    m.querySelector('[data-pick-cancel]').onclick = () => N.closeModal(m);
  });
}

function openManualPrompt(ds, onPick){
  const freeSlots = computeFreeSlots(ds);
  const time = freeSlots[0] ? fmtClock(freeSlots[0].start) : '12:00';

  N.openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom:14px">Своё событие</div>
    <div class="field"><label>Название</label>
      <input id="mpTitle" placeholder="Например, Позвонить маме" maxlength="60">
    </div>
    <div class="field-row">
      <div class="field"><label>Время</label><input id="mpTime" type="time" value="${time}"></div>
      <div class="field"><label>Минут</label>
        <select id="mpDur">
          ${[10,15,20,30,45,60].map(v => `<option value="${v}" ${v===15?'selected':''}>${v}</option>`).join('')}
        </select>
      </div>
    </div>
    <div style="display:flex;gap:10px;margin-top:16px">
      <button class="btn btn-ghost btn-full" id="mpCancel" type="button">Отмена</button>
      <button class="btn btn-primary btn-full" id="mpSave" type="button">Добавить</button>
    </div>
  `, m => {
    m.querySelector('#mpCancel').onclick = () => N.closeModal(m);
    m.querySelector('#mpSave').onclick = () => {
      const t = m.querySelector('#mpTitle').value.trim();
      if (!t){ N.toast('Введи название'); return; }
      const time = m.querySelector('#mpTime').value || '12:00';
      const dur = +m.querySelector('#mpDur').value || 15;
      N.closeModal(m);
      onPick({
        type: 'manual',
        title: t,
        emoji: '✍️',
        time,
        duration: dur,
        include: true
      });
    };
  });
}

function startAutoSchedule(){
  const ds = N.todayKey();
  const pending = habitsToSchedule();

  if (!pending.length){
    N.toast('Все привычки уже выполнены или не имеют привязки');
    return;
  }

  const dayItems = N.S.navlife.schedule.filter(i => i.date === ds);
  const links = N.S.navlife.habitLinks || {};

  const missing = pending.filter(h => {
    const baseId = links[h.id];
    return !dayItems.some(s => s.fromBase && s.baseRef === baseId);
  });

  if (!missing.length){
    N.toast('У всех привычек уже есть время в расписании');
    return;
  }

  const freeSlots = computeFreeSlots(ds);
  if (!freeSlots.length){
    N.toast('Нет свободных окон в расписании');
    return;
  }

  const proposed = [];
  let slotIdx = 0;
  let slotCursor = freeSlots[0].start;

  missing.forEach(h => {
    if (slotIdx >= freeSlots.length) return;
    const curSlot = freeSlots[slotIdx];
    if (slotCursor + 15 > curSlot.end){
      slotIdx++;
      if (slotIdx >= freeSlots.length) return;
      slotCursor = freeSlots[slotIdx].start;
    }
    proposed.push({
      type: 'habit',
      habitId: h.id,
      title: h.title,
      emoji: h.emoji || '✅',
      time: fmtClock(slotCursor),
      duration: 15,
      include: true
    });
    slotCursor += 20;
  });

  if (!proposed.length){
    N.toast('Не хватило свободных окон');
    return;
  }

  openEditor(ds, proposed);
}

/* ═══ Кнопка в Делах — СИНХРОННО (без setTimeout → нет сжатия) ═══ */
window.App.hooks.afterGo.push(name => {
  if (name !== 'schedule') return;

  const host = qs('#screens');
  if (!host) return;
  if (host.querySelector('[data-auto-sched]')) return;
  const tplBtn = host.querySelector('[data-tpl-btn]');
  const switcher = host.querySelector('[data-view-switch]');
  const anchor = tplBtn || switcher;
  if (!anchor) return;

  const btn = document.createElement('button');
  btn.setAttribute('data-auto-sched', '');
  btn.type = 'button';
  btn.className = 'btn btn-primary btn-sm';
  btn.style.cssText = 'width:100%;margin-bottom:14px';
  btn.innerHTML = '✨ Собрать день';
  btn.onclick = () => {
    N.SFX.tap();
    if (window.Haptics) Haptics.play('ok');
    startAutoSchedule();
  };
  anchor.parentNode.insertBefore(btn, anchor.nextSibling);
});

window.AutoSchedule = { run: startAutoSchedule, openEditor };
console.log('[Auto-Schedule] v2.1 (sync) loaded');
})();