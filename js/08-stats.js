/* ═══ NAVLIFE · STATS · с анализом взаимосвязей ═══ */
(function(){
'use strict';
const N = window.__nav;
if (!N){ console.error('[STATS] __nav not found'); return; }
const { go, esc, todayKey, fmtDate, levelInfo, dowShort, dowNames, nutritionToday, itemsForDate } = N;
const CATS = { memory:{name:'Память',icon:'🧠'}, speed:{name:'Внимание',icon:'⚡'}, math:{name:'Счёт',icon:'🔢'}, logic:{name:'Логика',icon:'🧩'} };
const MODES = { normal:{emoji:'📋'}, endless:{emoji:'♾️'}, survival:{emoji:'💀'} };

/* ═══════════════════════════════════════════════════════════════════
   АНАЛИЗ ВЗАИМОСВЯЗЕЙ
   Ищем закономерности в накопленных данных.
   Порог: минимум 3 точки в каждой группе, чтобы избежать случайных выводов.
   Формулируем как НАБЛЮДЕНИЕ, не как причину.
   ═══════════════════════════════════════════════════════════════════ */

function avg(arr){ return arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0; }

/* Собрать данные за последние N дней в единый датасет */
function collectDailyMetrics(daysBack = 30){
  const S = N.S;
  const out = [];
  for (let i = 0; i < daysBack; i++){
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = fmtDate(d);
    const day = S.nutrition.days[ds];
    let kcal = 0;
    if (day && day.meals){
      ['breakfast','lunch','dinner','snack'].forEach(m => {
        (day.meals[m] || []).forEach(it => { kcal += (it.kcal || 0) * (it.grams || 0) / 100; });
      });
    }
    const items = S.navlife.schedule.filter(x => x.date === ds);
    const done = items.filter(x => x.completed).length;
    const total = items.length;
    const sessionsToday = S.neurofit.sessions.filter(s => s.d === ds);
    const avgAccToday = sessionsToday.length ? avg(sessionsToday.map(s => s.acc)) : null;
    const habitDone = (S.habits || []).filter(h => ((h.log||{})[ds] || 0) >= (h.target || 1)).length;
    const habitTotal = (S.habits || []).length;

    out.push({
      ds,
      dow: d.getDay(),
      sleep: S.sleep[ds] ? S.sleep[ds].hours : null,
      sleepQuality: S.sleep[ds] ? S.sleep[ds].quality : null,
      mood: S.mood[ds] ? S.mood[ds].m : null,
      energy: S.mood[ds] ? S.mood[ds].e : null,
      water: day ? (day.water || 0) : 0,
      kcal: Math.round(kcal),
      scheduleDone: done,
      scheduleTotal: total,
      schedulePct: total ? Math.round(done/total*100) : null,
      brainAcc: avgAccToday,
      brainSessions: sessionsToday.length,
      habitPct: habitTotal ? Math.round(habitDone/habitTotal*100) : null
    });
  }
  return out;
}

/* 1. Сон → Настроение */
function insightSleepMood(){
  const data = collectDailyMetrics(30).filter(x => x.sleep !== null && x.mood !== null);
  if (data.length < 6) return null;
  const short = data.filter(x => x.sleep < 6.5).map(x => x.mood);
  const mid   = data.filter(x => x.sleep >= 6.5 && x.sleep < 7.5).map(x => x.mood);
  const long  = data.filter(x => x.sleep >= 7.5).map(x => x.mood);
  if (short.length < 3 || long.length < 3) return null;
  const aS = avg(short), aL = avg(long);
  const diff = aL - aS;
  if (Math.abs(diff) < 0.4) return null;
  const direction = diff > 0 ? 'выше' : 'ниже';
  const fill = (v) => v.toFixed(1);
  return {
    icon: '😴',
    title: 'Сон и настроение',
    text: `В дни, когда ты спал <b>≥ 7.5 ч</b>, настроение в среднем <b>${fill(aL)}</b> из 5. 
           Когда <b>менее 6.5 ч</b> — <b>${fill(aS)}</b>. 
           Настроение на <b>${Math.abs(diff).toFixed(1)}</b> ${direction}.
           ${mid.length ? `При среднем сне — <b>${fill(avg(mid))}</b>.` : ''}
           <span style="opacity:.7">Это наблюдение на твоих данных, а не доказанная причина.</span>`
  };
}

/* 2. Сон → Продуктивность (дела) */
function insightSleepProductivity(){
  const data = collectDailyMetrics(30).filter(x => x.sleep !== null && x.schedulePct !== null && x.scheduleTotal >= 3);
  if (data.length < 6) return null;
  const short = data.filter(x => x.sleep < 6.5).map(x => x.schedulePct);
  const long  = data.filter(x => x.sleep >= 7.5).map(x => x.schedulePct);
  if (short.length < 3 || long.length < 3) return null;
  const aS = avg(short), aL = avg(long);
  const diff = aL - aS;
  if (Math.abs(diff) < 8) return null;
  const direction = diff > 0 ? 'больше' : 'меньше';
  return {
    icon: '📋',
    title: 'Сон и дела',
    text: `После сна <b>≥ 7.5 ч</b> ты выполняешь в среднем <b>${Math.round(aL)}%</b> дел, 
           а после <b>< 6.5 ч</b> — <b>${Math.round(aS)}%</b>. 
           Разница <b>${Math.round(Math.abs(diff))}%</b> в пользу ${direction === 'больше' ? 'хорошего сна' : 'короткого сна'}.
           <span style="opacity:.7">Наблюдение на твоих данных.</span>`
  };
}

/* 3. Настроение → Продуктивность */
function insightMoodProductivity(){
  const data = collectDailyMetrics(30).filter(x => x.mood !== null && x.schedulePct !== null && x.scheduleTotal >= 3);
  if (data.length < 6) return null;
  const low = data.filter(x => x.mood <= 2).map(x => x.schedulePct);
  const high = data.filter(x => x.mood >= 4).map(x => x.schedulePct);
  if (low.length < 3 || high.length < 3) return null;
  const aL = avg(low), aH = avg(high);
  const diff = aH - aL;
  if (Math.abs(diff) < 10) return null;
  return {
    icon: '🙂',
    title: 'Настроение и дела',
    text: `В дни с настроением <b>😄 / 🤩</b> ты выполняешь <b>${Math.round(aH)}%</b> дел,
           а в дни с <b>😞 / 😐</b> — <b>${Math.round(aL)}%</b>. 
           Разница <b>${Math.round(Math.abs(diff))}%</b>.
           <span style="opacity:.7">Это корреляция, не причина.</span>`
  };
}

/* 4. Вода → Настроение */
function insightWaterMood(){
  const data = collectDailyMetrics(30).filter(x => x.water > 0 && x.mood !== null);
  if (data.length < 6) return null;
  const goal = N.S.nutrition.goals.water || 2000;
  const low = data.filter(x => x.water < goal * 0.6).map(x => x.mood);
  const high = data.filter(x => x.water >= goal * 0.9).map(x => x.mood);
  if (low.length < 3 || high.length < 3) return null;
  const aL = avg(low), aH = avg(high);
  const diff = aH - aL;
  if (Math.abs(diff) < 0.4) return null;
  return {
    icon: '💧',
    title: 'Вода и настроение',
    text: `Когда ты пьёшь <b>≥ ${Math.round(goal*0.9)} мл</b> воды, настроение в среднем <b>${aH.toFixed(1)}</b>.
           Когда <b>< ${Math.round(goal*0.6)} мл</b> — <b>${aL.toFixed(1)}</b>. 
           Разница <b>${Math.abs(diff).toFixed(1)}</b>.
           <span style="opacity:.7">Наблюдение, не доказательство.</span>`
  };
}

/* 5. Сон → Точность в упражнениях мозга */
function insightSleepBrain(){
  const data = collectDailyMetrics(30).filter(x => x.sleep !== null && x.brainAcc !== null);
  if (data.length < 6) return null;
  const short = data.filter(x => x.sleep < 6.5).map(x => x.brainAcc);
  const long  = data.filter(x => x.sleep >= 7.5).map(x => x.brainAcc);
  if (short.length < 3 || long.length < 3) return null;
  const aS = avg(short), aL = avg(long);
  const diff = aL - aS;
  if (Math.abs(diff) < 5) return null;
  const direction = diff > 0 ? 'выше' : 'ниже';
  return {
    icon: '🧠',
    title: 'Сон и концентрация',
    text: `После <b>≥ 7.5 ч</b> сна средняя точность упражнений — <b>${Math.round(aL)}%</b>.
           После <b>< 6.5 ч</b> — <b>${Math.round(aS)}%</b>. 
           Концентрация на <b>${Math.round(Math.abs(diff))}%</b> ${direction}.
           <span style="opacity:.7">Наблюдение на твоих данных.</span>`
  };
}

/* 6. Привычки → Настроение */
function insightHabitsMood(){
  const data = collectDailyMetrics(30).filter(x => x.habitPct !== null && x.mood !== null && x.habitPct > 0);
  if (data.length < 6) return null;
  const low = data.filter(x => x.habitPct < 40).map(x => x.mood);
  const high = data.filter(x => x.habitPct >= 70).map(x => x.mood);
  if (low.length < 3 || high.length < 3) return null;
  const aL = avg(low), aH = avg(high);
  const diff = aH - aL;
  if (Math.abs(diff) < 0.4) return null;
  return {
    icon: '✅',
    title: 'Привычки и настроение',
    text: `Когда ты выполняешь <b>≥ 70%</b> привычек, настроение — <b>${aH.toFixed(1)}</b>.
           Когда <b>< 40%</b> — <b>${aL.toFixed(1)}</b>. 
           Разница <b>${Math.abs(diff).toFixed(1)}</b>.
           <span style="opacity:.7">Возможное совпадение.</span>`
  };
}

/* 7. Лучший день недели по настроению */
function insightBestWeekday(){
  const data = collectDailyMetrics(60).filter(x => x.mood !== null);
  if (data.length < 12) return null;
  const byDow = {};
  data.forEach(x => { (byDow[x.dow] = byDow[x.dow] || []).push(x.mood); });
  const stats = Object.keys(byDow).map(k => ({ dow:+k, avg: avg(byDow[k]), n: byDow[k].length })).filter(x => x.n >= 2);
  if (stats.length < 4) return null;
  stats.sort((a,b) => b.avg - a.avg);
  const best = stats[0], worst = stats[stats.length-1];
  if (best.avg - worst.avg < 0.5) return null;
  const names = ['воскресенье','понедельник','вторник','среду','четверг','пятницу','субботу'];
  return {
    icon: '📅',
    title: 'День недели и настроение',
    text: `В <b>${names[best.dow]}</b> настроение в среднем выше — <b>${best.avg.toFixed(1)}</b>.
           В <b>${names[worst.dow]}</b> — ниже — <b>${worst.avg.toFixed(1)}</b>.
           Данных: ${best.n + worst.n} дней.
           <span style="opacity:.7">Наблюдение.</span>`
  };
}

/* 8. Единый отчёт */
function findAllInsights(){
  const insights = [
    insightSleepMood(),
    insightSleepProductivity(),
    insightSleepBrain(),
    insightMoodProductivity(),
    insightWaterMood(),
    insightHabitsMood(),
    insightBestWeekday()
  ].filter(Boolean);
  return insights;
}

/* ═══════════════════════════════════════════════════════════════════
   ГЛАВНЫЙ ЭКРАН STATS
   ═══════════════════════════════════════════════════════════════════ */

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

  const insights = findAllInsights();

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

    ${insights.length ? `
    <div class="card" style="background:linear-gradient(155deg,#2A3A2F 0%,#1E2820 62%);color:#F4F2EA;border-color:transparent">
      <div class="tiny" style="color:#F3E3C8;letter-spacing:.14em;margin-bottom:8px">🔍 НАБЛЮДЕНИЯ</div>
      <div style="font-family:'Fraunces',serif;font-size:18px;font-weight:600;margin-bottom:4px">Закономерности в твоих данных</div>
      <p style="font-size:12.5px;color:#C7CEC5;line-height:1.5">Это не диагноз и не причинность — просто то, что видно в накопленной статистике.</p>
    </div>
    ${insights.map(ins => `
      <div class="card" style="padding:16px 18px">
        <div style="display:flex;gap:12px;align-items:flex-start">
          <div style="font-size:26px;line-height:1;flex-shrink:0">${ins.icon}</div>
          <div style="flex:1;min-width:0">
            <div style="font-family:'Fraunces',serif;font-size:15px;font-weight:600;margin-bottom:6px">${ins.title}</div>
            <div style="font-size:13.5px;line-height:1.55;color:var(--ink-soft)">${ins.text}</div>
          </div>
        </div>
      </div>
    `).join('')}
    ` : `
    <div class="card" style="padding:24px;text-align:center">
      <div style="font-size:40px;margin-bottom:10px">🔍</div>
      <div class="h3" style="font-family:'Fraunces',serif;font-size:16px;margin-bottom:6px">Наблюдений пока нет</div>
      <p class="muted" style="font-size:12.5px">Нужно минимум 3–6 дней с разными метриками, чтобы найти закономерности. Веди сон, настроение и дела — появятся инсайты.</p>
    </div>
    `}

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