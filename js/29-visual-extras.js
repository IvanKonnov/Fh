/* ═══ NAVLIFE · VISUAL EXTRAS · v7.0 · Realistic Garden ═══
   • Детализированные SVG-деревья (изогнутые стволы, слои листвы)
   • Починена вёрстка пустого состояния и модалки посадки
   • Анимации: прорисовка ветвей, раскрытие листвы
*/
(function(){
'use strict';
const N = window.__nav;
if (!N){ console.error('[VISUAL] __nav not found'); return; }
const qs = (s, r=document) => r.querySelector(s);
const qsa = (s, r=document) => Array.from(r.querySelectorAll(s));
const _esc = (s) => String(s??'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ═══ СТИЛИ ═══ */
const STYLE_ID = 'navlife-garden-v7-styles';
function ensureStyles(){
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
/* --- Контейнер сада --- */
.garden-card-v7 {
  margin: 20px 0;
  padding: 0;
  background: var(--glass-bg, #fff);
  border-radius: 24px;
  border: 1px solid var(--glass-border, rgba(0,0,0,.06));
  box-shadow: 0 12px 40px -12px rgba(0,0,0,.15), inset 0 1px 0 rgba(255,255,255,.6);
  overflow: hidden;
  position: relative;
}
html[data-theme="dark"] .garden-card-v7 {
  background: rgba(15,15,15,.8);
  box-shadow: 0 12px 40px -12px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.05);
}

/* Пустое состояние */
.garden-empty {
  padding: 40px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.garden-empty-em {
  font-size: 64px;
  line-height: 1;
  margin-bottom: 16px;
  display: block;
  animation: emptyFloat 3s ease-in-out infinite;
}
@keyframes emptyFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

/* --- Сцена --- */
.garden-scene-v7 {
  position: relative;
  width: 100%;
  height: 220px;
  background: linear-gradient(180deg, #E8EFE9 0%, #CDD9D0 100%);
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
html[data-theme="dark"] .garden-scene-v7 {
  background: linear-gradient(180deg, #141A16 0%, #0A0F0C 100%);
}

.garden-sun {
  position: absolute; top: 20px; right: 30px;
  width: 50px; height: 50px; border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #FFF8D6, #F2C94C);
  box-shadow: 0 0 40px rgba(242,201,76,0.6);
  animation: sunPulse 8s ease-in-out infinite alternate;
}
@keyframes sunPulse { 0% { transform: scale(1); opacity: 0.9; } 100% { transform: scale(1.1); opacity: 1; } }

.garden-cloud {
  position: absolute; background: rgba(255,255,255,0.6);
  border-radius: 40px; filter: blur(6px);
}
.garden-cloud.c1 { width: 80px; height: 24px; top: 40px; left: -100px; animation: cloudMove 40s linear infinite; }
.garden-cloud.c2 { width: 100px; height: 30px; top: 80px; left: -100px; animation: cloudMove 55s linear infinite 10s; opacity: 0.4; }
@keyframes cloudMove { 100% { transform: translateX(800px); } }

.garden-soil {
  position: absolute; bottom: 0; left: -5%; right: -5%;
  height: 60px;
  background: linear-gradient(180deg, #C3D0C6 0%, #B3C1B6 100%);
  border-radius: 50% 50% 0 0 / 20px 20px 0 0;
  box-shadow: inset 0 8px 16px rgba(0,0,0,0.06);
  z-index: 5;
}
html[data-theme="dark"] .garden-soil {
  background: linear-gradient(180deg, #1A241D 0%, #0D120F 100%);
}

/* --- ДЕРЕВО --- */
.tree-container {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  width: 160px;
  height: 160px;
  transform-origin: bottom center;
  animation: treeWind 6s ease-in-out infinite alternate;
}
@keyframes treeWind {
  0% { transform: translateX(-50%) rotate(-2deg); }
  100% { transform: translateX(-50%) rotate(2deg); }
}
.tree-sakura .tree-container { animation-duration: 4s; }
.tree-willow .tree-container { animation-duration: 5s; transform-origin: top center; }
.tree-pine .tree-container { animation-name: treeBreathe; animation-duration: 7s; }
@keyframes treeBreathe { 0%, 100% { transform: translateX(-50%) scale(1); } 50% { transform: translateX(-50%) scale(1.03); } }

/* Анимации SVG */
.svg-trunk { stroke-dasharray: 200; stroke-dashoffset: 200; transition: stroke-dashoffset 1.5s ease; }
.svg-branch { stroke-dasharray: 100; stroke-dashoffset: 100; transition: stroke-dashoffset 1s ease 0.3s; }
.svg-leaf { transform: scale(0); transform-origin: center; opacity: 0; transition: transform 1s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.8s ease; }
.svg-leaf.d1 { transition-delay: 0.4s; }
.svg-leaf.d2 { transition-delay: 0.6s; }
.svg-leaf.d3 { transition-delay: 0.8s; }

.tree-grown .svg-trunk { stroke-dashoffset: 0; }
.tree-grown .svg-branch { stroke-dashoffset: 0; }
.tree-grown .svg-leaf { transform: scale(1); opacity: 1; }

/* --- UI панель --- */
.garden-ui-v7 {
  padding: 16px 20px;
  background: var(--surface-raised);
  border-top: 1px solid var(--line);
  position: relative;
  z-index: 20;
}
.g-progress-track {
  height: 8px; border-radius: 4px; background: var(--paper); overflow: hidden; margin: 10px 0 14px; border: 1px solid var(--line-soft);
}
.g-progress-fill {
  height: 100%; border-radius: 4px; background: linear-gradient(90deg, var(--moss), var(--amber));
  transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

/* --- Модалка посадки --- */
.plant-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}
.plant-card {
  padding: 16px 12px;
  border-radius: 16px;
  background: var(--paper);
  border: 1px solid var(--line);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  transition: all 0.15s;
  min-height: 160px;
}
.plant-card:hover {
  border-color: var(--moss);
  background: var(--surface);
}
.plant-card-svg {
  width: 90px;
  height: 90px;
  margin-bottom: 8px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.plant-card-title {
  font-family: 'Fraunces', serif;
  font-size: 15px;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 2px;
}
.plant-card-desc {
  font-size: 11px;
  color: var(--ink-mute);
  text-align: center;
}
  `;
  document.head.appendChild(s);
}
ensureStyles();

/* ═══════════════════════════════════════════════════════════════════
   ГЕНЕРАТОР КРАСИВЫХ SVG-ДЕРЕВЬЕВ
   ═══════════════════════════════════════════════════════════════════ */
function generateTreeSVG(type, stage) {
  const isGrown = stage > 0; // Для анимации
  const grownClass = isGrown ? 'tree-grown' : '';
  
  // Базовый ствол (изогнутый)
  let trunk = '';
  let branches = '';
  let leaves = '';

  if (type === 'oak') {
    trunk = `<path class="svg-trunk" d="M50,100 Q48,70 50,40" stroke="#5C4033" stroke-width="${2 + stage*0.5}" stroke-linecap="round" fill="none" />`;
    branches = `
      <path class="svg-branch" d="M50,60 Q30,50 20,30" stroke="#5C4033" stroke-width="2" stroke-linecap="round" fill="none" />
      <path class="svg-branch" d="M50,50 Q70,40 80,20" stroke="#5C4033" stroke-width="2" stroke-linecap="round" fill="none" />
    `;
    if (stage > 0) {
      leaves = `
        <circle class="svg-leaf d1" cx="40" cy="35" r="${10 + stage*2}" fill="#4F7563" opacity="0.9"/>
        <circle class="svg-leaf d2" cx="60" cy="30" r="${12 + stage*2}" fill="#3F6152" opacity="0.9"/>
        <circle class="svg-leaf d3" cx="50" cy="20" r="${14 + stage*2}" fill="#2E4A3E" opacity="0.9"/>
        <circle class="svg-leaf d2" cx="25" cy="25" r="${8 + stage*2}" fill="#5E7D6B" opacity="0.8"/>
        <circle class="svg-leaf d3" cx="75" cy="15" r="${9 + stage*2}" fill="#4F7563" opacity="0.8"/>
      `;
    }
  } 
  else if (type === 'sakura') {
    trunk = `<path class="svg-trunk" d="M50,100 C45,70 55,60 45,30" stroke="#4A332A" stroke-width="${2.5 + stage*0.5}" stroke-linecap="round" fill="none" />`;
    branches = `
      <path class="svg-branch" d="M48,65 Q30,50 20,40" stroke="#4A332A" stroke-width="2" stroke-linecap="round" fill="none" />
      <path class="svg-branch" d="M50,50 Q70,40 80,30" stroke="#4A332A" stroke-width="2" stroke-linecap="round" fill="none" />
      <path class="svg-branch" d="M45,40 Q30,20 40,10" stroke="#4A332A" stroke-width="1.5" stroke-linecap="round" fill="none" />
    `;
    if (stage > 0) {
      leaves = `
        <circle class="svg-leaf d1" cx="45" cy="25" r="${12 + stage*2}" fill="#FFB7C5" opacity="0.95"/>
        <circle class="svg-leaf d2" cx="65" cy="30" r="${10 + stage*2}" fill="#FF9DAF" opacity="0.95"/>
        <circle class="svg-leaf d3" cx="30" cy="35" r="${11 + stage*2}" fill="#FFC0CB" opacity="0.95"/>
        <circle class="svg-leaf d2" cx="55" cy="15" r="${14 + stage*2}" fill="#FFB7C5" opacity="0.9"/>
        <circle class="svg-leaf d1" cx="70" cy="20" r="${8 + stage*2}" fill="#FF9DAF" opacity="0.9"/>
      `;
    }
  } 
  else if (type === 'pine') {
    trunk = `<path class="svg-trunk" d="M50,100 L50,20" stroke="#4A332A" stroke-width="${3 + stage*0.5}" stroke-linecap="round" fill="none" />`;
    if (stage > 0) {
      leaves = `
        <path class="svg-leaf d1" d="M50,70 L30,90 L70,90 Z" fill="#2E4A3E" />
        <path class="svg-leaf d2" d="M50,50 L25,75 L75,75 Z" fill="#3F6152" />
        <path class="svg-leaf d3" d="M50,30 L20,60 L80,60 Z" fill="#4F7563" />
        <path class="svg-leaf d3" d="M50,10 L30,40 L70,40 Z" fill="#5E7D6B" />
      `;
    }
  } 
  else if (type === 'palm') {
    trunk = `<path class="svg-trunk" d="M50,100 Q60,60 50,30" stroke="#7A5B3B" stroke-width="${2.5 + stage*0.5}" stroke-linecap="round" fill="none" />`;
    if (stage > 0) {
      leaves = `
        <path class="svg-leaf d1" d="M50,30 Q10,20 5,50 Q30,40 50,30 Z" fill="#3F6152" />
        <path class="svg-leaf d2" d="M50,30 Q90,20 95,50 Q70,40 50,30 Z" fill="#4F7563" />
        <path class="svg-leaf d3" d="M50,30 Q30,0 20,10 Q40,20 50,30 Z" fill="#2E4A3E" />
        <path class="svg-leaf d3" d="M50,30 Q70,0 80,10 Q60,20 50,30 Z" fill="#5E7D6B" />
        <path class="svg-leaf d2" d="M50,30 Q50,-10 40,-15 Q45,10 50,30 Z" fill="#8FAE9B" />
        <!-- Кокосы -->
        ${stage >= 3 ? `<circle class="svg-leaf d3" cx="48" cy="32" r="3" fill="#5C4033" /><circle class="svg-leaf d3" cx="53" cy="33" r="3" fill="#4A332A" />` : ''}
      `;
    }
  } 
  else if (type === 'maple') {
    trunk = `<path class="svg-trunk" d="M50,100 Q48,60 50,30" stroke="#5C4033" stroke-width="${2.5 + stage*0.5}" stroke-linecap="round" fill="none" />`;
    branches = `
      <path class="svg-branch" d="M49,60 Q30,50 25,35" stroke="#5C4033" stroke-width="1.5" stroke-linecap="round" fill="none" />
      <path class="svg-branch" d="M50,50 Q70,40 75,25" stroke="#5C4033" stroke-width="1.5" stroke-linecap="round" fill="none" />
    `;
    if (stage > 0) {
      // Упрощенная форма кленового листа
      const mapleLeaf = `M0,-15 L5,-5 L15,-8 L8,2 L12,12 L0,8 L-12,12 L-8,2 L-15,-8 L-5,-5 Z`;
      leaves = `
        <path class="svg-leaf d1" d="${mapleLeaf}" transform="translate(40, 30) scale(${1 + stage*0.2})" fill="#D35F3D" />
        <path class="svg-leaf d2" d="${mapleLeaf}" transform="translate(60, 25) scale(${1 + stage*0.2})" fill="#B87F35" />
        <path class="svg-leaf d3" d="${mapleLeaf}" transform="translate(50, 15) scale(${1.2 + stage*0.2})" fill="#C4512D" />
        <path class="svg-leaf d1" d="${mapleLeaf}" transform="translate(25, 35) scale(${0.8 + stage*0.2})" fill="#E67E22" />
        <path class="svg-leaf d2" d="${mapleLeaf}" transform="translate(75, 20) scale(${0.9 + stage*0.2})" fill="#D35F3D" />
      `;
    }
  } 
  else if (type === 'willow') {
    trunk = `<path class="svg-trunk" d="M50,100 Q45,70 50,40" stroke="#4A332A" stroke-width="${3 + stage*0.5}" stroke-linecap="round" fill="none" />`;
    if (stage > 0) {
      leaves = `
        <circle class="svg-leaf d1" cx="50" cy="30" r="${15 + stage*2}" fill="#6B8F71" opacity="0.8"/>
        <!-- Плакучие ветви -->
        <path class="svg-leaf d2" d="M50,30 Q30,40 25,80 Q35,50 50,30" fill="#4F7563" opacity="0.9"/>
        <path class="svg-leaf d3" d="M50,30 Q70,40 75,80 Q65,50 50,30" fill="#5E7D6B" opacity="0.9"/>
        <path class="svg-leaf d2" d="M50,30 Q15,30 10,70 Q25,40 50,30" fill="#3F6152" opacity="0.8"/>
        <path class="svg-leaf d3" d="M50,30 Q85,30 90,70 Q75,40 50,30" fill="#8FAE9B" opacity="0.8"/>
      `;
    }
  }

  return `
    <svg viewBox="0 0 100 100" width="100%" height="100%" style="overflow: visible;">
      <g class="${grownClass}">
        ${trunk}
        ${branches}
        ${leaves}
      </g>
    </svg>
  `;
}

/* ═══════════════════════════════════════════════════════════════════
   ЛОГИКА
   ═══════════════════════════════════════════════════════════════════ */
const TREES = [
  { key:'oak',    name:'Дуб',       desc:'Крепкий и могучий' },
  { key:'sakura', name:'Сакура',    desc:'Цветёт весной' },
  { key:'pine',   name:'Сосна',     desc:'Вечнозелёная' },
  { key:'palm',   name:'Пальма',    desc:'Тёплая и южная' },
  { key:'maple',  name:'Клён',      desc:'Осенний' },
  { key:'willow', name:'Ива',       desc:'Плакучая' }
];

const TOTAL_WATER = 91;
const STAGE_STEP = 13;
const MAX_STAGE = 6;

const WATER_LIMITS = { task: 5, habit: 3, brain: 2, allTasks: 3 };

function ensureGarden(){
  if (!N.S.garden) N.S.garden = { water: 0, current: null, collection: [] };
  if (typeof N.S.garden.water !== 'number') N.S.garden.water = 0;
  if (!Array.isArray(N.S.garden.collection)) N.S.garden.collection = [];
  return N.S.garden;
}

function ensureWaterLog(){
  if (!N.S.meta) N.S.meta = {};
  if (!N.S.meta.waterLog) N.S.meta.waterLog = {};
  const ds = N.todayKey();
  if (!N.S.meta.waterLog[ds]) N.S.meta.waterLog[ds] = {};
  return N.S.meta.waterLog[ds];
}

function canEarnWater(type, limit){
  const log = ensureWaterLog();
  return (log[type] || 0) < limit;
}
function recordWater(type){
  const log = ensureWaterLog();
  log[type] = (log[type] || 0) + 1;
}

function addWater(amount, reason){
  const g = ensureGarden();
  g.water += amount;
  N.saveState();
  
  N.SFX.ok(); 
  if (window.Haptics) Haptics.play('ok');
  N.toast(`💧 +${amount} за ${reason}`);
  
  if (typeof refreshGardenCard === 'function') refreshGardenCard();
}

/* Перехватчики */
const _origComplete = N.completeScheduleItem;
N.completeScheduleItem = function(id, done){
  const it = N.S.navlife.schedule.find(i => i.id === id);
  const wasCompleted = it && it.completed;
  const result = _origComplete.call(this, id, done);
  const isNowCompleted = done === undefined ? true : !!done;
  
  if (isNowCompleted && !wasCompleted){
    const ds = N.todayKey();
    if (canEarnWater('task', WATER_LIMITS.task)){
      recordWater('task');
      addWater(1, 'дело');
    }
    const tasks = N.S.navlife.schedule.filter(i => i.date === ds);
    const allDone = tasks.length > 0 && tasks.every(i => i.completed);
    if (allDone){
      const log = ensureWaterLog();
      if (!log.allTasks){ log.allTasks = true; addWater(3, 'все дела дня'); }
    }
  }
  return result;
};

const _origHabitToggle = window.Habits && window.Habits.toggle;
if (_origHabitToggle){
  window.Habits.toggle = function(id){
    const h = (N.S.habits || []).find(x => x.id === id);
    const ds = N.todayKey();
    const wasDone = h ? ((h.log || {})[ds] || 0) >= (h.target || 1) : false;
    const result = _origHabitToggle.call(this, id);
    const isDone = h ? ((h.log || {})[ds] || 0) >= (h.target || 1) : false;
    
    if (isDone && !wasDone){
      if (canEarnWater('habit', WATER_LIMITS.habit)){
        recordWater('habit');
        addWater(1, 'привычку');
      }
    }
    return result;
  };
}

setTimeout(() => {
  const origToast = N.toast;
  N.toast = function(msg, ms, cls){
    if (cls === 'gold' && typeof msg === 'string' && (msg.includes('XP') || msg.includes('тренировка'))){
      if (canEarnWater('brain', WATER_LIMITS.brain)){
        recordWater('brain');
        addWater(2, 'тренировку мозга');
      }
    }
    return origToast.call(this, msg, ms, cls);
  };
}, 100);

/* ═══════════════════════════════════════════════════════════════════
   UI
   ═══════════════════════════════════════════════════════════════════ */
function renderGardenCard(){
  const g = ensureGarden();
  const current = g.current;
  const collection = g.collection || [];
  const water = g.water;

  if (!current){
    return `
      <div data-garden-card class="garden-card-v7">
        <div class="garden-empty">
          <div class="garden-empty-em">🌱</div>
          <div style="font-family: 'Fraunces', serif; font-size: 22px; font-weight: 600; color: var(--ink); margin-bottom: 6px;">Посади дерево</div>
          <div class="muted" style="font-size: 14px; margin-bottom: 24px;">Сад растёт от твоих идеальных дней</div>
          <div style="display: flex; gap: 10px; justify-content: center;">
            <button class="btn btn-primary btn-lg" data-plant type="button" style="padding: 14px 28px;">🌱 Посадить</button>
            ${collection.length ? `<button class="btn btn-ghost btn-lg" data-garden-open type="button" style="padding: 14px 20px;">🌳 Сад (${collection.length})</button>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  const tree = TREES.find(t => t.key === current.type) || TREES[0];
  const progressWater = current.water || 0;
  const stage = Math.min(MAX_STAGE, Math.floor(progressWater / STAGE_STEP));
  const stagePct = Math.min(100, Math.round((progressWater % STAGE_STEP) / STAGE_STEP * 100));
  const isGrown = progressWater >= TOTAL_WATER;
  const canWater = water > 0 && !isGrown;

  const svgTree = generateTreeSVG(tree.key, stage);

  return `
    <div data-garden-card class="garden-card-v7 ${isGrown ? 'harvest-active' : ''}">
      <div class="garden-scene-v7 tree-${tree.key}">
        <div class="garden-sun"></div>
        <div class="garden-cloud c1"></div>
        <div class="garden-cloud c2"></div>
        <div class="garden-soil"></div>
        <div class="tree-container">${svgTree}</div>
      </div>
      <div class="garden-ui-v7">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="font-family: 'Fraunces', serif; font-size: 16px; font-weight: 600; color: var(--ink);">
            ${tree.name} <span style="font-size: 12px; font-weight: 500; color: var(--ink-mute);">· Ур. ${stage + 1}/7</span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px; background: var(--paper); padding: 4px 12px; border-radius: 100px; border: 1px solid var(--line);">
            <span style="font-size: 14px;">💧</span>
            <span style="font-family: 'Fraunces', serif; font-size: 14px; font-weight: 600; color: var(--ink);">${water}</span>
          </div>
        </div>
        <div class="g-progress-track">
          <div class="g-progress-fill" style="width: ${isGrown ? 100 : stagePct}%"></div>
        </div>
        <div style="display: flex; gap: 8px;">
          ${isGrown
            ? `<button class="btn btn-primary btn-full btn-lg" data-harvest type="button" style="background:var(--amber);color:#241704;">🌟 Собрать в сад</button>`
            : `<button class="btn ${canWater ? 'btn-primary' : 'btn-ghost'} btn-full btn-lg" data-water type="button" ${!canWater ? 'disabled style="opacity:.5"' : ''}>
                💧 Полить ${!canWater ? `(нет воды)` : ''}
              </button>`
          }
          ${collection.length ? `<button class="icon-btn" data-garden-open type="button" title="Сад" style="width:auto;padding:0 16px;font-size:14px;font-weight:600;">${collection.length} 🌳</button>` : ''}
        </div>
      </div>
    </div>
  `;
}

function refreshGardenCard(){
  const host = qs('#screens');
  if (!host) return;
  const existing = host.querySelector('[data-garden-card]');
  if (!existing) return;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = renderGardenCard();
  const newCard = wrapper.firstElementChild;
  existing.parentNode.replaceChild(newCard, existing);
  bindGardenCard(newCard);
}

function bindGardenCard(card){
  if (!card) return;
  card.querySelectorAll('[data-plant]').forEach(b => b.onclick = () => { N.SFX.tap(); if (window.Haptics) Haptics.play('ok'); openPlantModal(); });
  card.querySelectorAll('[data-garden-open]').forEach(b => b.onclick = () => { N.SFX.tap(); if (window.Haptics) Haptics.play('ok'); openGardenModal(); });

  const waterBtn = card.querySelector('[data-water]');
  if (waterBtn && !waterBtn.disabled){
    waterBtn.onclick = () => {
      const g = ensureGarden();
      if (!g.current || g.water <= 0) return;
      g.water -= 1;
      g.current.water = (g.current.water || 0) + 1;
      N.saveState();
      
      N.SFX.ok(); 
      if (window.Haptics) Haptics.play('success');
      
      const oldStage = Math.floor((g.current.water - 1) / STAGE_STEP);
      const nextStage = Math.floor(g.current.water / STAGE_STEP);

      refreshGardenCard();

      if (g.current.water >= TOTAL_WATER) {
        setTimeout(() => N.toast('🎉 Дерево полностью выросло!', 3000, 'gold'), 300);
      } else if (nextStage > oldStage) {
        setTimeout(() => N.toast(`🌱 Новая стадия роста! (${nextStage + 1}/7)`, 2500), 300);
      }
    };
  }

  const harvestBtn = card.querySelector('[data-harvest]');
  if (harvestBtn){
    harvestBtn.onclick = () => {
      const g = ensureGarden();
      if (!g.current) return;
      const treeType = g.current.type;
      const tree = TREES.find(t => t.key === treeType);
      
      g.collection.push({ type: treeType, finishedAt: N.todayKey() });
      g.current = null;
      N.saveState();
      
      N.SFX.win(); if (window.Haptics) Haptics.play('success');
      N.toast(`🌟 ${tree.name} теперь в твоём саду!`, 3500, 'gold');
      
      refreshGardenCard();
      setTimeout(openPlantModal, 800);
    };
  }
}

/* Модалки */
function openPlantModal(){
  const layer = N.openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom: 6px;">Что посадим?</div>
    <p class="muted" style="margin-bottom: 20px;">Выращивание занимает 7 идеальных дней. Каждый день дерево будет меняться.</p>
    
    <div class="plant-grid">
      ${TREES.map(t => `
        <button type="button" class="plant-card" data-plant-tree="${t.key}">
          <div class="plant-card-svg">
            ${generateTreeSVG(t.key, MAX_STAGE)}
          </div>
          <div class="plant-card-title">${t.name}</div>
          <div class="plant-card-desc">${t.desc}</div>
        </button>
      `).join('')}
    </div>
    <button class="btn btn-ghost btn-full" id="plantCancel" type="button">Отмена</button>
  `, m => {
    // Анимация для превью
    m.querySelectorAll('.tree-grown').forEach(g => {
       g.classList.remove('tree-grown');
       setTimeout(() => g.classList.add('tree-grown'), 100);
    });

    m.querySelectorAll('[data-plant-tree]').forEach(b => b.onclick = () => {
      const g = ensureGarden();
      if (g.current) return;
      g.current = { type: b.dataset.plantTree, water: 0, plantedAt: N.todayKey() };
      N.saveState();
      N.closeModal(layer);
      N.SFX.ok(); if (window.Haptics) Haptics.play('success');
      N.toast('🌱 Дерево посажено! Поливай его водой', 3000);
      refreshGardenCard();
    });
    m.querySelector('#plantCancel').onclick = () => N.closeModal(layer);
  });
}

function openGardenModal(){
  const g = ensureGarden();
  const collection = g.collection || [];

  if (!collection.length){
    N.toast('Сад пока пуст');
    return;
  }

  const counts = {};
  collection.forEach(c => { counts[c.type] = (counts[c.type] || 0) + 1; });

  N.openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom: 6px;">🌳 Твой сад</div>
    <p class="muted" style="margin-bottom: 16px;">${collection.length} ${collection.length === 1 ? 'дерево' : collection.length < 5 ? 'дерева' : 'деревьев'} выращено</p>

    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; padding: 16px; background: var(--paper); border-radius: 16px; border: 1px solid var(--line);">
      ${Object.keys(counts).map(key => {
        const tree = TREES.find(t => t.key === key);
        if (!tree) return '';
        return `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-end; position: relative; padding: 10px;">
            <div style="width: 80px; height: 80px; display:flex; align-items:flex-end; justify-content:center;">
               ${generateTreeSVG(tree.key, MAX_STAGE)}
            </div>
            ${counts[key] > 1 ? `<div style="position: absolute; top: 0; right: 0; background: var(--amber); color: #fff; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 100px;">×${counts[key]}</div>` : ''}
            <div class="tiny" style="font-size: 12px; margin-top: 6px; color: var(--ink); font-weight: 600;">${tree.name}</div>
          </div>
        `;
      }).join('')}
    </div>

    <button class="btn btn-primary btn-full" id="gardenClose" type="button" style="margin-top: 16px;">Закрыть</button>
  `, m => {
    m.querySelectorAll('.tree-grown').forEach(g => {
       g.classList.remove('tree-grown');
       setTimeout(() => g.classList.add('tree-grown'), 100);
    });
    m.querySelector('#gardenClose').onclick = () => N.closeModal(m);
  });
}

/* Вставка на главную */
window.App.hooks.afterGo.push(name => {
  if (name !== 'today') return;
  setTimeout(() => {
    const host = qs('#screens');
    if (!host) return;
    if (host.querySelector('[data-garden-card]')) return;

    let anchor = host.querySelector('.hero');
    if (!anchor) {
      anchor = Array.from(host.querySelectorAll('.card')).find(c => c.textContent.includes('На сегодня всё выполнено'));
    }
    if (!anchor) anchor = host.querySelector('.between');
    if (!anchor) anchor = host.firstElementChild;

    if (anchor && anchor.parentNode){
      const wrapper = document.createElement('div');
      wrapper.innerHTML = renderGardenCard();
      const card = wrapper.firstElementChild;
      
      if (anchor.nextSibling) {
        anchor.parentNode.insertBefore(card, anchor.nextSibling);
      } else {
        anchor.parentNode.appendChild(card);
      }
      bindGardenCard(card);
    }
  }, 200);
});

window.Garden = {
  openPlant: openPlantModal,
  openCollection: openGardenModal,
  getState: ensureGarden
};

console.log('[Visual Extras] v7.0 (Realistic) loaded');
})();