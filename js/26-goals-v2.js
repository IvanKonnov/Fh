/* ═══ NAVLIFE · GOALS v2 · полноценная система целей ═══
   Перезаписывает экран 'goals' из 06-goals.js.
   Категории, приоритеты, дедлайны, мотивация, круглый прогресс.
*/
(function(){
'use strict';
const N = window.__nav;
if (!N){ console.error('[GOALS v2] __nav not found'); return; }

const qs = (s, r=document) => r.querySelector(s);
const qsa = (s, r=document) => Array.from(r.querySelectorAll(s));
const _esc = (s) => String(s??'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ═══ КАТЕГОРИИ ═══ */
const CATEGORIES = [
  { key:'health',        label:'Здоровье',   emoji:'💪', color:'#3F6152', bg:'#E5EDE7' },
  { key:'career',        label:'Карьера',    emoji:'💼', color:'#3F5A7A', bg:'#E8EEF5' },
  { key:'finance',       label:'Финансы',    emoji:'💰', color:'#B87F35', bg:'#FBF3E1' },
  { key:'learning',      label:'Обучение',   emoji:'📚', color:'#6A4A7A', bg:'#F0E7F5' },
  { key:'relationships', label:'Отношения',  emoji:'❤️', color:'#A4503A', bg:'#FBEFE9' },
  { key:'growth',        label:'Развитие',   emoji:'🌱', color:'#4F7563', bg:'#DDE6DE' },
  { key:'creativity',    label:'Творчество', emoji:'🎨', color:'#B87F35', bg:'#F3E3C8' },
  { key:'other',         label:'Другое',     emoji:'⭐', color:'#7B857B', bg:'#EFEFEA' }
];
const CAT_MAP = {};
CATEGORIES.forEach(c => CAT_MAP[c.key] = c);

/* ═══ ПРИОРИТЕТЫ ═══ */
const PRIORITIES = [
  { key:1, label:'Высокий', short:'P1', color:'#A4503A' },
  { key:2, label:'Средний', short:'P2', color:'#B87F35' },
  { key:3, label:'Низкий',  short:'P3', color:'#7B857B' }
];
const PRIO_MAP = {};
PRIORITIES.forEach(p => PRIO_MAP[p.key] = p);

/* ═══ СТИЛИ ═══ */
const STYLE_ID = 'navlife-goals-v2-styles';
function ensureStyles(){
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
/* Hero секции целей */
.goals-hero{
  position:relative;
  border-radius:22px;
  padding:22px;
  background:linear-gradient(155deg,#2A3A2F 0%,#1B211D 62%);
  color:#F4F2EA;
  overflow:hidden;
  margin-bottom:14px;
  box-shadow:0 24px 60px -24px rgba(0,0,0,.45);
}
.goals-hero::after{
  content:'';position:absolute;right:-60px;top:-60px;
  width:220px;height:220px;border-radius:50%;
  background:radial-gradient(circle,rgba(184,127,53,.42),transparent 68%);
  pointer-events:none;
}
.goals-hero-inner{position:relative;z-index:1;display:flex;align-items:center;gap:18px}
.goals-hero-ring{flex-shrink:0;position:relative}
.goals-hero-meta{flex:1;min-width:0}
.goals-hero-title{
  font-family:'Fraunces',serif;
  font-size:20px;font-weight:600;color:#fff;
  letter-spacing:-.01em;line-height:1.2;
  margin-bottom:4px;
}
.goals-hero-sub{
  font-size:12.5px;color:#C7CEC5;line-height:1.5;
}
.goals-hero-stats{
  display:flex;gap:16px;margin-top:12px;flex-wrap:wrap;
}
.goals-hero-stat{
  display:flex;flex-direction:column;
}
.goals-hero-stat b{
  font-family:'Fraunces',serif;font-size:18px;font-weight:600;color:#F3E3C8;
  line-height:1;
}
.goals-hero-stat span{
  font-size:10.5px;color:#9AA398;letter-spacing:.06em;
  text-transform:uppercase;font-weight:700;margin-top:3px;
}
.goals-hero-empty .goals-hero-title{color:#fff}

/* Табы-фильтры */
.goals-tabs{
  display:flex;gap:6px;margin-bottom:14px;
  overflow-x:auto;
  -webkit-overflow-scrolling:touch;
  scrollbar-width:none;
}
.goals-tabs::-webkit-scrollbar{display:none}
.goals-tab{
  padding:9px 16px;border-radius:100px;
  background:var(--paper);
  border:1px solid var(--line);
  font-size:13px;font-weight:600;
  color:var(--ink-soft);
  cursor:pointer;
  transition:all .15s;
  white-space:nowrap;
  display:inline-flex;align-items:center;gap:6px;
}
.goals-tab:hover{border-color:var(--moss);color:var(--moss)}
.goals-tab.on{
  background:var(--moss);color:#fff;border-color:var(--moss);
  box-shadow:0 6px 16px -6px rgba(63,97,82,.4);
}
.goals-tab-count{
  display:inline-flex;align-items:center;justify-content:center;
  min-width:18px;height:18px;padding:0 5px;
  border-radius:100px;
  background:rgba(0,0,0,.08);
  font-size:10.5px;font-weight:700;
}
.goals-tab.on .goals-tab-count{background:rgba(255,255,255,.25);color:#fff}

/* Карточка цели */
.goal-card-v2{
  position:relative;
  background:var(--glass-bg,var(--surface-raised));
  border:1px solid var(--glass-border,var(--line));
  border-radius:16px;
  padding:16px;
  margin-bottom:10px;
  cursor:pointer;
  transition:border-color .15s,transform .14s,box-shadow .18s;
  backdrop-filter:blur(20px) saturate(150%);
  -webkit-backdrop-filter:blur(20px) saturate(150%);
  box-shadow:0 1px 0 0 var(--glass-hi,rgba(255,255,255,.9)) inset,0 8px 24px -14px rgba(27,33,29,.2);
  overflow:hidden;
}
.goal-card-v2:active{transform:scale(.99)}
.goal-card-v2::before{
  content:'';position:absolute;left:0;top:0;bottom:0;width:4px;
  background:var(--accent-color,#7B857B);
}
.goal-card-v2:hover{
  border-color:var(--accent-color,#3F6152);
  box-shadow:var(--card-ring,0 4px 12px rgba(27,33,29,.08));
}
.goal-card-v2.done{opacity:.75}
.goal-card-v2.done .goal-title-v2{text-decoration:line-through;color:var(--ink-soft)}
.goal-card-v2.archived{opacity:.55}
.goal-card-v2.overdue{border-color:rgba(164,80,58,.3);background:linear-gradient(155deg,#FBEFE9,var(--glass-bg,var(--surface-raised)))}
html[data-theme="dark"] .goal-card-v2.overdue{background:linear-gradient(155deg,#1A0F0A,var(--line-soft))}

.goal-card-top{
  display:flex;gap:12px;align-items:flex-start;
  margin-bottom:10px;
}
.goal-cat-icon{
  width:44px;height:44px;flex-shrink:0;
  border-radius:12px;
  display:grid;place-items:center;
  font-size:22px;
}
.goal-title-block{flex:1;min-width:0}
.goal-title-v2{
  font-family:'Fraunces',serif;
  font-size:15.5px;font-weight:600;
  color:var(--ink);letter-spacing:-.01em;
  line-height:1.25;
  word-wrap:break-word;
}
.goal-tags-v2{
  display:flex;gap:6px;flex-wrap:wrap;
  margin-top:4px;
}
.goal-tag{
  font-size:10px;font-weight:700;
  padding:2px 8px;border-radius:100px;
  letter-spacing:.04em;text-transform:uppercase;
}
.goal-prio-tag{color:#fff}

.goal-card-ring{
  flex-shrink:0;
  margin-left:auto;
  position:relative;
}
.goal-ring-value{
  position:absolute;inset:0;
  display:flex;align-items:center;justify-content:center;
  font-family:'Fraunces',serif;
  font-size:13.5px;font-weight:600;
  color:var(--ink);
}

.goal-desc-v2{
  font-size:12.5px;color:var(--ink-soft);
  line-height:1.5;
  margin-bottom:10px;
  display:-webkit-box;
  -webkit-line-clamp:2;
  line-clamp:2;
  -webkit-box-orient:vertical;
  overflow:hidden;
}
.goal-why-v2{
  font-size:12px;
  color:var(--moss);
  background:var(--moss-soft);
  border-radius:8px;
  padding:8px 10px;
  margin-bottom:10px;
  line-height:1.5;
  font-style:italic;
  display:-webkit-box;
  -webkit-line-clamp:2;
  line-clamp:2;
  -webkit-box-orient:vertical;
  overflow:hidden;
}
.goal-why-v2::before{content:'“';font-size:16px;font-weight:700;color:var(--moss);margin-right:2px}
.goal-why-v2::after{content:'”';font-size:16px;font-weight:700;color:var(--moss);margin-left:2px}

.goal-bar-v2{
  height:5px;border-radius:4px;
  background:var(--line-soft);
  overflow:hidden;
  margin-bottom:8px;
}
.goal-bar-v2 > div{
  height:100%;border-radius:4px;
  transition:width .6s cubic-bezier(.22,1,.36,1);
}
.goal-card-foot{
  display:flex;justify-content:space-between;align-items:center;
  gap:10px;
  font-size:11.5px;color:var(--ink-mute);
}
.goal-card-foot b{color:var(--ink);font-weight:600}
.goal-deadline{
  font-weight:600;
  padding:2px 8px;border-radius:100px;
  font-size:10.5px;
}
.goal-deadline.urgent{background:rgba(184,127,53,.14);color:#8A5E1F}
.goal-deadline.overdue{background:rgba(164,80,58,.14);color:#A4503A}
.goal-deadline.ok{background:var(--paper);color:var(--ink-soft)}
html[data-theme="dark"] .goal-deadline.urgent{background:rgba(217,168,94,.2);color:#E5B96C}
html[data-theme="dark"] .goal-deadline.overdue{background:rgba(214,129,104,.2);color:#D68168}
html[data-theme="dark"] .goal-deadline.ok{background:var(--line-soft);color:var(--ink-mute)}

/* Пустое состояние */
.goal-empty{
  padding:40px 24px;text-align:center;
}
.goal-empty-em{
  font-size:56px;line-height:1;margin-bottom:14px;
  display:inline-block;
  animation:emptyFloat 3s ease-in-out infinite;
}
@keyframes emptyFloat{
  0%,100%{transform:translateY(0)}
  50%{transform:translateY(-8px)}
}
.goal-empty-title{
  font-family:'Fraunces',serif;
  font-size:19px;font-weight:600;
  color:var(--ink);letter-spacing:-.01em;
  margin-bottom:6px;
}
.goal-empty-text{
  font-size:13px;color:var(--ink-soft);
  line-height:1.55;max-width:300px;margin:0 auto 20px;
}

/* Детальный экран (модалка) */
.goal-detail-head{
  display:flex;gap:14px;align-items:flex-start;
  margin-bottom:16px;
}
.goal-detail-icon{
  width:64px;height:64px;flex-shrink:0;
  border-radius:16px;
  display:grid;place-items:center;
  font-size:32px;
}
.goal-detail-info{flex:1;min-width:0}
.goal-detail-title{
  font-family:'Fraunces',serif;
  font-size:20px;font-weight:600;
  color:var(--ink);letter-spacing:-.01em;
  line-height:1.2;
  margin-bottom:6px;
  word-wrap:break-word;
}
.goal-detail-tags{
  display:flex;gap:6px;flex-wrap:wrap;
}
.goal-detail-ring-wrap{
  display:flex;align-items:center;gap:18px;
  padding:14px;
  background:var(--paper);
  border-radius:14px;
  margin-bottom:16px;
}
.goal-detail-ring-num{
  font-family:'Fraunces',serif;
  font-size:26px;font-weight:600;
  color:var(--ink);line-height:1;
}
.goal-detail-ring-sub{
  font-size:12px;color:var(--ink-soft);
  margin-top:2px;
}
.goal-section-title{
  font-size:11px;font-weight:700;
  letter-spacing:.1em;text-transform:uppercase;
  color:var(--ink-mute);
  margin:16px 0 8px;
}
.goal-why-block{
  padding:12px 14px;
  background:var(--moss-soft);
  border-radius:12px;
  font-size:13.5px;
  line-height:1.55;
  color:var(--moss);
  font-style:italic;
}
.goal-why-block::before{content:'“';font-size:20px;font-weight:700;margin-right:4px}
.goal-why-block::after{content:'”';font-size:20px;font-weight:700;margin-left:4px}

/* Список шагов */
.goal-step-v2{
  display:flex;align-items:center;gap:12px;
  padding:12px 14px;
  border-radius:12px;
  background:var(--paper);
  margin-bottom:6px;
  transition:background .15s;
}
.goal-step-v2:active{background:var(--line-soft)}
.goal-step-v2.completed{opacity:.55}
.goal-step-v2.completed .goal-step-title{text-decoration:line-through;color:var(--ink-soft)}
.goal-step-check{
  width:22px;height:22px;flex-shrink:0;
  border-radius:7px;
  border:1.5px solid var(--line);
  background:transparent;
  display:grid;place-items:center;
  color:#fff;font-size:13px;font-weight:700;
  cursor:pointer;
  transition:all .15s;
}
.goal-step-check.on{background:var(--moss);border-color:var(--moss)}
.goal-step-body{flex:1;min-width:0}
.goal-step-title{
  font-size:13.5px;font-weight:600;color:var(--ink);
  line-height:1.35;
  word-wrap:break-word;
}
.goal-step-date{
  font-size:11px;color:var(--ink-mute);
  margin-top:2px;
}
.goal-step-del{
  width:28px;height:28px;flex-shrink:0;
  border-radius:8px;background:transparent;border:none;
  color:var(--ink-mute);font-size:14px;cursor:pointer;
  display:grid;place-items:center;
}
.goal-step-del:hover{color:var(--rust)}

/* Периодическая цель — точки дней */
.goal-period-info{
  display:flex;align-items:center;gap:12px;
  padding:14px;
  background:var(--paper);
  border-radius:14px;
  margin-bottom:14px;
}
.goal-period-value{
  font-family:'Fraunces',serif;
  font-size:32px;font-weight:600;
  color:var(--moss);line-height:1;
}
.goal-period-label{
  font-size:12px;color:var(--ink-soft);
  line-height:1.4;
}

/* Действия */
.goal-actions-v2{
  display:grid;gap:8px;margin-top:14px;
}
.goal-actions-row{display:flex;gap:8px}
.goal-actions-row .btn{flex:1}

/* Модалка выбора категории */
.cat-grid{
  display:grid;grid-template-columns:repeat(4,1fr);gap:6px;
}
.cat-btn{
  aspect-ratio:1;
  border-radius:12px;
  border:1.5px solid var(--line);
  background:var(--paper);
  display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  gap:4px;
  padding:6px 4px;
  cursor:pointer;
  transition:all .15s;
}
.cat-btn:hover{border-color:var(--moss)}
.cat-btn.on{border-width:2px;box-shadow:0 4px 12px -4px rgba(0,0,0,.12)}
.cat-btn-em{font-size:20px;line-height:1}
.cat-btn-lbl{font-size:9px;font-weight:700;letter-spacing:.02em;color:var(--ink-soft);text-align:center;line-height:1.15}

/* Пикер приоритета */
.prio-row{
  display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;
}
.prio-btn{
  padding:12px 8px;border-radius:12px;
  border:1.5px solid var(--line);
  background:var(--paper);
  font-size:13px;font-weight:600;
  color:var(--ink);
  cursor:pointer;
  transition:all .15s;
  display:flex;flex-direction:column;align-items:center;gap:2px;
}
.prio-btn .dot{
  width:8px;height:8px;border-radius:50%;
}
  `;
  document.head.appendChild(s);
}

/* ═══ ПРОГРЕСС-КРУГ ═══ */
function progressRing(pct, color, size){
  size = size || 54;
  const stroke = size >= 50 ? 4 : 3;
  const r = (size - stroke * 2) / 2;
  const cx = size / 2, cy = size / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(100, Math.max(0, pct))/100);
  return `
    <svg viewBox="0 0 ${size} ${size}" style="width:${size}px;height:${size}px;transform:rotate(-90deg);display:block">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--line-soft)" stroke-width="${stroke}"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}"
        stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}"
        stroke-linecap="round" style="transition:stroke-dashoffset .6s cubic-bezier(.22,1,.36,1)"/>
    </svg>
  `;
}

/* ═══ ДАТЫ ═══ */
function daysUntil(dateStr){
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  const now = new Date(); now.setHours(0,0,0,0);
  return Math.ceil((d - now) / 86400000);
}
function plural(n, one, few, many){
  const a = Math.abs(n) % 100;
  if (a >= 11 && a <= 19) return many;
  const l = a % 10;
  if (l === 1) return one;
  if (l >= 2 && l <= 4) return few;
  return many;
}
function deadlineInfo(dateStr){
  const d = daysUntil(dateStr);
  if (d === null) return null;
  if (d < 0){
    return { text:`Просрочено на ${-d} ${plural(-d,'день','дня','дней')}`, cls:'overdue', urgent:true, d };
  }
  if (d === 0) return { text:'Сегодня', cls:'urgent', urgent:true, d };
  if (d === 1) return { text:'Завтра', cls:'urgent', urgent:true, d };
  if (d < 7)  return { text:`Осталось ${d} ${plural(d,'день','дня','дней')}`, cls:'urgent', urgent:true, d };
  if (d < 30) return { text:`Осталось ${d} дней`, cls:'ok', urgent:false, d };
  return { text:`Осталось ${Math.round(d/30)} мес.`, cls:'ok', urgent:false, d };
}

/* ═══ ПЕРИОД ═══ */
function periodStart(period){
  const d = new Date(); d.setHours(0,0,0,0);
  if (period === 'week'){
    const dow = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - dow);
  } else if (period === 'month'){
    d.setDate(1);
  }
  return N.fmtDate(d);
}
function periodDaysLeft(period){
  const p = periodStart(period);
  const d = new Date(p + 'T00:00:00');
  d.setDate(d.getDate() + (period === 'week' ? 7 : 30));
  const now = new Date();
  return Math.max(0, Math.ceil((d - now) / 86400000));
}

/* ═══ ПРОГРЕСС ЦЕЛИ ═══ */
function goalProgress(g){
  if ((g.period || 'longterm') === 'longterm'){
    const steps = g.steps || [];
    const total = steps.length;
    const done = steps.filter(s => s.completed).length;
    return { pct: total ? Math.round(done/total*100) : 0, done, total, unit: plural(total,'шаг','шага','шагов') };
  }
  const start = periodStart(g.period);
  const prog = (g.progress || []).filter(d => d >= start);
  const target = g.target || 4;
  return { pct: Math.min(100, Math.round(prog.length/target*100)), done: prog.length, total: target, unit:'раз' };
}

/* ═══ МИГРАЦИЯ СУЩЕСТВУЮЩИХ ЦЕЛЕЙ ═══ */
function migrateGoals(){
  let changed = false;
  (N.S.navlife.goals || []).forEach(g => {
    if (typeof g.category === 'undefined'){ g.category = 'other'; changed = true; }
    if (typeof g.priority === 'undefined'){ g.priority = 2; changed = true; }
    if (typeof g.why === 'undefined'){ g.why = ''; changed = true; }
    if (typeof g.deadline === 'undefined'){ g.deadline = null; changed = true; }
    if (typeof g.status === 'undefined'){ g.status = 'active'; changed = true; }
    if (typeof g.completedAt === 'undefined'){ g.completedAt = null; changed = true; }
    if (g.steps){
      g.steps.forEach(s => {
        if (typeof s.date === 'undefined'){ s.date = null; changed = true; }
      });
    }
    // Приведение icon к эмодзи категории, если icon — не эмодзи
    if (g.icon && g.icon.length > 2){
      const cat = CAT_MAP[g.category];
      g.icon = cat ? cat.emoji : '🎯';
      changed = true;
    }
  });
  if (changed) N.saveState();
}

/* ═══ СТАТИСТИКА ═══ */
function getStats(){
  const goals = N.S.navlife.goals || [];
  const active = goals.filter(g => (g.status || 'active') === 'active');
  const done = goals.filter(g => g.status === 'done');
  const archived = goals.filter(g => g.status === 'archived');

  const avgProgress = active.length
    ? Math.round(active.reduce((s, g) => s + goalProgress(g).pct, 0) / active.length)
    : 0;

  // Ближайший дедлайн среди активных
  let nearest = null;
  active.forEach(g => {
    if (!g.deadline) return;
    const d = daysUntil(g.deadline);
    if (d === null) return;
    if (!nearest || d < nearest.days){
      nearest = { goal: g, days: d, date: g.deadline };
    }
  });

  return { active, done, archived, avgProgress, nearest, total: goals.length };
}

/* ═══════════════════════════════════════════════════════════════════
   ГЛАВНЫЙ ЭКРАН
   ═══════════════════════════════════════════════════════════════════ */
let activeTab = 'active'; /* active | done | archived */

function renderGoals(){
  ensureStyles();
  migrateGoals();
  const goals = N.S.navlife.goals || [];
  const stats = getStats();

  const root = document.createElement('div');
  root.className = 'screen';

  /* Сортируем активные: приоритет → дедлайн */
  const sortActive = arr => arr.slice().sort((a, b) => {
    const pa = a.priority || 2, pb = b.priority || 2;
    if (pa !== pb) return pa - pb;
    const da = a.deadline ? daysUntil(a.deadline) : 9999;
    const db = b.deadline ? daysUntil(b.deadline) : 9999;
    return da - db;
  });

  const listActive = sortActive(stats.active);
  const listDone = stats.done.slice().sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));
  const listArchived = stats.archived.slice();

  const listMap = { active: listActive, done: listDone, archived: listArchived };
  const currentList = listMap[activeTab] || [];

  root.innerHTML = `
    <div class="row" style="margin-bottom:16px;gap:10px">
      <button class="icon-btn" id="gBack" type="button">←</button>
      <div class="h1" style="flex:1">Цели</div>
      <button class="btn btn-primary btn-sm" id="gAdd" type="button">+ Цель</button>
    </div>

    ${renderHero(stats)}

    <div class="goals-tabs">
      <button class="goals-tab ${activeTab==='active'?'on':''}" data-tab="active" type="button">
        Активные <span class="goals-tab-count">${stats.active.length}</span>
      </button>
      <button class="goals-tab ${activeTab==='done'?'on':''}" data-tab="done" type="button">
        Выполнено <span class="goals-tab-count">${stats.done.length}</span>
      </button>
      <button class="goals-tab ${activeTab==='archived'?'on':''}" data-tab="archived" type="button">
        Архив <span class="goals-tab-count">${stats.archived.length}</span>
      </button>
    </div>

    <div id="goals-list"></div>
    <div style="height:20px"></div>`;

  const listEl = root.querySelector('#goals-list');
  if (!currentList.length){
    listEl.innerHTML = renderEmptyState(activeTab);
  } else {
    listEl.innerHTML = currentList.map(g => renderGoalCard(g)).join('');
  }

  /* Bindings */
  root.querySelector('#gBack').onclick = () => N.go('today');
  root.querySelector('#gAdd').onclick = () => openGoalEditor(null);

  root.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => {
    activeTab = b.dataset.tab;
    N.SFX.tap(); N.buzz(6);
    N.go('goals');
  });

  /* Клик на карточку → детали */
  listEl.querySelectorAll('[data-goal-id]').forEach(card => {
    card.onclick = (e) => {
      if (e.target.closest('[data-step-toggle]')) return;
      const id = card.dataset.goalId;
      const g = (N.S.navlife.goals || []).find(x => x.id === id);
      if (g){ N.SFX.tap(); openGoalDetail(g); }
    };
  });

  /* Быстрый чекбокс шага прямо на карточке (если есть) */
  listEl.querySelectorAll('[data-step-toggle]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const [gid, sid] = btn.dataset.stepToggle.split('|');
      const g = (N.S.navlife.goals || []).find(x => x.id === gid);
      if (!g) return;
      const s = (g.steps||[]).find(x => x.id === sid);
      if (!s) return;
      s.completed = !s.completed;
      N.saveState();
      N.SFX.ok(); N.buzz(10);
      /* Автопредложение завершить цель */
      if ((g.steps||[]).every(x => x.completed) && g.status === 'active'){
        setTimeout(() => {
          N.toast(`🎉 Все шаги выполнены! Отметить цель?`, 4000, 'gold');
        }, 300);
      }
      if (window.Achievements) window.Achievements.check();
      N.go('goals');
    };
  });

  return root;
}

/* ═══ HERO ═══ */
function renderHero(stats){
  if (stats.total === 0){
    return `
      <div class="goals-hero goals-hero-empty">
        <div class="goals-hero-inner">
          <div style="font-size:44px;flex-shrink:0">🎯</div>
          <div class="goals-hero-meta">
            <div class="goals-hero-title">Поставь первую цель</div>
            <div class="goals-hero-sub">Цели помогают фокусироваться и не терять направление.</div>
          </div>
        </div>
      </div>`;
  }

  const pct = stats.avgProgress;
  const nearest = stats.nearest;
  let deadlineHTML = '';
  if (nearest){
    const info = deadlineInfo(nearest.date);
    deadlineHTML = info
      ? `<div class="goals-hero-stat"><b style="color:${info.urgent?'#E5B96C':'#F3E3C8'}">${nearest.days < 0 ? '+' + (-nearest.days) : nearest.days}</b><span>${nearest.days < 0 ? 'дней просроч.' : 'дней до дедлайна'}</span></div>`
      : '';
  }

  return `
    <div class="goals-hero">
      <div class="goals-hero-inner">
        <div class="goals-hero-ring">
          ${progressRing(pct, '#F3E3C8', 76)}
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-size:19px;font-weight:600;color:#F3E3C8">${pct}%</div>
        </div>
        <div class="goals-hero-meta">
          <div class="goals-hero-title">${stats.active.length} ${plural(stats.active.length,'цель','цели','целей')} в работе</div>
          <div class="goals-hero-sub">Средний прогресс ${pct}%</div>
          <div class="goals-hero-stats">
            <div class="goals-hero-stat"><b>${stats.done.length}</b><span>выполнено</span></div>
            ${deadlineHTML}
          </div>
        </div>
      </div>
    </div>`;
}

/* ═══ ПУСТОЕ СОСТОЯНИЕ ═══ */
function renderEmptyState(tab){
  if (tab === 'active'){
    return `
      <div class="goal-empty">
        <div class="goal-empty-em">🎯</div>
        <div class="goal-empty-title">Пока пусто</div>
        <p class="goal-empty-text">Заведи первую цель: маленькую или большую — она поможет держать фокус и видеть прогресс.</p>
        <button class="btn btn-primary btn-lg" id="gAddEmpty" type="button">+ Создать первую цель</button>
      </div>`;
  }
  if (tab === 'done'){
    return `
      <div class="goal-empty">
        <div class="goal-empty-em">🏅</div>
        <div class="goal-empty-title">Выполненных пока нет</div>
        <p class="goal-empty-text">Здесь появятся достигнутые цели. Иди к своим — получится!</p>
      </div>`;
  }
  return `
    <div class="goal-empty">
      <div class="goal-empty-em">📦</div>
      <div class="goal-empty-title">Архив пуст</div>
      <p class="goal-empty-text">Сюда можно отложить цели, к которым ты временно не идёшь.</p>
    </div>`;
}

/* ═══ КАРТОЧКА ЦЕЛИ ═══ */
function renderGoalCard(g){
  const cat = CAT_MAP[g.category] || CAT_MAP.other;
  const prio = PRIO_MAP[g.priority] || PRIO_MAP[2];
  const prog = goalProgress(g);
  const isDone = g.status === 'done';
  const isArchived = g.status === 'archived';
  const dl = g.deadline ? deadlineInfo(g.deadline) : null;

  const classes = ['goal-card-v2'];
  if (isDone) classes.push('done');
  if (isArchived) classes.push('archived');
  if (dl && dl.urgent && !isDone && !isArchived) classes.push('overdue');

  /* Первый незавершённый шаг для быстрой отметки */
  let quickStep = null;
  if (!isDone && !isArchived && g.steps && g.steps.length){
    quickStep = g.steps.find(s => !s.completed);
  }

  return `
    <div class="${classes.join(' ')}" data-goal-id="${g.id}" style="--accent-color:${cat.color}">
      <div class="goal-card-top">
        <div class="goal-cat-icon" style="background:${cat.bg};color:${cat.color}">${cat.emoji}</div>
        <div class="goal-title-block">
          <div class="goal-title-v2">${_esc(g.title)}</div>
          <div class="goal-tags-v2">
            <span class="goal-tag" style="background:${cat.bg};color:${cat.color}">${_esc(cat.label)}</span>
            <span class="goal-tag goal-prio-tag" style="background:${prio.color}">${prio.short} · ${prio.label}</span>
            ${isDone ? '<span class="goal-tag" style="background:var(--moss);color:#fff">✓ Готово</span>' : ''}
            ${isArchived ? '<span class="goal-tag" style="background:var(--ink-mute);color:#fff">Архив</span>' : ''}
          </div>
        </div>
        <div class="goal-card-ring">
          ${progressRing(prog.pct, cat.color, 54)}
          <div class="goal-ring-value" style="color:${cat.color}">${prog.pct}%</div>
        </div>
      </div>

      ${g.description ? `<div class="goal-desc-v2">${_esc(g.description)}</div>` : ''}

      <div class="goal-bar-v2">
        <div style="width:${prog.pct}%;background:${cat.color}"></div>
      </div>

      <div class="goal-card-foot">
        <div><b>${prog.done}</b> / ${prog.total} ${prog.unit}</div>
        ${dl ? `<div class="goal-deadline ${dl.cls}">${_esc(dl.text)}</div>` : (g.period && g.period !== 'longterm' ? `<div class="goal-deadline ok">${periodDaysLeft(g.period)} дней</div>` : '<div></div>')}
      </div>

      ${g.why && !isDone && !isArchived ? `<div class="goal-why-v2" style="margin-top:10px;margin-bottom:0">${_esc(g.why)}</div>` : ''}

      ${quickStep && !isDone && !isArchived ? `
        <button data-step-toggle="${g.id}|${quickStep.id}" type="button" style="
          margin-top:10px;width:100%;
          padding:10px 12px;
          border-radius:10px;
          background:${cat.bg};
          border:1px dashed ${cat.color}55;
          color:${cat.color};
          font-size:12.5px;font-weight:600;
          cursor:pointer;text-align:left;
          display:flex;align-items:center;gap:8px;
        ">
          <span style="width:16px;height:16px;border-radius:5px;border:1.5px solid ${cat.color};display:grid;place-items:center;font-size:11px;background:transparent;color:${cat.color}"></span>
          <span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${_esc(quickStep.title)}</span>
          <span style="font-size:10px;opacity:.7">отметить</span>
        </button>
      ` : ''}
    </div>`;
}

/* ═══════════════════════════════════════════════════════════════════
   ДЕТАЛЬНЫЙ ЭКРАН ЦЕЛИ
   ═══════════════════════════════════════════════════════════════════ */
function openGoalDetail(g){
  const cat = CAT_MAP[g.category] || CAT_MAP.other;
  const prio = PRIO_MAP[g.priority] || PRIO_MAP[2];
  const prog = goalProgress(g);
  const isDone = g.status === 'done';
  const isArchived = g.status === 'archived';
  const dl = g.deadline ? deadlineInfo(g.deadline) : null;
  const periodInfo = (g.period && g.period !== 'longterm') ? periodDaysLeft(g.period) : null;

  const layer = N.openModal(`
    <div class="modal-handle"></div>

    <div class="goal-detail-head">
      <div class="goal-detail-icon" style="background:${cat.bg};color:${cat.color}">${cat.emoji}</div>
      <div class="goal-detail-info">
        <div class="goal-detail-title">${_esc(g.title)}</div>
        <div class="goal-detail-tags">
          <span class="goal-tag" style="background:${cat.bg};color:${cat.color}">${_esc(cat.label)}</span>
          <span class="goal-tag goal-prio-tag" style="background:${prio.color}">${prio.short}</span>
          ${isDone ? '<span class="goal-tag" style="background:var(--moss);color:#fff">✓ Готово</span>' : ''}
          ${isArchived ? '<span class="goal-tag" style="background:var(--ink-mute);color:#fff">Архив</span>' : ''}
        </div>
      </div>
    </div>

    ${g.description ? `<p class="muted" style="font-size:13.5px;line-height:1.55;margin-bottom:14px">${_esc(g.description)}</p>` : ''}

    <div class="goal-detail-ring-wrap">
      <div style="position:relative;flex-shrink:0">
        ${progressRing(prog.pct, cat.color, 68)}
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-size:17px;font-weight:600;color:${cat.color}">${prog.pct}%</div>
      </div>
      <div>
        <div class="goal-detail-ring-num">${prog.done} <span style="font-size:16px;color:var(--ink-mute);font-weight:500">/ ${prog.total}</span></div>
        <div class="goal-detail-ring-sub">${prog.unit}</div>
        ${dl ? `<div style="font-size:12px;color:${dl.urgent?'#A4503A':'var(--ink-mute)'};font-weight:600;margin-top:6px">${_esc(dl.text)}</div>` : ''}
        ${periodInfo !== null ? `<div style="font-size:12px;color:var(--moss);font-weight:600;margin-top:6px">Осталось ${periodInfo} дней в периоде</div>` : ''}
      </div>
    </div>

    ${g.why ? `
      <div class="goal-section-title">ЗАЧЕМ</div>
      <div class="goal-why-block">${_esc(g.why)}</div>
    ` : ''}

    ${g.period === 'longterm' || !g.period ? `
      <div class="goal-section-title">ШАГИ (${(g.steps||[]).filter(s=>s.completed).length} / ${(g.steps||[]).length})</div>
      ${(g.steps||[]).length ? (g.steps||[]).map(s => `
        <div class="goal-step-v2 ${s.completed?'completed':''}" data-step-row="${s.id}">
          <button class="goal-step-check ${s.completed?'on':''}" data-step-toggle-detail="${s.id}" type="button">${s.completed?'✓':''}</button>
          <div class="goal-step-body">
            <div class="goal-step-title">${_esc(s.title)}</div>
            ${s.date ? `<div class="goal-step-date">до ${new Date(s.date+'T00:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'long'})}</div>` : ''}
          </div>
          <button class="goal-step-del" data-step-del="${s.id}" type="button" title="Удалить">✕</button>
        </div>
      `).join('') : '<p class="muted" style="font-size:13px;text-align:center;padding:8px">Шагов пока нет</p>'}
      <button class="btn btn-line btn-full btn-sm" data-step-add type="button" style="margin-top:8px">+ Добавить шаг</button>
    ` : `
      <div class="goal-period-info">
        <div class="goal-period-value">${prog.done}</div>
        <div class="goal-period-label">
          отмечено <b>${prog.total}</b> целевых<br>
          ${g.period === 'week' ? 'на эту неделю' : 'на этот месяц'}
        </div>
      </div>
      ${isDone || isArchived ? '' : `
        <button class="btn btn-primary btn-full btn-lg" data-period-mark type="button" style="margin-bottom:8px">
          ${(g.progress||[]).includes(N.todayKey()) ? '✓ Отмечено сегодня — нажми чтобы снять' : '+ Отметить сегодня'}
        </button>
      `}
    `}

    <div class="goal-actions-v2">
      ${!isDone && !isArchived ? `
        <button class="btn btn-primary btn-full" data-goal-done type="button">🎉 Цель достигнута</button>
      ` : ''}
      <div class="goal-actions-row">
        <button class="btn btn-ghost" data-goal-edit type="button">✎ Изменить</button>
        ${!isArchived ? `<button class="btn btn-ghost" data-goal-archive type="button">📦 В архив</button>` : `<button class="btn btn-ghost" data-goal-unarchive type="button">↩ Из архива</button>`}
        <button class="btn btn-ghost btn-danger" data-goal-del type="button">Удалить</button>
      </div>
    </div>
  `, m => {
    /* Чекбокс шага */
    m.querySelectorAll('[data-step-toggle-detail]').forEach(btn => btn.onclick = () => {
      const sid = btn.dataset.stepToggleDetail;
      const s = (g.steps||[]).find(x => x.id === sid);
      if (!s) return;
      s.completed = !s.completed;
      N.saveState(); N.SFX.ok(); N.buzz(10);
      N.closeModal(layer);
      setTimeout(() => openGoalDetail(g), 180);
    });

    /* Удаление шага */
    m.querySelectorAll('[data-step-del]').forEach(btn => btn.onclick = () => {
      const sid = btn.dataset.stepDel;
      if (!confirm('Удалить шаг?')) return;
      g.steps = (g.steps||[]).filter(x => x.id !== sid);
      N.saveState();
      N.closeModal(layer);
      setTimeout(() => openGoalDetail(g), 180);
    });

    /* Добавить шаг */
    const addStepBtn = m.querySelector('[data-step-add]');
    if (addStepBtn) addStepBtn.onclick = () => {
      const title = prompt('Название шага:');
      if (!title || !title.trim()) return;
      g.steps = g.steps || [];
      g.steps.push({
        id: 'gstep_' + Math.random().toString(36).slice(2,9),
        title: title.trim(),
        completed: false,
        date: null
      });
      N.saveState();
      N.closeModal(layer);
      setTimeout(() => openGoalDetail(g), 180);
    };

    /* Отметить периодическую */
    const markBtn = m.querySelector('[data-period-mark]');
    if (markBtn) markBtn.onclick = () => {
      const ds = N.todayKey();
      g.progress = g.progress || [];
      if (g.progress.includes(ds)){
        g.progress = g.progress.filter(x => x !== ds);
        N.SFX.tap();
      } else {
        g.progress.push(ds);
        N.SFX.ok(); N.buzz(12);
      }
      N.saveState();
      N.closeModal(layer);
      N.go('goals');
      if (window.Achievements) window.Achievements.check();
    };

    /* Цель достигнута */
    const doneBtn = m.querySelector('[data-goal-done]');
    if (doneBtn) doneBtn.onclick = () => {
      markGoalDone(g, () => {
        N.closeModal(layer);
        N.go('goals');
      });
    };

    /* Редактировать */
    const editBtn = m.querySelector('[data-goal-edit]');
    if (editBtn) editBtn.onclick = () => {
      N.closeModal(layer);
      setTimeout(() => openGoalEditor(g.id), 180);
    };

    /* Архив */
    const archBtn = m.querySelector('[data-goal-archive]');
    if (archBtn) archBtn.onclick = () => {
      g.status = 'archived';
      N.saveState(); N.SFX.tap();
      N.closeModal(layer);
      N.go('goals');
      N.toast('Цель в архиве');
    };
    const unarchBtn = m.querySelector('[data-goal-unarchive]');
    if (unarchBtn) unarchBtn.onclick = () => {
      g.status = 'active';
      N.saveState(); N.SFX.ok();
      N.closeModal(layer);
      N.go('goals');
      N.toast('Цель возвращена');
    };

    /* Удалить */
    const delBtn = m.querySelector('[data-goal-del]');
    if (delBtn) delBtn.onclick = () => {
      if (!confirm('Удалить цель полностью? Это действие необратимо.')) return;
      N.S.navlife.goals = (N.S.navlife.goals || []).filter(x => x.id !== g.id);
      N.saveState();
      N.closeModal(layer);
      N.go('goals');
      N.toast('Цель удалена');
    };
  });
}

/* ═══ Завершить цель ═══ */
function markGoalDone(g, onClose){
  /* Если есть незавершённые шаги — предложить отметить все */
  const unfinished = (g.steps || []).filter(s => !s.completed);
  if (unfinished.length && g.period === 'longterm'){
    if (!confirm(`Осталось ${unfinished.length} шагов. Отметить цель как выполненную?`)) return;
    g.steps.forEach(s => s.completed = true);
  }
  g.status = 'done';
  g.completedAt = N.todayKey();
  N.saveState();
  N.SFX.win(); N.buzz([18,40,18]);
  N.toast(`🎉 «${g.title}» — цель достигнута!`, 4000, 'gold');
  if (window.Achievements) window.Achievements.check();
  if (onClose) onClose();
}

/* ═══════════════════════════════════════════════════════════════════
   РЕДАКТОР ЦЕЛИ
   ═══════════════════════════════════════════════════════════════════ */
function openGoalEditor(editId){
  migrateGoals();
  const g = editId ? (N.S.navlife.goals || []).find(x => x.id === editId) : null;
  const isEd = !!g;

  let title = g ? g.title : '';
  let category = g ? (g.category || 'other') : 'growth';
  let description = g ? (g.description || '') : '';
  let why = g ? (g.why || '') : '';
  let period = g ? (g.period || 'longterm') : 'longterm';
  let priority = g ? (g.priority || 2) : 2;
  let target = g ? (g.target || 4) : 4;
  let deadline = g ? (g.deadline || '') : '';
  let steps = g && g.steps ? JSON.parse(JSON.stringify(g.steps)) : [{ id: 's_'+Math.random().toString(36).slice(2,7), title:'', completed:false, date:null }];

  const layer = N.openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom:16px">${isEd ? 'Изменить цель' : 'Новая цель'}</div>

    <div class="field">
      <label>Название</label>
      <input id="geTitle" value="${_esc(title)}" placeholder="Например, Спортзал 4 раза в неделю" maxlength="60">
    </div>

    <div class="field">
      <label>Категория</label>
      <div class="cat-grid" id="geCats"></div>
    </div>

    <div class="field">
      <label>Описание <span style="color:var(--ink-mute);font-weight:400">(необязательно)</span></label>
      <textarea id="geDesc" placeholder="Что именно хочешь сделать?">${_esc(description)}</textarea>
    </div>

    <div class="field">
      <label>Зачем тебе это? <span style="color:var(--ink-mute);font-weight:400">(мотивация)</span></label>
      <textarea id="geWhy" placeholder="Например: хочу быть здоровым и уверенным, чтобы...">${_esc(why)}</textarea>
    </div>

    <div class="field">
      <label>Тип цели</label>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:6px" id="gePeriod">
        <button type="button" data-period="longterm" style="padding:12px 6px;border-radius:12px;font-size:12.5px;font-weight:600;cursor:pointer;text-align:center;border:1.5px solid var(--line);background:var(--paper);color:var(--ink)">
          <div style="font-size:20px;margin-bottom:4px">🎯</div>
          <div>Долгая</div>
        </button>
        <button type="button" data-period="week" style="padding:12px 6px;border-radius:12px;font-size:12.5px;font-weight:600;cursor:pointer;text-align:center;border:1.5px solid var(--line);background:var(--paper);color:var(--ink)">
          <div style="font-size:20px;margin-bottom:4px">📅</div>
          <div>Неделя</div>
        </button>
        <button type="button" data-period="month" style="padding:12px 6px;border-radius:12px;font-size:12.5px;font-weight:600;cursor:pointer;text-align:center;border:1.5px solid var(--line);background:var(--paper);color:var(--ink)">
          <div style="font-size:20px;margin-bottom:4px">🗓</div>
          <div>Месяц</div>
        </button>
      </div>
    </div>

    <div class="field" id="geTargetWrap" style="display:none">
      <label>Сколько раз за период</label>
      <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">
        ${[2,3,4,5,6,8,10,12,15,20,30].map(n => `
          <button type="button" data-target="${n}" style="padding:8px 12px;border-radius:8px;font-size:13px;font-weight:600;min-width:40px;border:1px solid var(--line);background:var(--paper);color:var(--ink);cursor:pointer">${n}</button>
        `).join('')}
        <input type="number" id="geTargetCustom" min="1" max="100" value="${target}" style="width:76px;padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--ink);font-size:13px">
      </div>
    </div>

    <div class="field" id="geDeadlineWrap">
      <label>Дедлайн <span style="color:var(--ink-mute);font-weight:400">(необязательно)</span></label>
      <input type="date" id="geDeadline" value="${deadline}">
    </div>

    <div class="field" id="geStepsWrap">
      <label>Шаги и этапы</label>
      <div id="geSteps"></div>
      <button class="btn btn-line btn-sm" id="geAddStep" type="button" style="margin-top:6px">+ Шаг</button>
    </div>

    <div class="field">
      <label>Приоритет</label>
      <div class="prio-row" id="gePrio"></div>
    </div>

    <div style="display:flex;gap:10px;margin-top:16px">
      <button class="btn btn-ghost btn-full" id="geCancel" type="button">Отмена</button>
      <button class="btn btn-primary btn-full" id="geSave" type="button">${isEd ? 'Сохранить' : 'Создать'}</button>
    </div>
  `, m => {
    const catsEl = m.querySelector('#geCats');
    const prioEl = m.querySelector('#gePrio');
    const periodBtns = qsa('[data-period]', m);
    const targetBtns = qsa('[data-target]', m);
    const targetWrap = m.querySelector('#geTargetWrap');
    const deadlineWrap = m.querySelector('#geDeadlineWrap');
    const stepsWrap = m.querySelector('#geStepsWrap');
    const stepsEl = m.querySelector('#geSteps');
    const customTarget = m.querySelector('#geTargetCustom');

    /* Категории */
    function drawCats(){
      catsEl.innerHTML = CATEGORIES.map(c => {
        const on = c.key === category;
        return `<button type="button" class="cat-btn ${on?'on':''}" data-cat="${c.key}"
          style="${on ? `background:${c.bg};border-color:${c.color}` : ''}">
          <span class="cat-btn-em">${c.emoji}</span>
          <span class="cat-btn-lbl" style="${on ? `color:${c.color}` : ''}">${_esc(c.label)}</span>
        </button>`;
      }).join('');
      qsa('[data-cat]', catsEl).forEach(b => b.onclick = () => {
        category = b.dataset.cat;
        N.SFX.tap();
        drawCats();
      });
    }
    drawCats();

    /* Приоритет */
    function drawPrio(){
      prioEl.innerHTML = PRIORITIES.map(p => {
        const on = p.key === priority;
        return `<button type="button" class="prio-btn ${on?'on':''}" data-prio="${p.key}"
          style="${on ? `border-color:${p.color};background:${p.color}11` : ''}">
          <span class="dot" style="background:${p.color}"></span>
          <span style="${on ? `color:${p.color}` : ''}">${_esc(p.label)}</span>
        </button>`;
      }).join('');
      qsa('[data-prio]', prioEl).forEach(b => b.onclick = () => {
        priority = +b.dataset.prio;
        N.SFX.tap();
        drawPrio();
      });
    }
    drawPrio();

    /* Шаги */
    function drawSteps(){
      stepsEl.innerHTML = steps.map((s, i) => `
        <div style="display:flex;gap:6px;margin-bottom:6px;align-items:flex-start">
          <div style="flex:1;display:flex;flex-direction:column;gap:4px">
            <input data-step-title="${i}" value="${_esc(s.title)}" placeholder="Название шага"
              style="width:100%;border:1px solid var(--line);border-radius:9px;padding:8px 10px;font-size:13.5px;background:var(--surface);color:var(--ink)">
            <input type="date" data-step-date="${i}" value="${s.date || ''}"
              style="width:100%;border:1px solid var(--line);border-radius:9px;padding:6px 10px;font-size:12px;background:var(--surface);color:var(--ink-soft)">
          </div>
          <button class="icon-btn btn-danger" style="width:34px;height:34px;font-size:13px;flex-shrink:0" data-step-del="${i}" type="button">✕</button>
        </div>
      `).join('');
      qsa('[data-step-title]', stepsEl).forEach(inp => {
        inp.oninput = () => { steps[+inp.dataset.stepTitle].title = inp.value; };
      });
      qsa('[data-step-date]', stepsEl).forEach(inp => {
        inp.oninput = () => { steps[+inp.dataset.stepDate].date = inp.value || null; };
      });
      qsa('[data-step-del]', stepsEl).forEach(b => b.onclick = () => {
        if (steps.length <= 1) return;
        steps.splice(+b.dataset.stepDel, 1);
        drawSteps();
      });
    }
    drawSteps();
    m.querySelector('#geAddStep').onclick = () => {
      steps.push({ id:'s_'+Math.random().toString(36).slice(2,7), title:'', completed:false, date:null });
      drawSteps();
    };

    /* Тип цели */
    function updatePeriodUI(){
      periodBtns.forEach(b => {
        const on = b.dataset.period === period;
        b.style.background = on ? 'var(--moss-soft)' : 'var(--paper)';
        b.style.borderColor = on ? 'var(--moss)' : 'var(--line)';
        b.style.color = on ? 'var(--moss)' : 'var(--ink)';
      });
      const isLong = period === 'longterm';
      targetWrap.style.display = isLong ? 'none' : 'block';
      deadlineWrap.style.display = isLong ? 'block' : 'none';
      stepsWrap.style.display = isLong ? 'block' : 'none';
      if (!isLong){
        const defaultT = period === 'week' ? 4 : 12;
        if (![2,3,4,5,6,8,10,12,15,20,30].includes(target)) target = defaultT;
      }
      customTarget.value = target;
      updateTargetBtns();
    }
    function updateTargetBtns(){
      targetBtns.forEach(b => {
        const on = +b.dataset.target === target;
        b.style.background = on ? 'var(--moss)' : 'var(--paper)';
        b.style.borderColor = on ? 'var(--moss)' : 'var(--line)';
        b.style.color = on ? '#fff' : 'var(--ink)';
      });
    }
    periodBtns.forEach(b => b.onclick = () => {
      period = b.dataset.period;
      N.SFX.tap();
      updatePeriodUI();
    });
    targetBtns.forEach(b => b.onclick = () => {
      target = +b.dataset.target;
      customTarget.value = target;
      N.SFX.tap();
      updateTargetBtns();
    });
    customTarget.oninput = () => {
      target = Math.max(1, Math.min(100, +customTarget.value || 1));
      updateTargetBtns();
    };
    updatePeriodUI();

    /* Сохранить */
    m.querySelector('#geCancel').onclick = () => N.closeModal(layer);
    m.querySelector('#geSave').onclick = () => {
      const t = m.querySelector('#geTitle').value.trim();
      if (!t){ N.toast('Введи название'); return; }
      const cleanSteps = steps
        .filter(s => s.title.trim())
        .map(s => ({
          id: s.id || 's_'+Math.random().toString(36).slice(2,7),
          title: s.title.trim(),
          completed: !!s.completed,
          date: s.date || null
        }));

      const payload = {
        title: t,
        category,
        priority,
        description: m.querySelector('#geDesc').value.trim(),
        why: m.querySelector('#geWhy').value.trim(),
        period,
        target: period === 'longterm' ? undefined : target,
        deadline: period === 'longterm' ? (m.querySelector('#geDeadline').value || null) : null,
        icon: (CAT_MAP[category] && CAT_MAP[category].emoji) || '🎯'
      };

      if (isEd){
        Object.assign(g, payload);
        if (period === 'longterm') g.steps = cleanSteps;
        else { g.steps = []; g.progress = g.progress || []; }
      } else {
        N.S.navlife.goals = N.S.navlife.goals || [];
        N.S.navlife.goals.push({
          id: 'goal_' + Math.random().toString(36).slice(2,9),
          ...payload,
          status: 'active',
          createdAt: N.todayKey(),
          completedAt: null,
          steps: period === 'longterm' ? cleanSteps : [],
          progress: []
        });
      }

      N.saveState();
      N.closeModal(layer);
      N.go('goals');
      N.toast(isEd ? 'Цель обновлена' : 'Цель создана');
      if (window.Achievements) window.Achievements.check();
    };
  });
}

/* ═══ РЕГИСТРАЦИЯ ═══ */
window.App.registerScreen('goals', renderGoals);
window.Goals = {
  openEditor: openGoalEditor,
  openDetail: openGoalDetail,
  categories: CATEGORIES,
  priorities: PRIORITIES
};
console.log('[Goals v2] loaded');
})();