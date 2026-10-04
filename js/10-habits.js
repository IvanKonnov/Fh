/* ═══ NAVLIFE · HABITS ═══ */
(function(){
'use strict';
const N = window.__nav;
const { go, saveState, esc, uid, todayKey, fmtDate, openModal, closeModal, toast, SFX, buzz, dowShort } = N;

function list(){ return N.S.habits || []; }
function findBy(id){ return list().find(h => h.id === id); }
function todayCount(h){ return (h.log && h.log[todayKey()]) || 0; }
function isDone(h){ return todayCount(h) >= (h.target || 1); }

function streakOf(h){
  const target = h.target || 1;
  let streak = 0;
  const cursor = new Date();
  const todayD = fmtDate(cursor);
  if (((h.log||{})[todayD] || 0) < target){
    cursor.setDate(cursor.getDate() - 1);
  }
  while (true){
    const k = fmtDate(cursor);
    if (((h.log||{})[k] || 0) >= target){ streak++; cursor.setDate(cursor.getDate() - 1); }
    else break;
    if (streak > 9999) break;
  }
  return streak;
}
function bestStreak(h){
  if (!h.log) return 0;
  const keys = Object.keys(h.log).filter(k => (h.log[k] || 0) >= (h.target || 1)).sort();
  if (!keys.length) return 0;
  let best = 1, cur = 1;
  for (let i = 1; i < keys.length; i++){
    const prev = new Date(keys[i-1] + 'T00:00:00');
    const now  = new Date(keys[i] + 'T00:00:00');
    const diff = Math.round((now - prev) / 86400000);
    if (diff === 1) { cur++; best = Math.max(best, cur); }
    else cur = 1;
  }
  return best;
}
function weekStatus(h){
  const arr = [];
  for (let i = 6; i >= 0; i--){
    const d = new Date(); d.setDate(d.getDate() - i);
    const k = fmtDate(d);
    arr.push({ date: k, done: ((h.log||{})[k] || 0) >= (h.target || 1), isToday: i === 0 });
  }
  return arr;
}

function toggle(id){
  const h = findBy(id);
  if (!h) return;
  h.log = h.log || {};
  const ds = todayKey();
  const target = h.target || 1;
  const cur = h.log[ds] || 0;
  if (cur >= target){ h.log[ds] = 0; }
  else { h.log[ds] = cur + 1; }
  saveState();
  if (isDone(h)){ SFX.ok(); buzz(12); N.flash('ok'); }
  else SFX.tap();
  if (window.Achievements) window.Achievements.check();
  if (N.currentScreen === 'habits') go('habits');
  else if (N.currentScreen === 'today'){
    const slot = document.querySelector('#home-habits-slot');
    if (slot) slot.innerHTML = homeCard();
    bindHomeCard();
  }
}

function bindHomeCard(){
  document.querySelectorAll('[data-habit-toggle]').forEach(b => {
    if (b._bound) return;
    b._bound = true;
    b.addEventListener('click', e => { e.stopPropagation(); toggle(b.dataset.habitToggle); });
  });
  const seeAll = document.querySelector('[data-goto-habits]');
  if (seeAll && !seeAll._bound){
    seeAll._bound = true;
    seeAll.addEventListener('click', e => { e.stopPropagation(); go('habits'); });
  }
}

function renderHabits(){
  const habits = list();
  const root = document.createElement('div');
  root.className = 'screen';

  const doneToday = habits.filter(isDone).length;
  const totalStreaks = habits.reduce((s, h) => s + streakOf(h), 0);

  root.innerHTML = `
    <div class="between" style="margin-bottom:18px">
      <div>
        <div class="tiny">СЕГОДНЯ</div>
        <div class="h1" style="margin-top:3px">Привычки</div>
      </div>
      <button class="btn btn-primary btn-sm" id="addHabit" type="button">+ Привычка</button>
    </div>

    <div class="card" style="background:linear-gradient(155deg,#22302A 0%,#1B211D 62%);color:#F4F2EA">
      <div class="between" style="align-items:flex-end">
        <div>
          <div class="tiny" style="color:#F3E3C8;letter-spacing:.14em">СЕГОДНЯ</div>
          <div style="font-family:'Fraunces',serif;font-size:38px;font-weight:600;color:#F3E3C8;line-height:1;margin-top:6px">${doneToday} / ${habits.length}</div>
          <div style="font-size:12.5px;color:#C7CEC5;margin-top:6px">выполнено</div>
        </div>
        <div style="text-align:right">
          <div class="tiny" style="color:#9AA398;letter-spacing:.14em">СУММА СЕРИЙ</div>
          <div style="font-family:'Fraunces',serif;font-size:26px;font-weight:600;color:#F3E3C8;line-height:1;margin-top:6px">🔥 ${totalStreaks}</div>
        </div>
      </div>
    </div>

    ${habits.length ? `<div class="habits-grid">${habits.map(h => habitCardHtml(h)).join('')}</div>`
                    : `<div class="card" style="text-align:center;padding:40px 24px">
                         <div style="font-size:44px;margin-bottom:10px">✅</div>
                         <div class="h2" style="margin-bottom:6px">Пока нет привычек</div>
                         <p class="muted" style="margin-bottom:16px">Начни с одной. Например «Вода» или «10 страниц».</p>
                         <button class="btn btn-primary" id="addFirstHabit" type="button">+ Добавить привычку</button>
                       </div>`}
    <div style="height:20px"></div>`;

  root.querySelector('#addHabit').onclick = () => openEditModal(null);
  const af = root.querySelector('#addFirstHabit');
  if (af) af.onclick = () => openEditModal(null);

  root.addEventListener('click', e => {
    const card = e.target.closest('[data-habit-id]');
    if (card && !e.target.closest('[data-edit-habit]')){
      toggle(card.dataset.habitId);
      return;
    }
    const ed = e.target.closest('[data-edit-habit]');
    if (ed){ e.stopPropagation(); openEditModal(ed.dataset.editHabit); }
  });

  return root;
}

function habitCardHtml(h){
  const cur = todayCount(h);
  const target = h.target || 1;
  const done = cur >= target;
  const st = streakOf(h);
  const week = weekStatus(h);

  return `
    <div class="habit-card ${done?'done':''}" data-habit-id="${h.id}">
      <div class="habit-card__top">
        <div class="habit-card__em">${h.emoji || '✅'}</div>
        <div class="habit-card__meta">
          <div class="habit-card__title">${esc(h.title)}</div>
          <div class="habit-card__sub">${done ? '✓ сегодня' : `Осталось ${target - cur}`}</div>
        </div>
        <button class="icon-btn" data-edit-habit="${h.id}" type="button" style="width:26px;height:26px;font-size:11px;background:transparent;border-color:transparent;color:var(--ink-mute)">✎</button>
      </div>
      <div class="habit-dots">
        ${week.map(w => `<div class="habit-dot ${w.done?'on':''} ${w.isToday?'today':''}" title="${w.date}"></div>`).join('')}
      </div>
      <div class="habit-card__foot">
        <span class="habit-card__streak ${st === 0 ? 'zero' : ''}">🔥 ${st} ${st === 1 ? 'день' : (st < 5 ? 'дня' : 'дней')}</span>
        <span class="habit-card__count">${cur}<small>/${target}</small></span>
      </div>
    </div>`;
}

function homeCard(){
  const habits = list();
  if (!habits.length){
    return `<button class="card tappable" data-goto-habits type="button" style="width:100%;text-align:left;margin-top:14px">
      <div class="between">
        <div>
          <div class="tiny">ПРИВЫЧКИ</div>
          <div style="font-size:15px;font-weight:600;margin-top:6px">Добавь первую привычку</div>
          <div class="muted" style="font-size:12.5px;margin-top:2px">Один тап — и серия пошла</div>
        </div>
        <div style="font-size:30px">✅</div>
      </div>
    </button>`;
  }
  const doneToday = habits.filter(isDone).length;
  return `<div class="card" style="margin-top:14px">
    <div class="between" style="margin-bottom:12px">
      <div>
        <div class="tiny">ПРИВЫЧКИ СЕГОДНЯ</div>
        <div style="font-size:15px;font-weight:600;margin-top:4px">${doneToday} / ${habits.length}</div>
      </div>
      <button class="btn btn-line btn-sm" data-goto-habits type="button">Все →</button>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      ${habits.slice(0, 6).map(h => {
        const done = isDone(h);
        const cur = todayCount(h);
        const target = h.target || 1;
        return `<button class="habit-pill ${done?'done':''}" data-habit-toggle="${h.id}" type="button">
          <span style="font-size:16px">${h.emoji || '✅'}</span>
          <span>${esc(h.title)}</span>
          ${target > 1 ? `<span style="opacity:.7">${cur}/${target}</span>` : ''}
        </button>`;
      }).join('')}
    </div>
  </div>`;
}

const EMOJIS = ['💧','🚭','📖','🧘','✍️','🏃','🥗','💪','🚶','🎯','☀️','🌙','🧠','💊','🦷','📝','🎨','🎵','🌿','🙏','💤','🚿','🍎','📵','🧹'];

function openEditModal(id){
  const h = id ? findBy(id) : null;
  const isEd = !!h;
  let emoji = h ? h.emoji : '💧';
  let target = h ? h.target : 1;

  openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom:16px">${isEd ? 'Изменить привычку' : 'Новая привычка'}</div>

    <div class="tiny" style="margin-bottom:8px">ИКОНКА</div>
    <div id="emojiGrid" style="display:grid;grid-template-columns:repeat(8,1fr);gap:5px;margin-bottom:18px">
      ${EMOJIS.map(e => `<button type="button" data-em="${e}" style="
        aspect-ratio:1;border-radius:10px;font-size:22px;
        background:${emoji===e ? 'var(--moss-soft)' : 'var(--paper)'};
        border:2px solid ${emoji===e ? 'var(--moss)' : 'var(--line)'};
        display:grid;place-items:center;cursor:pointer;transition:all .15s;
      ">${e}</button>`).join('')}
    </div>

    <div class="field">
      <label>Название</label>
      <input id="hbTitle" value="${h?esc(h.title):''}" placeholder="Например, Вода" maxlength="30">
    </div>

    <div class="field">
      <label>Цель в день</label>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        ${[1,2,3,5,8,10].map(n => `<button type="button" data-target="${n}" style="
          padding:8px 14px;border-radius:9px;font-size:13px;font-weight:600;
          background:${target===n ? 'var(--moss)' : 'var(--paper)'};
          color:${target===n ? '#fff' : 'var(--ink)'};
          border:1px solid ${target===n ? 'var(--moss)' : 'var(--line)'};
          cursor:pointer;
        ">${n}</button>`).join('')}
        <input id="hbCustom" type="number" min="1" max="99" value="${target}" style="width:80px;padding:8px 10px;border:1px solid var(--line);border-radius:9px;background:var(--surface);color:var(--ink);font-size:13px">
      </div>
    </div>

    ${isEd ? `<div style="padding:14px;background:var(--paper);border-radius:12px;margin-bottom:16px">
      <div class="tiny" style="margin-bottom:6px">СТАТИСТИКА</div>
      <div style="font-size:13px;line-height:1.6">
        Текущая серия: <b>🔥 ${streakOf(h)}</b><br>
        Лучшая серия: <b>⭐ ${bestStreak(h)}</b><br>
        Всего дней: <b>${Object.keys(h.log||{}).filter(k => (h.log[k]||0) >= (h.target||1)).length}</b>
      </div>
    </div>` : ''}

    <div style="display:flex;gap:10px">
      ${isEd ? '<button class="btn btn-line btn-danger" id="hbDel" type="button">Удалить</button>' : ''}
      <button class="btn btn-ghost btn-full" id="hbCancel" type="button">Отмена</button>
      <button class="btn btn-primary btn-full" id="hbSave" type="button">${isEd ? 'Сохранить' : 'Добавить'}</button>
    </div>`, m => {
    const updateEmoji = () => m.querySelectorAll('[data-em]').forEach(b => {
      b.style.background = b.dataset.em === emoji ? 'var(--moss-soft)' : 'var(--paper)';
      b.style.borderColor = b.dataset.em === emoji ? 'var(--moss)' : 'var(--line)';
    });
    m.querySelectorAll('[data-em]').forEach(b => b.onclick = () => { emoji = b.dataset.em; SFX.tap(); updateEmoji(); });
    m.querySelectorAll('[data-target]').forEach(b => b.onclick = () => {
      target = +b.dataset.target;
      m.querySelector('#hbCustom').value = target;
      m.querySelectorAll('[data-target]').forEach(x => {
        const on = +x.dataset.target === target;
        x.style.background = on ? 'var(--moss)' : 'var(--paper)';
        x.style.color = on ? '#fff' : 'var(--ink)';
        x.style.borderColor = on ? 'var(--moss)' : 'var(--line)';
      });
    });
    m.querySelector('#hbCustom').oninput = () => {
      target = Math.max(1, Math.min(99, +m.querySelector('#hbCustom').value || 1));
    };
    m.querySelector('#hbCancel').onclick = () => closeModal(m);
    m.querySelector('#hbSave').onclick = () => {
      const title = m.querySelector('#hbTitle').value.trim();
      if (!title){ toast('Введи название'); return; }
      if (isEd){
        h.emoji = emoji;
        h.title = title;
        h.target = target;
      } else {
        N.S.habits = N.S.habits || [];
        N.S.habits.push({
          id: uid('hab'),
          emoji,
          title,
          target,
          log: {},
          createdAt: todayKey()
        });
      }
      saveState();
      if (window.Achievements) window.Achievements.check();
      closeModal(m); go('habits');
      toast(isEd ? 'Обновлено' : 'Привычка добавлена');
    };
    const del = m.querySelector('#hbDel');
    if (del) del.onclick = () => {
      if (confirm('Удалить привычку со всей историей?')){
        N.S.habits = N.S.habits.filter(x => x.id !== h.id);
        saveState(); closeModal(m); go('habits');
      }
    };
  });
}

function seedDefault(){
  if ((N.S.habits || []).length) return;
  N.S.habits = [
    { id: uid('hab'), emoji:'💧', title:'Вода',     target:8, log:{}, createdAt: todayKey() },
    { id: uid('hab'), emoji:'🚭', title:'Без сахара',target:1, log:{}, createdAt: todayKey() },
    { id: uid('hab'), emoji:'📖', title:'10 страниц',target:1, log:{}, createdAt: todayKey() },
    { id: uid('hab'), emoji:'🧘', title:'Медитация', target:1, log:{}, createdAt: todayKey() },
    { id: uid('hab'), emoji:'✍️', title:'Дневник',   target:1, log:{}, createdAt: todayKey() }
  ];
  saveState();
}

window.Habits = {
  list, findBy, isDone, streakOf, bestStreak, weekStatus,
  toggle, homeCard, bindHomeCard, seedDefault, openEditModal
};
window.App.registerScreen('habits', renderHabits);
})();