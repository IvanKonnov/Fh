/* ═══ NAVLIFE · REFLECTION ═══ */
(function(){
'use strict';
const N = window.__nav;
const { go, saveState, esc, todayKey, openModal, closeModal, toast, SFX } = N;

function currentWeekKey(){
  const d = new Date();
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

function open(){
  const wk = currentWeekKey();
  const ex = N.S.reflections.find(r => r.week === wk);
  openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom:6px">Неделя в фокусе</div>
    <p class="muted" style="margin-bottom:18px">5 минут рефлексии. Ответы можно перечитать через месяц.</p>
    <div class="field">
      <label>Что получилось?</label>
      <textarea id="rfQ1" style="min-height:70px;width:100%;border:1px solid var(--line);border-radius:9px;padding:10px 12px;font-family:inherit;background:var(--surface);color:var(--ink);font-size:14px" placeholder="Победы, приятные моменты">${ex ? esc(ex.q1||'') : ''}</textarea>
    </div>
    <div class="field">
      <label>Что не получилось?</label>
      <textarea id="rfQ2" style="min-height:70px;width:100%;border:1px solid var(--line);border-radius:9px;padding:10px 12px;font-family:inherit;background:var(--surface);color:var(--ink);font-size:14px" placeholder="Что было сложно">${ex ? esc(ex.q2||'') : ''}</textarea>
    </div>
    <div class="field">
      <label>Что изменить на следующей неделе?</label>
      <textarea id="rfQ3" style="min-height:70px;width:100%;border:1px solid var(--line);border-radius:9px;padding:10px 12px;font-family:inherit;background:var(--surface);color:var(--ink);font-size:14px" placeholder="1–3 конкретных изменения">${ex ? esc(ex.q3||'') : ''}</textarea>
    </div>
    <div style="display:flex;gap:10px;margin-top:16px">
      <button class="btn btn-ghost btn-full" id="rfCancel" type="button">Отмена</button>
      <button class="btn btn-primary btn-full" id="rfSave" type="button">Сохранить</button>
    </div>
  `, m => {
    m.querySelector('#rfCancel').onclick = () => closeModal(m);
    m.querySelector('#rfSave').onclick = () => {
      const q1 = m.querySelector('#rfQ1').value.trim();
      const q2 = m.querySelector('#rfQ2').value.trim();
      const q3 = m.querySelector('#rfQ3').value.trim();
      if (!q1 && !q2 && !q3){ toast('Хотя бы одно поле'); return; }
      if (!N.S.reflections) N.S.reflections = [];
      const idx = N.S.reflections.findIndex(r => r.week === wk);
      const obj = { week: wk, date: todayKey(), q1, q2, q3, ts: Date.now() };
      if (idx >= 0) N.S.reflections[idx] = obj;
      else N.S.reflections.push(obj);
      saveState();
      closeModal(m);
      toast('Записано ✓');
      SFX.ok();
      if (window.Achievements) window.Achievements.check();
      go(N.currentScreen || 'stats');
    };
  });
}

function history(){
  const list = (N.S.reflections || []).slice().sort((a, b) => b.ts - a.ts);
  openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom:16px">Дневник рефлексии</div>
    ${list.length ? list.map(r => `
      <div class="card" style="padding:16px">
        <div class="tiny" style="margin-bottom:10px">${esc(r.week)} · ${esc(r.date)}</div>
        ${r.q1 ? `<div style="font-size:13px;margin-bottom:8px;line-height:1.5"><b style="color:var(--moss)">Что получилось:</b> ${esc(r.q1)}</div>` : ''}
        ${r.q2 ? `<div style="font-size:13px;margin-bottom:8px;line-height:1.5"><b style="color:var(--rust)">Что не получилось:</b> ${esc(r.q2)}</div>` : ''}
        ${r.q3 ? `<div style="font-size:13px;line-height:1.5"><b style="color:var(--amber-dim)">План:</b> ${esc(r.q3)}</div>` : ''}
      </div>`).join('') : '<p class="muted" style="margin-bottom:20px;text-align:center;padding:24px 0">Пока нет записей. Сделай первую — 5 минут.</p>'}
    <button class="btn btn-primary btn-full btn-lg" id="rflClose" type="button">Закрыть</button>
  `, m => { m.querySelector('#rflClose').onclick = () => closeModal(m); });
}

function statsCard(){
  const rcount = (N.S.reflections || []).length;
  return `<div class="card">
    <div class="between">
      <div>
        <div class="h3" style="font-family:'Fraunces',serif;font-size:16px">Дневник рефлексии</div>
        <div class="muted" style="font-size:12.5px;margin-top:2px">5 минут раз в неделю · ${rcount} ${rcount === 1 ? 'запись' : 'записей'}</div>
      </div>
      <div style="font-size:24px">📓</div>
    </div>
    <div style="display:flex;gap:8px;margin-top:14px">
      <button class="btn btn-primary btn-full" id="statsReflectBtn" type="button">Написать сейчас</button>
      <button class="btn btn-ghost" id="statsReflectHistBtn" type="button" style="flex:0 0 auto">Все</button>
    </div>
  </div>`;
}

window.Reflection = { open, history, statsCard, currentWeekKey };
})();