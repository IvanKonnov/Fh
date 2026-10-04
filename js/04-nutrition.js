/* ═══ NAVLIFE · NUTRITION ═══ */
(function(){
'use strict';
const N = window.__nav;
const { go, saveState, esc, todayKey, fmtDate, openModal, closeModal, toast, SFX, buzz, dowShort, $, $$ } = N;

const FOOD_DB = [
  {n:'Овсянка на воде',kcal:88,p:3,f:1.7,c:15},
  {n:'Рис варёный',kcal:116,p:2.2,f:0.5,c:25},
  {n:'Гречка варёная',kcal:110,p:4,f:1.2,c:21},
  {n:'Макароны варёные',kcal:131,p:5,f:1.1,c:25},
  {n:'Куриная грудка',kcal:165,p:31,f:3.6,c:0},
  {n:'Индейка филе',kcal:189,p:29,f:7,c:0},
  {n:'Говядина',kcal:250,p:26,f:16,c:0},
  {n:'Свинина',kcal:290,p:25,f:21,c:0},
  {n:'Лосось',kcal:208,p:20,f:13,c:0},
  {n:'Треска',kcal:82,p:18,f:0.7,c:0},
  {n:'Тунец консерв.',kcal:116,p:26,f:1,c:0},
  {n:'Яйцо куриное',kcal:155,p:13,f:11,c:1.1},
  {n:'Творог 5%',kcal:121,p:17,f:5,c:3},
  {n:'Творог 2%',kcal:103,p:18,f:2,c:3.3},
  {n:'Молоко 2.5%',kcal:52,p:2.8,f:2.5,c:4.7},
  {n:'Кефир 1%',kcal:40,p:3,f:1,c:4},
  {n:'Сыр твёрдый',kcal:364,p:25,f:29,c:2},
  {n:'Йогурт натуральный',kcal:66,p:5,f:3.5,c:4},
  {n:'Хлеб белый',kcal:265,p:9,f:3,c:49},
  {n:'Хлеб чёрный',kcal:210,p:7,f:1,c:40},
  {n:'Картофель варёный',kcal:87,p:2,f:0.1,c:20},
  {n:'Банан',kcal:89,p:1.1,f:0.3,c:23},
  {n:'Яблоко',kcal:52,p:0.3,f:0.2,c:14},
  {n:'Апельсин',kcal:47,p:0.9,f:0.1,c:12},
  {n:'Виноград',kcal:69,p:0.7,f:0.2,c:18},
  {n:'Авокадо',kcal:160,p:2,f:15,c:9},
  {n:'Огурец',kcal:15,p:0.7,f:0.1,c:3.6},
  {n:'Помидор',kcal:18,p:0.9,f:0.2,c:3.9},
  {n:'Морковь',kcal:41,p:0.9,f:0.2,c:10},
  {n:'Капуста белая',kcal:25,p:1.3,f:0.1,c:6},
  {n:'Брокколи',kcal:34,p:2.8,f:0.4,c:7},
  {n:'Орехи грецкие',kcal:654,p:15,f:65,c:14},
  {n:'Миндаль',kcal:579,p:21,f:50,c:22},
  {n:'Оливковое масло',kcal:884,p:0,f:100,c:0},
  {n:'Сливочное масло',kcal:717,p:0.8,f:81,c:0.1},
  {n:'Кофе с молоком',kcal:35,p:1.5,f:1.5,c:4},
  {n:'Чай без сахара',kcal:1,p:0,f:0,c:0.2},
  {n:'Сок апельсиновый',kcal:45,p:0.7,f:0.2,c:10},
  {n:'Протеиновый батончик',kcal:180,p:20,f:6,c:15},
  {n:'Шоколад тёмный 70%',kcal:598,p:7.8,f:43,c:46},
  {n:'Печенье',kcal:417,p:5,f:20,c:60},
  {n:'Салат Цезарь',kcal:190,p:9,f:14,c:7},
  {n:'Борщ',kcal:60,p:2.5,f:2.5,c:7},
  {n:'Суп куриный',kcal:45,p:3,f:2,c:3},
  {n:'Плов',kcal:200,p:7,f:7,c:27},
  {n:'Пицца Маргарита',kcal:266,p:11,f:10,c:33},
  {n:'Сэндвич с курицей',kcal:240,p:15,f:8,c:26}
];

const MEAL_NAMES = { breakfast:'Завтрак', lunch:'Обед', dinner:'Ужин', snack:'Перекус' };
let addFoodTarget = null;

function nutritionToday(date){
  const ds = date || todayKey();
  if (!N.S.nutrition.days[ds]) N.S.nutrition.days[ds] = { meals:{breakfast:[],lunch:[],dinner:[],snack:[]}, water:0, notes:'' };
  const d = N.S.nutrition.days[ds];
  if (!d.meals) d.meals = { breakfast:[], lunch:[], dinner:[], snack:[] };
  ['breakfast','lunch','dinner','snack'].forEach(k => { if (!d.meals[k]) d.meals[k] = []; });
  let kcal = 0, prot = 0, fat = 0, carb = 0;
  ['breakfast','lunch','dinner','snack'].forEach(m => {
    (d.meals[m] || []).forEach(item => {
      const f = item.grams / 100;
      kcal += item.kcal*f; prot += item.p*f; fat += item.f*f; carb += item.c*f;
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

function renderNutrition(){
  const today = todayKey();
  if (!N.S.nutrition.viewDate){
    N.S.nutrition.viewDate = today;
  } else if (N.S.nutrition.viewDate < today && !N.S.nutrition._manualDate){
    N.S.nutrition.viewDate = today;
  }
  const ds = N.S.nutrition.viewDate;
  if (!N.S.nutrition.days[ds]) N.S.nutrition.days[ds] = { meals:{breakfast:[],lunch:[],dinner:[],snack:[]}, water:0, notes:'' };
  const d = N.S.nutrition.days[ds];
  if (!d.meals) d.meals = { breakfast:[], lunch:[], dinner:[], snack:[] };
  ['breakfast','lunch','dinner','snack'].forEach(k => { if (!d.meals[k]) d.meals[k] = []; });

  const nut = nutritionToday(ds);
  const g = N.S.nutrition.goals;
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
    <div class="nutri-hero"><div style="position:relative;z-index:1">
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
    ${MEALS.map(m => {
      const items = d.meals[m.id] || [];
      const mealKcal = items.reduce((s, it) => s + it.kcal*it.grams/100, 0);
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
            ${items.length ? items.map((it, idx) => `
              <div class="food-row">
                <div class="food-row-main">
                  <div class="food-row-name">${esc(it.n)}</div>
                  <div class="food-row-macros">
                    <span>${it.grams}г</span>
                    <span class="mp">Б ${Math.round(it.p*it.grams/100)}</span>
                    <span class="mf">Ж ${Math.round(it.f*it.grams/100)}</span>
                    <span class="mc">У ${Math.round(it.c*it.grams/100)}</span>
                  </div>
                </div>
                <div class="food-row-kcal">${Math.round(it.kcal*it.grams/100)}<small> ккал</small></div>
                <button class="icon-btn btn-danger" style="width:30px;height:30px;font-size:12px" data-del-food="${m.id}|${idx}" type="button">✕</button>
              </div>
            `).join('') : '<div class="meal-empty">Пока пусто. Добавь продукты.</div>'}
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
    if (t && !e.target.closest('[data-meal-add]') && !e.target.closest('[data-del-food]')){
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

function openAddFoodModal(mealId, ds){
  addFoodTarget = { mealId, ds };
  const allFoods = [...FOOD_DB, ...(N.S.nutrition.myFoods || [])];
  openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom:14px">Добавить в ${MEAL_NAMES[mealId]}</div>
    <div class="food-tabs">
      <button class="food-tab on" data-tab="db" type="button">📚 База</button>
      <button class="food-tab" data-tab="custom" type="button">✏️ Свой</button>
    </div>
    <div id="tab-db">
      <input class="food-search" id="foodSearch" placeholder="Поиск продукта..." autocomplete="off">
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
    const renderList = filter => {
      const filtered = allFoods.filter(f => !filter || f.n.toLowerCase().includes(filter.toLowerCase()));
      listEl.innerHTML = filtered.length ? filtered.map((f, i) => `
        <div class="food-item" data-fi="${i}">
          <div style="flex:1">
            <div class="food-item-name">${esc(f.n)}</div>
            <div class="food-item-info">Б ${f.p} · Ж ${f.f} · У ${f.c}</div>
          </div>
          <div class="food-item-kcal">${f.kcal}<small> ккал</small></div>
        </div>`).join('') : '<div style="padding:20px;text-align:center" class="muted">Не найдено</div>';
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
        kcal: selectedFood.kcal, p: selectedFood.p, f: selectedFood.f, c: selectedFood.c
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
      N.S.nutrition.myFoods.push({ n, kcal, p, f, c });
      const day = N.S.nutrition.days[addFoodTarget.ds];
      day.meals[addFoodTarget.mealId].push({ n, grams: g, kcal, p, f, c });
      saveState(); closeModal(m); go('nutrition');
      toast(`Добавлено: ${n} ${g}г`);
    };
  });
}

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
      if (u.goalType === 'lose') tdee = Math.round(tdee*0.85);
      else if (u.goalType === 'gain') tdee = Math.round(tdee*1.15);
      m.querySelector('#gKcal').value = tdee;
      m.querySelector('#gP').value = Math.round(u.weight*1.8);
      m.querySelector('#gF').value = Math.round(tdee*0.25/9);
      m.querySelector('#gC').value = Math.round(tdee*0.45/4);
      toast('Рассчитано по формуле Миффлина');
    };
  });
}

window.App.registerScreen('nutrition', renderNutrition);
N.nutritionToday = nutritionToday;
})();