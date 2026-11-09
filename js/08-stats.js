/* ═══ NAVLIFE · STATS · v6.2 (No XP, Reflection back) ═══ */
(function(){
'use strict';
const N = window.__nav;
if (!N){ console.error('[STATS] __nav not found'); return; }
const { go, esc, todayKey, fmtDate, dowShort, nutritionToday, itemsForDate } = N;

/* ═══ ИНЖЕКТ СТИЛЕЙ ═══ */
const STYLE_ID = 'navlife-stats-styles';
function ensureStyles(){
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
.insight-card{ background:var(--glass-bg,var(--surface-raised)); border:1px solid var(--glass-border,var(--line)); border-radius:16px; padding:16px; margin-bottom:10px; backdrop-filter:blur(20px) saturate(150%); -webkit-backdrop-filter:blur(20px) saturate(150%); box-shadow:0 1px 0 0 var(--glass-hi,rgba(255,255,255,.9)) inset,0 10px 30px -16px rgba(27,33,29,.2); }
.insight-head{ display:flex;gap:12px;align-items:center; margin-bottom:14px; }
.insight-em{ font-size:26px;line-height:1; flex-shrink:0; width:44px;height:44px; border-radius:12px; display:grid;place-items:center; background:linear-gradient(135deg,var(--moss-soft),var(--paper)); border:1px solid var(--line); }
.insight-head-text{flex:1;min-width:0;}
.insight-title{ font-family:'Fraunces',serif; font-size:15px;font-weight:600; color:var(--ink);letter-spacing:-.01em; margin-bottom:2px; }
.insight-hint{ font-size:11.5px;color:var(--ink-soft); line-height:1.4; }
.insight-body{ display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px; }
.insight-panel{ padding:12px 10px; border-radius:12px; text-align:center; position:relative; overflow:hidden; transition:transform .14s; }
.insight-panel.low{ background:linear-gradient(180deg,var(--paper),var(--surface-raised)); border:1px solid var(--line); }
.insight-panel.high{ background:linear-gradient(180deg,var(--moss-soft),var(--surface-raised)); border:1px solid var(--moss); box-shadow:0 0 0 1px rgba(63,97,82,.06); }
.panel-label{ font-size:10.5px; text-transform:uppercase; letter-spacing:.08em; font-weight:700; color:var(--ink-mute); margin-bottom:2px; }
.insight-panel.high .panel-label{color:var(--moss);}
.panel-sub{ font-size:11px; color:var(--ink-soft); font-weight:600; margin-bottom:8px; }
.insight-panel.high .panel-sub{color:var(--moss);}
.panel-value{ font-family:'Fraunces',serif; font-size:30px; font-weight:600; line-height:1; color:var(--ink); letter-spacing:-.02em; }
.insight-panel.high .panel-value{color:var(--moss);}
.panel-value small{ font-size:13px; font-weight:500; color:var(--ink-soft); letter-spacing:0; margin-left:2px; }
.insight-panel.high .panel-value small{color:var(--moss);opacity:.7;}
.panel-bar{ height:4px; border-radius:4px; background:var(--line-soft); margin:10px 4px 6px; overflow:hidden; }
.panel-bar > div{ height:100%; border-radius:4px; background:var(--ink-mute); transition:width .6s cubic-bezier(.22,1,.36,1); }
.insight-panel.high .panel-bar > div{background:var(--moss);}
.panel-days{ font-size:10px; color:var(--ink-mute); font-weight:600; letter-spacing:.04em; }
.insight-diff{ display:flex; align-items:center; justify-content:center; gap:8px; padding:10px 12px; border-radius:10px; background:var(--moss-soft); color:var(--moss); font-size:13px; font-weight:600; }
.insight-diff .arrow{ font-size:16px; font-weight:700; }
.insight-diff.neutral{ background:var(--paper); color:var(--ink-soft); }
.insight-note{ text-align:center; font-size:10.5px; color:var(--ink-mute); margin-top:10px; letter-spacing:.02em; }
.insight-highlight{ text-align:center; padding:18px 12px; border-radius:14px; background:linear-gradient(135deg,var(--amber-soft),var(--paper)); border:1px solid var(--amber); margin-bottom:12px; }
.insight-highlight .hl-value{ font-family:'Fraunces',serif; font-size:28px; font-weight:600; color:var(--amber-dim); letter-spacing:-.02em; line-height:1.1; }
.insight-highlight .hl-sub{ font-size:12px; color:var(--amber-dim); margin-top:4px; opacity:.85; font-weight:500; }
.observations-hero{ padding:18px 20px; border-radius:16px; background:var(--hero-bg); color:var(--hero-text); margin-bottom:12px; position:relative; overflow:hidden; box-shadow:0 20px 50px -20px rgba(0,0,0,.5); }
.observations-hero::after{ content:''; position:absolute;right:-40px;top:-40px;width:160px;height:160px;border-radius:50%; background:radial-gradient(circle,rgba(184,127,53,.35),transparent 70%); pointer-events:none; }
.observations-hero .oh-eyebrow{ font-size:11px; letter-spacing:.16em; color:var(--amber-soft); font-weight:700; margin-bottom:6px; }
.observations-hero .oh-title{ font-family:'Fraunces',serif; font-size:19px; font-weight:600; color:#fff; letter-spacing:-.01em; margin-bottom:4px; }
.observations-hero .oh-sub{ font-size:12.5px; color:var(--hero-text-dim); line-height:1.5; max-width:44ch; }
.summary-hero{ padding:16px 18px; border-radius:16px; background:var(--hero-bg); color:var(--hero-text); margin-bottom:12px; }
.summary-hero .sh-title{ font-family:'Fraunces',serif; font-size:16px; font-weight:600; color:#fff; margin-bottom:10px; }
.summary-grid{ display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.summary-item{ padding:10px 12px; background:rgba(255,255,255,.07); border-radius:10px; border:1px solid rgba(255,255,255,.06); }
.summary-item .si-label{ font-size:10px; letter-spacing:.08em; color:var(--hero-text-mute); font-weight:600; margin-bottom:4px; display:flex; align-items:center; gap:4px; }
.summary-item .si-value{ font-family:'Fraunces',serif; font-size:20px; font-weight:600; color:var(--amber-soft); line-height:1; letter-spacing:-.01em; }
.summary-item .si-sub{ font-size:10.5px; color:var(--hero-text-mute); margin-top:4px; }
  `;
  document.head.appendChild(style);
}

const CATS = { memory:{name:'Память',icon:'🧠'}, speed:{name:'Внимание',icon:'⚡'}, math:{name:'Счёт',icon:'🔢'}, logic:{name:'Логика',icon:'🧩'} };
const MODES = { normal:{emoji:'📋'}, endless:{emoji:'♾️'}, survival:{emoji:'💀'} };

function avg(arr){ return arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0; }
function pluralDays(n){ if (n === 1) return 'день'; if (n < 5) return 'дня'; return 'дней'; }
function plural(n, one, few, many){
  const a = Math.abs(n) % 100;
  if (a >= 11 && a <= 19) return many;
  const l = a % 10;
  if (l === 1) return one;
  if (l >= 2 && l <= 4) return few;
  return many;
}
const MIN_TOTAL = 4;
const MIN_GROUP = 2;

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
    const avgAccToday = sessionsToday.length ? avg(sessionsToday.map(s => s.acc || 0)) : null;
    const habitDone = (S.habits || []).filter(h => ((h.log||{})[ds] || 0) >= (h.target || 1)).length;
    const habitTotal = (S.habits || []).length;

    out.push({
      ds, dow: d.getDay(),
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
      habitPct: habitTotal ? Math.round(habitDone/habitTotal*100) : null,
      breathingMin: (S.breathing && S.breathing.sessions || []).filter(x => x.d === ds).reduce((s,x) => s + Math.round((x.seconds||0)/60), 0)
    });
  }
  return out;
}

function simpleSummaries(){
  const data = collectDailyMetrics(30);
  const withSleep = data.filter(x => x.sleep !== null);
  const withMood = data.filter(x => x.mood !== null);
  const withWater = data.filter(x => x.water > 0);
  const withSchedule = data.filter(x => x.scheduleTotal > 0);
  const withHabits = data.filter(x => x.habitPct !== null && x.habitPct > 0);
  const withBreath = data.filter(x => x.breathingMin > 0);

  const out = [];
  if (withSleep.length >= 2) out.push({ icon:'😴', label:'СОН', value:`${avg(withSleep.map(x => x.sleep)).toFixed(1)} ч`, sub:`${withSleep.length} ${pluralDays(withSleep.length)}` });
  if (withMood.length >= 2) out.push({ icon:'🙂', label:'НАСТРОЕНИЕ', value:`${avg(withMood.map(x => x.mood)).toFixed(1)}/5`, sub:`${withMood.length} ${pluralDays(withMood.length)}` });
  if (withWater.length >= 2) out.push({ icon:'💧', label:'ВОДА', value:`${Math.round(avg(withWater.map(x => x.water)))} мл`, sub:`${withWater.length} ${pluralDays(withWater.length)}` });
  if (withSchedule.length >= 2) out.push({ icon:'📋', label:'ДЕЛА', value:`${Math.round(avg(withSchedule.map(x => x.schedulePct)))}%`, sub:`${withSchedule.length} ${pluralDays(withSchedule.length)}` });
  if (withHabits.length >= 2) out.push({ icon:'✅', label:'ПРИВЫЧКИ', value:`${Math.round(avg(withHabits.map(x => x.habitPct)))}%`, sub:`${withHabits.length} ${pluralDays(withHabits.length)}` });
  if (withBreath.length >= 2) { const total = withBreath.reduce((s,x) => s + x.breathingMin, 0); out.push({ icon:'🧘', label:'ДЫХАНИЕ', value:`${total} мин`, sub:`${withBreath.length} ${pluralDays(withBreath.length)}` }); }
  return out;
}

function renderInsightCard(ins){
  if (ins.highlight){
    return `
      <div class="insight-card">
        <div class="insight-head">
          <div class="insight-em">${ins.icon}</div>
          <div class="insight-head-text">
            <div class="insight-title">${esc(ins.title)}</div>
            <div class="insight-hint">${esc(ins.hint)}</div>
          </div>
        </div>
        <div class="insight-highlight">
          <div class="hl-value">${esc(ins.highlight.value)}</div>
          <div class="hl-sub">${esc(ins.highlight.sub)}</div>
        </div>
        ${ins.extra ? `<div class="insight-diff neutral" style="margin-bottom:0"><span class="arrow">${ins.extra.icon}</span><span>${ins.extra.text}</span></div>` : ''}
        ${ins.note ? `<div class="insight-note">${esc(ins.note)}</div>` : ''}
      </div>
    `;
  }
  const left = ins.left, right = ins.right, diff = ins.diff;
  const arrow = diff.direction === 'up' ? '↑' : '↓';
  return `
    <div class="insight-card">
      <div class="insight-head">
        <div class="insight-em">${ins.icon}</div>
        <div class="insight-head-text">
          <div class="insight-title">${esc(ins.title)}</div>
          <div class="insight-hint">${esc(ins.hint)}</div>
        </div>
      </div>
      <div class="insight-body">
        <div class="insight-panel low">
          <div class="panel-label">${esc(left.label)}</div>
          <div class="panel-sub">${esc(left.sub)}</div>
          <div class="panel-value">${esc(left.value)}<small>${esc(left.unit)}</small></div>
          <div class="panel-bar"><div style="width:${Math.min(100, left.pct).toFixed(0)}%"></div></div>
          <div class="panel-days">${left.days} ${pluralDays(left.days)}</div>
        </div>
        <div class="insight-panel high">
          <div class="panel-label">${esc(right.label)}</div>
          <div class="panel-sub">${esc(right.sub)}</div>
          <div class="panel-value">${esc(right.value)}<small>${esc(right.unit)}</small></div>
          <div class="panel-bar"><div style="width:${Math.min(100, right.pct).toFixed(0)}%"></div></div>
          <div class="panel-days">${right.days} ${pluralDays(right.days)}</div>
        </div>
      </div>
      <div class="insight-diff">
        <span class="arrow">${arrow}</span>
        <span>${esc(diff.value)} ${esc(diff.label)}</span>
      </div>
      ${ins.note ? `<div class="insight-note">${esc(ins.note)}</div>` : ''}
    </div>
  `;
}

/* ═══ RADAR CHART ═══ */
function renderRadarChart(data) {
  const cx = 170, cy = 170, R = 100;
  const axes = [
    { key:'sleep', label:'Сон', icon:'😴' },
    { key:'nutrition', label:'Питание', icon:'🥗' },
    { key:'brain', label:'Мозг', icon:'🧠' },
    { key:'tasks', label:'Дела', icon:'📋' },
    { key:'habits', label:'Привычки', icon:'✅' },
    { key:'breathing', label:'Дыхание', icon:'🧘' }
  ];
  const N_axes = axes.length;
  const angleStep = (Math.PI * 2) / N_axes;

  function getPoint(i, val) {
    const angle = i * angleStep - Math.PI / 2;
    const r = (val / 100) * R;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      lx: cx + (R + 30) * Math.cos(angle),
      ly: cy + (R + 30) * Math.sin(angle)
    };
  }

  let gridHtml = '';
  [25, 50, 75, 100].forEach(level => {
    const pts = axes.map((_, i) => { const p = getPoint(i, level); return `${p.x},${p.y}`; }).join(' ');
    gridHtml += `<polygon points="${pts}" fill="none" stroke="var(--line)" stroke-width="1" opacity="${level === 100 ? 1 : 0.5}"/>`;
  });

  let axesHtml = '';
  axes.forEach((ax, i) => {
    const p = getPoint(i, 100);
    axesHtml += `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="var(--line)" stroke-width="1"/>`;
    const textAnchor = p.lx > cx + 5 ? 'start' : p.lx < cx - 5 ? 'end' : 'middle';
    axesHtml += `<text x="${p.lx}" y="${p.ly + 4}" text-anchor="${textAnchor}" font-size="11" font-weight="600" fill="var(--ink-soft)">${ax.icon} ${ax.label}</text>`;
  });

  const dataPts = axes.map((ax, i) => { const p = getPoint(i, data[ax.key] || 0); return `${p.x},${p.y}`; }).join(' ');
  const dataPolygon = `<polygon points="${dataPts}" fill="rgba(63,97,82,0.25)" stroke="var(--moss)" stroke-width="2" stroke-linejoin="round"/>`;
  const dataDots = axes.map((ax, i) => {
    const p = getPoint(i, data[ax.key] || 0);
    return `<circle cx="${p.x}" cy="${p.y}" r="4" fill="var(--moss)"/>`;
  }).join('');

  return `
    <div class="card" style="margin-bottom:14px">
      <div class="between" style="margin-bottom:10px">
        <div class="h3" style="font-family:'Fraunces',serif;font-size:16px">🕸 Паутина баланса</div>
        <div class="tiny">Идеал = 100%</div>
      </div>
      <svg viewBox="0 0 340 340" style="width:100%;height:auto;display:block;overflow:visible">
        ${gridHtml}
        ${axesHtml}
        ${dataPolygon}
        ${dataDots}
      </svg>
    </div>
  `;
}

/* ═══ SENIOR COMPARISON ═══ */
function renderSeniorComparison() {
  const S = N.S;
  const comparisons = [];
  const totalDone = S.navlife.schedule.filter(i => i.completed).length;
  const lastSessions = S.neurofit.totalSessions;
  const totalMinutes = Math.round(S.neurofit.totalMs / 60000);

  const createdAt = S.shared.createdAt || (function(){
    const sessions = S.neurofit.sessions || [];
    if (sessions.length){
      const first = sessions.reduce((a, b) => a.t < b.t ? a : b);
      return new Date(first.t);
    }
    return new Date(Date.now() - 30 * 86400000);
  })();
  
  const daysInApp = Math.max(1, Math.floor((Date.now() - createdAt.getTime()) / 86400000));

  if (totalDone > 0) comparisons.push({ icon: '📋', text: `Ты закрыл <b>${totalDone}</b> ${plural(totalDone, 'дело', 'дела', 'дел')} за всё время.` });
  if (S.neurofit.bestStreak > 0) comparisons.push({ icon: '🔥', text: `Лучшая серия — <b>${S.neurofit.bestStreak}</b> ${plural(S.neurofit.bestStreak, 'день', 'дня', 'дней')} подряд. Текущая — ${S.neurofit.streak}.` });
  if (lastSessions > 0) comparisons.push({ icon: '🧠', text: `Ты тренировал мозг <b>${lastSessions}</b> ${plural(lastSessions, 'раз', 'раза', 'раз')} — это <b>${totalMinutes}</b> минут.` });
  if (S.breathing && S.breathing.totalSessions > 0) comparisons.push({ icon: '🌬️', text: `Дыхательных практик — <b>${S.breathing.totalSessions}</b>. Это ${Math.round(S.breathing.totalMs/60000)} минут спокойствия.` });
  const habits = S.habits || [];
  if (habits.length){
    const totalHabitMarks = habits.reduce((s, h) => s + Object.keys(h.log || {}).length, 0);
    if (totalHabitMarks > 0) comparisons.push({ icon: '✅', text: `Привычки отмечены <b>${totalHabitMarks}</b> ${plural(totalHabitMarks, 'раз', 'раза', 'раз')}.` });
  }
  if (daysInApp >= 7) comparisons.push({ icon: '📅', text: `Ты в NavLife <b>${daysInApp}</b> ${plural(daysInApp, 'день', 'дня', 'дней')}. Прогресс копится — продолжай.` });

  if (!comparisons.length) return '';
  return `
    <div class="card" style="margin-top:14px">
      <div class="tiny" style="margin-bottom:10px;letter-spacing:.08em">ТЫ VS ТЫ ПРОШЛЫЙ</div>
      <div style="padding:14px 16px;background:var(--amber-soft);border-radius:12px">
        ${comparisons.map(c => `
          <div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:${c === comparisons[comparisons.length-1] ? '0' : '10px'}">
            <div style="font-size:18px;flex-shrink:0">${c.icon}</div>
            <div style="flex:1;font-size:12.5px;line-height:1.55;color:var(--amber-dim)">${c.text}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/* ═══════════════════════════════════════════════════════════════════
   ГЛАВНЫЙ ЭКРАН
   ═══════════════════════════════════════════════════════════════════ */
function renderStats(){
  ensureStyles();
  const S = N.S;
  const todayDs = todayKey();
  const todayItems = itemsForDate(todayDs);
  const todayDone = todayItems.filter(i => i.completed).length;
  const todayPct = todayItems.length ? Math.round(todayDone/todayItems.length*100) : 0;
  const nut = nutritionToday();
  const g = S.nutrition.goals;
  const kcalPct = Math.min(100, Math.round(nut.kcal / Math.max(1, g.calories) * 100));
  const waterPct = Math.min(100, Math.round(nut.water / Math.max(1, g.water) * 100));

  const last7 = collectDailyMetrics(7).filter(d => d.scheduleTotal > 0 || d.sleep || d.habitPct || d.breathingMin > 0);
  const avgSleep = avg(last7.filter(d => d.sleep).map(d => d.sleep));
  const avgKcal = avg(last7.filter(d => d.kcal > 0).map(d => d.kcal));
  const avgBrain = avg(last7.map(d => d.brainSessions));
  const avgTasks = avg(last7.filter(d => d.schedulePct !== null).map(d => d.schedulePct));
  const avgHabits = avg(last7.filter(d => d.habitPct !== null).map(d => d.habitPct));
  const avgBreath = avg(last7.map(d => d.breathingMin));

  const radarData = {
    sleep: Math.min(100, Math.round((avgSleep / 8) * 100)),
    nutrition: Math.min(100, Math.round((avgKcal / Math.max(1, g.calories)) * 100)),
    brain: Math.min(100, Math.round((avgBrain / 3) * 100)),
    tasks: Math.min(100, Math.round(avgTasks)),
    habits: Math.min(100, Math.round(avgHabits)),
    breathing: Math.min(100, Math.round((avgBreath / 10) * 100))
  };

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
  const avgAcc = last.length ? Math.round(last.reduce((a, b) => a + (b.acc || 0), 0) / last.length) : 0;
  const mins = Math.round(S.neurofit.totalMs / 60000);

  const summaries = simpleSummaries();

  const root = document.createElement('div');
  root.className = 'screen';
  root.innerHTML = `
    <div class="h1" style="margin-bottom:18px">Прогресс</div>

    <div class="hero" style="margin-bottom:14px">
      <div class="hero-inner">
        <div class="between" style="align-items:flex-start;margin-bottom:14px">
          <div>
            <div class="eyebrow">ТРЕНИРОВКИ МОЗГА</div>
            <div style="font-family:'Fraunces',serif;font-size:34px;font-weight:600;color:#fff;line-height:1;margin-top:4px">${S.neurofit.totalSessions} <span style="font-size:18px;font-weight:400;opacity:.8">сессий</span></div>
          </div>
          <div style="text-align:right">
            <div class="eyebrow" style="color:var(--hero-text-mute)">ВРЕМЯ</div>
            <div style="font-family:'Fraunces',serif;font-size:24px;font-weight:600;color:var(--amber-soft);line-height:1;margin-top:6px">${mins} мин</div>
          </div>
        </div>
      </div>
    </div>

    ${renderRadarChart(radarData)}
    ${renderSeniorComparison()}

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
    </div>

    ${summaries.length ? `
      <div class="summary-hero">
        <div class="sh-title">📊 Твои средние</div>
        <div class="summary-grid">
          ${summaries.map(s => `
            <div class="summary-item">
              <div class="si-label"><span>${s.icon}</span><span>${esc(s.label)}</span></div>
              <div class="si-value">${esc(s.value)}</div>
              <div class="si-sub">${esc(s.sub)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <div id="stats-reflection-slot"></div>
    <div id="stats-achievements-slot"></div>

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

    <div style="height:20px"></div>`;

  return root;
}

window.App.registerScreen('stats', renderStats);

window.App.hooks.afterGo.push(name => {
  if (name !== 'stats') return;
  requestAnimationFrame(() => {
    if (window.Reflection && window.Reflection.statsCard) {
      const slot = document.querySelector('#stats-reflection-slot');
      if (slot) slot.innerHTML = window.Reflection.statsCard();
    }
    const rb = document.querySelector('#statsReflectBtn');
    if (rb) rb.onclick = () => window.Reflection && window.Reflection.open();
    const rh = document.querySelector('#statsReflectHistBtn');
    if (rh) rh.onclick = () => window.Reflection && window.Reflection.history();

    if (window.Achievements && window.Achievements.previewCard) {
      const slot = document.querySelector('#stats-achievements-slot');
      if (slot) slot.innerHTML = window.Achievements.previewCard();
    }
    const ab = document.querySelector('#statsAchBtn');
    if (ab) ab.onclick = () => go('achievements');
  });
});
})();