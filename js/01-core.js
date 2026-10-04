/* ═══ NAVLIFE · CORE · v3.1 ═══ */
'use strict';

const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const rnd  = n => Math.floor(Math.random()*n);
const pick = a => a[rnd(a.length)];
const clamp = (v, lo, hi) => v<lo?lo:v>hi?hi:v;
function shuffle(a){const b=a.slice();for(let i=b.length-1;i>0;i--){const j=rnd(i+1);[b[i],b[j]]=[b[j],b[i]];}return b;}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
const uid = p => p+'_'+Math.random().toString(36).slice(2,9);
const pad2 = n => String(n).padStart(2,'0');
const fmtDate = d => `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
const todayKey = () => fmtDate(new Date());
const toMin = t => { if(!t||typeof t!=='string') return 0; const [h,m]=t.split(':').map(Number); return (h||0)*60+(m||0); };
const fmtMinToClock = m => `${pad2(Math.floor(m/60)%24)}:${pad2(m%60)}`;
const dowNames = ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
const dowShort = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
const monNames = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const LEVEL_NAMES = ['Новичок','Ученик','Опытный','Продвинутый','Эксперт','Мастер'];
const STREAK_TO_LEVELUP = 10;
const TIMEOUT = Symbol('timeout');

const STORAGE_KEY = 'navlife-unified-v7';
const DEFAULT_STATE = {
  version: 7,
  shared:{ onboarded:false, theme:'light', sound:true, haptics:true, notifications:false, name:'Игрок', avatar:'🧠', avatarType:'emoji', dailyGoal:3 },
  navlife:{ goals:[], schedule:[], programs:[], baseRoutine:[], dailyStats:{}, viewDate: todayKey(), customKnowledge:[], baseSkip:{} },
  neurofit:{ xp:0, streak:0, bestStreak:0, lastDay:null, todayDay:null, todayCount:0, totalSessions:0, totalMs:0, levels:{}, manualDiff:{}, records:{}, sessions:[], catTried:{}, preferredMode:'normal' },
  nutrition:{
    goals:{ calories:2000, protein:100, fat:70, carbs:250, water:2000 },
    user:{ gender:'m', age:30, weight:75, height:180, activity:1.4, goalType:'maintain' },
    days:{}, weights:[], myFoods:[], templates:[], viewDate: todayKey(), _manualDate:false
  },
  mood:{}, reflections:[], meta:{}, habits:[], sleep:{},
  freezer:{ uses:2, monthKey:'', log:[] },
  achievements:{}, viewMode:'day'
};

let S = loadState();
let _saveInFlight = false;

function migrateState(p){
  if (!p || typeof p !== 'object') p = {};
  const out = { ...JSON.parse(JSON.stringify(DEFAULT_STATE)), ...p };
  out.shared    = { ...DEFAULT_STATE.shared,    ...(p.shared    || {}) };
  out.navlife   = { ...DEFAULT_STATE.navlife,   ...(p.navlife   || {}) };
  out.neurofit  = { ...DEFAULT_STATE.neurofit,  ...(p.neurofit  || {}) };
  out.nutrition = { ...DEFAULT_STATE.nutrition, ...(p.nutrition || {}) };
  out.nutrition.goals = { ...DEFAULT_STATE.nutrition.goals, ...((p.nutrition||{}).goals||{}) };
  out.nutrition.user  = { ...DEFAULT_STATE.nutrition.user,  ...((p.nutrition||{}).user ||{}) };
  out.neurofit.levels     = { ...((p.neurofit||{}).levels     || {}) };
  out.neurofit.manualDiff = { ...((p.neurofit||{}).manualDiff || {}) };
  out.neurofit.records    = { ...((p.neurofit||{}).records    || {}) };
  if (!out.mood || typeof out.mood !== 'object') out.mood = {};
  if (!Array.isArray(out.reflections)) out.reflections = [];
  if (!out.meta || typeof out.meta !== 'object') out.meta = {};
  if (!out.meta.notifShown || typeof out.meta.notifShown !== 'object') out.meta.notifShown = {};
  if (!out.meta.endOfDayShown || typeof out.meta.endOfDayShown !== 'object') out.meta.endOfDayShown = {};
  if (!Array.isArray(out.habits)) out.habits = [];
  if (!out.sleep || typeof out.sleep !== 'object') out.sleep = {};
  if (!out.freezer || typeof out.freezer !== 'object') out.freezer = { uses:2, monthKey:'', log:[] };
  if (!out.achievements || typeof out.achievements !== 'object') out.achievements = {};
  if (!out.viewMode) out.viewMode = 'day';
  if (!out.navlife.customKnowledge) out.navlife.customKnowledge = [];
  if (!out.navlife.baseSkip) out.navlife.baseSkip = {};
  if (!Array.isArray(out.navlife.schedule)) out.navlife.schedule = [];
  if (!Array.isArray(out.navlife.programs)) out.navlife.programs = [];
  if (!Array.isArray(out.navlife.baseRoutine)) out.navlife.baseRoutine = [];
  if (!Array.isArray(out.navlife.goals)) out.navlife.goals = [];
  if (!out.neurofit.sessions) out.neurofit.sessions = [];
  out.version = 7;
  return out;
}
function loadState(){
  try{
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw){
      for (const k of ['navlife-unified-v6','navlife-unified-v5','navlife-unified-v4','navlife-unified-v3']){
        const old = localStorage.getItem(k);
        if (old){ try { return migrateState(JSON.parse(old)); } catch(e){} }
      }
      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
    return migrateState(JSON.parse(raw));
  }catch(e){
    console.error('[loadState]', e);
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
}
function saveState(){
  if (_saveInFlight) return;
  _saveInFlight = true;
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); }catch(e){ console.error('[save]', e); }
  _saveInFlight = false;
}
function resetState(){
  try{ localStorage.removeItem(STORAGE_KEY); }catch(e){}
  S = JSON.parse(JSON.stringify(DEFAULT_STATE));
}
function applyTheme(){
  document.documentElement.dataset.theme = S.shared.theme;
  const m = document.querySelector('meta[name="theme-color"]');
  if (m) m.content = S.shared.theme === 'dark' ? '#000000' : '#EDEFEA';
}
function avatarHtml(avatar, size=48){
  if (avatar && String(avatar).startsWith('data:')){
    return `<img src="${avatar}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;display:block" alt="avatar">`;
  }
  return `<span style="font-size:${Math.round(size*0.7)}px;line-height:1">${avatar||'🧠'}</span>`;
}

let audioCtx = null;
function ensureAudio(){
  if (!audioCtx){ try{ audioCtx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ audioCtx = null; } }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}
function tone(freq, dur=.12, type='sine', gain=.06){
  if (!S.shared.sound) return;
  const ctx = ensureAudio(); if (!ctx) return;
  try{
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t+.012);
    g.gain.exponentialRampToValueAtTime(.0001, t+dur);
    o.connect(g).connect(ctx.destination);
    o.start(); o.stop(t+dur+.02);
  }catch(e){}
}
const SFX = {
  tap:()=>tone(520,.05,'sine',.03),
  ok:()=>{tone(660,.1,'sine',.055);setTimeout(()=>tone(880,.14,'sine',.05),70);},
  err:()=>tone(180,.2,'sawtooth',.04),
  levelup:()=>[0,80,160,260].forEach((d,i)=>setTimeout(()=>tone([523,659,784,1047][i],.18,'triangle',.06),d)),
  beep:i=>tone([392,494,587,698,784,880][i%6],.22,'sine',.06),
  win:()=>[0,100,200,340].forEach((d,i)=>setTimeout(()=>tone([523,659,784,1047][i],.22,'sine',.055),d)),
  endMelody:()=>[0,150,300,500].forEach((d,i)=>setTimeout(()=>tone([523,659,784,1047][i],.3,'sine',.06),d)),
  tick:()=>tone(700,.06,'sine',.04),
  timerStart:()=>{tone(523,.13,'sine',.06);setTimeout(()=>tone(784,.16,'sine',.06),110);},
  timerEnd:()=>{tone(880,.15,'sine',.07);setTimeout(()=>tone(880,.15,'sine',.07),180);setTimeout(()=>tone(1175,.28,'sine',.07),360);},
  timerLast3:()=>tone(600,.07,'sine',.045),
  pomodoroEnd:()=>{[0,150,300,450].forEach((d,i)=>setTimeout(()=>tone([523,659,784,1047][i],.25,'triangle',.06),d));},
  badge:()=>[0,90,180,300,450].forEach((d,i)=>setTimeout(()=>tone([784,988,1175,1397,1760][i],.2,'triangle',.06),d))
};
function buzz(p){ if (!S.shared.haptics || !navigator.vibrate) return; try{ navigator.vibrate(p); }catch(e){} }

let flashT = null;
function flash(kind){
  const el = $('#flash'); if (!el) return;
  el.className = 'flash '+kind+' on';
  clearTimeout(flashT);
  flashT = setTimeout(()=>{ el.className = 'flash '+kind; }, 170);
}
let toastT = null;
function toast(msg, ms=2400, cls){
  const el = $('#toast'); if (!el) return;
  el.textContent = msg;
  el.className = 'toast'+(cls?' '+cls:'');
  el.classList.add('on');
  clearTimeout(toastT);
  toastT = setTimeout(()=>el.classList.remove('on'), ms);
}

const xpForLevel = lv => Math.round(180 * Math.pow(lv, 1.35));
function levelInfo(xp){
  let lv = 1, acc = 0;
  while (lv<99 && acc+xpForLevel(lv) <= xp){ acc += xpForLevel(lv); lv++; }
  const need = xpForLevel(lv), into = xp - acc;
  return { level: lv, into, need, pct: clamp(into/need, 0, 1) };
}

const modalStack = [];
function openModal(html, after){
  const root = $('#modal-root');
  root.classList.add('open');
  const layer = document.createElement('div');
  layer.className = 'modal-layer';
  layer.innerHTML = `<div class="modal-backdrop"></div><div class="modal">${html}</div>`;
  root.appendChild(layer);
  modalStack.push(layer);
  $('.modal-backdrop', layer).onclick = () => closeModal(layer);
  if (after) after(layer);
  return layer;
}
function closeModal(layer){
  const root = $('#modal-root');
  let target = layer || modalStack[modalStack.length-1];
  if (!target) return;
  const i = modalStack.indexOf(target);
  if (i >= 0) modalStack.splice(i, 1);
  target.style.transition = 'opacity .2s';
  target.style.opacity = '0';
  setTimeout(()=>{
    if (target.parentNode) target.parentNode.removeChild(target);
    if (modalStack.length === 0) root.classList.remove('open');
  }, 200);
}
function closeAllModals(){
  modalStack.forEach(l => { if (l.parentNode) l.parentNode.removeChild(l); });
  modalStack.length = 0;
  $('#modal-root').classList.remove('open');
}

const App = {
  screens: {},
  registerScreen(name, fn){ this.screens[name] = fn; },
  hooks: { afterGo: [] }
};
window.App = App;

let currentScreen = null;
function go(name){
  if (window.__exCleanup){ try{ window.__exCleanup(); }catch(e){} window.__exCleanup = null; }
  if (window.__queue) window.__queue = [];
  closeAllModals();
  const host = $('#screens');
  host.innerHTML = '';
  const noNav = ['onboarding','goals','programs','knowledge','levels','achievements'];
  $('#nav').classList.toggle('hidden', noNav.includes(name));

  const fn = App.screens[name] || App.screens['today'];
  if (!fn){ console.error('[go] unknown:', name); return; }

  let el;
  try {
    el = fn();
  } catch (err) {
    console.error('[render:' + name + ']', err);
    const fallback = document.createElement('div');
    fallback.className = 'screen active';
    fallback.innerHTML = `<div class="card" style="text-align:center;padding:40px 20px;margin-top:40px">
      <div style="font-size:44px;margin-bottom:12px">⚠️</div>
      <div class="h2" style="margin-bottom:8px">Экран не загрузился</div>
      <p class="muted" style="margin-bottom:16px">${esc(String(err.message || err))}</p>
      <button class="btn btn-primary btn-full" onclick="location.reload()">Перезагрузить</button>
    </div>`;
    host.appendChild(fallback);
    currentScreen = name;
    $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.nav === name));
    return;
  }
  el.classList.add('active');
  host.appendChild(el);
  currentScreen = name;
  $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.nav === name));
  window.scrollTo(0, 0);
  App.hooks.afterGo.forEach(h => { try{ h(name); }catch(e){ console.warn('[afterGo]', e); } });
}
$$('.nav-btn').forEach(b => b.onclick = () => { SFX.tap(); buzz(8); go(b.dataset.nav); });

(function(){
  let last = 0;
  document.addEventListener('touchend', e => {
    const n = Date.now();
    if (n - last <= 350 && !e.target.closest('input, textarea')) e.preventDefault();
    last = n;
  }, {passive:false});
  ['gesturestart','gesturechange','gestureend'].forEach(ev =>
    document.addEventListener(ev, e => e.preventDefault(), {passive:false}));
  window.addEventListener('wheel', e => { if (e.ctrlKey||e.metaKey) e.preventDefault(); }, {passive:false});
})();

function itemsForDate(ds){ return S.navlife.schedule.filter(i => i.date === ds).sort((a,b)=>toMin(a.startTime)-toMin(b.startTime)); }
function findGoalStep(gid){
  for (const g of S.navlife.goals){
    const s = g.steps.find(x => x.id === gid);
    if (s) return { ...s, goal: g };
  }
  return null;
}
function computeDailyStats(ds){
  const items = itemsForDate(ds);
  const planned = items.length, completed = items.filter(i => i.completed).length;
  const percentage = planned ? Math.round(completed/planned*100) : 0;
  S.navlife.dailyStats[ds] = { planned, completed, percentage };
  return { planned, completed, percentage, remaining: planned - completed };
}
function dateLabel(ds){
  const t = todayKey();
  const d = new Date(ds+'T00:00:00');
  const y = new Date(Date.now()-86400000).toISOString().slice(0,10);
  const tm = new Date(Date.now()+86400000).toISOString().slice(0,10);
  const base = `${dowNames[d.getDay()][0].toUpperCase()}${dowNames[d.getDay()].slice(1)}, ${d.getDate()} ${monNames[d.getMonth()]}`;
  if (ds === t)  return 'Сегодня, '+base;
  if (ds === y)  return 'Вчера, '+base;
  if (ds === tm) return 'Завтра, '+base;
  return base;
}

function migrateBaseRefs(){
  if (!S.navlife.baseSkip) S.navlife.baseSkip = {};
  const today = todayKey();
  S.navlife.schedule.forEach(item => {
    if (item.fromBase && !item.baseRef && item.date >= today){
      const match = S.navlife.baseRoutine.find(b => b.title === item.title && b.startTime === item.startTime);
      if (match) item.baseRef = match.id;
    }
  });
}
function ensureBaseEventsForFuture(){
  if (!S.navlife.baseSkip) S.navlife.baseSkip = {};
  const start = new Date(); start.setHours(0,0,0,0);
  const end = new Date(start); end.setDate(end.getDate()+60);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate()+1)){
    const ds = fmtDate(d);
    S.navlife.baseRoutine.forEach(b => {
      const skipKey = `${ds}|${b.id}`;
      if (S.navlife.baseSkip[skipKey]) return;
      const exists = S.navlife.schedule.some(s => s.date === ds && s.fromBase && (s.baseRef === b.id || (!s.baseRef && s.title === b.title && s.startTime === b.startTime)));
      if (exists) return;
      const prog = b.programTitle ? S.navlife.programs.find(p => p.title === b.programTitle) : null;
      S.navlife.schedule.push({
        id: uid('sch'), title: b.title, type:'task',
        startTime: b.startTime, endTime: b.endTime, date: ds,
        completed:false, programId: prog ? prog.id : null, goalStepId:null,
        fromBase:true, baseRef: b.id
      });
    });
  }
}
function syncBaseEvents(){
  const today = todayKey();
  const activeIds = new Set(S.navlife.baseRoutine.map(b => b.id));
  S.navlife.schedule = S.navlife.schedule.filter(item => {
    if (!item.fromBase || item.date < today) return true;
    if (item.baseRef && !activeIds.has(item.baseRef) && !item.completed) return false;
    return true;
  });
  Object.keys(S.navlife.baseSkip).forEach(k => {
    const [id] = k.split('|');
    if (!activeIds.has(id)) delete S.navlife.baseSkip[k];
  });
  ensureBaseEventsForFuture();
}
function ensureRecurringEvents(){
  const templates = S.navlife.schedule.filter(i => i.repeatRule && i.repeatRule !== 'none');
  templates.forEach(tpl => {
    const start = new Date(tpl.date+'T00:00:00');
    const end = new Date(); end.setDate(end.getDate()+60);
    const days = [];
    if (tpl.repeatRule === 'daily'){
      for (let d = new Date(start); d <= end; d.setDate(d.getDate()+1)) days.push(new Date(d));
    } else if (tpl.repeatRule === 'every_other_day'){
      let c = 0;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate()+1)){ if (c%2===0) days.push(new Date(d)); c++; }
    } else if (tpl.repeatRule.startsWith('weekly_')){
      const nums = tpl.repeatRule.split('_')[1].split(',').map(Number);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate()+1)) if (nums.includes(d.getDay())) days.push(new Date(d));
    }
    days.forEach(d => {
      const ds = fmtDate(d);
      if (ds === tpl.date) return;
      const exists = S.navlife.schedule.some(s => s.date === ds && s.title === tpl.title && s.startTime === tpl.startTime && s.endTime === tpl.endTime);
      if (!exists){
        const ni = { ...tpl, id: uid('sch'), date: ds, completed:false, fromRecurring:true, repeatRule:undefined };
        if (ni.programId && !S.navlife.programs.find(p => p.id === ni.programId)) ni.programId = null;
        S.navlife.schedule.push(ni);
      }
    });
  });
}
function ensureBaseForDate(ds){
  const has = S.navlife.schedule.some(it => it.date === ds && it.fromBase);
  if (has || S.navlife.baseRoutine.length === 0) return;
  S.navlife.baseRoutine.forEach(b => {
    const skipKey = `${ds}|${b.id}`;
    if (S.navlife.baseSkip[skipKey]) return;
    const prog = b.programTitle ? S.navlife.programs.find(p => p.title === b.programTitle) : null;
    S.navlife.schedule.push({
      id: uid('sch'), title: b.title, type:'task',
      startTime: b.startTime, endTime: b.endTime, date: ds,
      completed:false, programId: prog ? prog.id : null, goalStepId:null,
      fromBase:true, baseRef: b.id
    });
  });
}
function refreshStreak(){
  const t = todayKey();
  if (S.neurofit.lastDay === t) return;
  const y = new Date(Date.now()-86400000).toISOString().slice(0,10);
  if (S.neurofit.lastDay === y){
    S.neurofit.streak = S.neurofit.streak + 1;
  } else {
    if (window.Freezer && window.Freezer.tryAutoFreeze && window.Freezer.tryAutoFreeze(S.neurofit.lastDay, t)){
      // серия сохранена
    } else {
      S.neurofit.streak = 1;
    }
  }
  S.neurofit.lastDay = t;
  if (S.neurofit.streak > S.neurofit.bestStreak) S.neurofit.bestStreak = S.neurofit.streak;
  saveState();
}
function ensureToday(){
  const t = todayKey();
  if (S.neurofit.todayDay !== t){ S.neurofit.todayDay = t; S.neurofit.todayCount = 0; saveState(); }
}
function completeScheduleItem(id, done){
  if (done === undefined) done = true;
  const it = S.navlife.schedule.find(i => i.id === id);
  if (!it) return;
  it.completed = done;
  if (it.goalStepId){
    const g = S.navlife.goals.find(g => g.steps.some(s => s.id === it.goalStepId));
    if (g){ const st = g.steps.find(s => s.id === it.goalStepId); st.completed = done; }
  }
  computeDailyStats(it.date);
  saveState();
  if (window.Achievements && window.Achievements.check) window.Achievements.check();
  toast(done ? `«${it.title}» ✓` : `«${it.title}» снова в плане`);
  go(currentScreen || 'today');
}

/* ═══ BRIDGE — ЭКСПОРТ ДЛЯ МОДУЛЕЙ ═══ */
window.__nav = {
  get S(){ return S; },
  set S(v){ S = v; },
  get currentScreen(){ return currentScreen; },
  get modalStack(){ return modalStack; },
  get TIMEOUT(){ return TIMEOUT; },
  get App(){ return App; },
  go, saveState, loadState, resetState, applyTheme, toast,
  openModal, closeModal, closeAllModals, completeScheduleItem,
  todayKey, fmtDate, esc, toMin, uid, pad2, fmtMinToClock,
  dowShort, dowNames, monNames, dateLabel, levelInfo, LEVEL_NAMES,
  itemsForDate, computeDailyStats, findGoalStep,
  ensureBaseForDate, syncBaseEvents, ensureRecurringEvents, ensureBaseEventsForFuture, migrateBaseRefs,
  refreshStreak, ensureToday,
  SFX, buzz, flash, ensureAudio, shuffle, pick, rnd, clamp, sleep,
  $, $$,
  STREAK_TO_LEVELUP,
  avatarHtml, DEFAULT_STATE,
  nutritionToday: (date) => {
    if (window.nutritionToday) return window.nutritionToday(date);
    return { kcal:0, protein:0, fat:0, carbs:0, water:0, data:{meals:{}} };
  }
};

setInterval(saveState, 30000);
window.addEventListener('beforeunload', saveState);
document.addEventListener('visibilitychange', () => { if (document.hidden) saveState(); });

/* ═══════════════════════════════════════════════════════════════════
   ГЛОБАЛЬНЫЕ ШИМЫ — защита от рассинхронизации между файлами.
   Если какой-то модуль напишет `const { $ } = window;` — сработает.
   Если Service Worker отдаст из кэша старый core без этих экспортов,
   шимы всё равно сделают `window.$` доступным.
   ═══════════════════════════════════════════════════════════════════ */
window.$  = $;
window.$$ = $$;
window.esc = esc;
window.clamp = clamp;
window.fmtMinToClock = fmtMinToClock;
window.sleep = sleep;
window.uid = uid;
window.toast = toast;
window.openModal = openModal;
window.closeModal = closeModal;
window.todayKey = todayKey;
window.fmtDate = fmtDate;
window.SFX = SFX;
window.buzz = buzz;
window.flash = flash;
window.levelInfo = levelInfo;
window.STREAK_TO_LEVELUP = STREAK_TO_LEVELUP;
window.S = S;