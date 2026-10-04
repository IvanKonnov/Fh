/* ═══ NAVLIFE · ONBOARDING + LEVELS ═══ */
(function(){
'use strict';
const N = window.__nav;
const { go, saveState, esc, todayKey, levelInfo, LEVEL_NAMES, SFX, buzz, ensureAudio, toast, clamp } = N;

function renderOnboarding(){
  let step = 0, goal = 3;
  const root = document.createElement('div');
  root.className = 'screen';
  root.style.padding = '0';
  document.querySelector('#nav').classList.add('hidden');
  const STEPS = [
    {em:'🧭', t:'Твой маршрут по дню', p:'NavLife превращает цели в конкретные действия и ведёт тебя шаг за шагом.'},
    {em:'✅', t:'Привычки и серии', p:'Отмечай привычки одним тапом. Каждая ведёт свою серию дней.'},
    {em:'😴', t:'Сон и настроение', p:'Смотри, как сон влияет на продуктивность и настроение.'},
    {em:'🧠', t:'Тренировка мозга', p:'19 упражнений для памяти, внимания, счёта и логики.'},
    {em:'📊', t:'Единый прогресс', p:'30 достижений, статистика, рекорды — всё в одном месте.'}
  ];
  function draw(){
    const s = STEPS[step];
    root.innerHTML = `
      <div class="onb">
        <div class="onb-body">
          <div class="onb-art">${s.em}</div>
          <h1>${esc(s.t)}</h1>
          <p>${esc(s.p)}</p>
          ${step === STEPS.length-1 ? `
          <div class="onb-options" style="margin-top:22px">
            ${[1,3,5].map(n => `
              <button class="opt ${goal===n?'on':''}" data-goal="${n}" type="button">
                <span class="opt-em">${n===1?'🌤':n===3?'🔥':'🚀'}</span>
                <span style="flex:1">
                  <span class="opt-title">${n} тренировк${n===1?'а':'и'} в день</span>
                  <span class="opt-desc">${n===1?'Спокойный ритм':n===3?'Оптимально':'Интенсивно'}</span>
                </span>
              </button>`).join('')}
          </div>` : ''}
        </div>
        <div>
          <div class="onb-dots">${STEPS.map((_, i) => `<i class="${i===step?'on':''}"></i>`).join('')}</div>
          <button class="btn btn-primary btn-full btn-lg" id="onbNext" type="button">${step === STEPS.length-1 ? 'Начать' : 'Далее'}</button>
          ${step < STEPS.length-1 ? '<button class="btn btn-ghost btn-full" id="onbSkip" type="button" style="margin-top:10px">Пропустить</button>' : ''}
        </div>
      </div>`;
    root.querySelectorAll('[data-goal]').forEach(b => b.onclick = () => { goal = +b.dataset.goal; SFX.tap(); buzz(8); draw(); });
    root.querySelector('#onbNext').onclick = () => {
      SFX.tap(); buzz(12); ensureAudio();
      if (step < STEPS.length-1){ step++; draw(); }
      else {
        N.S.shared.onboarded = true;
        N.S.shared.dailyGoal = goal;
        saveState();
        if (window.Habits && window.Habits.seedDefault) window.Habits.seedDefault();
        go('today');
      }
    };
    const sk = root.querySelector('#onbSkip');
    if (sk) sk.onclick = () => { step = STEPS.length-1; draw(); };
  }
  draw();
  return root;
}

function renderLevels(){
  const root = document.createElement('div');
  root.className = 'screen';
  const EX_LIST = window.EX_LIST || [];
  const CATS = window.CATS || {};
  root.innerHTML = `
    <div class="row" style="margin-bottom:16px;gap:10px">
      <button class="icon-btn" id="back" type="button">←</button>
      <div class="h1" style="flex:1">Уровни</div>
    </div>
    <div class="card" style="background:var(--moss-soft);border-color:transparent;margin-bottom:16px">
      <div class="tiny" style="color:var(--moss);margin-bottom:8px">Как работает</div>
      <p style="font-size:13px;line-height:1.6;color:var(--moss);margin-bottom:12px">По умолчанию сложность <b>адаптивная</b>. 🎚 = ручной режим.</p>
      <button class="btn btn-ghost btn-sm" id="resetAll" type="button">Сбросить на Авто</button>
    </div>
    ${Object.keys(CATS).map(catKey => {
      const list = EX_LIST.filter(e => e.cat === catKey);
      const cc = CATS[catKey];
      if (!list.length) return '';
      return `
        <div class="cat-title" style="margin-top:18px"><span>${cc.icon}</span><span>${esc(cc.name)}</span></div>
        ${list.map(ex => {
          const man = N.S.neurofit.manualDiff[ex.id] || 0;
          const auto = clamp(N.S.neurofit.levels[ex.id] || ex.defaultLevel, 1, ex.levels.length);
          return `
            <div class="lvl-row">
              <div class="lico">${ex.icon}</div>
              <div class="lmeta">
                <div class="lnm">${esc(ex.name)}</div>
                <div class="lsub">${man > 0 ? `🎚 ${LEVEL_NAMES[man-1]}` : `🤖 Авто: ${LEVEL_NAMES[auto-1]}`}</div>
              </div>
            </div>
            <div class="picker" data-picker="${ex.id}">
              <button class="${man===0?'on':''}" data-l="0" type="button">🤖 Авто</button>
              ${LEVEL_NAMES.map((nm, i) => `<button class="${man===i+1?'on':''}" data-l="${i+1}" type="button">${i+1} ${esc(nm.slice(0,3))}</button>`).join('')}
            </div>`;
        }).join('')}
      `;
    }).join('')}
    <div style="height:20px"></div>`;
  root.querySelector('#back').onclick = () => go('profile');
  root.querySelector('#resetAll').onclick = () => {
    if (confirm('Сбросить?')){ N.S.neurofit.manualDiff = {}; saveState(); toast('Сброшено'); go('levels'); }
  };
  root.querySelectorAll('[data-picker]').forEach(picker => {
    const exId = picker.dataset.picker;
    picker.querySelectorAll('button').forEach(btn => btn.onclick = () => {
      const lvl = +btn.dataset.l;
      if (lvl === 0) delete N.S.neurofit.manualDiff[exId];
      else N.S.neurofit.manualDiff[exId] = lvl;
      saveState(); SFX.tap(); buzz(10); go('levels');
    });
  });
  return root;
}

window.App.registerScreen('onboarding', renderOnboarding);
window.App.registerScreen('levels', renderLevels);
})();