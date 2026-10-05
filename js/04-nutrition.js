/* ═══ NAVLIFE · NUTRITION · v4.3 · редактирование блюд ═══ */
(function(){
'use strict';
const N = window.__nav;
if (!N){ console.error('[NUTRITION] __nav not found'); return; }
const { go, saveState, esc, todayKey, fmtDate, openModal, closeModal, toast,
        SFX, buzz, dowShort, $, $$, uid, rnd, shuffle, pick } = N;

const FOOD_DB = window.FOOD_DB || [];
const MEAL_COMPONENTS = window.MEAL_COMPONENTS || {};
const MEAL_SCHEMAS = window.MEAL_SCHEMAS || {};
const NUTRITION_CATEGORIES = window.NUTRITION_CATEGORIES || [];
const FOOD_TIERS = window.FOOD_TIERS || [];

const MEAL_NAMES = { breakfast:'Завтрак', lunch:'Обед', dinner:'Ужин', snack:'Перекус' };
const GOAL_LABELS = { gain:'🏋️ Набор массы', maintain:'⚖️ Поддержание веса', lose:'🔥 Снижение веса', healthy:'🥗 Здоровое питание' };
const DIET_OPTIONS = ['обычное','вегетарианское','веганское'];
const EXCLUSIONS = [
  { key:'gluten', label:'Глютен' },{ key:'lactose', label:'Лактоза' },
  { key:'nuts', label:'Орехи' },{ key:'fish', label:'Рыба' },
  { key:'meat', label:'Мясо' },{ key:'pork', label:'Свинина' },{ key:'eggs', label:'Яйца' }
];
const ROLE_LABELS = {
  protein: '🥩 Белок', base: '🌾 Гарнир', veg: '🥦 Овощи',
  fruit: '🍎 Фрукты', fats: '🥜 Жиры'
};
const TIER_BADGE = {
  budget: { label:'💰 бюджет',  color:'#8A5E1F', bg:'rgba(184,127,53,.14)' },
  standard:{ label:'⚖️ стандарт',color:'#4B564E', bg:'rgba(75,86,78,.12)' },
  premium: { label:'⭐ премиум', color:'#6A4A7A', bg:'rgba(106,74,122,.14)' }
};

const MACRO_SPLIT = { p: 0.30, f: 0.25, c: 0.45 };
const KCAL_PER_G = { p: 4, f: 9, c: 4 };

let addFoodTarget = null;

/* ═══ Хранилище планов ═══ */
function ensurePlansStore(){
  if (!N.S.nutrition.plans) N.S.nutrition.plans = {};
}
function getPlan(ds){
  ensurePlansStore();
  const p = N.S.nutrition.plans[ds];
  if (!p || !Array.isArray(p.slots)) return null;
  return p;
}
function savePlan(ds, plan){
  ensurePlansStore();
  N.S.nutrition.plans[ds] = plan;
  saveState();
}
function clearPlan(ds){
  ensurePlansStore();
  delete N.S.nutrition.plans[ds];
  saveState();
}

/* ═══ КБЖУ за день ═══ */
function nutritionToday(date){
  const ds = date || todayKey();
  if (!N.S.nutrition.days[ds]) N.S.nutrition.days[ds] = { meals:{breakfast:[],lunch:[],dinner:[],snack:[]}, water:0, notes:'' };
  const d = N.S.nutrition.days[ds];
  if (!d.meals) d.meals = { breakfast:[], lunch:[], dinner:[], snack:[] };
  ['breakfast','lunch','dinner','snack'].forEach(k => { if (!d.meals[k]) d.meals[k] = []; });
  let kcal = 0, prot = 0, fat = 0, carb = 0;
  ['breakfast','lunch','dinner','snack'].forEach(m => {
    (d.meals[m] || []).forEach(item => {
      const grams = item.grams !== undefined ? item.grams : 100;
      const f = grams / 100;
      kcal += (item.kcal || 0)*f; prot += (item.p || 0)*f; fat += (item.f || 0)*f; carb += (item.c || 0)*f;
    });
  });
  return {
    kcal: Math.round(kcal),
    protein: Math.round(prot),
    fat: Math.round(fat),
    carbs: Math.round(carb),
    water: d.water || 0,
    data: d
  };
}
window.nutritionToday = nutritionToday;

function componentMatches(c, prefs){
  if (!c.diet) return true;
  if (prefs.diet && prefs.diet !== 'обычное'){
    if (!c.diet.includes(prefs.diet)) return false;
  }
  if (prefs.exclusions && prefs.exclusions.length){
    for (const ex of prefs.exclusions) if (c.contains.includes(ex)) return false;
  }
  return true;
}

function pickComponent(category, prefs){
  let pool = (MEAL_COMPONENTS[category] || []).filter(c => componentMatches(c, prefs));
  if (!pool.length) return null;
  if (prefs.tier && prefs.tier !== 'any'){
    pool = [...pool].sort((a, b) => (b.tier === prefs.tier ? 1 : 0) - (a.tier === prefs.tier ? 1 : 0));
    pool = pool.slice(0, Math.min(4, pool.length));
  } else {
    pool = shuffle(pool).slice(0, Math.min(4, pool.length));
  }
  return pick(pool);
}

function assembleMeal(category, prefs){
  const schema = MEAL_SCHEMAS[category] || [];
  const components = [];
  for (const role of schema){
    const c = pickComponent(role, prefs);
    if (c){
      components.push({
        role,
        name: c.n,
        unit: c.unit || 'г',
        per100: { kcal:c.kcal, p:c.p, f:c.f, c:c.c },
        grams: c.def,
        min: c.min,
        max: c.max,
        tag: c.tag,
        tier: c.tier
      });
    }
  }
  return components;
}

function mealTotals(components){
  const t = { kcal:0, p:0, f:0, c:0, weight:0 };
  components.forEach(c => {
    const k = c.grams / 100;
    t.kcal += c.per100.kcal * k;
    t.p += c.per100.p * k;
    t.f += c.per100.f * k;
    t.c += c.per100.c * k;
    t.weight += c.grams;
  });
  return t;
}

function balanceMeal(components, targetKcal){
  if (!components.length) return components;
  const tgtP = (targetKcal * MACRO_SPLIT.p) / KCAL_PER_G.p;
  const tgtF = (targetKcal * MACRO_SPLIT.f) / KCAL_PER_G.f;
  const tgtC = (targetKcal * MACRO_SPLIT.c) / KCAL_PER_G.c;
  const score = () => {
    const t = mealTotals(components);
    const dK = Math.abs(t.kcal - targetKcal) / Math.max(targetKcal, 1);
    const dP = Math.abs(t.p - tgtP) / Math.max(tgtP, 1);
    const dF = Math.abs(t.f - tgtF) / Math.max(tgtF, 1);
    const dC = Math.abs(t.c - tgtC) / Math.max(tgtC, 1);
    return dK * 1.0 + dP * 1.2 + dF * 2.0 + dC * 1.2;
  };
  for (let iter = 0; iter < 6; iter++){
    let improved = false;
    const baseScore = score();
    components.forEach((c) => {
      [10, -10, 20, -20, 5, -5].forEach(delta => {
        const old = c.grams;
        const nv = Math.max(c.min, Math.min(c.max, old + delta));
        if (nv === old) return;
        c.grams = nv;
        const s = score();
        if (s < baseScore - 0.0005){ improved = true; }
        else { c.grams = old; }
      });
    });
    if (!improved) break;
  }
  components.forEach(c => { c.grams = Math.round(c.grams / 5) * 5; });
  return components;
}

function computeMealTargets(mealsPerDay, dailyKcal){
  if (mealsPerDay === 3){
    return { breakfast: dailyKcal*0.30, lunch: dailyKcal*0.40, dinner: dailyKcal*0.30, snack: [] };
  }
  if (mealsPerDay === 4){
    return { breakfast: dailyKcal*0.28, lunch: dailyKcal*0.32, dinner: dailyKcal*0.28, snack: [dailyKcal*0.12] };
  }
  return { breakfast: dailyKcal*0.22, lunch: dailyKcal*0.30, dinner: dailyKcal*0.26, snack: [dailyKcal*0.11, dailyKcal*0.11] };
}

function generatePlanSlots(){
  const prefs = N.S.nutrition.preferences;
  const mealsPerDay = prefs.mealsPerDay || 4;
  const g = N.S.nutrition.goals;
  const goal = prefs.mealGoal || 'maintain';
  const dailyTarget = goal === 'gain' ? g.calories * 1.15
                    : goal === 'lose' ? g.calories * 0.85
                    : g.calories;
  const targets = computeMealTargets(mealsPerDay, dailyTarget);
  const slots = [];

  function makeSlot(mealId, category, targetKcal){
    const comps = assembleMeal(category, prefs);
    if (!comps.length) return null;
    balanceMeal(comps, targetKcal);
    const t = mealTotals(comps);
    return {
      id: 'slot_' + Math.random().toString(36).slice(2,8),
      mealId,
      label: MEAL_NAMES[mealId],
      icon: mealId === 'breakfast' ? '🌅' : mealId === 'lunch' ? '☀️' : mealId === 'dinner' ? '🌙' : '🍎',
      components: comps,
      targetKcal: Math.round(targetKcal),
      totalKcal: Math.round(t.kcal),
      totalP: Math.round(t.p),
      totalF: Math.round(t.f),
      totalC: Math.round(t.c),
      confirmed: false,
      confirmedAt: null
    };
  }

  const b = makeSlot('breakfast', 'breakfast', targets.breakfast);
  if (b) slots.push(b);
  const l = makeSlot('lunch', 'lunch', targets.lunch);
  if (l) slots.push(l);
  const d = makeSlot('dinner', 'dinner', targets.dinner);
  if (d) slots.push(d);
  targets.snack.forEach(t => {
    const s = makeSlot('snack', 'snack', t);
    if (s) slots.push(s);
  });

  return slots;
}

function recalcSlot(slot){
  const t = mealTotals(slot.components);
  slot.totalKcal = Math.round(t.kcal);
  slot.totalP = Math.round(t.p);
  slot.totalF = Math.round(t.f);
  slot.totalC = Math.round(t.c);
}

function planTotals(plan){
  const t = { kcal:0, p:0, f:0, c:0 };
  (plan.slots || []).forEach(s => {
    t.kcal += s.totalKcal; t.p += s.totalP; t.f += s.totalF; t.c += s.totalC;
  });
  return { kcal: Math.round(t.kcal), p: Math.round(t.p), f: Math.round(t.f), c: Math.round(t.c) };
}
function goalCompliance(totals, goal){
  const g = N.S.nutrition.goals;
  const target = goal === 'gain' ? g.calories * 1.15
               : goal === 'lose' ? g.calories * 0.85
               : g.calories;
  const diff = totals.kcal - target;
  const pct = Math.round(totals.kcal / target * 100);
  return { targetKcal: Math.round(target), diff: Math.round(diff), pct };
}
function macroPct(totals){
  const kP = totals.p * 4, kF = totals.f * 9, kC = totals.c * 4;
  const sum = kP + kF + kC || 1;
  return { p: Math.round(kP/sum*100), f: Math.round(kF/sum*100), c: Math.round(kC/sum*100) };
}

/* ═══════════════════════════════════════════════════════════════════
   ГЛАВНЫЙ ЭКРАН
   ═══════════════════════════════════════════════════════════════════ */
function renderNutrition(){
  ensurePlansStore();
  const today = todayKey();
  if (!N.S.nutrition.viewDate) N.S.nutrition.viewDate = today;
  else if (N.S.nutrition.viewDate < today && !N.S.nutrition._manualDate) N.S.nutrition.viewDate = today;
  const ds = N.S.nutrition.viewDate;
  if (!N.S.nutrition.days[ds]) N.S.nutrition.days[ds] = { meals:{breakfast:[],lunch:[],dinner:[],snack:[]}, water:0, notes:'' };
  const d = N.S.nutrition.days[ds];
  if (!d.meals) d.meals = { breakfast:[], lunch:[], dinner:[], snack:[] };
  ['breakfast','lunch','dinner','snack'].forEach(k => { if (!d.meals[k]) d.meals[k] = []; });

  const plan = getPlan(ds);

  const nut = nutritionToday(ds);
  const g = N.S.nutrition.goals;
  const prefs = N.S.nutrition.preferences;
  const kcalLeft = Math.max(0, g.calories - nut.kcal);
  const over = nut.kcal > g.calories;
  const waterPct = Math.min(100, Math.round(nut.water / Math.max(1, g.water) * 100));
  const R = 86, C = 2 * Math.PI * R;
  const dash = C * (1 - Math.min(1, nut.kcal / Math.max(1, g.calories)));
  const MEALS = [
    { id:'breakfast', name:'Завтрак', icon:'🌅' },
    { id:'lunch', name:'Обед', icon:'☀️' },
    { id:'dinner', name:'Ужин', icon:'🌙' },
    { id:'snack', name:'Перекус', icon:'🍎' }
  ];
  const isToday = ds === today;
  const tierLabel = (FOOD_TIERS.find(t => t.key === (prefs.tier || 'any')) || {label:'Любой бюджет'}).label;

  const root = document.createElement('div');
  root.className = 'screen';
  root.innerHTML = `
    <div class="between" style="margin-bottom:16px">
      <div>
        <div class="tiny">${isToday ? 'СЕГОДНЯ' : 'ДРУГОЙ ДЕНЬ'}</div>
        <div class="h1">Питание</div>
      </div>
      <button class="icon-btn" id="nutDate" type="button">📅</button>
    </div>
    ${!isToday ? `<button class="btn btn-ghost btn-sm btn-full" id="nutToday" type="button" style="margin-bottom:14px">↩ Сегодня</button>` : ''}

    <button class="btn btn-primary btn-full btn-lg" id="openPlan" type="button" style="margin-bottom:14px">
      ${plan ? '🔄 Изменить план на день' : '✨ Подобрать план на день'}
    </button>
    <p class="muted" style="text-align:center;font-size:11.5px;margin-bottom:16px;opacity:.75">
      ${esc(GOAL_LABELS[prefs.mealGoal] || prefs.mealGoal)} · ${prefs.mealsPerDay} приёма · ${esc(prefs.diet)} · ${esc(tierLabel)}
    </p>

    ${plan && plan.slots.length ? renderPlanBlock(ds, plan) : ''}

    <div class="nutri-hero"><div style="position:relative;z-index:1">
      <div class="tiny" style="color:#F3E3C8;letter-spacing:.14em;margin-bottom:10px;text-align:center">СЪЕДЕНО СЕГОДНЯ</div>
      <div class="kcal-ring">
        <svg viewBox="0 0 200 200">
          <circle class="track" cx="100" cy="100" r="${R}"/>
          <circle class="fill ${over?'over':''}" cx="100" cy="100" r="${R}" stroke-dasharray="${C}" stroke-dashoffset="${dash}"/>
        </svg>
        <div class="kcal-ring-inner">
          <div class="big">${nut.kcal}</div>
          <div class="sub">ккал</div>
          <div class="left">${over ? `+${nut.kcal-g.calories} сверх` : `осталось ${kcalLeft}`}</div>
        </div>
      </div>
      <div class="macro-bars">
        ${[['Белки','p','protein'],['Жиры','f','fat'],['Углев.','c','carbs']].map(([lbl, cls, key]) => `
          <div class="macro-bar-row">
            <div class="macro-bar-lbl">${lbl}</div>
            <div class="macro-bar-track"><div class="macro-bar-fill ${cls}" style="width:${Math.min(100,Math.round(nut[key]/Math.max(1,g[key])*100))}%"></div></div>
            <div class="macro-bar-val">${nut[key]}/${g[key]}г</div>
          </div>`).join('')}
      </div>
    </div></div>

    <div class="water-card">
      <div class="water-head">
        <div class="water-title">💧 Вода</div>
        <div class="water-val">${nut.water}<small>/${g.water} мл</small></div>
      </div>
      <div class="water-track"><div class="water-fill" style="width:${waterPct}%"></div></div>
      <div class="water-btns">
        <button class="water-btn" data-water="200" type="button">+200</button>
        <button class="water-btn" data-water="300" type="button">+300</button>
        <button class="water-btn" data-water="500" type="button">+500</button>
        <button class="water-btn minus" data-water="-200" type="button">−200</button>
      </div>
    </div>

    <div class="nutri-quick">
      <button class="nutri-quick-btn" data-quick="weight" type="button">
        <div class="nutri-quick-em">⚖️</div>
        <div class="nutri-quick-txt">
          <div class="nutri-quick-t">Вес</div>
          <div class="nutri-quick-s">${N.S.nutrition.weights.length ? N.S.nutrition.weights[N.S.nutrition.weights.length-1].weight+' кг' : 'Нет данных'}</div>
        </div>
      </button>
      <button class="nutri-quick-btn" data-quick="goals" type="button">
        <div class="nutri-quick-em">🎯</div>
        <div class="nutri-quick-txt">
          <div class="nutri-quick-t">Цели КБЖУ</div>
          <div class="nutri-quick-s">${g.calories} ккал</div>
        </div>
      </button>
    </div>

    <div class="h3" style="margin:22px 0 12px;font-family:'Fraunces',serif;font-size:16px">Дневник еды</div>
    ${MEALS.map(m => {
      const items = d.meals[m.id] || [];
      const mealKcal = items.reduce((s, it) => {
        const grams = it.grams !== undefined ? it.grams : 100;
        return s + (it.kcal || 0) * grams / 100;
      }, 0);
      const planGroups = {};
      const standalone = [];
      items.forEach((it, idx) => {
        if (it.planId){
          if (!planGroups[it.planId]) planGroups[it.planId] = [];
          planGroups[it.planId].push({ it, idx });
        } else {
          standalone.push({ it, idx });
        }
      });
      return `
        <div class="meal-card" data-meal="${m.id}">
          <div class="meal-head" data-meal-toggle="${m.id}">
            <div class="meal-ico">${m.icon}</div>
            <div class="meal-info">
              <div class="meal-name">${m.name}</div>
              <div class="meal-kcal"><b>${Math.round(mealKcal)}</b> ккал${items.length ? ' · '+items.length+' прод.' : ''}</div>
            </div>
            <div class="meal-add" data-meal-add="${m.id}">+</div>
          </div>
          <div class="meal-body">
            ${items.length ? Object.keys(planGroups).map(pid => {
              const group = planGroups[pid];
              const gTotals = group.reduce((s, {it}) => {
                const k = (it.grams||100)/100;
                return { kcal: s.kcal + (it.kcal||0)*k, p: s.p + (it.p||0)*k, f: s.f + (it.f||0)*k, c: s.c + (it.c||0)*k };
              }, { kcal:0, p:0, f:0, c:0 });
              const slotId = pid.replace(/^plan_/, '');
              return `
              <div style="border:1px solid var(--moss);border-radius:12px;padding:12px 14px;margin:8px 12px;background:var(--moss-soft)">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                  <div class="tiny" style="color:var(--moss);letter-spacing:.08em">✓ ${esc(group[0].it.planName || 'Блюдо')}</div>
                  <div style="display:flex;gap:6px;align-items:center">
                    <div style="font-family:'Fraunces',serif;font-size:15px;font-weight:600;color:var(--moss)">${Math.round(gTotals.kcal)} ккал</div>
                    <button class="icon-btn" style="width:26px;height:26px;font-size:11px;background:transparent;border-color:transparent;color:var(--moss)" data-edit-slot="${slotId}" type="button" title="Редактировать">✎</button>
                  </div>
                </div>
                ${group.map(({it, idx}) => {
                  const k = (it.grams||100)/100;
                  return `
                    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:4px 0;border-bottom:1px dashed rgba(63,97,82,.2)">
                      <div style="flex:1;min-width:0">
                        <div style="font-size:13px;font-weight:600;color:var(--ink)">${esc(it.n)} <span style="color:var(--moss);font-weight:500">${it.grams}${it.unit||'г'}</span></div>
                        <div style="font-size:11px;color:var(--ink-soft)">Б ${Math.round(it.p*k)} · Ж ${Math.round(it.f*k)} · У ${Math.round(it.c*k)}</div>
                      </div>
                      <div style="font-size:12px;color:var(--ink);font-weight:600">${Math.round(it.kcal*k)} ккал</div>
                      <button class="icon-btn btn-danger" style="width:26px;height:26px;font-size:11px;background:transparent;border-color:transparent" data-del-food="${m.id}|${idx}" type="button">✕</button>
                    </div>`;
                }).join('')}
                <div style="display:flex;gap:10px;font-size:11px;color:var(--moss);margin-top:6px">
                  <span>Б ${Math.round(gTotals.p)}г</span>
                  <span>Ж ${Math.round(gTotals.f)}г</span>
                  <span>У ${Math.round(gTotals.c)}г</span>
                </div>
              </div>`;
            }).join('') : ''}
            ${standalone.map(({it, idx}) => {
              const grams = it.grams !== undefined ? it.grams : 100;
              const k = grams / 100;
              const isJunk = it.tag === 'junk';
              const tagBadge = isJunk
                ? '<span style="display:inline-block;font-size:9.5px;padding:1px 6px;border-radius:6px;background:rgba(164,80,58,.12);color:var(--rust);font-weight:600;margin-left:4px">не особо</span>'
                : (it.tag === 'healthy' ? '<span style="display:inline-block;font-size:9.5px;padding:1px 6px;border-radius:6px;background:var(--moss-soft);color:var(--moss);font-weight:600;margin-left:4px">полезно</span>' : '');
              return `
              <div class="food-row" style="flex-wrap:wrap">
                <div class="food-row-main" style="width:100%">
                  <div class="food-row-name">${esc(it.n)}${tagBadge}</div>
                  <div class="food-row-macros" style="margin-bottom:4px">
                    <span>${grams}г</span>
                    <span class="mp">Б ${Math.round((it.p||0)*k)}</span>
                    <span class="mf">Ж ${Math.round((it.f||0)*k)}</span>
                    <span class="mc">У ${Math.round((it.c||0)*k)}</span>
                  </div>
                </div>
                <div style="display:flex;align-items:center;gap:6px;width:100%;justify-content:space-between;margin-top:6px">
                  <div class="food-row-kcal" style="margin-left:auto">${Math.round((it.kcal||0)*k)}<small> ккал</small></div>
                  <button class="icon-btn btn-danger" style="width:30px;height:30px;font-size:12px" data-del-food="${m.id}|${idx}" type="button">✕</button>
                </div>
              </div>`;
            }).join('')}
            ${!items.length ? '<div class="meal-empty">Пока пусто. Подтверди блюдо из плана или нажми + справа.</div>' : ''}
          </div>
        </div>`;
    }).join('')}

    <div class="card" style="margin-top:16px">
      <div class="h3" style="margin-bottom:12px">Заметки о питании</div>
      <textarea class="nutri-note" id="nutNotes" placeholder="Как прошёл день...">${esc(d.notes||'')}</textarea>
    </div>
    <div class="card">
      <div class="h3" style="margin-bottom:12px;font-family:'Fraunces',serif;font-size:16px">История за 7 дней</div>
      <div class="daily-history">
        ${(() => {
          const days = [];
          for (let i = 6; i >= 0; i--){
            const dd = new Date(Date.now() - i*86400000);
            const k = fmtDate(dd);
            const n = nutritionToday(k);
            days.push({ k, n, label: dowShort[dd.getDay()] });
          }
          const maxK = Math.max(...days.map(x => x.n.kcal), 1);
          return days.map(x => {
            const pct = Math.round(x.n.kcal / maxK * 100);
            const cls = x.n.kcal > g.calories*1.1 ? 'over' : x.n.kcal < g.calories*0.7 ? 'low' : 'good';
            return `<div class="hist-day">
              <div class="hist-day-lbl">${x.label}</div>
              <div class="hist-day-bar"><div class="hist-day-fill ${cls}" style="height:${pct}%"></div></div>
              <div class="hist-day-val">${x.n.kcal}</div>
            </div>`;
          }).join('');
        })()}
      </div>
    </div>
    <div style="height:20px"></div>`;

  root.addEventListener('click', e => {
    const t = e.target.closest('[data-meal-toggle]');
    if (t && !e.target.closest('[data-meal-add]') && !e.target.closest('[data-del-food]') && !e.target.closest('[data-edit-slot]')){
      t.closest('.meal-card').classList.toggle('open'); return;
    }
    const add = e.target.closest('[data-meal-add]');
    if (add){ openAddFoodModal(add.dataset.mealAdd, ds); return; }
    const df = e.target.closest('[data-del-food]');
    if (df){
      const [m, idx] = df.dataset.delFood.split('|');
      d.meals[m].splice(+idx, 1);
      saveState(); go('nutrition'); return;
    }
    const w = e.target.closest('[data-water]');
    if (w){
      const delta = +w.dataset.water;
      d.water = Math.max(0, (d.water||0) + delta);
      SFX.tap(); buzz(8); saveState();
      if (window.Achievements) window.Achievements.check();
      go('nutrition'); return;
    }
    const q = e.target.closest('[data-quick]');
    if (q){
      if (q.dataset.quick === 'weight') openWeightModal();
      else if (q.dataset.quick === 'goals') openMacroGoalsModal();
    }
    const op = e.target.closest('#openPlan');
    if (op){ openPlanModal(ds); return; }

    const conf = e.target.closest('[data-confirm-slot]');
    if (conf){ confirmSlot(ds, conf.dataset.confirmSlot); return; }

    const unconf = e.target.closest('[data-unconfirm-slot]');
    if (unconf){ unconfirmSlot(ds, unconf.dataset.unconfirmSlot); return; }

    const ed = e.target.closest('[data-edit-slot]');
    if (ed){ openSlotEditor(ds, ed.dataset.editSlot); return; }

    const clearP = e.target.closest('[data-clear-plan]');
    if (clearP){
      if (confirm('Удалить весь план на сегодня? Уже подтверждённые приёмы останутся в дневнике.')){
        clearPlan(ds); go('nutrition');
      }
      return;
    }
  });

  const nutDate = root.querySelector('#nutDate');
  if (nutDate) nutDate.onclick = () => {
    const nd = prompt('Дата (YYYY-MM-DD):', ds);
    if (nd && /^\d{4}-\d{2}-\d{2}$/.test(nd)){
      N.S.nutrition.viewDate = nd;
      N.S.nutrition._manualDate = nd !== today;
      if (!N.S.nutrition.days[nd]) N.S.nutrition.days[nd] = { meals:{breakfast:[],lunch:[],dinner:[],snack:[]}, water:0, notes:'' };
      saveState(); go('nutrition');
    }
  };
  const nToday = root.querySelector('#nutToday');
  if (nToday) nToday.onclick = () => {
    N.S.nutrition.viewDate = today;
    N.S.nutrition._manualDate = false;
    saveState(); go('nutrition');
  };
  const nt = root.querySelector('#nutNotes');
  if (nt) nt.oninput = () => { d.notes = nt.value; saveState(); };

  return root;
}

/* ═══ Блок «План на сегодня» ═══ */
function renderPlanBlock(ds, plan){
  const pending = plan.slots.filter(s => !s.confirmed);
  const confirmedCount = plan.slots.length - pending.length;
  const tot = planTotals(plan);
  const allDone = pending.length === 0;

  return `
    <div class="card" data-plan-block style="padding:16px 18px;border:1px solid var(--moss);background:linear-gradient(180deg,var(--moss-soft),var(--surface-raised))">
      <div class="between" style="margin-bottom:12px">
        <div>
          <div class="tiny" style="color:var(--moss);letter-spacing:.1em">📋 ПЛАН НА СЕГОДНЯ</div>
          <div style="font-size:12.5px;color:var(--moss);margin-top:4px">
            ${allDone ? '✓ Все приёмы подтверждены' : `Подтверждено ${confirmedCount} из ${plan.slots.length}`}
          </div>
        </div>
        <button class="icon-btn btn-danger" data-clear-plan type="button" style="width:32px;height:32px;font-size:13px" title="Удалить план">✕</button>
      </div>

      <div style="padding:10px 12px;background:var(--paper);border-radius:10px;margin-bottom:12px;font-size:12px">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px">
          <span style="color:var(--ink-soft)">Итого по плану</span>
          <span style="color:var(--moss);font-weight:600">${tot.kcal} ккал · Б ${tot.p} · Ж ${tot.f} · У ${tot.c}</span>
        </div>
      </div>

      ${plan.slots.map(s => `
        <div style="padding:12px 14px;background:${s.confirmed ? 'rgba(63,97,82,.08)' : 'var(--surface-raised)'};border:1px solid ${s.confirmed ? 'rgba(63,97,82,.2)' : 'var(--line)'};border-radius:12px;margin-bottom:8px;${s.confirmed ? 'opacity:.85' : ''}">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;gap:6px">
            <div style="font-size:13.5px;font-weight:600;color:var(--ink);flex:1;min-width:0">
              ${s.icon} ${esc(s.label)}
              ${s.confirmed ? '<span style="color:var(--moss);font-size:11.5px;margin-left:6px">✓ съедено</span>' : ''}
            </div>
            <div style="display:flex;gap:6px;align-items:center">
              <div style="font-family:'Fraunces',serif;font-size:14px;font-weight:600;color:var(--moss)">${s.totalKcal} ккал</div>
              <button class="icon-btn" style="width:28px;height:28px;font-size:12px;background:transparent;border-color:transparent;color:var(--moss)" data-edit-slot="${s.id}" type="button" title="Редактировать">✎</button>
            </div>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">
            ${s.components.map(c => `<span style="font-size:10.5px;padding:2px 7px;border-radius:6px;background:var(--paper);border:1px solid var(--line);color:var(--ink-soft)">${esc(c.name)} <b style="color:var(--ink)">${c.grams}${c.unit}</b></span>`).join('')}
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
            <div style="display:flex;gap:8px;font-size:11px;color:var(--ink-soft)">
              <span>Б ${s.totalP}г</span><span>Ж ${s.totalF}г</span><span>У ${s.totalC}г</span>
            </div>
            ${s.confirmed
              ? `<button class="btn btn-ghost btn-sm" data-unconfirm-slot="${s.id}" type="button" style="font-size:11.5px">↺ Отменить</button>`
              : `<button class="btn btn-primary btn-sm" data-confirm-slot="${s.id}" type="button" style="font-size:12.5px">✓ Съел(а)</button>`}
          </div>
        </div>
      `).join('')}
    </div>`;
}

/* ═══ Подтверждение / снятие ═══ */
function syncSlotToDay(ds, slot){
  const day = N.S.nutrition.days[ds];
  if (!day) return;
  if (!day.meals) day.meals = { breakfast:[], lunch:[], dinner:[], snack:[] };
  if (!day.meals[slot.mealId]) day.meals[slot.mealId] = [];
  const planId = 'plan_' + slot.id;
  day.meals[slot.mealId] = day.meals[slot.mealId].filter(it => it.planId !== planId);
  if (!slot.confirmed) return;
  const planName = slot.icon + ' ' + slot.label;
  slot.components.forEach(comp => {
    day.meals[slot.mealId].push({
      n: comp.name,
      unit: comp.unit,
      grams: comp.grams,
      kcal: comp.per100.kcal,
      p: comp.per100.p,
      f: comp.per100.f,
      c: comp.per100.c,
      tag: comp.tag,
      tier: comp.tier,
      planId,
      planName
    });
  });
}

function confirmSlot(ds, slotId){
  const plan = getPlan(ds);
  if (!plan) return;
  const slot = plan.slots.find(s => s.id === slotId);
  if (!slot || slot.confirmed) return;
  slot.confirmed = true;
  slot.confirmedAt = Date.now();
  recalcSlot(slot);
  syncSlotToDay(ds, slot);
  savePlan(ds, plan);
  SFX.ok(); buzz(12); N.flash('ok');
  toast(`${slot.icon} ${slot.label} добавлен в дневник`, 2000, 'gold');
  if (window.Achievements) window.Achievements.check();
  go('nutrition');
}

function unconfirmSlot(ds, slotId){
  const plan = getPlan(ds);
  if (!plan) return;
  const slot = plan.slots.find(s => s.id === slotId);
  if (!slot || !slot.confirmed) return;
  slot.confirmed = false;
  slot.confirmedAt = null;
  syncSlotToDay(ds, slot);
  savePlan(ds, plan);
  SFX.tap(); buzz(8);
  toast(`${slot.icon} ${slot.label} убран из дневника`);
  go('nutrition');
}

/* ═══════════════════════════════════════════════════════════════════
   РЕДАКТОР БЛЮДА ИЗ ПЛАНА
   ═══════════════════════════════════════════════════════════════════ */
function openSlotEditor(ds, slotId){
  const plan = getPlan(ds);
  if (!plan) return;
  const slot = plan.slots.find(s => s.id === slotId);
  if (!slot) return;

  // Рабочая копия компонентов
  const components = JSON.parse(JSON.stringify(slot.components || []));

  const layer = openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom:6px">${slot.icon} ${esc(slot.label)}</div>
    <p class="muted" style="margin-bottom:16px">Меняй граммовки, удаляй и добавляй компоненты. Изменения попадут в план${slot.confirmed ? ' и в дневник' : ''}.</p>
    <div id="slotEditor"></div>
  `, m => {
    const host = m.querySelector('#slotEditor');

    function recalc(){
      const t = { kcal:0, p:0, f:0, c:0 };
      components.forEach(c => {
        const k = c.grams / 100;
        t.kcal += c.per100.kcal * k;
        t.p += c.per100.p * k;
        t.f += c.per100.f * k;
        t.c += c.per100.c * k;
      });
      return { kcal: Math.round(t.kcal), p: Math.round(t.p), f: Math.round(t.f), c: Math.round(t.c) };
    }

    function updateTotals(){
      const tot = recalc();
      const sumEl = host.querySelector('#slotTotals');
      if (sumEl){
        sumEl.querySelector('.slotKcal').textContent = `${tot.kcal} ккал`;
        sumEl.querySelector('.slotMacros').textContent = `Б ${tot.p} · Ж ${tot.f} · У ${tot.c}`;
      }
      // Обновить kcal в каждой карточке компонента
      host.querySelectorAll('[data-comp-kcal]').forEach(el => {
        const i = +el.dataset.compKcal;
        const c = components[i];
        if (!c) return;
        const k = c.grams / 100;
        el.textContent = `${Math.round(c.per100.kcal * k)} ккал`;
      });
    }

    function draw(){
      const tot = recalc();
      host.innerHTML = `
        <div id="slotTotals" style="padding:10px 12px;background:var(--moss-soft);border-radius:10px;margin-bottom:14px;text-align:center">
          <div class="tiny" style="color:var(--moss);letter-spacing:.08em;margin-bottom:4px">ИТОГО ПО БЛЮДУ</div>
          <div class="slotKcal" style="font-family:'Fraunces',serif;font-size:22px;font-weight:600;color:var(--moss)">${tot.kcal} ккал</div>
          <div class="slotMacros" style="font-size:11.5px;color:var(--moss);opacity:.9;margin-top:2px">Б ${tot.p} · Ж ${tot.f} · У ${tot.c}</div>
        </div>

        ${components.length ? components.map((c, i) => `
          <div style="padding:10px 12px;border:1px solid var(--line);border-radius:10px;margin-bottom:8px;background:var(--paper)">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:8px">
              <div style="flex:1;min-width:0">
                <div style="font-size:13.5px;font-weight:600;color:var(--ink)">${esc(c.name)}</div>
                <div style="font-size:10.5px;color:var(--ink-mute);margin-top:2px">
                  ${ROLE_LABELS[c.role] || c.role} · <span data-comp-kcal="${i}">${Math.round(c.per100.kcal * c.grams / 100)} ккал</span>
                </div>
              </div>
              <button class="icon-btn btn-danger" data-rm="${i}" type="button" style="width:28px;height:28px;font-size:12px;flex-shrink:0">✕</button>
            </div>
            <div style="display:flex;align-items:center;gap:6px">
              <button class="icon-btn" data-dg="${i}" type="button" style="width:32px;height:32px;font-size:16px;flex-shrink:0">−</button>
              <input type="number" data-g="${i}" value="${c.grams}" min="1" max="999"
                style="flex:1;min-width:0;text-align:center;padding:8px;border:1px solid var(--line);border-radius:8px;background:var(--surface-raised);color:var(--ink);font-size:14px;font-weight:600">
              <span class="tiny" style="width:24px;text-align:center;flex-shrink:0">${c.unit}</span>
              <button class="icon-btn" data-ig="${i}" type="button" style="width:32px;height:32px;font-size:16px;flex-shrink:0">+</button>
            </div>
          </div>
        `).join('') : '<div class="muted" style="text-align:center;padding:16px">Все компоненты удалены</div>'}

        <button class="btn btn-line btn-full" id="addComp" type="button" style="margin-top:6px">+ Добавить компонент</button>

        <div style="display:flex;gap:10px;margin-top:16px">
          <button class="btn btn-ghost btn-full" id="cancelSlot" type="button">Отмена</button>
          <button class="btn btn-primary btn-full btn-lg" id="saveSlot" type="button">Сохранить</button>
        </div>
      `;

      // Изменение граммовки
      host.querySelectorAll('[data-g]').forEach(inp => {
        inp.oninput = () => {
          const i = +inp.dataset.g;
          let v = parseInt(inp.value, 10);
          if (isNaN(v) || v < 1) v = 1;
          if (v > 999) v = 999;
          components[i].grams = v;
          updateTotals();
        };
        inp.onblur = () => {
          const i = +inp.dataset.g;
          const v = Math.max(1, Math.min(999, parseInt(inp.value, 10) || 1));
          components[i].grams = v;
          inp.value = v;
          updateTotals();
        };
      });

      // Уменьшить / увеличить
      host.querySelectorAll('[data-dg]').forEach(b => b.onclick = () => {
        const i = +b.dataset.dg;
        const step = components[i].grams > 50 ? 10 : 5;
        components[i].grams = Math.max(1, components[i].grams - step);
        const inp = host.querySelector(`[data-g="${i}"]`);
        if (inp) inp.value = components[i].grams;
        SFX.tap();
        updateTotals();
      });
      host.querySelectorAll('[data-ig]').forEach(b => b.onclick = () => {
        const i = +b.dataset.ig;
        const step = components[i].grams >= 50 ? 10 : 5;
        components[i].grams = Math.min(999, components[i].grams + step);
        const inp = host.querySelector(`[data-g="${i}"]`);
        if (inp) inp.value = components[i].grams;
        SFX.tap();
        updateTotals();
      });

      // Удалить
      host.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => {
        const i = +b.dataset.rm;
        components.splice(i, 1);
        SFX.tap(); buzz(6);
        draw();
      });

      // Добавить
      const addBtn = host.querySelector('#addComp');
      if (addBtn) addBtn.onclick = () => {
        openAddComponentModal((newComp) => {
          components.push(newComp);
          SFX.ok(); buzz(8);
          draw();
        });
      };

      // Отмена / Сохранить
      host.querySelector('#cancelSlot').onclick = () => closeModal(layer);
      host.querySelector('#saveSlot').onclick = () => {
        if (!components.length){
          toast('Добавь хотя бы один компонент'); return;
        }
        // Обновляем слот
        slot.components = components.map(c => ({ ...c }));
        recalcSlot(slot);
        // Синхронизируем с дневником, если слот подтверждён
        syncSlotToDay(ds, slot);
        savePlan(ds, plan);
        closeModal(layer);
        toast('Блюдо обновлено ✨', 2000, 'gold');
        SFX.win(); buzz(12);
        go('nutrition');
      };
    }

    draw();
  });
}

/* ═══ Выбор компонента для добавления ═══ */
function openAddComponentModal(onAdd){
  const prefs = N.S.nutrition.preferences;
  const roles = ['protein','base','veg','fruit','fats'];
  let activeRole = 'protein';

  openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom:6px">Добавить компонент</div>
    <p class="muted" style="margin-bottom:14px">Выбери категорию и продукт.</p>
    <div id="roleTabs" style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:12px"></div>
    <div id="compList" style="max-height:44vh;overflow-y:auto;border:1px solid var(--line);border-radius:10px;background:var(--paper)"></div>
    <button class="btn btn-ghost btn-full" id="cpCancel" type="button" style="margin-top:16px">Отмена</button>
  `, m => {
    const roleTabs = m.querySelector('#roleTabs');
    const list = m.querySelector('#compList');

    function drawTabs(){
      roleTabs.innerHTML = roles.map(r => `<button type="button" data-role="${r}" style="
        padding:6px 10px;border-radius:100px;font-size:11.5px;font-weight:600;cursor:pointer;
        background:${activeRole===r?'var(--moss)':'var(--paper)'};
        color:${activeRole===r?'#fff':'var(--ink-soft)'};
        border:1px solid ${activeRole===r?'var(--moss)':'var(--line)'};
      ">${ROLE_LABELS[r]}</button>`).join('');
      roleTabs.querySelectorAll('[data-role]').forEach(b => b.onclick = () => {
        activeRole = b.dataset.role; SFX.tap(); drawTabs(); drawList();
      });
    }

    function drawList(){
      const pool = (MEAL_COMPONENTS[activeRole] || []).filter(c => componentMatches(c, prefs));
      list.innerHTML = pool.length ? pool.map((c, i) => `
        <div data-ci="${i}" style="padding:10px 12px;border-bottom:1px solid var(--line-soft);cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:8px">
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:600;color:var(--ink)">${esc(c.n)}</div>
            <div style="font-size:10.5px;color:var(--ink-mute);margin-top:2px">${c.kcal} ккал · Б ${c.p} · Ж ${c.f} · У ${c.c} · порция ${c.def}${c.unit||'г'}</div>
          </div>
          <div style="font-size:16px;color:var(--moss);font-weight:700">+</div>
        </div>
      `).join('') : '<div style="padding:20px;text-align:center" class="muted">Нет подходящих</div>';
      list.querySelectorAll('[data-ci]').forEach(el => el.onclick = () => {
        const c = pool[+el.dataset.ci];
        onAdd({
          role: activeRole,
          name: c.n,
          unit: c.unit || 'г',
          per100: { kcal:c.kcal, p:c.p, f:c.f, c:c.c },
          grams: c.def,
          min: c.min,
          max: c.max,
          tag: c.tag,
          tier: c.tier
        });
        closeModal(m);
      });
    }

    drawTabs();
    drawList();
    m.querySelector('#cpCancel').onclick = () => closeModal(m);
  });
}

/* ═══════════════════════════════════════════════════════════════════
   МОДАЛКА ГЕНЕРАЦИИ ПЛАНА
   ═══════════════════════════════════════════════════════════════════ */
function openPlanModal(ds){
  const prefs0 = N.S.nutrition.preferences;
  let goal = prefs0.mealGoal || 'maintain';
  let mealsPerDay = prefs0.mealsPerDay || 4;
  let diet = prefs0.diet || 'обычное';
  let tier = prefs0.tier || 'any';
  let exclusions = [...(prefs0.exclusions || [])];
  let generated = null;

  const existing = getPlan(ds);
  if (existing){
    generated = { slots: existing.slots.filter(s => !s.confirmed) };
  }

  const layer = openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom:6px">✨ План на день</div>
    <p class="muted" style="margin-bottom:18px">План сохранится отдельно. Подтвердишь приём — данные уйдут в дневник.</p>
    <div id="planContent"></div>
  `, m => {
    const content = m.querySelector('#planContent');

    function dailyTarget(){
      const g = N.S.nutrition.goals;
      return goal === 'gain' ? Math.round(g.calories * 1.15)
           : goal === 'lose' ? Math.round(g.calories * 0.85)
           : g.calories;
    }

    function draw(){
      const target = dailyTarget();
      content.innerHTML = `
        <div style="padding:12px 14px;background:var(--moss-soft);border-radius:12px;margin-bottom:16px;text-align:center">
          <div class="tiny" style="color:var(--moss);letter-spacing:.1em;margin-bottom:4px">ДНЕВНАЯ ЦЕЛЬ</div>
          <div style="font-family:'Fraunces',serif;font-size:24px;font-weight:600;color:var(--moss)">${target} ккал</div>
          <div style="font-size:11.5px;color:var(--moss);opacity:.85;margin-top:2px">Б 30% · Ж 25% · У 45%</div>
        </div>

        <div class="field">
          <label>Цель питания</label>
          <div style="display:grid;gap:6px;margin-top:6px">
            ${Object.keys(GOAL_LABELS).map(k => `
              <button type="button" data-goal="${k}" style="padding:12px 14px;border-radius:12px;text-align:left;font-size:14px;font-weight:600;background:${goal===k ? 'var(--moss-soft)' : 'var(--paper)'};color:${goal===k ? 'var(--moss)' : 'var(--ink)'};border:1.5px solid ${goal===k ? 'var(--moss)' : 'var(--line)'};cursor:pointer;transition:all .15s;">${GOAL_LABELS[k]}</button>
            `).join('')}
          </div>
        </div>

        <div class="field">
          <label>Бюджет</label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px">
            ${FOOD_TIERS.map(t => `
              <button type="button" data-tier="${t.key}" style="padding:10px 12px;border-radius:10px;font-size:12.5px;font-weight:600;text-align:left;background:${tier===t.key ? 'var(--moss-soft)' : 'var(--paper)'};color:${tier===t.key ? 'var(--moss)' : 'var(--ink)'};border:1.5px solid ${tier===t.key ? 'var(--moss)' : 'var(--line)'};cursor:pointer;transition:all .15s;">${t.label}</button>
            `).join('')}
          </div>
        </div>

        <div class="field">
          <label>Приёмов в день</label>
          <div style="display:flex;gap:6px;margin-top:6px">
            ${[3,4,5].map(n => `
              <button type="button" data-meals="${n}" style="flex:1;padding:12px;border-radius:12px;font-size:15px;font-weight:600;background:${mealsPerDay===n ? 'var(--moss)' : 'var(--paper)'};color:${mealsPerDay===n ? '#fff' : 'var(--ink)'};border:1.5px solid ${mealsPerDay===n ? 'var(--moss)' : 'var(--line)'};cursor:pointer;transition:all .15s;">${n}</button>
            `).join('')}
          </div>
        </div>

        <div class="field">
          <label>Тип питания</label>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">
            ${DIET_OPTIONS.map(d => `
              <button type="button" data-diet="${d}" style="padding:9px 14px;border-radius:10px;font-size:13px;font-weight:600;background:${diet===d ? 'var(--moss)' : 'var(--paper)'};color:${diet===d ? '#fff' : 'var(--ink)'};border:1px solid ${diet===d ? 'var(--moss)' : 'var(--line)'};cursor:pointer;transition:all .15s;">${esc(d)}</button>
            `).join('')}
          </div>
        </div>

        <div class="field">
          <label>Исключить (аллергии)</label>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">
            ${EXCLUSIONS.map(ex => {
              const on = exclusions.includes(ex.key);
              return `<button type="button" data-ex="${ex.key}" style="padding:7px 12px;border-radius:100px;font-size:12px;font-weight:600;background:${on ? 'var(--rust)' : 'var(--paper)'};color:${on ? '#fff' : 'var(--ink-soft)'};border:1px solid ${on ? 'var(--rust)' : 'var(--line)'};cursor:pointer;transition:all .15s;">${on ? '✕ ' : ''}${esc(ex.label)}</button>`;
            }).join('')}
          </div>
        </div>

        <button class="btn btn-primary btn-full btn-lg" id="genPlan" type="button" style="margin-top:8px">
          ${generated ? '🔄 Перегенерировать' : '✨ Подобрать блюда'}
        </button>

        ${generated ? renderPlanPreview(generated) : ''}
      `;

      content.querySelectorAll('[data-goal]').forEach(b => b.onclick = () => { goal = b.dataset.goal; generated = null; SFX.tap(); draw(); });
      content.querySelectorAll('[data-meals]').forEach(b => b.onclick = () => { mealsPerDay = +b.dataset.meals; generated = null; SFX.tap(); draw(); });
      content.querySelectorAll('[data-diet]').forEach(b => b.onclick = () => { diet = b.dataset.diet; generated = null; SFX.tap(); draw(); });
      content.querySelectorAll('[data-tier]').forEach(b => b.onclick = () => { tier = b.dataset.tier; generated = null; SFX.tap(); draw(); });
      content.querySelectorAll('[data-ex]').forEach(b => b.onclick = () => {
        const k = b.dataset.ex;
        if (exclusions.includes(k)) exclusions = exclusions.filter(x => x !== k);
        else exclusions.push(k);
        generated = null; SFX.tap(); draw();
      });
      content.querySelector('#genPlan').onclick = () => {
        N.S.nutrition.preferences = { mealGoal:goal, mealsPerDay, diet, tier, exclusions:[...exclusions] };
        saveState();
        const slots = generatePlanSlots();
        if (!slots.length){
          toast('Мало подходящих компонентов — ослабь фильтры', 3000);
          generated = null; draw(); return;
        }
        generated = { slots };
        SFX.ok(); buzz(12);
        draw();
      };

      const applyBtn = content.querySelector('#applyPlan');
      if (applyBtn) applyBtn.onclick = () => {
        const oldPlan = getPlan(ds);
        const confirmedOld = oldPlan ? oldPlan.slots.filter(s => s.confirmed) : [];

        // Синхронизировать с дневником: удалить старые неподтверждённые (если были)
        const day = N.S.nutrition.days[ds];
        const oldPending = oldPlan ? oldPlan.slots.filter(s => !s.confirmed) : [];
        oldPending.forEach(s => {
          const planId = 'plan_' + s.id;
          if (day && day.meals[s.mealId]){
            day.meals[s.mealId] = day.meals[s.mealId].filter(it => it.planId !== planId);
          }
        });

        const newPlan = {
          slots: [
            ...confirmedOld,
            ...generated.slots.map(s => ({ ...s, confirmed: false, confirmedAt: null }))
          ]
        };
        savePlan(ds, newPlan);
        closeModal(layer);
        toast('План сохранён. Подтверди приёмы кнопкой «Съел(а)»', 3200, 'gold');
        SFX.ok(); buzz(12);
        go('nutrition');
      };

      const cancelBtn = content.querySelector('#cancelPlan');
      if (cancelBtn) cancelBtn.onclick = () => closeModal(layer);
    }

    function renderPlanPreview(plan){
      const tot = planTotals(plan);
      const comp = goalCompliance(tot, goal);
      const mp = macroPct(tot);
      const diffAbs = Math.abs(comp.diff);
      const complianceColor = diffAbs < comp.targetKcal * 0.08 ? 'var(--moss)'
                            : diffAbs < comp.targetKcal * 0.2 ? 'var(--amber-dim)'
                            : 'var(--rust)';

      return `
        <div style="margin-top:18px;padding-top:18px;border-top:1px solid var(--line)">
          <div class="tiny" style="margin-bottom:10px;letter-spacing:.1em">ПРЕДПРОСМОТР</div>
          ${plan.slots.map(s => `
            <div style="padding:12px 14px;background:var(--paper);border-radius:12px;margin-bottom:8px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                <div style="font-size:11px;font-weight:600;color:var(--ink-mute);text-transform:uppercase;letter-spacing:.06em">${s.icon} ${esc(s.label)}</div>
                <div style="font-size:12px;font-weight:700;color:var(--moss);background:var(--moss-soft);padding:2px 8px;border-radius:100px">${s.totalKcal} ккал</div>
              </div>
              ${s.components.map(c => `
                <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;border-bottom:1px dashed var(--line)">
                  <span style="color:var(--ink)">${esc(c.name)} <b style="color:var(--moss)">${c.grams}${c.unit}</b></span>
                  <span style="color:var(--ink-soft);font-size:11.5px">Б ${Math.round(c.per100.p*c.grams/100)} · Ж ${Math.round(c.per100.f*c.grams/100)} · У ${Math.round(c.per100.c*c.grams/100)}</span>
                </div>
              `).join('')}
              <div style="display:flex;gap:10px;font-size:11.5px;color:var(--moss);margin-top:8px">
                <span>Итого Б ${s.totalP}г</span>
                <span>Ж ${s.totalF}г</span>
                <span>У ${s.totalC}г</span>
              </div>
            </div>
          `).join('')}

          <div style="padding:14px 16px;background:var(--moss-soft);border-radius:12px;margin-top:6px">
            <div class="tiny" style="color:var(--moss);letter-spacing:.1em;margin-bottom:6px">ИТОГО ПО ПЛАНУ</div>
            <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:600;color:var(--moss);margin-bottom:4px;flex-wrap:wrap;gap:6px">
              <span>${tot.kcal} ккал</span>
              <span>Б ${tot.p} · Ж ${tot.f} · У ${tot.c}</span>
            </div>
            <div style="font-size:12.5px;color:var(--moss);opacity:.9;margin-bottom:4px">
              Цель: <b>${comp.targetKcal}</b> ккал ·
              <b style="color:${complianceColor}">${comp.pct}%</b>
              ${diffAbs < 100 ? ' ✓' : ` (${comp.diff > 0 ? '+' : ''}${comp.diff})`}
            </div>
            <div style="font-size:11.5px;color:var(--moss);opacity:.8">
              БЖУ по калориям: <b>${mp.p}/${mp.f}/${mp.c}%</b> · цель 30/25/45
            </div>
          </div>

          <p class="muted" style="font-size:11.5px;line-height:1.55;margin-top:14px;text-align:center">
            План не добавляется автоматически. Каждое блюдо можно отредактировать (кнопка ✎) — поменять граммовки, добавить или удалить компоненты.
          </p>

          <div style="display:flex;gap:10px;margin-top:16px">
            <button class="btn btn-ghost btn-full" id="cancelPlan" type="button">Отмена</button>
            <button class="btn btn-primary btn-full btn-lg" id="applyPlan" type="button">Сохранить план</button>
          </div>
        </div>
      `;
    }

    draw();
  });
}

/* ═══════════════════════════════════════════════════════════════════
   РУЧНОЕ ДОБАВЛЕНИЕ
   ═══════════════════════════════════════════════════════════════════ */
function openAddFoodModal(mealId, ds){
  addFoodTarget = { mealId, ds };
  const allFoods = [...FOOD_DB, ...(N.S.nutrition.myFoods || [])];
  let activeCat = 'all';
  let activeTier = 'any';

  openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom:14px">Добавить в ${MEAL_NAMES[mealId]}</div>
    <div class="food-tabs">
      <button class="food-tab on" data-tab="db" type="button">📚 База</button>
      <button class="food-tab" data-tab="custom" type="button">✏️ Свой</button>
    </div>
    <div id="tab-db">
      <input class="food-search" id="foodSearch" placeholder="Поиск продукта..." autocomplete="off">
      <div class="tiny" style="margin-bottom:6px">КАТЕГОРИЯ</div>
      <div id="catList" style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px"></div>
      <div class="tiny" style="margin-bottom:6px">БЮДЖЕТ</div>
      <div id="tierList" style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:12px"></div>
      <div class="food-list" id="foodList"></div>
      <div class="tiny" style="margin-bottom:8px">Порция (граммы)</div>
      <div class="portion-row" id="portionRow">
        ${[50,100,150,200,250,300].map(g => `<button class="portion-btn ${g===100?'on':''}" data-portion="${g}" type="button">${g}г</button>`).join('')}
      </div>
      <div class="field"><label>Или точное значение</label><input id="customGrams" type="number" value="100" min="1"></div>
      <div id="selectedFoodInfo" class="muted" style="text-align:center;margin-bottom:12px;font-size:13px">Выбери продукт</div>
      <div style="display:flex;gap:10px">
        <button class="btn btn-ghost btn-full" id="afCancel" type="button">Отмена</button>
        <button class="btn btn-primary btn-full" id="afAdd" type="button" disabled>Добавить</button>
      </div>
    </div>
    <div id="tab-custom" style="display:none">
      <div class="field"><label>Название</label><input id="cfName" placeholder="Например, Мой салат"></div>
      <div class="field-row">
        <div class="field"><label>Ккал/100г</label><input id="cfKcal" type="number" placeholder="0"></div>
        <div class="field"><label>Белки/100г</label><input id="cfP" type="number" placeholder="0"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Жиры/100г</label><input id="cfF" type="number" placeholder="0"></div>
        <div class="field"><label>Углеводы/100г</label><input id="cfC" type="number" placeholder="0"></div>
      </div>
      <div class="field"><label>Граммы</label><input id="cfGrams" type="number" value="100" min="1"></div>
      <div style="display:flex;gap:10px">
        <button class="btn btn-ghost btn-full" id="cfCancel" type="button">Отмена</button>
        <button class="btn btn-primary btn-full" id="cfAdd" type="button">Добавить</button>
      </div>
    </div>`, m => {
    let selectedFood = null, grams = 100;
    const listEl = m.querySelector('#foodList');
    const searchEl = m.querySelector('#foodSearch');
    const catList = m.querySelector('#catList');
    const tierList = m.querySelector('#tierList');

    catList.innerHTML = `<button type="button" data-cat="all" style="padding:6px 10px;border-radius:100px;font-size:11.5px;font-weight:600;cursor:pointer;border:1px solid var(--line);background:var(--paper);color:var(--ink-soft)">Все</button>` +
      NUTRITION_CATEGORIES.map(c => `<button type="button" data-cat="${c.key}" style="padding:6px 10px;border-radius:100px;font-size:11.5px;font-weight:600;cursor:pointer;border:1px solid var(--line);background:var(--paper);color:var(--ink-soft)">${c.label}</button>`).join('');
    tierList.innerHTML = FOOD_TIERS.map(t => `<button type="button" data-tier="${t.key}" style="padding:6px 10px;border-radius:100px;font-size:11.5px;font-weight:600;cursor:pointer;border:1px solid var(--line);background:var(--paper);color:var(--ink-soft)">${t.label}</button>`).join('');

    const drawTabs = () => {
      catList.querySelectorAll('[data-cat]').forEach(b => {
        const on = b.dataset.cat === activeCat;
        b.style.background = on ? 'var(--moss)' : 'var(--paper)';
        b.style.color = on ? '#fff' : 'var(--ink-soft)';
        b.style.borderColor = on ? 'var(--moss)' : 'var(--line)';
      });
      tierList.querySelectorAll('[data-tier]').forEach(b => {
        const on = b.dataset.tier === activeTier;
        b.style.background = on ? 'var(--moss)' : 'var(--paper)';
        b.style.color = on ? '#fff' : 'var(--ink-soft)';
        b.style.borderColor = on ? 'var(--moss)' : 'var(--line)';
      });
    };
    catList.querySelectorAll('[data-cat]').forEach(b => b.onclick = () => { activeCat = b.dataset.cat; SFX.tap(); drawTabs(); renderList(searchEl.value); });
    tierList.querySelectorAll('[data-tier]').forEach(b => b.onclick = () => { activeTier = b.dataset.tier; SFX.tap(); drawTabs(); renderList(searchEl.value); });
    drawTabs();

    const renderList = filter => {
      let filtered = allFoods.filter(f => !filter || f.n.toLowerCase().includes(filter.toLowerCase()));
      if (activeCat !== 'all') filtered = filtered.filter(f => f.category === activeCat);
      if (activeTier !== 'any') filtered = filtered.filter(f => (f.tier || 'standard') === activeTier);
      listEl.innerHTML = filtered.length ? filtered.map((f, i) => {
        const junk = f.tag === 'junk';
        const healthy = f.tag === 'healthy';
        const tierInfo = TIER_BADGE[f.tier || 'standard'];
        return `
        <div class="food-item" data-fi="${i}">
          <div style="flex:1;min-width:0">
            <div class="food-item-name">${esc(f.n)}</div>
            <div class="food-item-info" style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
              <span>Б ${f.p} · Ж ${f.f} · У ${f.c}</span>
              <span style="font-size:9.5px;padding:1px 6px;border-radius:6px;background:${tierInfo.bg};color:${tierInfo.color};font-weight:600">${tierInfo.label}</span>
              ${healthy ? '<span style="font-size:9px;padding:1px 5px;border-radius:5px;background:var(--moss-soft);color:var(--moss);font-weight:600">полезно</span>' : ''}
              ${junk ? '<span style="font-size:9px;padding:1px 5px;border-radius:5px;background:rgba(164,80,58,.12);color:var(--rust);font-weight:600">не особо</span>' : ''}
            </div>
          </div>
          <div class="food-item-kcal">${f.kcal}<small> ккал</small></div>
        </div>`;
      }).join('') : '<div style="padding:20px;text-align:center" class="muted">Не найдено</div>';
      $$('.food-item', listEl).forEach(el => {
        el.onclick = () => {
          selectedFood = filtered[+el.dataset.fi];
          const kcal = Math.round(selectedFood.kcal*grams/100);
          m.querySelector('#selectedFoodInfo').innerHTML = `<b>${esc(selectedFood.n)}</b><br>${grams}г = ${kcal} ккал`;
          m.querySelector('#afAdd').disabled = false;
          SFX.tap(); buzz(6);
        };
      });
    };
    renderList('');
    searchEl.oninput = () => renderList(searchEl.value);

    m.querySelectorAll('.portion-btn').forEach(b => b.onclick = () => {
      grams = +b.dataset.portion;
      m.querySelectorAll('.portion-btn').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      m.querySelector('#customGrams').value = grams;
      if (selectedFood){
        const kcal = Math.round(selectedFood.kcal*grams/100);
        m.querySelector('#selectedFoodInfo').innerHTML = `<b>${esc(selectedFood.n)}</b><br>${grams}г = ${kcal} ккал`;
      }
    });
    m.querySelector('#customGrams').oninput = () => {
      grams = Math.max(1, +m.querySelector('#customGrams').value || 0);
      m.querySelectorAll('.portion-btn').forEach(x => x.classList.remove('on'));
      if (selectedFood){
        const kcal = Math.round(selectedFood.kcal*grams/100);
        m.querySelector('#selectedFoodInfo').innerHTML = `<b>${esc(selectedFood.n)}</b><br>${grams}г = ${kcal} ккал`;
      }
    };
    m.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => {
      m.querySelectorAll('[data-tab]').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      m.querySelector('#tab-db').style.display = b.dataset.tab === 'db' ? 'block' : 'none';
      m.querySelector('#tab-custom').style.display = b.dataset.tab === 'custom' ? 'block' : 'none';
    });
    m.querySelector('#afCancel').onclick = () => closeModal(m);
    m.querySelector('#afAdd').onclick = () => {
      if (!selectedFood) return;
      const day = N.S.nutrition.days[addFoodTarget.ds];
      day.meals[addFoodTarget.mealId].push({
        n: selectedFood.n, grams,
        kcal: selectedFood.kcal, p: selectedFood.p, f: selectedFood.f, c: selectedFood.c,
        tag: selectedFood.tag, tier: selectedFood.tier || 'standard'
      });
      saveState(); closeModal(m); go('nutrition');
      if (window.Achievements) window.Achievements.check();
      toast(`Добавлено: ${selectedFood.n} ${grams}г`);
    };
    m.querySelector('#cfCancel').onclick = () => closeModal(m);
    m.querySelector('#cfAdd').onclick = () => {
      const n = m.querySelector('#cfName').value.trim();
      const kcal = +m.querySelector('#cfKcal').value || 0;
      const p = +m.querySelector('#cfP').value || 0;
      const f = +m.querySelector('#cfF').value || 0;
      const c = +m.querySelector('#cfC').value || 0;
      const g = Math.max(1, +m.querySelector('#cfGrams').value || 100);
      if (!n || !kcal){ toast('Введи название и ккал'); return; }
      if (!N.S.nutrition.myFoods) N.S.nutrition.myFoods = [];
      N.S.nutrition.myFoods.push({ n, kcal, p, f, c, tag:'neutral', tier:'standard' });
      const day = N.S.nutrition.days[addFoodTarget.ds];
      day.meals[addFoodTarget.mealId].push({ n, grams: g, kcal, p, f, c, tag:'neutral', tier:'standard' });
      saveState(); closeModal(m); go('nutrition');
      toast(`Добавлено: ${n} ${g}г`);
    };
  });
}

/* ═══ Weight / Goals ═══ */
function openWeightModal(){
  const last = N.S.nutrition.weights.length ? N.S.nutrition.weights[N.S.nutrition.weights.length-1].weight : N.S.nutrition.user.weight;
  openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom:16px">⚖️ Вес</div>
    <div class="field"><label>Текущий вес (кг)</label><input id="wIn" type="number" step="0.1" value="${last}"></div>
    <p class="muted" style="margin-bottom:16px;font-size:12.5px">Запись сохраняется с датой.</p>
    <div style="display:flex;gap:10px">
      <button class="btn btn-ghost btn-full" id="wCancel" type="button">Отмена</button>
      <button class="btn btn-primary btn-full" id="wSave" type="button">Сохранить</button>
    </div>`, m => {
    m.querySelector('#wCancel').onclick = () => closeModal(m);
    m.querySelector('#wSave').onclick = () => {
      const w = parseFloat(m.querySelector('#wIn').value);
      if (!w || w < 20 || w > 400){ toast('Неверное значение'); return; }
      const today = todayKey();
      const idx = N.S.nutrition.weights.findIndex(x => x.date === today);
      if (idx >= 0) N.S.nutrition.weights[idx].weight = w;
      else N.S.nutrition.weights.push({ date: today, weight: w });
      N.S.nutrition.user.weight = w;
      saveState(); closeModal(m); go('nutrition'); toast('Вес сохранён');
    };
  });
}
function openMacroGoalsModal(){
  const g = N.S.nutrition.goals;
  openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom:16px">🎯 Дневные цели</div>
    <div class="field"><label>Калории (ккал)</label><input id="gKcal" type="number" value="${g.calories}"></div>
    <div class="field-row">
      <div class="field"><label>Белки (г)</label><input id="gP" type="number" value="${g.protein}"></div>
      <div class="field"><label>Жиры (г)</label><input id="gF" type="number" value="${g.fat}"></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Углеводы (г)</label><input id="gC" type="number" value="${g.carbs}"></div>
      <div class="field"><label>Вода (мл)</label><input id="gW" type="number" value="${g.water}"></div>
    </div>
    <button class="btn btn-ghost btn-full" id="calcTDEE" type="button" style="margin-bottom:16px">🧮 Рассчитать по формуле</button>
    <div style="display:flex;gap:10px">
      <button class="btn btn-ghost btn-full" id="mgCancel" type="button">Отмена</button>
      <button class="btn btn-primary btn-full" id="mgSave" type="button">Сохранить</button>
    </div>`, m => {
    m.querySelector('#mgCancel').onclick = () => closeModal(m);
    m.querySelector('#mgSave').onclick = () => {
      N.S.nutrition.goals = {
        calories: +m.querySelector('#gKcal').value || 2000,
        protein: +m.querySelector('#gP').value || 100,
        fat: +m.querySelector('#gF').value || 70,
        carbs: +m.querySelector('#gC').value || 250,
        water: +m.querySelector('#gW').value || 2000
      };
      saveState(); closeModal(m); go('nutrition'); toast('Цели сохранены');
    };
    m.querySelector('#calcTDEE').onclick = () => {
      const u = N.S.nutrition.user;
      const bmr = u.gender === 'm'
        ? 10*u.weight + 6.25*u.height - 5*u.age + 5
        : 10*u.weight + 6.25*u.height - 5*u.age - 161;
      let tdee = Math.round(bmr * u.activity);
      const goalType = N.S.nutrition.preferences.mealGoal;
      if (goalType === 'lose') tdee = Math.round(tdee*0.85);
      else if (goalType === 'gain') tdee = Math.round(tdee*1.15);
      m.querySelector('#gKcal').value = tdee;
      m.querySelector('#gP').value = Math.round((tdee*0.30)/4);
      m.querySelector('#gF').value = Math.round((tdee*0.25)/9);
      m.querySelector('#gC').value = Math.round((tdee*0.45)/4);
      toast('Рассчитано · БЖУ 30/25/45');
    };
  });
}

window.App.registerScreen('nutrition', renderNutrition);
N.nutritionToday = nutritionToday;
})();