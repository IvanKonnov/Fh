/* ═══ NAVLIFE · REPORTS · v4.1 · расширенный отчёт ═══ */
(function(){
'use strict';
const N = window.__nav;
if (!N){ console.error('[REPORTS] __nav not found'); return; }
const qs = (s, r=document) => r.querySelector(s);

/* ═══════════════════════════════════════════════════════════════════
   СБОР ДАННЫХ
   ═══════════════════════════════════════════════════════════════════ */
function collectData(days){
  const out = [];
  for (let i = days - 1; i >= 0; i--){
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = N.fmtDate(d);
    const nut = window.nutritionToday ? window.nutritionToday(ds) : {kcal:0,protein:0,fat:0,carbs:0,water:0};
    const items = N.S.navlife.schedule.filter(x => x.date === ds);
    const done = items.filter(x => x.completed).length;
    const sessions = N.S.neurofit.sessions.filter(s => s.d === ds);
    const brainAcc = sessions.length ? Math.round(sessions.reduce((a,s) => a+s.acc,0)/sessions.length) : null;
    const brainRt = sessions.filter(s => s.rt>0);
    const avgRt = brainRt.length ? Math.round(brainRt.reduce((a,s) => a+s.rt,0)/brainRt.length) : null;
    const habitsDone = (N.S.habits||[]).filter(h => ((h.log||{})[ds] || 0) >= (h.target||1)).length;
    const habitsTotal = (N.S.habits||[]).length;
    const breathingSec = (N.S.breathing && N.S.breathing.sessions || []).filter(x => x.d === ds).reduce((s,x) => s + (x.seconds||0), 0);
    out.push({
      ds, date: d,
      kcal: nut.kcal, protein: nut.protein, fat: nut.fat, carbs: nut.carbs, water: nut.water,
      scheduleDone: done, scheduleTotal: items.length,
      schedulePct: items.length ? Math.round(done/items.length*100) : 0,
      brainSessions: sessions.length, brainAcc, brainRt: avgRt,
      sleep: N.S.sleep[ds] ? N.S.sleep[ds].hours : null,
      sleepQ: N.S.sleep[ds] ? N.S.sleep[ds].quality : null,
      mood: N.S.mood[ds] ? N.S.mood[ds].m : null,
      energy: N.S.mood[ds] ? N.S.mood[ds].e : null,
      habitsDone, habitsTotal,
      habitsPct: habitsTotal ? Math.round(habitsDone/habitsTotal*100) : 0,
      breathingMin: Math.round(breathingSec/60)
    });
  }
  return out;
}

function avg(arr){ return arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0; }
function sum(arr){ return arr.reduce((a,b)=>a+b,0); }
function nn(arr){ return arr.filter(x => x !== null && x !== undefined && !isNaN(x)); }

function brainStats(){
  const sessions = N.S.neurofit.sessions || [];
  const byCat = {};
  const byEx = {};
  sessions.forEach(s => {
    const ex = window.EX && window.EX[s.ex];
    if (!ex) return;
    byCat[ex.cat] = byCat[ex.cat] || { n:0, acc:0 };
    byCat[ex.cat].n++; byCat[ex.cat].acc += (s.acc||0);
    byEx[s.ex] = byEx[s.ex] || { n:0, acc:0 };
    byEx[s.ex].n++; byEx[s.ex].acc += (s.acc||0);
  });
  const cats = Object.keys(byCat).map(k => ({
    key:k,
    name: (window.CATS && window.CATS[k] && window.CATS[k].name) || k,
    icon: (window.CATS && window.CATS[k] && window.CATS[k].icon) || '🧠',
    n: byCat[k].n,
    acc: Math.round(byCat[k].acc/byCat[k].n)
  }));
  const exs = Object.keys(byEx).map(k => ({
    key:k,
    name: (window.EX[k] && window.EX[k].name) || k,
    icon: (window.EX[k] && window.EX[k].icon) || '🎯',
    n: byEx[k].n,
    acc: Math.round(byEx[k].acc/byEx[k].n)
  })).sort((a,b) => b.n - a.n);
  return { cats, exs, total: sessions.length };
}

function habitStats(days){
  const out = [];
  (N.S.habits || []).forEach(h => {
    let done = 0, possible = 0;
    for (let i = 0; i < days; i++){
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = N.fmtDate(d);
      const created = h.createdAt || '2000-01-01';
      if (created > ds) continue;
      possible++;
      if (((h.log||{})[ds] || 0) >= (h.target || 1)) done++;
    }
    const streak = window.Habits && window.Habits.streakOf ? window.Habits.streakOf(h) : 0;
    const best = window.Habits && window.Habits.bestStreak ? window.Habits.bestStreak(h) : 0;
    out.push({
      emoji: h.emoji || '✅', title: h.title,
      done, possible,
      pct: possible ? Math.round(done/possible*100) : 0,
      streak, best, target: h.target || 1
    });
  });
  return out.sort((a,b) => b.pct - a.pct);
}

function breathingStats(days){
  const sessions = (N.S.breathing && N.S.breathing.sessions || []).filter(s => {
    const d = new Date(s.d+'T00:00:00');
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - (days-1));
    return d >= cutoff;
  });
  const byPractice = {};
  sessions.forEach(s => {
    byPractice[s.practiceId] = (byPractice[s.practiceId] || 0) + 1;
  });
  const totalSec = sum(sessions.map(s => s.seconds || 0));
  const topId = Object.keys(byPractice).sort((a,b) => byPractice[b]-byPractice[a])[0];
  const topP = topId && window.Breathing && window.Breathing.practices
    ? window.Breathing.practices.find(p => p.id === topId)
    : null;
  return {
    n: sessions.length,
    totalMin: Math.round(totalSec/60),
    top: topP ? { emoji: topP.emoji, name: topP.name, n: byPractice[topId] } : null
  };
}

function vitaminStats(days){
  const vitamins = N.S.nutrition.vitamins || [];
  const out = [];
  vitamins.forEach(v => {
    let taken = 0, possible = 0;
    for (let i = 0; i < days; i++){
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = N.fmtDate(d);
      if ((v.createdAt || '2000-01-01') > ds) continue;
      possible++;
      const log = (N.S.nutrition.vitaminLog && N.S.nutrition.vitaminLog[ds]) || [];
      if (log.includes(v.id)) taken++;
    }
    out.push({
      name: v.name, dose: v.dose, unit: v.unit,
      taken, possible,
      pct: possible ? Math.round(taken/possible*100) : 0
    });
  });
  return out;
}

function goalsStats(){
  const goals = N.S.navlife.goals || [];
  const result = [];
  goals.forEach(g => {
    if ((g.period || 'longterm') === 'longterm'){
      const total = (g.steps||[]).length;
      const done = (g.steps||[]).filter(s => s.completed).length;
      result.push({
        icon: g.icon || '🎯', title: g.title, type: 'Долгая',
        pct: total ? Math.round(done/total*100) : 0,
        label: `${done} / ${total} шагов`
      });
    } else {
      const start = (function(){
        const d = new Date();
        if (g.period === 'week'){ const dow = (d.getDay()+6)%7; d.setDate(d.getDate()-dow); }
        else d.setDate(1);
        return N.fmtDate(d);
      })();
      const prog = (g.progress || []).filter(d => d >= start);
      const target = g.target || 4;
      result.push({
        icon: g.icon || '📅', title: g.title,
        type: g.period === 'week' ? 'Неделя' : 'Месяц',
        pct: Math.min(100, Math.round(prog.length/target*100)),
        label: `${prog.length} / ${target}`
      });
    }
  });
  return result;
}

function achievementsStats(){
  const all = window.Achievements && window.Achievements.list || [];
  const unlocked = Object.keys(N.S.achievements || {}).length;
  return { unlocked, total: all.length, pct: all.length ? Math.round(unlocked/all.length*100) : 0 };
}

/* ═══════════════════════════════════════════════════════════════════
   УТИЛИТЫ РИСОВАНИЯ
   ═══════════════════════════════════════════════════════════════════ */
function roundRect(ctx, x, y, w, h, r){
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/* ═══════════════════════════════════════════════════════════════════
   ГЕНЕРАЦИЯ ОТЧЁТА
   ═══════════════════════════════════════════════════════════════════ */
function generateReportImage(days = 30){
  const W = 1200;
  const data = collectData(days);

  const habitsList = habitStats(days);
  const vitaminsList = vitaminStats(days);
  const goalsList = goalsStats();
  const exs = brainStats().exs;
  let H = 3350;
  H += Math.max(0, habitsList.length - 5) * 50;
  H += Math.max(0, vitaminsList.length - 4) * 45;
  H += Math.max(0, goalsList.length - 3) * 70;
  H += Math.max(0, exs.length - 6) * 55;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#F9F9F5');
  bgGrad.addColorStop(1, '#EDEFEA');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  const topGrad = ctx.createLinearGradient(0, 0, W, 0);
  topGrad.addColorStop(0, '#3F6152');
  topGrad.addColorStop(0.6, '#4F7563');
  topGrad.addColorStop(1, '#B87F35');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, W, 8);

  const M = 60;
  const CW = W - M * 2;
  let y = 0;

  /* HEADER */
  y = 70;
  ctx.fillStyle = '#1B211D';
  ctx.font = 'bold 44px Georgia, serif';
  ctx.fillText('NavLife', M, y);

  ctx.fillStyle = '#3F6152';
  ctx.font = '600 15px -apple-system, sans-serif';
  ctx.fillText('ОТЧЁТ О ПРОГРЕССЕ', M, y + 26);

  const endDate = new Date();
  const startDate = new Date(); startDate.setDate(endDate.getDate() - days + 1);
  const periodLabel = `${startDate.toLocaleDateString('ru-RU',{day:'numeric',month:'long'})} — ${endDate.toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'})}`;

  ctx.textAlign = 'right';
  ctx.fillStyle = '#1B211D';
  ctx.font = '600 15px -apple-system, sans-serif';
  ctx.fillText(N.S.shared.name || 'Игрок', W - M, y - 6);
  ctx.fillStyle = '#7B857B';
  ctx.font = '13px -apple-system, sans-serif';
  ctx.fillText(periodLabel, W - M, y + 16);
  ctx.fillText(`${days} дней наблюдений`, W - M, y + 34);
  ctx.textAlign = 'left';

  y += 65;
  ctx.strokeStyle = '#D8DBD1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(M, y);
  ctx.lineTo(W - M, y);
  ctx.stroke();
  y += 30;

  /* SECTION 1: KEY METRICS */
  const li = N.levelInfo ? N.levelInfo(N.S.neurofit.xp) : {level:1, into:0, need:100, pct:0};
  const acc = achievementsStats();
  const bStats = brainStats();
  const brStats = breathingStats(days);

  const keyMetrics = [
    { label:'СЕРИЯ', value: String(N.S.neurofit.streak), sub: 'дней подряд', icon:'🔥', color:'#B87F35', bg:'#FBF3E1' },
    { label:'УРОВЕНЬ', value: String(li.level), sub: `${N.S.neurofit.xp} XP`, icon:'⭐', color:'#3F5A7A', bg:'#E8EEF5' },
    { label:'ТРЕНИРОВОК', value: String(bStats.total), sub: 'мозга', icon:'🧠', color:'#3F6152', bg:'#E5EDE7' },
    { label:'ДОСТИЖЕНИЙ', value: `${acc.unlocked}/${acc.total}`, sub: `${acc.pct}% открыто`, icon:'🏆', color:'#6A4A7A', bg:'#F0E7F5' }
  ];

  const kmW = (CW - 3 * 16) / 4;
  const kmH = 130;
  keyMetrics.forEach((m, i) => {
    const x = M + i * (kmW + 16);
    roundRect(ctx, x, y, kmW, kmH, 16);
    ctx.fillStyle = m.bg;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x + 30, y + 34, 18, 0, Math.PI*2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.font = '20px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(m.icon, x + 30, y + 41);
    ctx.textAlign = 'left';

    ctx.fillStyle = '#7B857B';
    ctx.font = '600 10px -apple-system, sans-serif';
    ctx.fillText(m.label, x + 16, y + 74);

    ctx.fillStyle = m.color;
    ctx.font = 'bold 32px Georgia, serif';
    ctx.fillText(m.value, x + 16, y + 106);

    ctx.fillStyle = '#7B857B';
    ctx.font = '11px -apple-system, sans-serif';
    ctx.fillText(m.sub, x + 16, y + 122);
  });

  y += kmH + 40;

  /* SECTION 2: ACTIVITY CHART */
  y = drawSection(ctx, M, y, CW, '📋', 'Активность по дням', 'Дела и привычки — % выполнения');

  const chartH = 200;
  const chartTop = y + 20;
  const maxBars = Math.min(days, 30);
  const barData = data.slice(-maxBars);
  const barGap = 4;
  const barW = Math.max(3, (CW - (maxBars - 1) * barGap) / maxBars);

  ctx.strokeStyle = '#E5E7E0';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++){
    const gy = chartTop + chartH - (chartH * i / 4);
    ctx.beginPath();
    ctx.moveTo(M, gy);
    ctx.lineTo(W - M, gy);
    ctx.stroke();
    if (i > 0){
      ctx.fillStyle = '#B0B5AD';
      ctx.font = '10px -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText((i*25) + '%', M - 8, gy + 3);
      ctx.textAlign = 'left';
    }
  }

  barData.forEach((d, i) => {
    const x = M + i * (barW + barGap);
    const hS = (d.schedulePct / 100) * chartH;
    const hH = (d.habitsPct / 100) * chartH;
    if (hS > 0){
      roundRect(ctx, x, chartTop + chartH - hS, barW/2 - 1, hS, 3);
      ctx.fillStyle = '#3F6152';
      ctx.fill();
    }
    if (hH > 0){
      roundRect(ctx, x + barW/2 + 1, chartTop + chartH - hH, barW/2 - 1, hH, 3);
      ctx.fillStyle = '#B87F35';
      ctx.fill();
    }
  });

  y = chartTop + chartH + 30;
  drawLegend(ctx, M, y, [
    { color:'#3F6152', label:'Дела' },
    { color:'#B87F35', label:'Привычки' }
  ]);
  y += 40;

  /* SECTION 3: NUTRITION */
  y = drawSection(ctx, M, y, CW, '🍽', 'Питание', 'Средние значения за период');

  const nutAvg = {
    kcal: Math.round(avg(data.map(d=>d.kcal))),
    protein: Math.round(avg(data.map(d=>d.protein))),
    fat: Math.round(avg(data.map(d=>d.fat))),
    carbs: Math.round(avg(data.map(d=>d.carbs))),
    water: Math.round(avg(data.map(d=>d.water)))
  };
  const goal = N.S.nutrition.goals;
  const kcalDone = data.filter(d => d.kcal >= goal.calories * 0.9 && d.kcal <= goal.calories * 1.1).length;
  const waterDone = data.filter(d => d.water >= goal.water * 0.9).length;

  const nW = (CW - 2 * 16) / 3;
  const nH = 110;
  const nItems = [
    { label:'ККАЛ В СРЕДНЕМ', value: String(nutAvg.kcal), sub: `${kcalDone} дней в цели`, color:'#B87F35', bg:'#FBF3E1' },
    { label:'ВОДА В СРЕДНЕМ', value: nutAvg.water + ' мл', sub: `${waterDone} дней нормы`, color:'#3F5A7A', bg:'#E8EEF5' },
    { label:'БЕЛКИ / ЖИРЫ / УГЛ.', value: `${nutAvg.protein} · ${nutAvg.fat} · ${nutAvg.carbs}`, sub: 'граммы в сутки', color:'#3F6152', bg:'#E5EDE7' }
  ];
  nItems.forEach((m, i) => {
    const x = M + i * (nW + 16);
    roundRect(ctx, x, y + 20, nW, nH, 14);
    ctx.fillStyle = m.bg;
    ctx.fill();
    ctx.fillStyle = '#7B857B';
    ctx.font = '600 10px -apple-system, sans-serif';
    ctx.fillText(m.label, x + 16, y + 44);
    ctx.fillStyle = m.color;
    ctx.font = 'bold 26px Georgia, serif';
    ctx.fillText(m.value, x + 16, y + 80);
    ctx.fillStyle = '#7B857B';
    ctx.font = '11px -apple-system, sans-serif';
    ctx.fillText(m.sub, x + 16, y + 100);
  });
  y += nH + 30;

  const kcalChartH = 80;
  const kcalChartTop = y + 10;
  const maxKcal = Math.max(...data.map(d => d.kcal), goal.calories, 1);

  const normY = kcalChartTop + kcalChartH - (goal.calories / maxKcal) * kcalChartH;
  ctx.strokeStyle = '#B87F35';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(M, normY);
  ctx.lineTo(W - M, normY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#B87F35';
  ctx.font = '10px -apple-system, sans-serif';
  ctx.fillText(`норма ${goal.calories}`, W - M - 90, normY - 5);

  data.forEach((d, i) => {
    const x = M + (i / data.length) * CW;
    const bW = CW / data.length - 2;
    const bH = (d.kcal / maxKcal) * kcalChartH;
    if (bH > 0){
      const color = d.kcal > goal.calories * 1.1 ? '#A4503A' :
                    d.kcal < goal.calories * 0.7 ? '#D9A85E' : '#3F6152';
      roundRect(ctx, x, kcalChartTop + kcalChartH - bH, bW, bH, 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  });
  y = kcalChartTop + kcalChartH + 30;

  /* SECTION 4: SLEEP & MOOD */
  y = drawSection(ctx, M, y, CW, '😴', 'Сон и настроение', 'Средние и динамика');

  const sleepArr = nn(data.map(d => d.sleep));
  const moodArr = nn(data.map(d => d.mood));
  const qArr = nn(data.map(d => d.sleepQ));

  const smAvg = [
    { label:'СОН', value: sleepArr.length ? avg(sleepArr).toFixed(1) + ' ч' : '—', sub: `${sleepArr.length} дней`, color:'#3F5A7A', bg:'#E8EEF5' },
    { label:'КАЧЕСТВО', value: qArr.length ? avg(qArr).toFixed(1) + '/5' : '—', sub: 'субъективно', color:'#4F7563', bg:'#E5EDE7' },
    { label:'НАСТРОЕНИЕ', value: moodArr.length ? avg(moodArr).toFixed(1) + '/5' : '—', sub: `${moodArr.length} дней`, color:'#B87F35', bg:'#FBF3E1' },
    { label:'ЭНЕРГИЯ', value: (function(){ const e = nn(data.map(d => d.energy)); return e.length ? avg(e).toFixed(1) + '/5' : '—'; })(), sub: 'средняя', color:'#6A4A7A', bg:'#F0E7F5' }
  ];
  const smW = (CW - 3*14) / 4;
  const smH = 100;
  smAvg.forEach((m, i) => {
    const x = M + i * (smW + 14);
    roundRect(ctx, x, y + 20, smW, smH, 14);
    ctx.fillStyle = m.bg;
    ctx.fill();
    ctx.fillStyle = '#7B857B';
    ctx.font = '600 10px -apple-system, sans-serif';
    ctx.fillText(m.label, x + 14, y + 42);
    ctx.fillStyle = m.color;
    ctx.font = 'bold 24px Georgia, serif';
    ctx.fillText(m.value, x + 14, y + 74);
    ctx.fillStyle = '#7B857B';
    ctx.font = '10px -apple-system, sans-serif';
    ctx.fillText(m.sub, x + 14, y + 92);
  });
  y += smH + 30;

  const smChartH = 130;
  const smChartTop = y + 10;

  data.forEach((d, i) => {
    const x = M + (i / data.length) * CW;
    const bW = CW / data.length - 2;
    if (d.sleep !== null){
      const h = (d.sleep / 12) * smChartH;
      roundRect(ctx, x, smChartTop + smChartH - h, bW, h, 2);
      const color = d.sleep >= 7.5 ? '#3F6152' : d.sleep >= 6.5 ? '#8FAE9B' : '#D9A85E';
      ctx.fillStyle = color;
      ctx.fill();
    }
  });

  ctx.strokeStyle = '#B87F35';
  ctx.lineWidth = 2;
  ctx.beginPath();
  let first = true;
  data.forEach((d, i) => {
    if (d.mood === null) return;
    const x = M + (i + 0.5) / data.length * CW;
    const normMood = (d.mood - 1) / 4;
    const yy = smChartTop + smChartH - normMood * smChartH;
    if (first){ ctx.moveTo(x, yy); first = false; }
    else ctx.lineTo(x, yy);
  });
  ctx.stroke();

  data.forEach((d, i) => {
    if (d.mood === null) return;
    const x = M + (i + 0.5) / data.length * CW;
    const normMood = (d.mood - 1) / 4;
    const yy = smChartTop + smChartH - normMood * smChartH;
    ctx.beginPath();
    ctx.arc(x, yy, 3.5, 0, Math.PI*2);
    ctx.fillStyle = '#B87F35';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
  y = smChartTop + smChartH + 30;

  drawLegend(ctx, M, y, [
    { color:'#3F6152', label:'Сон ≥7.5ч' },
    { color:'#8FAE9B', label:'6.5–7.5ч' },
    { color:'#D9A85E', label:'<6.5ч' },
    { color:'#B87F35', label:'Настроение', line:true }
  ]);
  y += 40;

  /* SECTION 5: BRAIN TRAINING */
  y = drawSection(ctx, M, y, CW, '🧠', 'Тренировки мозга', `Всего ${bStats.total} сессий · ${N.S.neurofit.xp} XP · уровень ${li.level}`);

  const totalAcc = (N.S.neurofit.sessions || []).length
    ? Math.round(avg((N.S.neurofit.sessions || []).map(s => s.acc || 0)))
    : 0;
  const rtArr = (N.S.neurofit.sessions || []).filter(s => s.rt > 0);
  const totalRt = rtArr.length ? Math.round(avg(rtArr.map(s => s.rt))) : 0;

  const brainTopMetrics = [
    { label:'ТОЧНОСТЬ', value: totalAcc + '%', color:'#3F6152' },
    { label:'РЕАКЦИЯ', value: totalRt ? totalRt + ' мс' : '—', color:'#3F5A7A' },
    { label:'ВСЕГО МИНУТ', value: Math.round((N.S.neurofit.totalMs || 0) / 60000), color:'#B87F35' }
  ];
  const btW = (CW - 2*16) / 3;
  brainTopMetrics.forEach((m, i) => {
    const x = M + i * (btW + 16);
    roundRect(ctx, x, y + 20, btW, 80, 12);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#D8DBD1';
    ctx.stroke();
    ctx.fillStyle = '#7B857B';
    ctx.font = '600 10px -apple-system, sans-serif';
    ctx.fillText(m.label, x + 16, y + 42);
    ctx.fillStyle = m.color;
    ctx.font = 'bold 24px Georgia, serif';
    ctx.fillText(String(m.value), x + 16, y + 76);
  });
  y += 100;

  ctx.fillStyle = '#1B211D';
  ctx.font = '600 13px -apple-system, sans-serif';
  ctx.fillText('По категориям', M, y + 15);
  y += 30;

  bStats.cats.forEach(c => {
    ctx.fillStyle = '#1B211D';
    ctx.font = '600 13px -apple-system, sans-serif';
    ctx.fillText(`${c.icon} ${c.name}`, M, y + 14);
    ctx.fillStyle = '#7B857B';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${c.n} сессий · ${c.acc}% точность`, W - M, y + 14);
    ctx.textAlign = 'left';
    roundRect(ctx, M, y + 22, CW, 6, 3);
    ctx.fillStyle = '#E5E7E0';
    ctx.fill();
    roundRect(ctx, M, y + 22, CW * (c.acc / 100), 6, 3);
    ctx.fillStyle = '#3F6152';
    ctx.fill();
    y += 46;
  });
  y += 10;

  if (exs.length){
    ctx.fillStyle = '#1B211D';
    ctx.font = '600 13px -apple-system, sans-serif';
    ctx.fillText('Топ упражнений', M, y + 15);
    y += 30;

    const topEx = exs.slice(0, 6);
    const tW = (CW - 2*14) / 3;
    const tH = 60;
    topEx.forEach((ex, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = M + col * (tW + 14);
      const yy = y + row * (tH + 10);
      roundRect(ctx, x, yy, tW, tH, 10);
      ctx.fillStyle = '#F9F9F5';
      ctx.fill();
      ctx.strokeStyle = '#E5E7E0';
      ctx.stroke();
      ctx.font = '16px -apple-system, sans-serif';
      ctx.fillStyle = '#1B211D';
      ctx.fillText(ex.icon, x + 12, yy + 30);
      ctx.fillStyle = '#1B211D';
      ctx.font = '600 12px -apple-system, sans-serif';
      const name = ex.name.length > 16 ? ex.name.slice(0, 15) + '…' : ex.name;
      ctx.fillText(name, x + 38, yy + 24);
      ctx.fillStyle = '#7B857B';
      ctx.font = '10px -apple-system, sans-serif';
      ctx.fillText(`${ex.n} сессий · ${ex.acc}%`, x + 38, yy + 44);
    });
    y += Math.ceil(topEx.length / 3) * (tH + 10) + 20;
  }

  /* SECTION 6: HABITS */
  if (habitsList.length){
    y = drawSection(ctx, M, y, CW, '✅', 'Привычки', `Всего ${habitsList.length} · заполнено ${habitsList.filter(h => h.pct >= 80).length} на 80%+`);

    habitsList.forEach(h => {
      roundRect(ctx, M, y, CW, 42, 10);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#E5E7E0';
      ctx.stroke();

      ctx.font = '20px -apple-system, sans-serif';
      ctx.fillStyle = '#1B211D';
      ctx.fillText(h.emoji, M + 14, y + 28);

      ctx.font = '600 13px -apple-system, sans-serif';
      ctx.fillStyle = '#1B211D';
      const t = h.title.length > 30 ? h.title.slice(0, 29) + '…' : h.title;
      ctx.fillText(t, M + 48, y + 20);

      ctx.font = '11px -apple-system, sans-serif';
      ctx.fillStyle = '#7B857B';
      ctx.fillText(`Серия ${h.streak}д · рекорд ${h.best}д`, M + 48, y + 35);

      const pStart = M + CW - 180;
      const pW = 160;
      roundRect(ctx, pStart, y + 18, pW, 6, 3);
      ctx.fillStyle = '#E5E7E0';
      ctx.fill();
      roundRect(ctx, pStart, y + 18, pW * (h.pct/100), 6, 3);
      ctx.fillStyle = h.pct >= 80 ? '#3F6152' : h.pct >= 50 ? '#B87F35' : '#A4503A';
      ctx.fill();

      ctx.fillStyle = '#1B211D';
      ctx.font = 'bold 13px Georgia, serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${h.pct}%`, M + CW - 14, y + 24);
      ctx.textAlign = 'left';

      y += 50;
    });
    y += 10;
  }

  /* SECTION 7: BREATHING + VITAMINS */
  y = drawSection(ctx, M, y, CW, '🌬', 'Дыхание и витамины', 'Практики и добавки');

  const bhW = (CW - 20) / 2;
  roundRect(ctx, M, y + 20, bhW, 120, 14);
  ctx.fillStyle = '#E5EDE7';
  ctx.fill();
  ctx.fillStyle = '#3F6152';
  ctx.font = '600 11px -apple-system, sans-serif';
  ctx.fillText('ДЫХАНИЕ', M + 18, y + 44);
  ctx.fillStyle = '#3F6152';
  ctx.font = 'bold 28px Georgia, serif';
  ctx.fillText(String(brStats.totalMin) + ' мин', M + 18, y + 80);
  ctx.fillStyle = '#1B211D';
  ctx.font = '12px -apple-system, sans-serif';
  ctx.fillText(`${brStats.n} сессий`, M + 18, y + 100);
  if (brStats.top){
    ctx.fillStyle = '#7B857B';
    ctx.font = '11px -apple-system, sans-serif';
    ctx.fillText(`Любимая: ${brStats.top.emoji} ${brStats.top.name}`, M + 18, y + 122);
  }

  roundRect(ctx, M + bhW + 20, y + 20, bhW, 120, 14);
  ctx.fillStyle = '#FBF3E1';
  ctx.fill();
  ctx.fillStyle = '#B87F35';
  ctx.font = '600 11px -apple-system, sans-serif';
  ctx.fillText('ВИТАМИНЫ', M + bhW + 38, y + 44);
  if (vitaminsList.length){
    const avgPct = Math.round(avg(vitaminsList.map(v => v.pct)));
    ctx.fillStyle = '#B87F35';
    ctx.font = 'bold 28px Georgia, serif';
    ctx.fillText(avgPct + '%', M + bhW + 38, y + 80);
    ctx.fillStyle = '#1B211D';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText(`${vitaminsList.length} добавок`, M + bhW + 38, y + 100);
    const bestV = vitaminsList.slice().sort((a,b) => b.pct - a.pct)[0];
    if (bestV){
      ctx.fillStyle = '#7B857B';
      ctx.font = '11px -apple-system, sans-serif';
      const tv = bestV.name.length > 18 ? bestV.name.slice(0, 17) + '…' : bestV.name;
      ctx.fillText(`Лучше всего: ${tv}`, M + bhW + 38, y + 122);
    }
  } else {
    ctx.fillStyle = '#B87F35';
    ctx.font = 'bold 20px Georgia, serif';
    ctx.fillText('—', M + bhW + 38, y + 80);
    ctx.fillStyle = '#7B857B';
    ctx.font = '11px -apple-system, sans-serif';
    ctx.fillText('Не добавлены', M + bhW + 38, y + 100);
  }
  y += 160;

  /* SECTION 8: GOALS */
  if (goalsList.length){
    y = drawSection(ctx, M, y, CW, '🎯', 'Цели', `${goalsList.length} активных`);

    goalsList.forEach(g => {
      roundRect(ctx, M, y, CW, 55, 10);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#E5E7E0';
      ctx.stroke();

      ctx.font = '20px -apple-system, sans-serif';
      ctx.fillText(g.icon, M + 14, y + 36);

      ctx.fillStyle = '#1B211D';
      ctx.font = '600 13px -apple-system, sans-serif';
      const t = g.title.length > 40 ? g.title.slice(0, 39) + '…' : g.title;
      ctx.fillText(t, M + 48, y + 22);

      ctx.fillStyle = '#7B857B';
      ctx.font = '11px -apple-system, sans-serif';
      ctx.fillText(`${g.type} · ${g.label}`, M + 48, y + 40);

      const pX = M + CW - 140;
      const pW = 124;
      roundRect(ctx, pX, y + 24, pW, 6, 3);
      ctx.fillStyle = '#E5E7E0';
      ctx.fill();
      roundRect(ctx, pX, y + 24, pW * (g.pct/100), 6, 3);
      ctx.fillStyle = g.pct >= 80 ? '#3F6152' : '#B87F35';
      ctx.fill();

      ctx.fillStyle = '#1B211D';
      ctx.font = 'bold 12px Georgia, serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${g.pct}%`, M + CW - 14, y + 22);
      ctx.textAlign = 'left';

      y += 63;
    });
    y += 10;
  }

  /* FOOTER */
  y += 20;
  ctx.strokeStyle = '#D8DBD1';
  ctx.beginPath();
  ctx.moveTo(M, y);
  ctx.lineTo(W - M, y);
  ctx.stroke();
  y += 20;

  ctx.fillStyle = '#7B857B';
  ctx.font = '11px -apple-system, sans-serif';
  ctx.fillText(`Сгенерировано: ${new Date().toLocaleString('ru-RU')}`, M, y + 10);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#3F6152';
  ctx.font = 'bold 13px -apple-system, sans-serif';
  ctx.fillText('NavLife · маршрут дня', W - M, y + 10);
  ctx.textAlign = 'left';

  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = W;
  finalCanvas.height = y + 40;
  const fctx = finalCanvas.getContext('2d');
  fctx.drawImage(canvas, 0, 0);
  return finalCanvas;
}

function drawSection(ctx, M, y, CW, icon, title, subtitle){
  ctx.fillStyle = '#1B211D';
  ctx.font = 'bold 22px Georgia, serif';
  ctx.fillText(`${icon}  ${title}`, M, y + 22);

  ctx.fillStyle = '#7B857B';
  ctx.font = '12px -apple-system, sans-serif';
  ctx.fillText(subtitle, M, y + 42);

  ctx.strokeStyle = '#E5E7E0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(M, y + 55);
  ctx.lineTo(M + CW, y + 55);
  ctx.stroke();

  return y + 70;
}

function drawLegend(ctx, M, y, items){
  let x = M;
  items.forEach(it => {
    if (it.line){
      ctx.strokeStyle = it.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 14, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + 7, y, 3, 0, Math.PI*2);
      ctx.fillStyle = it.color;
      ctx.fill();
      ctx.fillStyle = '#1B211D';
      ctx.font = '11px -apple-system, sans-serif';
      ctx.fillText(it.label, x + 20, y + 4);
      x += 20 + ctx.measureText(it.label).width + 24;
    } else {
      roundRect(ctx, x, y - 5, 12, 12, 3);
      ctx.fillStyle = it.color;
      ctx.fill();
      ctx.fillStyle = '#1B211D';
      ctx.font = '11px -apple-system, sans-serif';
      ctx.fillText(it.label, x + 18, y + 5);
      x += 18 + ctx.measureText(it.label).width + 24;
    }
  });
}

/* ═══════════════════════════════════════════════════════════════════
   СКАЧИВАНИЕ
   ═══════════════════════════════════════════════════════════════════ */
function downloadPNG(days){
  const canvas = generateReportImage(days);
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `navlife-report-${N.todayKey()}-${days}d.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    N.toast('Подробный отчёт сохранён');
    N.SFX.win();
  }, 'image/png', 0.95);
}

function downloadCSV(days){
  const data = collectData(days);
  const header = ['Дата','Ккал','Белки','Жиры','Углеводы','Вода_мл','Сон_ч','Качество','Настроение','Энергия','Дела_%','Привычки_%','Тренировки_мозга','Точность_%','Реакция_мс','Дыхание_мин'];
  const rows = data.map(d => [
    d.ds, d.kcal, d.protein, d.fat, d.carbs, d.water,
    d.sleep !== null ? d.sleep : '',
    d.sleepQ !== null ? d.sleepQ : '',
    d.mood !== null ? d.mood : '',
    d.energy !== null ? d.energy : '',
    d.schedulePct, d.habitsPct, d.brainSessions,
    d.brainAcc !== null ? d.brainAcc : '',
    d.brainRt !== null ? d.brainRt : '',
    d.breathingMin
  ]);
  const csv = '\uFEFF' + [header, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `navlife-data-${N.todayKey()}-${days}d.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  N.toast('CSV сохранён');
}

function openReportModal(){
  let days = 30;
  let format = 'png';

  N.openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom:6px">📊 Подробный отчёт</div>
    <p class="muted" style="margin-bottom:18px">Полная сводка: питание, сон, мозг, привычки, дыхание, витамины, цели. Профессиональный формат для тренера, врача или архива.</p>

    <div class="field">
      <label>Период</label>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:6px">
        ${[7,30,90].map(n => `
          <button type="button" data-days="${n}" style="
            padding:14px 8px;border-radius:12px;font-size:14px;font-weight:600;
            background:${days===n?'var(--moss)':'var(--paper)'};
            color:${days===n?'#fff':'var(--ink)'};
            border:1.5px solid ${days===n?'var(--moss)':'var(--line)'};
            cursor:pointer;transition:all .15s;
          ">${n} дней</button>`).join('')}
      </div>
    </div>

    <div class="field">
      <label>Формат</label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px">
        <button type="button" data-fmt="png" style="
          padding:14px 10px;border-radius:12px;font-size:13.5px;font-weight:600;text-align:left;
          background:${format==='png'?'var(--moss-soft)':'var(--paper)'};
          color:${format==='png'?'var(--moss)':'var(--ink)'};
          border:1.5px solid ${format==='png'?'var(--moss)':'var(--line)'};
          cursor:pointer;
        ">
          <div style="font-size:22px;margin-bottom:4px">🖼</div>
          <div>Полный отчёт</div>
          <div style="font-size:10.5px;opacity:.75;font-weight:500;margin-top:2px">8 разделов · PNG</div>
        </button>
        <button type="button" data-fmt="csv" style="
          padding:14px 10px;border-radius:12px;font-size:13.5px;font-weight:600;text-align:left;
          background:${format==='csv'?'var(--moss-soft)':'var(--paper)'};
          color:${format==='csv'?'var(--moss)':'var(--ink)'};
          border:1.5px solid ${format==='csv'?'var(--moss)':'var(--line)'};
          cursor:pointer;
        ">
          <div style="font-size:22px;margin-bottom:4px">📄</div>
          <div>Данные CSV</div>
          <div style="font-size:10.5px;opacity:.75;font-weight:500;margin-top:2px">16 колонок</div>
        </button>
      </div>
    </div>

    <div style="padding:12px 14px;background:var(--paper);border-radius:10px;font-size:12px;color:var(--ink-soft);line-height:1.55;margin-bottom:8px">
      <b style="color:var(--ink)">Что внутри отчёта:</b><br>
      Ключевые метрики · Активность по дням · Питание и КБЖУ · Сон и настроение · Тренировки мозга по категориям · Привычки с сериями · Дыхание · Витамины · Цели
    </div>

    <div style="display:flex;gap:10px;margin-top:16px">
      <button class="btn btn-ghost btn-full" id="repCancel" type="button">Отмена</button>
      <button class="btn btn-primary btn-full btn-lg" id="repGen" type="button">Скачать</button>
    </div>
  `, m => {
    m.querySelectorAll('[data-days]').forEach(b => b.onclick = () => {
      days = +b.dataset.days;
      N.SFX.tap();
      m.querySelectorAll('[data-days]').forEach(x => {
        const on = +x.dataset.days === days;
        x.style.background = on ? 'var(--moss)' : 'var(--paper)';
        x.style.color = on ? '#fff' : 'var(--ink)';
        x.style.borderColor = on ? 'var(--moss)' : 'var(--line)';
      });
    });
    m.querySelectorAll('[data-fmt]').forEach(b => b.onclick = () => {
      format = b.dataset.fmt;
      N.SFX.tap();
      m.querySelectorAll('[data-fmt]').forEach(x => {
        const on = x.dataset.fmt === format;
        x.style.background = on ? 'var(--moss-soft)' : 'var(--paper)';
        x.style.color = on ? 'var(--moss)' : 'var(--ink)';
        x.style.borderColor = on ? 'var(--moss)' : 'var(--line)';
      });
    });
    m.querySelector('#repCancel').onclick = () => N.closeModal(m);
    m.querySelector('#repGen').onclick = () => {
      N.closeModal(m);
      setTimeout(() => {
        if (format === 'png') downloadPNG(days);
        else downloadCSV(days);
      }, 200);
    };
  });
}

/* ═══ ФОЛБЭК-КНОПКА В ПРОФИЛЕ ═══
   Ставится ТОЛЬКО если в новом дизайне профиля кнопки нет.
   Новый профиль имеет id="openReport" в меню — тогда хук ничего не делает. */
window.App.hooks.afterGo.push(name => {
  if (name !== 'profile') return;
  setTimeout(() => {
    const host = qs('#screens');
    if (!host) return;

    /* Если в новом профиле уже есть кнопка в меню — не вставляем дубликат */
    if (host.querySelector('#openReport')) return;
    if (host.querySelector('[data-report-btn]')) return;

    const card = document.createElement('button');
    card.className = 'card tappable';
    card.setAttribute('data-report-btn', '');
    card.type = 'button';
    card.style.cssText = 'width:100%;text-align:left';
    card.innerHTML = `
      <div class="between">
        <div>
          <div class="h3" style="margin-bottom:2px">📊 Отчёты</div>
          <div class="muted" style="font-size:12.5px">Подробный отчёт · PNG или CSV</div>
        </div>
        <div style="font-size:18px;color:var(--ink-mute)">›</div>
      </div>`;
    card.onclick = () => { N.SFX.tap(); openReportModal(); };

    /* Ищем карточку с Экспорт/Импорт */
    const cards = host.querySelectorAll('.card');
    const dataCard = Array.from(cards).find(c => c.textContent.includes('Экспорт') && c.textContent.includes('Импорт'));
    if (dataCard && dataCard.parentNode){
      dataCard.parentNode.insertBefore(card, dataCard.nextSibling);
    } else {
      host.appendChild(card);
    }
  }, 80);
});

window.Reports = { open: openReportModal, generateImage: generateReportImage, downloadPNG, downloadCSV };
console.log('[Reports] v4.1 loaded');
})();