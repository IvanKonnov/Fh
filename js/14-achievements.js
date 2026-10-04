/* ═══ NAVLIFE · ACHIEVEMENTS ═══ */
(function(){
'use strict';
const N = window.__nav;
const { go, saveState, esc, toast, SFX, buzz } = N;

const BADGES = [
  { id:'streak_3',   icon:'🔥', title:'Разогрев',      desc:'3 дня подряд' },
  { id:'streak_7',   icon:'🔥', title:'Неделя',        desc:'7 дней подряд' },
  { id:'streak_14',  icon:'🔥', title:'2 недели',      desc:'14 дней подряд' },
  { id:'streak_30',  icon:'🔥', title:'Месяц',         desc:'30 дней подряд' },
  { id:'streak_100', icon:'🔥', title:'100 дней',      desc:'100 дней подряд' },
  { id:'brain_first',  icon:'🧠', title:'Первый шаг',   desc:'Первая тренировка' },
  { id:'brain_10',     icon:'🧠', title:'10 тренировок', desc:'10 сессий' },
  { id:'brain_50',     icon:'🧠', title:'50 тренировок', desc:'50 сессий' },
  { id:'brain_100',    icon:'🧠', title:'100 сессий',    desc:'100 сессий' },
  { id:'brain_perfect',icon:'🎯', title:'Идеально',      desc:'100% в сессии' },
  { id:'brain_all',    icon:'🌟', title:'Всё попробовал',desc:'Все упражнения' },
  { id:'habits_first',      icon:'✅', title:'Привычка',      desc:'Первая привычка' },
  { id:'habits_5',          icon:'✅', title:'5 привычек',    desc:'5 привычек' },
  { id:'habits_streak7',    icon:'🎯', title:'Неделя привычки',desc:'7 дней привычки' },
  { id:'habits_streak30',   icon:'🏅', title:'Месяц привычки',desc:'30 дней привычки' },
  { id:'water_7',   icon:'💧', title:'Водохлёб',   desc:'7 дней нормы воды' },
  { id:'water_30',  icon:'💧', title:'Океан',      desc:'30 дней нормы воды' },
  { id:'kcal_7',    icon:'🥗', title:'Точность',   desc:'7 дней в норме ккал' },
  { id:'kcal_30',   icon:'🥗', title:'Мастер КБЖУ',desc:'30 дней в норме' },
  { id:'sleep_first', icon:'😴', title:'Первый сон',   desc:'Первая запись сна' },
  { id:'sleep_7',     icon:'😴', title:'Ритм',         desc:'7 дней записей сна' },
  { id:'sleep_8h_7',  icon:'🌙', title:'Крепкий сон',  desc:'7 дней по 8ч' },
  { id:'mood_first', icon:'🙂', title:'Настроение',      desc:'Первая запись' },
  { id:'mood_7',     icon:'😄', title:'Неделя эмоций',   desc:'7 дней настроения' },
  { id:'mood_30',    icon:'🤩', title:'Месяц эмоций',    desc:'30 дней настроения' },
  { id:'reflect_1',  icon:'📓', title:'Рефлексия',    desc:'Первая запись' },
  { id:'reflect_4',  icon:'📓', title:'4 недели',     desc:'4 недели подряд' },
  { id:'reflect_12', icon:'📓', title:'Квартал',      desc:'12 недель подряд' },
  { id:'goal_first', icon:'🎯', title:'Целеустремлённый', desc:'Первая цель' },
  { id:'goal_done',  icon:'🏆', title:'Цель достигнута',  desc:'Закрыл цель' },
  { id:'schedule_10',  icon:'📅', title:'Первый десяток',  desc:'10 дел выполнено' },
  { id:'schedule_100', icon:'📅', title:'100 дел',         desc:'100 дел выполнено' },
  { id:'schedule_perfect_day', icon:'✨', title:'Идеальный день', desc:'Все дела за день' }
];

function totalDoneSchedule(){ return N.S.navlife.schedule.filter(i => i.completed).length; }
function daysInARow(datesArr){
  if (!datesArr.length) return 0;
  const sorted = datesArr.slice().sort();
  let best = 1, cur = 1;
  for (let i = 1; i < sorted.length; i++){
    const prev = new Date(sorted[i-1] + 'T00:00:00');
    const now = new Date(sorted[i] + 'T00:00:00');
    const diff = Math.round((now - prev) / 86400000);
    if (diff === 1){ cur++; best = Math.max(best, cur); }
    else cur = 1;
  }
  return best;
}
function lastNDaysMoodStreak(){ return daysInARow(Object.keys(N.S.mood || {})); }
function bestHabitStreak(){
  if (!N.S.habits || !window.Habits) return 0;
  let best = 0;
  N.S.habits.forEach(h => { best = Math.max(best, window.Habits.bestStreak(h)); });
  return best;
}
function waterGoalDays(){
  let count = 0;
  const goal = N.S.nutrition.goals.water;
  Object.keys(N.S.nutrition.days || {}).forEach(k => {
    const d = N.S.nutrition.days[k];
    if (d && (d.water || 0) >= goal) count++;
  });
  return count;
}
function kcalGoalDays(){
  let count = 0;
  const goal = N.S.nutrition.goals.calories;
  Object.keys(N.S.nutrition.days || {}).forEach(k => {
    const d = N.S.nutrition.days[k];
    if (!d || !d.meals) return;
    let kcal = 0;
    ['breakfast','lunch','dinner','snack'].forEach(m => {
      (d.meals[m] || []).forEach(it => { kcal += it.kcal * it.grams / 100; });
    });
    if (kcal >= goal * 0.9 && kcal <= goal * 1.1) count++;
  });
  return count;
}
function sleepDays8h(){
  let c = 0;
  Object.keys(N.S.sleep || {}).forEach(k => { if (N.S.sleep[k].hours >= 8) c++; });
  return c;
}
function perfectDays(){
  const byDate = {};
  N.S.navlife.schedule.forEach(i => {
    if (!byDate[i.date]) byDate[i.date] = { total: 0, done: 0 };
    byDate[i.date].total++;
    if (i.completed) byDate[i.date].done++;
  });
  return Object.keys(byDate).filter(k => byDate[k].total > 3 && byDate[k].done === byDate[k].total).length;
}
function allExercisesTried(){
  if (!window.EX_LIST) return false;
  const sessionsEx = new Set(N.S.neurofit.sessions.map(s => s.ex));
  return window.EX_LIST.every(e => sessionsEx.has(e.id));
}
function maxBrainAccuracy(){
  return N.S.neurofit.sessions.reduce((m, s) => Math.max(m, s.acc || 0), 0);
}

const CHECKS = {
  streak_3:   () => N.S.neurofit.bestStreak >= 3,
  streak_7:   () => N.S.neurofit.bestStreak >= 7,
  streak_14:  () => N.S.neurofit.bestStreak >= 14,
  streak_30:  () => N.S.neurofit.bestStreak >= 30,
  streak_100: () => N.S.neurofit.bestStreak >= 100,
  brain_first:  () => N.S.neurofit.totalSessions >= 1,
  brain_10:     () => N.S.neurofit.totalSessions >= 10,
  brain_50:     () => N.S.neurofit.totalSessions >= 50,
  brain_100:    () => N.S.neurofit.totalSessions >= 100,
  brain_perfect:() => maxBrainAccuracy() >= 100,
  brain_all:    () => allExercisesTried(),
  habits_first:    () => (N.S.habits || []).length >= 1,
  habits_5:        () => (N.S.habits || []).length >= 5,
  habits_streak7:  () => bestHabitStreak() >= 7,
  habits_streak30: () => bestHabitStreak() >= 30,
  water_7:  () => waterGoalDays() >= 7,
  water_30: () => waterGoalDays() >= 30,
  kcal_7:   () => kcalGoalDays() >= 7,
  kcal_30:  () => kcalGoalDays() >= 30,
  sleep_first: () => Object.keys(N.S.sleep || {}).length >= 1,
  sleep_7:     () => Object.keys(N.S.sleep || {}).length >= 7,
  sleep_8h_7:  () => sleepDays8h() >= 7,
  mood_first: () => Object.keys(N.S.mood || {}).length >= 1,
  mood_7:     () => lastNDaysMoodStreak() >= 7,
  mood_30:    () => Object.keys(N.S.mood || {}).length >= 30,
  reflect_1:  () => (N.S.reflections || []).length >= 1,
  reflect_4:  () => (N.S.reflections || []).length >= 4,
  reflect_12: () => (N.S.reflections || []).length >= 12,
  goal_first: () => (N.S.navlife.goals || []).length >= 1,
  goal_done:  () => (N.S.navlife.goals || []).some(g => g.steps.length > 0 && g.steps.every(s => s.completed)),
  schedule_10: () => totalDoneSchedule() >= 10,
  schedule_100:() => totalDoneSchedule() >= 100,
  schedule_perfect_day: () => perfectDays() >= 1
};

let lastCheckAt = 0;
function check(){
  const now = Date.now();
  if (now - lastCheckAt < 500) return;
  lastCheckAt = now;
  if (!N.S.achievements) N.S.achievements = {};
  const justUnlocked = [];
  BADGES.forEach(b => {
    if (N.S.achievements[b.id]) return;
    try{
      if (CHECKS[b.id] && CHECKS[b.id]()){
        N.S.achievements[b.id] = now;
        justUnlocked.push(b);
      }
    }catch(e){}
  });
  if (justUnlocked.length){
    saveState();
    SFX.badge();
    buzz([20,40,20,40,20]);
    justUnlocked.forEach((b, i) => {
      setTimeout(() => {
        toast(`🏆 ${b.title} — ${b.desc}`, 3200, 'gold');
      }, i * 400);
    });
  }
}

function renderAchievements(){
  const root = document.createElement('div');
  root.className = 'screen';
  const unlocked = Object.keys(N.S.achievements || {}).length;
  const total = BADGES.length;
  root.innerHTML = `
    <div class="row" style="margin-bottom:16px;gap:10px">
      <button class="icon-btn" id="back" type="button">←</button>
      <div class="h1" style="flex:1">Достижения</div>
    </div>

    <div class="card" style="text-align:center;padding:22px">
      <div style="font-family:'Fraunces',serif;font-size:48px;font-weight:600;color:var(--amber);line-height:1">${unlocked} <span style="font-size:24px;color:var(--ink-mute)">/ ${total}</span></div>
      <div class="tiny" style="margin-top:8px">РАЗБЛОКИРОВАНО</div>
      <div class="bar" style="margin-top:14px"><i class="on" style="--p:${(unlocked/total).toFixed(3)}"></i></div>
    </div>

    <div class="badges-grid">
      ${BADGES.map(b => {
        const on = !!N.S.achievements[b.id];
        return `<div class="badge ${on?'unlocked':'locked'}" title="${esc(b.desc)}">
          <div class="badge-em">${b.icon}</div>
          <div class="badge-t">${esc(b.title)}</div>
        </div>`;
      }).join('')}
    </div>
    <p class="muted" style="text-align:center;font-size:12.5px;margin-top:14px">
      Тапни на бейдж — увидишь описание.
    </p>
    <div style="height:20px"></div>`;

  root.querySelector('#back').onclick = () => go('profile');
  root.querySelectorAll('.badge').forEach((b, i) => {
    b.onclick = () => {
      const badge = BADGES[i];
      const on = !!N.S.achievements[badge.id];
      toast(`${badge.icon} ${badge.title} — ${badge.desc}${on ? ' ✓' : ''}`, 2800);
      SFX.tap();
    };
  });
  return root;
}

function previewCard(){
  const unlocked = Object.keys(N.S.achievements || {}).length;
  const recent = Object.keys(N.S.achievements || {})
    .sort((a,b) => (N.S.achievements[b] || 0) - (N.S.achievements[a] || 0))
    .slice(0, 5)
    .map(id => BADGES.find(b => b.id === id))
    .filter(Boolean);
  return `<div class="card">
    <div class="between" style="margin-bottom:14px">
      <div>
        <div class="h3" style="font-family:'Fraunces',serif;font-size:16px">🏆 Достижения</div>
        <div class="muted" style="font-size:12.5px;margin-top:2px">${unlocked} / ${BADGES.length} разблокировано</div>
      </div>
      <button class="btn btn-line btn-sm" id="statsAchBtn" type="button">Все →</button>
    </div>
    ${recent.length ? `
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${recent.map(b => `<div style="display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:100px;background:var(--amber-soft);color:var(--amber-dim);font-size:12px;font-weight:600">
          <span>${b.icon}</span><span>${esc(b.title)}</span>
        </div>`).join('')}
      </div>` : '<p class="muted" style="font-size:12.5px">Пока ничего. Загляни в раздел достижений — там 33 цели.</p>'}
  </div>`;
}

window.Achievements = { list: BADGES, check, previewCard };
window.App.registerScreen('achievements', renderAchievements);

window.App.hooks.afterGo.push(name => {
  if (['stats','profile','today','habits'].includes(name)) {
    setTimeout(check, 200);
  }
});
})();