/* ═══ NAVLIFE · STATS · v5.0 · красивые наблюдения ═══ */
(function(){
'use strict';
const N = window.__nav;
if (!N){ console.error('[STATS] __nav not found'); return; }
const { go, esc, todayKey, fmtDate, levelInfo, dowShort, nutritionToday, itemsForDate } = N;

/* ═══ ИНЖЕКТ СТИЛЕЙ ═══ */
const STYLE_ID = 'navlife-stats-styles';
function ensureStyles(){
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
/* ═══ Insight cards ═══ */
.insight-card{
  background:var(--glass-bg,var(--surface-raised));
  border:1px solid var(--glass-border,var(--line));
  border-radius:16px;
  padding:16px;
  margin-bottom:10px;
  backdrop-filter:blur(20px) saturate(150%);
  -webkit-backdrop-filter:blur(20px) saturate(150%);
  box-shadow:0 1px 0 0 var(--glass-hi,rgba(255,255,255,.9)) inset,0 10px 30px -16px rgba(27,33,29,.2);
}
.insight-head{
  display:flex;gap:12px;align-items:center;
  margin-bottom:14px;
}
.insight-em{
  font-size:26px;line-height:1;
  flex-shrink:0;
  width:44px;height:44px;
  border-radius:12px;
  display:grid;place-items:center;
  background:linear-gradient(135deg,var(--moss-soft),var(--paper));
  border:1px solid var(--line);
}
.insight-head-text{flex:1;min-width:0;}
.insight-title{
  font-family:'Fraunces',serif;
  font-size:15px;font-weight:600;
  color:var(--ink);letter-spacing:-.01em;
  margin-bottom:2px;
}
.insight-hint{
  font-size:11.5px;color:var(--ink-soft);
  line-height:1.4;
}
.insight-body{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:8px;
  margin-bottom:12px;
}
.insight-panel{
  padding:12px 10px;
  border-radius:12px;
  text-align:center;
  position:relative;
  overflow:hidden;
  transition:transform .14s;
}
.insight-panel.low{
  background:linear-gradient(180deg,var(--paper),var(--surface-raised));
  border:1px solid var(--line);
}
.insight-panel.high{
  background:linear-gradient(180deg,var(--moss-soft),var(--surface-raised));
  border:1px solid var(--moss);
  box-shadow:0 0 0 1px rgba(63,97,82,.06);
}
.panel-label{
  font-size:10.5px;
  text-transform:uppercase;
  letter-spacing:.08em;
  font-weight:700;
  color:var(--ink-mute);
  margin-bottom:2px;
}
.insight-panel.high .panel-label{color:var(--moss);}
.panel-sub{
  font-size:11px;
  color:var(--ink-soft);
  font-weight:600;
  margin-bottom:8px;
}
.insight-panel.high .panel-sub{color:var(--moss);}
.panel-value{
  font-family:'Fraunces',serif;
  font-size:30px;
  font-weight:600;
  line-height:1;
  color:var(--ink);
  letter-spacing:-.02em;
}
.insight-panel.high .panel-value{color:var(--moss);}
.panel-value small{
  font-size:13px;
  font-weight:500;
  color:var(--ink-soft);
  letter-spacing:0;
  margin-left:2px;
}
.insight-panel.high .panel-value small{color:var(--moss);opacity:.7;}
.panel-bar{
  height:4px;
  border-radius:4px;
  background:var(--line-soft);
  margin:10px 4px 6px;
  overflow:hidden;
}
.panel-bar > div{
  height:100%;
  border-radius:4px;
  background:var(--ink-mute);
  transition:width .6s cubic-bezier(.22,1,.36,1);
}
.insight-panel.high .panel-bar > div{background:var(--moss);}
.panel-days{
  font-size:10px;
  color:var(--ink-mute);
  font-weight:600;
  letter-spacing:.04em;
}
.insight-diff{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  padding:10px 12px;
  border-radius:10px;
  background:var(--moss-soft);
  color:var(--moss);
  font-size:13px;
  font-weight:600;
}
.insight-diff .arrow{
  font-size:16px;
  font-weight:700;
}
.insight-diff.neutral{
  background:var(--paper);
  color:var(--ink-soft);
}
.insight-note{
  text-align:center;
  font-size:10.5px;
  color:var(--ink-mute);
  margin-top:10px;
  letter-spacing:.02em;
}

/* Highlight карточка (одиночный акцент) */
.insight-highlight{
  text-align:center;
  padding:18px 12px;
  border-radius:14px;
  background:linear-gradient(135deg,var(--amber-soft),var(--paper));
  border:1px solid var(--amber);
  margin-bottom:12px;
}
.insight-highlight .hl-value{
  font-family:'Fraunces',serif;
  font-size:28px;
  font-weight:600;
  color:var(--amber-dim);
  letter-spacing:-.02em;
  line-height:1.1;
}
.insight-highlight .hl-sub{
  font-size:12px;
  color:var(--amber-dim);
  margin-top:4px;
  opacity:.85;
  font-weight:500;
}

/* Вводная карточка «Наблюдения» */
.observations-hero{
  padding:18px 20px;
  border-radius:16px;
  background:linear-gradient(155deg,#2A3A2F 0%,#1E2820 62%);
  color:#F4F2EA;
  margin-bottom:12px;
  position:relative;
  overflow:hidden;
  box-shadow:0 20px 50px -20px rgba(0,0,0,.5);
}
.observations-hero::after{
  content:'';position:absolute;right:-40px;top:-40px;width:160px;height:160px;border-radius:50%;
  background:radial-gradient(circle,rgba(184,127,53,.35),transparent 70%);
  pointer-events:none;
}
.observations-hero .oh-eyebrow{
  font-size:11px;
  letter-spacing:.16em;
  color:#F3E3C8;
  font-weight:700;
  margin-bottom:6px;
}
.observations-hero .oh-title{
  font-family:'Fraunces',serif;
  font-size:19px;
  font-weight:600;
  color:#fff;
  letter-spacing:-.01em;
  margin-bottom:4px;
}
.observations-hero .oh-sub{
  font-size:12.5px;
  color:#C7CEC5;
  line-height:1.5;
  max-width:44ch;
}

/* Компактная сводка «Твои средние» */
.summary-hero{
  padding:16px 18px;
  border-radius:16px;
  background:linear-gradient(155deg,#2A3A2F 0%,#1E2820 62%);
  color:#F4F2EA;
  margin-bottom:12px;
}
.summary-hero .sh-title{
  font-family:'Fraunces',serif;
  font-size:16px;
  font-weight:600;
  color:#fff;
  margin-bottom:10px;
}
.summary-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:8px;
}
.summary-item{
  padding:10px 12px;
  background:rgba(255,255,255,.07);
  border-radius:10px;
  border:1px solid rgba(255,255,255,.06);
}
.summary-item .si-label{
  font-size:10px;
  letter-spacing:.08em;
  color:#9AA398;
  font-weight:600;
  margin-bottom:4px;
  display:flex;align-items:center;gap:4px;
}
.summary-item .si-value{
  font-family:'Fraunces',serif;
  font-size:20px;
  font-weight:600;
  color:#F3E3C8;
  line-height:1;
  letter-spacing:-.01em;
}
.summary-item .si-sub{
  font-size:10.5px;
  color:#9AA398;
  margin-top:4px;
}
  `;
  document.head.appendChild(style);
}

const CATS = { memory:{name:'Память',icon:'🧠'}, speed:{name:'Внимание',icon:'⚡'}, math:{name:'Счёт',icon:'🔢'}, logic:{name:'Логика',icon:'🧩'} };
const MODES = { normal:{emoji:'📋'}, endless:{emoji:'♾️'}, survival:{emoji:'💀'} };

/* ═══ Хелперы ═══ */
function avg(arr){ return arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0; }
function pluralDays(n){
  if (n === 1) return 'день';
  if (n < 5) return 'дня';
  return 'дней';
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
    const avgAccToday = sessionsToday.length ? avg(sessionsToday.map(s => s.acc)) : null;
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

/* ═══ Сводки ═══ */
function simpleSummaries(){
  const data = collectDailyMetrics(30);
  const withSleep = data.filter(x => x.sleep !== null);
  const withMood = data.filter(x => x.mood !== null);
  const withWater = data.filter(x => x.water > 0);
  const withSchedule = data.filter(x => x.scheduleTotal > 0);
  const withHabits = data.filter(x => x.habitPct !== null && x.habitPct > 0);
  const withBreath = data.filter(x => x.breathingMin > 0);

  const out = [];
  if (withSleep.length >= 2){
    out.push({ icon:'😴', label:'СОН', value:`${avg(withSleep.map(x => x.sleep)).toFixed(1)} ч`, sub:`${withSleep.length} ${pluralDays(withSleep.length)}` });
  }
  if (withMood.length >= 2){
    out.push({ icon:'🙂', label:'НАСТРОЕНИЕ', value:`${avg(withMood.map(x => x.mood)).toFixed(1)}/5`, sub:`${withMood.length} ${pluralDays(withMood.length)}` });
  }
  if (withWater.length >= 2){
    out.push({ icon:'💧', label:'ВОДА', value:`${Math.round(avg(withWater.map(x => x.water)))} мл`, sub:`${withWater.length} ${pluralDays(withWater.length)}` });
  }
  if (withSchedule.length >= 2){
    out.push({ icon:'📋', label:'ДЕЛА', value:`${Math.round(avg(withSchedule.map(x => x.schedulePct)))}%`, sub:`${withSchedule.length} ${pluralDays(withSchedule.length)}` });
  }
  if (withHabits.length >= 2){
    out.push({ icon:'✅', label:'ПРИВЫЧКИ', value:`${Math.round(avg(withHabits.map(x => x.habitPct)))}%`, sub:`${withHabits.length} ${pluralDays(withHabits.length)}` });
  }
  if (withBreath.length >= 2){
    const total = withBreath.reduce((s,x) => s + x.breathingMin, 0);
    out.push({ icon:'🧘', label:'ДЫХАНИЕ', value:`${total} мин`, sub:`${withBreath.length} ${pluralDays(withBreath.length)}` });
  }
  return out;
}

/* ═══════════════════════════════════════════════════════════════════
   ИНСАЙТЫ — новая структура: сравнительная (две панели) или highlight
   ═══════════════════════════════════════════════════════════════════ */

/* ─── Сравнительная ───
   Возвращает { icon, title, hint, left, right, diff, diffLabel, note }
   left / right: { label, sub, value, unit, days, pct }
   diff: { value, direction: 'up' | 'down' } */
function makeComparative(cfg){ return cfg; }

function insightSleepMood(){
  const data = collectDailyMetrics(30).filter(x => x.sleep !== null && x.mood !== null);
  if (data.length < MIN_TOTAL) return null;
  const short = data.filter(x => x.sleep < 6.5).map(x => x.mood);
  const long  = data.filter(x => x.sleep >= 7.5).map(x => x.mood);
  if (short.length < MIN_GROUP || long.length < MIN_GROUP) return null;
  const aS = avg(short), aL = avg(long);
  const diff = aL - aS;
  if (Math.abs(diff) < 0.4) return null;
  const direction = diff > 0 ? 'up' : 'down';
  return makeComparative({
    icon: '😴',
    title: 'Сон и настроение',
    hint: 'Как сон влияет на самочувствие',
    left:  { label:'Мало сна',  sub:'< 6.5 ч', value:aS.toFixed(1), unit:'из 5', days:short.length, pct:(aS/5)*100 },
    right: { label:'Много сна', sub:'≥ 7.5 ч', value:aL.toFixed(1), unit:'из 5', days:long.length,  pct:(aL/5)*100 },
    diff:  { value:Math.abs(diff).toFixed(1), direction, label: direction === 'up' ? 'в пользу хорошего сна' : 'в пользу короткого сна' },
    note: 'Наблюдение на твоих данных'
  });
}

function insightSleepProductivity(){
  const data = collectDailyMetrics(30).filter(x => x.sleep !== null && x.schedulePct !== null && x.scheduleTotal >= 3);
  if (data.length < MIN_TOTAL) return null;
  const short = data.filter(x => x.sleep < 6.5).map(x => x.schedulePct);
  const long  = data.filter(x => x.sleep >= 7.5).map(x => x.schedulePct);
  if (short.length < MIN_GROUP || long.length < MIN_GROUP) return null;
  const aS = avg(short), aL = avg(long);
  const diff = aL - aS;
  if (Math.abs(diff) < 8) return null;
  const direction = diff > 0 ? 'up' : 'down';
  return makeComparative({
    icon: '📋',
    title: 'Сон и дела',
    hint: 'Сколько дел закрываешь при разном сне',
    left:  { label:'Мало сна',  sub:'< 6.5 ч', value:`${Math.round(aS)}`, unit:'%',  days:short.length, pct:aS },
    right: { label:'Много сна', sub:'≥ 7.5 ч', value:`${Math.round(aL)}`, unit:'%',  days:long.length,  pct:aL },
    diff:  { value:`${Math.round(Math.abs(diff))}%`, direction, label: direction === 'up' ? 'в пользу хорошего сна' : 'в пользу короткого сна' },
    note: 'Наблюдение'
  });
}

function insightMoodProductivity(){
  const data = collectDailyMetrics(30).filter(x => x.mood !== null && x.schedulePct !== null && x.scheduleTotal >= 3);
  if (data.length < MIN_TOTAL) return null;
  const low = data.filter(x => x.mood <= 2).map(x => x.schedulePct);
  const high = data.filter(x => x.mood >= 4).map(x => x.schedulePct);
  if (low.length < MIN_GROUP || high.length < MIN_GROUP) return null;
  const aL = avg(low), aH = avg(high);
  const diff = aH - aL;
  if (Math.abs(diff) < 10) return null;
  return makeComparative({
    icon: '🙂',
    title: 'Настроение и дела',
    hint: 'Как самочувствие связано с продуктивностью',
    left:  { label:'Плохое',  sub:'😞 / 😐', value:`${Math.round(aL)}`, unit:'%', days:low.length,  pct:aL },
    right: { label:'Хорошее', sub:'😄 / 🤩', value:`${Math.round(aH)}`, unit:'%', days:high.length, pct:aH },
    diff:  { value:`${Math.round(Math.abs(diff))}%`, direction:'up', label:'в пользу хорошего настроения' },
    note: 'Корреляция, не причина'
  });
}

function insightWaterMood(){
  const data = collectDailyMetrics(30).filter(x => x.water > 0 && x.mood !== null);
  if (data.length < MIN_TOTAL) return null;
  const goal = N.S.nutrition.goals.water || 2000;
  const low = data.filter(x => x.water < goal * 0.6).map(x => x.mood);
  const high = data.filter(x => x.water >= goal * 0.9).map(x => x.mood);
  if (low.length < MIN_GROUP || high.length < MIN_GROUP) return null;
  const aL = avg(low), aH = avg(high);
  const diff = aH - aL;
  if (Math.abs(diff) < 0.4) return null;
  return makeComparative({
    icon: '💧',
    title: 'Вода и настроение',
    hint: 'Связь питьевого режима и самочувствия',
    left:  { label:'Мало воды', sub:`< ${(goal*0.6/1000).toFixed(1)} л`, value:aL.toFixed(1), unit:'из 5', days:low.length,  pct:(aL/5)*100 },
    right: { label:'Норма',     sub:`≥ ${(goal*0.9/1000).toFixed(1)} л`, value:aH.toFixed(1), unit:'из 5', days:high.length, pct:(aH/5)*100 },
    diff:  { value:Math.abs(diff).toFixed(1), direction:'up', label:'в пользу нормы воды' },
    note: 'Наблюдение'
  });
}

function insightSleepBrain(){
  const data = collectDailyMetrics(30).filter(x => x.sleep !== null && x.brainAcc !== null);
  if (data.length < MIN_TOTAL) return null;
  const short = data.filter(x => x.sleep < 6.5).map(x => x.brainAcc);
  const long  = data.filter(x => x.sleep >= 7.5).map(x => x.brainAcc);
  if (short.length < MIN_GROUP || long.length < MIN_GROUP) return null;
  const aS = avg(short), aL = avg(long);
  const diff = aL - aS;
  if (Math.abs(diff) < 5) return null;
  const direction = diff > 0 ? 'up' : 'down';
  return makeComparative({
    icon: '🧠',
    title: 'Сон и концентрация',
    hint: 'Точность упражнений при разном сне',
    left:  { label:'Мало сна',  sub:'< 6.5 ч', value:`${Math.round(aS)}`, unit:'%', days:short.length, pct:aS },
    right: { label:'Много сна', sub:'≥ 7.5 ч', value:`${Math.round(aL)}`, unit:'%', days:long.length,  pct:aL },
    diff:  { value:`${Math.round(Math.abs(diff))}%`, direction, label: direction === 'up' ? 'в пользу хорошего сна' : 'в пользу короткого сна' },
    note: 'Наблюдение'
  });
}

function insightHabitsMood(){
  const data = collectDailyMetrics(30).filter(x => x.habitPct !== null && x.mood !== null && x.habitPct > 0);
  if (data.length < MIN_TOTAL) return null;
  const low = data.filter(x => x.habitPct < 40).map(x => x.mood);
  const high = data.filter(x => x.habitPct >= 70).map(x => x.mood);
  if (low.length < MIN_GROUP || high.length < MIN_GROUP) return null;
  const aL = avg(low), aH = avg(high);
  const diff = aH - aL;
  if (Math.abs(diff) < 0.4) return null;
  return makeComparative({
    icon: '✅',
    title: 'Привычки и настроение',
    hint: 'Связь выполнения привычек с самочувствием',
    left:  { label:'Мало привычек', sub:'< 40%', value:aL.toFixed(1), unit:'из 5', days:low.length,  pct:(aL/5)*100 },
    right: { label:'Много',         sub:'≥ 70%', value:aH.toFixed(1), unit:'из 5', days:high.length, pct:(aH/5)*100 },
    diff:  { value:Math.abs(diff).toFixed(1), direction:'up', label:'в пользу дня с привычками' },
    note: 'Наблюдение'
  });
}

/* ─── Highlight (одиночная цифра) ─── */
function insightBestWeekday(){
  const data = collectDailyMetrics(60).filter(x => x.mood !== null);
  if (data.length < MIN_TOTAL * 2) return null;
  const byDow = {};
  data.forEach(x => { (byDow[x.dow] = byDow[x.dow] || []).push(x.mood); });
  const stats = Object.keys(byDow).map(k => ({ dow:+k, avg: avg(byDow[k]), n: byDow[k].length })).filter(x => x.n >= 2);
  if (stats.length < 4) return null;
  stats.sort((a,b) => b.avg - a.avg);
  const best = stats[0], worst = stats[stats.length-1];
  if (best.avg - worst.avg < 0.5) return null;
  const names = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];
  return {
    icon: '📅',
    title: 'Лучший день недели',
    hint: 'Когда настроение в среднем выше всего',
    highlight: {
      value: names[best.dow],
      sub: `${best.avg.toFixed(1)} из 5 · ${best.n} ${pluralDays(best.n)}`
    },
    extra: {
      icon: '⬇',
      text: `Хуже всего — <b>${names[worst.dow]}</b>: ${worst.avg.toFixed(1)} из 5`,
      neutral: true
    },
    note: 'Наблюдение'
  };
}

function insightBreathing(){
  const data = collectDailyMetrics(30).filter(x => x.breathingMin > 0);
  if (data.length < 2) return null;
  const totalMin = data.reduce((s,x) => s + x.breathingMin, 0);
  return {
    icon: '🧘',
    title: 'Дыхательные практики',
    hint: 'Твоя динамика',
    highlight: {
      value: `${totalMin} мин`,
      sub: `за ${data.length} ${pluralDays(data.length)}`
    },
    extra: null,
    note: 'Регулярность снижает тревогу'
  };
}

function findAllInsights(){
  return [
    insightSleepMood(),
    insightSleepProductivity(),
    insightSleepBrain(),
    insightMoodProductivity(),
    insightWaterMood(),
    insightHabitsMood(),
    insightBestWeekday(),
    insightBreathing()
  ].filter(Boolean);
}

/* ═══ Диагностика ═══ */
function dataDebug(){
  const data = collectDailyMetrics(30);
  const withSleep = data.filter(x => x.sleep !== null).length;
  const withMood = data.filter(x => x.mood !== null).length;
  const withWater = data.filter(x => x.water > 0).length;
  const withSchedule = data.filter(x => x.scheduleTotal > 0).length;
  const withHabits = data.filter(x => x.habitPct !== null && x.habitPct > 0).length;
  const both = data.filter(x => x.sleep !== null && x.mood !== null).length;
  return { withSleep, withMood, withWater, withSchedule, withHabits, both };
}

/* ═══ Рендер одной карточки инсайта ═══ */
function renderInsightCard(ins){
  /* Highlight */
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
        ${ins.extra ? `
          <div class="insight-diff neutral" style="margin-bottom:0">
            <span class="arrow">${ins.extra.icon}</span>
            <span>${ins.extra.text}</span>
          </div>
        ` : ''}
        ${ins.note ? `<div class="insight-note">${esc(ins.note)}</div>` : ''}
      </div>
    `;
  }

  /* Сравнительная */
  const left  = ins.left;
  const right = ins.right;
  const diff  = ins.diff;
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

/* ═══════════════════════════════════════════════════════════════════
   ГЛАВНЫЙ ЭКРАН
   ═══════════════════════════════════════════════════════════════════ */
function renderStats(){
  ensureStyles();
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

  const summaries = simpleSummaries();
  const insights = findAllInsights();
  const dbg = dataDebug();

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

    ${insights.length ? `
      <div class="observations-hero">
        <div class="oh-eyebrow">🔍 НАБЛЮДЕНИЯ</div>
        <div class="oh-title">Закономерности в данных</div>
        <div class="oh-sub">Сравнение двух ситуаций на твоих записях. Это корреляция — не диагноз и не доказательство причины.</div>
      </div>
      ${insights.map(ins => renderInsightCard(ins)).join('')}
    ` : `
      <div class="card" style="padding:22px 20px">
        <div style="text-align:center;margin-bottom:14px">
          <div style="font-size:40px;margin-bottom:8px">🔍</div>
          <div class="h3" style="font-family:'Fraunces',serif;font-size:16px;margin-bottom:6px">Мало данных для закономерностей</div>
          <p class="muted" style="font-size:12.5px">Нужно минимум <b>${MIN_TOTAL}</b> совпадающих дней в паре.</p>
        </div>
        <div style="display:grid;gap:6px;font-size:13px;color:var(--ink-soft);max-width:300px;margin:0 auto">
          <div style="display:flex;justify-content:space-between"><span>😴 Сон</span><b style="color:var(--ink)">${dbg.withSleep} ${pluralDays(dbg.withSleep)}</b></div>
          <div style="display:flex;justify-content:space-between"><span>🙂 Настроение</span><b style="color:var(--ink)">${dbg.withMood} ${pluralDays(dbg.withMood)}</b></div>
          <div style="display:flex;justify-content:space-between"><span>💧 Вода</span><b style="color:var(--ink)">${dbg.withWater} ${pluralDays(dbg.withWater)}</b></div>
          <div style="display:flex;justify-content:space-between"><span>📋 Дела</span><b style="color:var(--ink)">${dbg.withSchedule} ${pluralDays(dbg.withSchedule)}</b></div>
          <div style="display:flex;justify-content:space-between"><span>✅ Привычки</span><b style="color:var(--ink)">${dbg.withHabits} ${pluralDays(dbg.withHabits)}</b></div>
          <div style="display:flex;justify-content:space-between;border-top:1px solid var(--line);padding-top:8px;margin-top:4px"><span>🔗 Сон + настроение</span><b style="color:var(--moss)">${dbg.both} ${pluralDays(dbg.both)}</b></div>
        </div>
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
    const rb = document.querySelector('#statsReflectBtn');
    if (rb) rb.onclick = () => window.Reflection && window.Reflection.open();
    const rh = document.querySelector('#statsReflectHistBtn');
    if (rh) rh.onclick = () => window.Reflection && window.Reflection.history();
    const ab = document.querySelector('#statsAchBtn');
    if (ab) ab.onclick = () => go('achievements');
  });
});
})();