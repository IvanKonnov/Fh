/* ═══ NAVLIFE · MOOD ═══ */
(function(){
'use strict';
const N = window.__nav;
const { go, saveState, todayKey, fmtDate, openModal, closeModal, toast, SFX, buzz, dowShort } = N;

const MOODS = [
  { v:1, em:'😞', label:'Плохо' },
  { v:2, em:'😐', label:'Нейтр.' },
  { v:3, em:'🙂', label:'Хорошо' },
  { v:4, em:'😄', label:'Отлично' },
  { v:5, em:'🤩', label:'Супер' },
];

function open(){
  const S = N.S;
  const ds = todayKey();
  const cur = S.mood[ds] || { m: 0, e: 0 };
  let m = cur.m, e = cur.e;

  function html(){
    return `
      <div class="modal-handle"></div>
      <div class="h2" style="margin-bottom:6px">Как ты сегодня?</div>
      <p class="muted" style="margin-bottom:18px">Пара секунд — и можно закрывать</p>
      <div class="tiny" style="margin-bottom:10px">НАСТРОЕНИЕ</div>
      <div style="display:flex;justify-content:space-between;gap:6px;margin-bottom:22px">
        ${MOODS.map(x => `
          <button data-m="${x.v}" type="button" style="
            flex:1;aspect-ratio:1;max-width:58px;border-radius:50%;font-size:26px;
            background:${m === x.v ? 'var(--moss-soft)' : 'var(--paper)'};
            border:2px solid ${m === x.v ? 'var(--moss)' : 'var(--line)'};
            display:grid;place-items:center;cursor:pointer;transition:all .18s;
            transform:${m === x.v ? 'scale(1.08)' : 'scale(1)'};
          ">${x.em}</button>`).join('')}
      </div>
      <div class="tiny" style="margin-bottom:10px">ЭНЕРГИЯ</div>
      <div style="display:flex;gap:6px;margin-bottom:22px">
        ${[1,2,3,4,5].map(x => `
          <button data-e="${x}" type="button" style="
            flex:1;padding:12px 4px;border-radius:10px;font-weight:700;font-size:15px;
            background:${e === x ? 'var(--moss)' : 'var(--paper)'};
            color:${e === x ? '#fff' : 'var(--ink-soft)'};
            border:1px solid ${e === x ? 'var(--moss)' : 'var(--line)'};
            cursor:pointer;transition:all .15s;
          ">${x}</button>`).join('')}
      </div>
      <div style="display:flex;gap:10px">
        <button class="btn btn-ghost btn-full" id="moodCancel" type="button">Отмена</button>
        <button class="btn btn-primary btn-full" id="moodSave" type="button" ${(!m || !e) ? 'disabled style="opacity:.5;pointer-events:none"' : ''}>Сохранить</button>
      </div>`;
  }
  function bind(layer){
    const modal = layer.querySelector('.modal');
    const redraw = () => { modal.innerHTML = html(); bind(layer); };
    modal.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { m = +b.dataset.m; SFX.tap(); buzz(6); redraw(); });
    modal.querySelectorAll('[data-e]').forEach(b => b.onclick = () => { e = +b.dataset.e; SFX.tap(); buzz(6); redraw(); });
    const c = modal.querySelector('#moodCancel');
    if (c) c.onclick = () => closeModal(layer);
    const s = modal.querySelector('#moodSave');
    if (s) s.onclick = () => {
      if (!m || !e) return;
      if (!N.S.mood) N.S.mood = {};
      N.S.mood[ds] = { m, e, ts: Date.now() };
      saveState();
      closeModal(layer);
      toast('Записано ✓');
      SFX.ok();
      if (window.Achievements) window.Achievements.check();
      go(N.currentScreen || 'today');
    };
  }
  const layer = openModal(html());
  bind(layer);
}

function strip(){
  const S = N.S;
  const today = todayKey();
  const cur = S.mood[today];
  if (cur){
    const mm = MOODS.find(x => x.v === cur.m);
    return `<button class="card tappable" data-mood-open type="button" style="width:100%;text-align:left;background:var(--moss-soft);border-color:transparent;margin-top:14px">
      <div class="between">
        <div>
          <div class="tiny" style="color:var(--moss)">НАСТРОЕНИЕ СЕГОДНЯ</div>
          <div style="font-size:22px;margin-top:6px;display:flex;align-items:center;gap:10px">
            <span>${mm ? mm.em : '🙂'}</span>
            <span style="font-size:14px;color:var(--moss);font-weight:600">Энергия ${cur.e}/5</span>
          </div>
        </div>
        <div style="font-size:26px;color:var(--moss);opacity:.7">✎</div>
      </div>
    </button>`;
  }
  return `<button class="card tappable" data-mood-open type="button" style="width:100%;text-align:left;margin-top:14px">
    <div class="between">
      <div>
        <div class="tiny">ДНЕВНИК НАСТРОЕНИЯ</div>
        <div style="font-size:15px;font-weight:600;margin-top:6px">Как ты сегодня?</div>
        <div class="muted" style="font-size:12.5px;margin-top:2px">1 тап · пара секунд</div>
      </div>
      <div style="font-size:30px">🙂</div>
    </div>
  </button>`;
}

function chart(){
  const S = N.S;
  const days = [];
  for (let i = 6; i >= 0; i--){
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = fmtDate(d);
    days.push({ ds, dow: dowShort[d.getDay()], entry: S.mood[ds] });
  }
  const hasAny = days.some(x => x.entry);
  if (!hasAny){
    return `<div class="card">
      <div class="h3" style="font-family:'Fraunces',serif;font-size:16px;margin-bottom:6px">Настроение за неделю</div>
      <p class="muted" style="font-size:12.5px;margin-bottom:14px">Начни вести дневник — 1 тап вечером</p>
      <button class="btn btn-ghost btn-full" data-mood-open type="button">Отметить настроение сегодня</button>
    </div>`;
  }
  return `<div class="card">
    <div class="between" style="margin-bottom:16px">
      <div>
        <div class="h3" style="font-family:'Fraunces',serif;font-size:16px">Настроение за неделю</div>
        <div class="muted" style="font-size:12px;margin-top:2px">Эмодзи + уровень энергии</div>
      </div>
      <button class="btn btn-line btn-sm" data-mood-open type="button">+ Отметить</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">
      ${days.map(x => {
        const mm = x.entry ? MOODS.find(m => m.v === x.entry.m) : null;
        const e = x.entry ? x.entry.e : 0;
        const hp = (e / 5) * 100;
        return `<div style="text-align:center">
          <div style="font-size:10.5px;color:var(--ink-mute);font-weight:600;margin-bottom:4px">${x.dow}</div>
          <div style="font-size:24px;height:32px;line-height:32px">${mm ? mm.em : '<span style="opacity:.25">·</span>'}</div>
          <div style="height:44px;border-radius:6px;background:var(--paper);border:1px solid var(--line);position:relative;overflow:hidden;margin-top:4px">
            <div style="position:absolute;bottom:0;left:0;right:0;height:${hp}%;background:linear-gradient(180deg,var(--moss),var(--moss-dim));transition:height .5s"></div>
          </div>
          <div style="font-size:9.5px;color:var(--ink-mute);margin-top:3px;font-weight:600">${e ? e + '/5' : '—'}</div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

window.Mood = { open, strip, chart, MOODS };
})();