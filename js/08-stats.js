/* ═══ NAVLIFE · STATS ═══ */
(function(){
'use strict';
const N = window.__nav;
const { go, esc, todayKey, fmtDate, levelInfo, dowShort, nutritionToday, itemsForDate } = N;
const CATS = { memory:{name:'Память',icon:'🧠'}, speed:{name:'Внимание',icon:'⚡'}, math:{name:'Счёт',icon:'🔢'}, logic:{name:'Логика',icon:'🧩'} };
const MODES = { normal:{emoji:'📋'}, endless:{emoji:'♾️'}, survival:{emoji:'💀'} };

function renderStats(){
  const S = N.S;
  const li = levelInfo(S.neurofit.xp);
  const todayDs = todayKey();
  const todayItems = itemsForDate(todayDs);
  const todayDone = todayItems.filter(i => i.completed).length;
  const todayPct = todayItems.length ? Math.round(todayDone/todayItems.length*100) : 0;
  const nut = nutritionToday();
  const g = S.nutrition.goals;
  const kcalPct = Math.min(100, Math.round(nut.kcal / Math.max(1, g.calories) * 100));
  const waterPct = Math.min(100, Math.round(nut.water / Math.max(1, g.water) * 100));

  const days = [];
  for (let i = 6; i >= 0; i--){
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = fmtDate(d);
    const trains = S.neurofit.sessions.filter(s => s.d === ds).length;
    const doneCnt = S.navlife.schedule.filter(x => x.date === ds && x.completed).length;
    days.push({ ds, dowShort: dowShort[d.getDay()], trains, done: doneCnt });
  }
  const maxV = Math.max(1, ...days.map(x => Math.max(x.trains, x.done)));

  const last = S.neurofit.sessions.slice(-30);
  const avgAcc = last.length ? Math.round(last.reduce((a, b) => a + b.acc, 0) / last.length) : 0;
  const rtArr = last.filter(x => x.rt > 0);
  const avgRt = rtArr.length ? Math.round(rtArr.reduce((a, b) => a + b.rt, 0) / rtArr.length) : 0;
  const mins = Math.round(S.neurofit.totalMs / 60000);
  const totalDone = S.navlife.schedule.filter(i => i.completed).length;

  const catStats = Object.keys(CATS).map(c => {
    const list = S.neurofit.sessions.filter(s => window.EX && window.EX[s.ex] && window.EX[s.ex].cat === c);
    const n = list.length;
    const acc = n ? Math.round(list.reduce((a, b) => a + b.acc, 0) / n) : 0;
    return { key:c, name:CATS[c].name, icon:CATS[c].icon, n, acc };
  });

  const recs = [];
  Object.keys(S.neurofit.records || {}).forEach(exId => {
    const r = S.neurofit.records[exId];
    ['endless','survival'].forEach(m => {
      if (r[m] && r[m].score) recs.push({ exId, mode:m, score: r[m].score });
    });
  });
  recs.sort((a, b) => b.score - a.score);

  const sleepMoodInsight = window.Sleep && window.Sleep.correlationInsight ? window.Sleep.correlationInsight() : '';

  const root = document.createElement('div');
  root.className = 'screen';
  root.innerHTML = `
    <div class="h1" style="margin-bottom:18px">Прогресс</div>

    <div class="hero" style="background:linear-gradient(155deg,#22302A 0%,#1B211D 62%);margin-bottom:14px">
      <div class="hero-inner">
        <div class="between" style="align-items:flex-start;margin-bottom:14px">
          <div>
            <div class="eyebrow">УРОВЕНЬ ${li.level}</div>
            <div style="font-family:'Fraunces',serif;font-size:34px;font-weight:600;color:#fff;line-height:1;margin-top:4px">${li.into} / ${li.need} XP</div>
          </div>
          <div style="text-align:right">
            <div class="eyebrow" style="color:#9AA398">ВСЕГО</div>
            <div style="font-family:'Fraunces',serif;font-size:24px;font-weight:600;color:#F3E3C8;line-height:1;margin-top:6px">${S.neurofit.xp} XP</div>
          </div>
        </div>
        <div style="height:6px;border-radius:4px;background:rgba(255,255,255,.15);overflow:hidden">
          <div style="height:100%;width:${(li.pct*100).toFixed(1)}%;background:linear-gradient(90deg,var(--amber),#F3E3C8);border-radius:4px;transition:width .5s"></div>
        </div>
        <p style="color:#C7CEC5;font-size:12.5px;margin-top:10px">До уровня ${li.level+1} — ${li.need - li.into} XP</p>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
      <div class="card" style="margin:0;padding:16px;text-align:center">
        <div style="font-size:28px;margin-bottom:4px">🔥</div>
        <div style="font-family:'Fraunces',serif;font-size:26px;font-weight:600;line-height:1">${S.neurofit.streak}</div>
        <div class="tiny" style="margin-top:4px">ДНЕЙ ПОДРЯД</div>
      </div>
      <div class="card" style="margin:0;padding:16px;text-align:center">
        <div style="font-size:28px;margin-bottom:4px">⭐</div>
        <div style="font-family:'Fraunces',serif;font-size:26px;font-weight:600;line-height:1">${S.neurofit.bestStreak}</div>
        <div class="tiny" style="margin-top:4px">РЕКОРД СЕРИИ</div>
      </div>
      <div class="card" style="margin:0;padding:16px;text-align:center">
        <div style="font-size:28px;margin-bottom:4px">🧠</div>
        <div style="font-family:'Fraunces',serif;font-size:26px;font-weight:600;line-height:1">${S.neurofit.totalSessions}</div>
        <div class="tiny" style="margin-top:4px">ТРЕНИРОВОК</div>
      </div>
      <div class="card" style="margin:0;padding:16px;text-align:center">
        <div style="font-size:28px;margin-bottom:4px">⏱</div>
        <div style="font-family:'Fraunces',serif;font-size:26px;font-weight:600;line-height:1">${mins}<span style="font-size:14px;font-weight:500"> мин</span></div>
        <div class="tiny" style="margin-top:4px">В ТРЕНИРОВКАХ</div>
      </div>
    </div>

    <div class="card">
      <div class="between" style="margin-bottom:12px">
        <div>
          <div class="h3" style="font-family:'Fraunces',serif;font-size:16px">Активность за неделю</div>
          <div class="muted" style="font-size:12px;margin-top:2px">Дела + тренировки мозга</div>
        </div>
        <div class="tiny">Пн–Вс</div>
      </div>
      <div class="chart" style="height:120px;padding:8px 4px 0">
        ${days.map(x => {
          const total = x.trains + x.done;
          const pct = Math.round(total/maxV*100);
          return `<div class="chart-col">
            <div class="chart-bar" style="height:100%"><div class="fillbar" style="--h:${(pct/100).toFixed(3)}"></div></div>
            <div class="chart-lbl">${x.dowShort}</div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <div id="stats-mood-slot"></div>
    ${sleepMoodInsight ? `<div class="mood-correlation">${sleepMoodInsight}</div>` : ''}

    <div class="card">
      <div class="h3" style="font-family:'Fraunces',serif;font-size:16px;margin-bottom:14px">Сегодня</div>
      <div style="margin-bottom:14px">
        <div class="between" style="margin-bottom:6px">
          <span style="font-size:13px;font-weight:600">📋 Дела по плану</span>
          <span class="muted" style="font-size:12.5px">${todayDone} / ${todayItems.length}</span>
        </div>
        <div class="bar"><i class="on" style="--p:${(todayPct/100).toFixed(3)}"></i></div>
      </div>
      <div style="margin-bottom:14px">
        <div class="between" style="margin-bottom:6px">
          <span style="font-size:13px;font-weight:600">🥗 Калории</span>
          <span class="muted" style="font-size:12.5px">${nut.kcal} / ${g.calories} ккал</span>
        </div>
        <div class="bar"><i class="on" style="--p:${(kcalPct/100).toFixed(3)};background:var(--amber)"></i></div>
      </div>
      <div>
        <div class="between" style="margin-bottom:6px">
          <span style="font-size:13px;font-weight:600">💧 Вода</span>
          <span class="muted" style="font-size:12.5px">${nut.water} / ${g.water} мл</span>
        </div>
        <div class="bar"><i class="on" style="--p:${(waterPct/100).toFixed(3)};background:var(--blue)"></i></div>
      </div>
    </div>

    <div id="stats-achievements-slot"></div>

    ${recs.length ? `
    <div class="card">
      <div class="h3" style="font-family:'Fraunces',serif;font-size:16px;margin-bottom:14px">🏆 Личные рекорды</div>
      ${recs.slice(0, 6).map(r => {
        const e = window.EX && window.EX[r.exId];
        if (!e) return '';
        const m = MODES[r.mode] || { emoji: '·' };
        return `<div class="res-row">
          <span class="muted" style="font-size:13px">${e.icon} ${esc(e.name)} <span style="opacity:.6">· ${m.emoji}</span></span>
          <b style="font-family:'Fraunces',serif;font-size:16px">${r.score}</b>
        </div>`;
      }).join('')}
    </div>` : ''}

    <div id="stats-reflection-slot"></div>

    <div style="height:20px"></div>`;

  return root;
}

window.App.registerScreen('stats', renderStats);

window.App.hooks.afterGo.push(name => {
  if (name !== 'stats') return;
  requestAnimationFrame(() => {
    if (window.Mood && window.Mood.chart) {
      const slot = document.querySelector('#stats-mood-slot');
      if (slot) slot.innerHTML = window.Mood.chart();
    }
    if (window.Reflection && window.Reflection.statsCard) {
      const slot = document.querySelector('#stats-reflection-slot');
      if (slot) slot.innerHTML = window.Reflection.statsCard();
    }
    if (window.Achievements && window.Achievements.previewCard) {
      const slot = document.querySelector('#stats-achievements-slot');
      if (slot) slot.innerHTML = window.Achievements.previewCard();
    }
    document.querySelectorAll('[data-mood-open]').forEach(b => {
      b.onclick = e => { e.stopPropagation(); window.Mood && window.Mood.open(); };
    });
    const reflectBtn = document.querySelector('#statsReflectBtn');
    if (reflectBtn) reflectBtn.onclick = () => window.Reflection && window.Reflection.open();
    const reflectHist = document.querySelector('#statsReflectHistBtn');
    if (reflectHist) reflectHist.onclick = () => window.Reflection && window.Reflection.history();
    const achBtn = document.querySelector('#statsAchBtn');
    if (achBtn) achBtn.onclick = () => go('achievements');
  });
});
})();