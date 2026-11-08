/* ═══ NAVLIFE · HOME · v2.5 (Safe water) ═══ */
(function(){
'use strict';
const N = window.__nav;
if (!N){ console.error('[HOME] __nav not found'); return; }
const { go, esc, toMin, todayKey, fmtMinToClock, SFX, buzz, levelInfo,
        dowNames, monNames, ensureBaseForDate, itemsForDate, computeDailyStats,
        findGoalStep, nutritionToday } = N;

function renderToday(){
  const ds = todayKey();
  ensureBaseForDate(ds);
  const d = new Date();
  const items = itemsForDate(ds);
  const nowMin = d.getHours()*60 + d.getMinutes();
  let current = items.find(i => !i.completed && toMin(i.startTime) <= nowMin && nowMin < toMin(i.endTime));
  let currentIdx = current ? items.indexOf(current) : -1;
  let next = null;
  if (current){ next = items.slice(currentIdx+1).find(i => !i.completed); }
  else {
    current = items.find(i => !i.completed && toMin(i.startTime) >= nowMin) || items.find(i => !i.completed);
    if (current){ currentIdx = items.indexOf(current); next = items.slice(currentIdx+1).find(i => !i.completed); }
  }
  const stat = computeDailyStats(ds);
  const nut = nutritionToday();
  
  // Защита от некорректных данных воды
  const safeWater = Math.min(Number(nut.water) || 0, 10000);
  const waterL = (safeWater / 1000).toFixed(1);
  
  const kcalPct = Math.round(nut.kcal / Math.max(1, N.S.nutrition.goals.calories) * 100);

  /* Проверка на Идеальный день */
  const habitsTotal = (N.S.habits || []).length;
  const habitsDone = (N.S.habits || []).filter(h => ((h.log||{})[ds] || 0) >= (h.target||1)).length;
  const isPerfectDay = items.length > 0 && stat.completed === items.length && (habitsTotal === 0 || habitsDone === habitsTotal);

  /* ─── СИНХРОННЫЙ РЕНДЕР СЛОТОВ ─── */
  const moodHtml    = (window.Mood   && window.Mood.strip)     ? window.Mood.strip()       : '';
  const sleepHtml   = (window.Sleep  && window.Sleep.todayCard) ? window.Sleep.todayCard() : '';
  const habitsHtml  = (window.Habits && window.Habits.homeCard) ? window.Habits.homeCard() : '';
  const eodHtml     = '<button class="btn btn-ghost btn-full" data-eod-open type="button" style="margin-top:14px">📋 Итог дня</button>';

  /* ─── СТАТУС БАР ─── */
  const focusSessionsToday = N.S.neurofit.sessions.filter(s => s.d === ds).length;
  const focusMinToday = focusSessionsToday * 3; // Примерно 3 мин на сессию
  const streak = N.S.neurofit.streak;

  const statusBarHtml = `
    <div style="display:flex;align-items:center;gap:8px;margin-top:8px;font-size:12.5px;color:var(--ink-soft);flex-wrap:wrap">
      <span style="display:inline-flex;align-items:center;gap:3px;background:var(--paper);padding:2px 8px;border-radius:100px;border:1px solid var(--line)">🔥 <b>${streak}</b></span>
      <span style="display:inline-flex;align-items:center;gap:3px;background:var(--paper);padding:2px 8px;border-radius:100px;border:1px solid var(--line)">🧠 <b>${focusMinToday}</b> мин</span>
      <span style="display:inline-flex;align-items:center;gap:3px;background:var(--paper);padding:2px 8px;border-radius:100px;border:1px solid var(--line)">💧 <b>${waterL}</b> л</span>
      ${isPerfectDay ? `<span style="display:inline-flex;align-items:center;gap:3px;background:var(--amber-soft);color:var(--amber-dim);padding:2px 8px;border-radius:100px;font-weight:600">✨ Идеальный день</span>` : ''}
    </div>
  `;

  const root = document.createElement('div');
  root.className = 'screen';
  if (isPerfectDay) root.classList.add('perfect-pulse');

  let heroHtml = '';
  if (!current){
    heroHtml = `<div class="card" style="text-align:center;padding:32px 24px">
      <div style="font-size:42px;margin-bottom:8px">🌿</div>
      <div class="h2" style="margin-bottom:6px">На сегодня всё выполнено</div>
      <p class="muted">Отличная работа!</p>
    </div>`;
  } else {
    const total = Math.max(1, toMin(current.endTime) - toMin(current.startTime));
    const isActive = toMin(current.startTime) <= nowMin && nowMin < toMin(current.endTime);
    const remain = isActive ? Math.max(0, toMin(current.endTime) - nowMin) : total;
    const prog = current.programId ? N.S.navlife.programs.find(p => p.id === current.programId) : null;
    const gs = current.goalStepId ? findGoalStep(current.goalStepId) : null;
    const why = prog ? prog.description : (gs ? `Двигает цель «${gs.goal.title}».` : null);
    heroHtml = `<div class="hero"><div class="hero-inner">
      <div class="eyebrow">${isActive?'СЕЙЧАС':'СЛЕДУЮЩЕЕ'}</div>
      <div class="lead">${esc(current.title)}</div>
      ${why ? `<p class="why">Зачем: ${esc(why)}</p>` : ''}
      <div class="between" style="align-items:flex-end;flex-wrap:wrap;gap:14px">
        <div class="time">${isActive ? fmtMinToClock(remain) : current.startTime}<small>${isActive?'осталось':'начало'}</small></div>
        ${prog
          ? `<button class="btn btn-primary btn-lg" data-run="${prog.id}" data-sched="${current.id}">▶ Начать</button>`
          : `<button class="btn btn-primary btn-lg" data-complete="${current.id}">${isActive?'Завершить':'Отметить'}</button>`}
      </div>
    </div></div>`;
  }

  const routeHtml = items.length ? items.map(it => {
    let cls = '';
    if (it.completed) cls = 'done';
    else if (current && it.id === current.id) cls = 'now';
    else if (toMin(it.endTime) < nowMin) cls = 'skipped';
    return `<div class="route-item ${cls}">
      <div class="route-node"></div>
      <div class="route-row">
        <div class="route-time">${it.startTime}</div>
        <div class="route-title">${esc(it.title)}</div>
        ${!it.completed ? `<button class="icon-btn" style="width:32px;height:32px;font-size:13px" data-complete="${it.id}">✓</button>` : ''}
      </div>
    </div>`;
  }).join('') : `<p class="muted">Пусто. Добавь события в «Делах».</p>`;

  root.innerHTML = `
    <div class="between" style="margin-bottom:16px">
      <div>
        <div class="tiny">${dowNames[d.getDay()]}, ${d.getDate()} ${monNames[d.getMonth()]}</div>
        <div class="h1" style="margin-top:3px">Привет, ${esc(N.S.shared.name)}</div>
        ${statusBarHtml}
      </div>
      <div class="chip amber" style="padding:8px 14px;align-self:flex-start">🔥 <b>${N.S.neurofit.streak}</b></div>
    </div>
    ${heroHtml}
    ${(current && next) ? `<div class="card" style="padding:14px 18px;display:flex;align-items:center;gap:12px">
      <div class="tiny" style="color:var(--moss)">ДАЛЕЕ</div>
      <div style="flex:1"><div style="font-weight:600;font-size:14px">${esc(next.title)}</div>
      <div class="muted" style="font-size:12px">${next.startTime}–${next.endTime}</div></div>
      <div style="color:var(--ink-mute)">→</div>
    </div>` : ''}
    <div class="h3" style="margin:22px 0 12px;font-family:'Fraunces',serif;font-size:16px">План дня</div>
    <div class="route-list">${routeHtml}</div>
    <div class="card" style="margin-top:22px">
      <div class="between" style="margin-bottom:10px">
        <div class="h3">Дела сегодня</div>
        <div class="tiny">${stat.completed} / ${stat.planned}</div>
      </div>
      <div class="bar"><i class="on" style="--p:${(stat.percentage/100).toFixed(3)}"></i></div>
      <p class="muted" style="margin-top:10px;font-size:12.5px">${stat.percentage}% плана · ${stat.remaining} осталось</p>
    </div>
    ${moodHtml}
    ${sleepHtml}
    <div id="home-habits-slot">${habitsHtml}</div>
    <div class="card tappable" data-goto="nutrition" style="background:var(--moss-soft);border-color:transparent">
      <div class="between">
        <div>
          <div class="tiny" style="color:var(--moss)">Питание сегодня</div>
          <div style="font-size:20px;font-family:'Fraunces',serif;font-weight:600;color:var(--moss);margin-top:4px">${nut.kcal} ккал</div>
          <div style="font-size:12px;color:var(--moss);opacity:.85;margin-top:2px">${kcalPct}% · 💧 ${safeWater} мл</div>
        </div>
        <div style="font-size:36px">🥗</div>
      </div>
    </div>
    <div class="cat-title" style="margin-top:22px"><span>🎯</span><span>Быстрый доступ</span></div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
      <button class="card tappable" data-goto="goals" style="text-align:center;padding:16px 8px;margin:0">
        <div style="font-size:26px;margin-bottom:4px">🎯</div>
        <div class="tiny" style="color:var(--ink)">Цели</div>
      </button>
      <button class="card tappable" data-goto="programs" style="text-align:center;padding:16px 8px;margin:0">
        <div style="font-size:26px;margin-bottom:4px">📋</div>
        <div class="tiny" style="color:var(--ink)">Программы</div>
      </button>
      <button class="card tappable" data-goto="knowledge" style="text-align:center;padding:16px 8px;margin:0">
        <div style="font-size:26px;margin-bottom:4px">📖</div>
        <div class="tiny" style="color:var(--ink)">Знания</div>
      </button>
    </div>
    <div class="card tappable" style="margin-top:16px;background:var(--amber-soft);border-color:transparent" data-goto="brain">
      <div class="between">
        <div>
          <div class="tiny" style="color:var(--amber-dim)">Уровень ${levelInfo(N.S.neurofit.xp).level} · ${N.S.neurofit.totalSessions} сессий</div>
          <div style="font-size:16px;font-weight:600;margin-top:6px;color:var(--amber-dim)">🧠 Тренировка мозга</div>
        </div>
        <div style="font-size:32px">→</div>
      </div>
    </div>
    <div class="card tappable" style="margin-top:10px;background:linear-gradient(135deg,#3F6152,#2A3A2F);border-color:transparent;color:#F4F2EA" data-goto="breathing">
      <div class="between">
        <div>
          <div class="tiny" style="color:#F3E3C8">ДЫХАНИЕ</div>
          <div style="font-size:15px;font-weight:600;margin-top:4px;color:#fff">2 минуты спокойствия</div>
          <div style="font-size:12px;color:#C7CEC5;margin-top:2px">4-7-8 · Box · Резонансное</div>
        </div>
        <div style="font-size:32px">🧘</div>
      </div>
    </div>
    ${eodHtml}
    <div style="height:20px"></div>`;

  if (isPerfectDay) {
    setTimeout(() => window.renderFireflies && window.renderFireflies(root), 100);
  }

  root.addEventListener('click', e => {
    const c = e.target.closest('[data-complete]');
    if (c){ N.completeScheduleItem(c.dataset.complete, true); return; }
    const r = e.target.closest('[data-run]');
    if (r){ window.startProgramRun && window.startProgramRun(r.dataset.run, r.dataset.sched || null); return; }
    const gt = e.target.closest('[data-goto]');
    if (gt){ SFX.tap(); buzz(8); go(gt.dataset.goto); return; }

    if (e.target.closest('[data-mood-open]')){ e.stopPropagation(); if (window.Mood) window.Mood.open(); return; }
    if (e.target.closest('[data-sleep-open]')){ e.stopPropagation(); if (window.Sleep) window.Sleep.open(); return; }
    if (e.target.closest('[data-sleep-calc]')){ e.stopPropagation(); if (window.Sleep && window.Sleep.openCalc) window.Sleep.openCalc(); return; }
    if (e.target.closest('[data-eod-open]')){ e.stopPropagation(); if (window.checkEndOfDay) window.checkEndOfDay(true); return; }
  });
  return root;
}

window.App.registerScreen('today', renderToday);
window.renderToday = renderToday;

window.App.hooks.afterGo.push(name => {
  if (name !== 'today') return;
  requestAnimationFrame(() => {
    try {
      if (window.Habits && window.Habits.bindHomeCard) window.Habits.bindHomeCard();
    } catch (err) {}
  });
});
})();