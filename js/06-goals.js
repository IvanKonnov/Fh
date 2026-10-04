/* ═══ NAVLIFE · GOALS / PROGRAMS / KNOWLEDGE / RUNNER ═══ */
(function(){
'use strict';
const N = window.__nav;
const { go, saveState, esc, uid, todayKey, toMin, openModal, closeModal, toast,
        SFX, buzz, pad2, levelInfo, $, $$ } = N;

const BUILTIN_PROGRAMS = [
  {title:'Утро',category:'утро',description:'Начать день осознанно.',
   steps:[
     {title:'Подъём',type:'checkbox',instructions:'Встань и потянись.',why:'Плавное пробуждение.'},
     {title:'Открыть окно',type:'checkbox',instructions:'Проветри.',why:'Свежий воздух.'},
     {title:'Умыться',type:'checkbox',instructions:'Прохладной водой.',why:'Бодрость.'},
     {title:'Прополоскать рот',type:'checkbox',why:'Гигиена.'},
     {title:'Стакан воды',type:'checkbox',instructions:'200–300 мл.',why:'Восполнение жидкости.'},
     {title:'Заправить кровать',type:'checkbox',why:'Порядок в голове.'}
   ]},
  {title:'Зарядка',category:'физическая активность',description:'Полноценная тренировка.',
   steps:(() => {
     const pos = ['Положение 1','Положение 2','Положение 3','Положение 4','Положение 5'];
     const arr = [];
     pos.forEach((p, i) => {
       arr.push({title:`${p} — левая нога`, type:'timer', duration:30, why:'Координация.'});
       if (i < pos.length-1) arr.push({title:'Смена ноги', type:'pause', duration:5, why:'Переход.'});
       arr.push({title:`${p} — правая нога`, type:'timer', duration:30, why:'Баланс.'});
       if (i < pos.length-1) arr.push({title:'Смена положения', type:'pause', duration:5, why:'Подготовка.'});
     });
     arr.push(
       {title:'Лыжник лицом к резинке',type:'reps',repetitions:20,why:'Разогрев.'},
       {title:'Отведение от груди лицом',type:'reps',repetitions:20,why:'Грудные.'},
       {title:'Выносы рук вверх',type:'reps',repetitions:20,why:'Плечи.'},
       {title:'Лыжник спиной',type:'reps',repetitions:20,why:'Спина.'},
       {title:'Отведение от груди спиной',type:'reps',repetitions:20,why:'Плечи.'},
       {title:'Робот правая',type:'reps',repetitions:20,why:'Координация.'},
       {title:'Робот левая',type:'reps',repetitions:20,why:'Симметрия.'},
       {title:'Удар правой',type:'reps',repetitions:20,why:'Скорость.'},
       {title:'Удар левой',type:'reps',repetitions:20,why:'Скорость.'},
       {title:'Отжимания',type:'reps',repetitions:20,why:'Грудь.'},
       {title:'Приседания',type:'reps',repetitions:20,why:'Ноги.'},
       {title:'Гиперэкстензия',type:'reps',repetitions:20,why:'Спина.'},
       {title:'Пресс',type:'reps',repetitions:20,why:'Пресс.'},
       {title:'Подтягивания',type:'reps',repetitions:8,why:'Широчайшие.'},
       {title:'Вис на турнике',type:'timer',duration:120,why:'Вытяжение.'},
       {title:'Растяжка',type:'timer',duration:360,why:'Гибкость.'}
     );
     return arr;
   })()},
  {title:'Контрастный душ',category:'утро',description:'Закаливание.',
   steps:[
     {title:'Горячая вода',type:'timer',duration:50,why:'Расширяет сосуды.'},
     {title:'Переключение',type:'pause',duration:3,why:'Смена.'},
     {title:'Холодная',type:'timer',duration:40,why:'Бодрит.'},
     {title:'Переключение',type:'pause',duration:3,why:'Смена.'},
     {title:'Горячая',type:'timer',duration:40,why:'Расширение.'},
     {title:'Переключение',type:'pause',duration:3,why:'Смена.'},
     {title:'Холодная',type:'timer',duration:30,why:'Сужаем.'},
     {title:'Переключение',type:'pause',duration:3,why:'Смена.'},
     {title:'Горячая',type:'timer',duration:30,why:'Расширяем.'},
     {title:'Переключение',type:'pause',duration:3,why:'Смена.'},
     {title:'Холодная финал',type:'timer',duration:30,why:'Контраст.'},
     {title:'Завершение',type:'checkbox',why:'Готово.'}
   ]},
  {title:'Помодоро',category:'концентрация',description:'Классическая техника: 4 блока по 25 минут с короткими перерывами и длинным отдыхом в конце.',
   steps:[
     {title:'Работа · блок 1',type:'timer',duration:1500,instructions:'Полная концентрация. Убери телефон, закрой лишние вкладки.',why:'25 минут — оптимальная длительность для глубокой работы.'},
     {title:'Короткий перерыв',type:'pause',duration:300,instructions:'Встань, попей воды, разомнись.',why:'Даёт мозгу восстановиться перед следующим блоком.'},
     {title:'Работа · блок 2',type:'timer',duration:1500,instructions:'Вернись к задаче.',why:'Второй цикл помодоро.'},
     {title:'Короткий перерыв',type:'pause',duration:300,instructions:'Не залипай в телефоне — лучше размяться.',why:'Восстановление.'},
     {title:'Работа · блок 3',type:'timer',duration:1500,instructions:'Третий блок.',why:'Держим темп.'},
     {title:'Короткий перерыв',type:'pause',duration:300,instructions:'Отдохни.',why:'Отдых.'},
     {title:'Работа · блок 4',type:'timer',duration:1500,instructions:'Финальный блок.',why:'Последний рывок.'},
     {title:'Длинный перерыв',type:'pause',duration:900,instructions:'15 минут полноценного отдыха.',why:'После 4 помодоро организму нужен полноценный перерыв.'}
   ]},
  {title:'Вечер',category:'вечер',description:'Плавный переход ко сну.',
   steps:[
     {title:'Проверить обувь',type:'checkbox',why:'Утром меньше забот.'},
     {title:'Одежда на завтра',type:'checkbox',why:'Экономит время.'},
     {title:'Рюкзак/сумка',type:'checkbox',why:'Ничего не забудешь.'},
     {title:'Вода на окно',type:'checkbox',why:'Утро с воды.'},
     {title:'Завтрак заранее',type:'checkbox',why:'Готово утром.'},
     {title:'Планы на завтра',type:'checkbox',why:'Чёткий план.'},
     {title:'Будильник',type:'checkbox',why:'Не проспишь.'},
     {title:'Растяжка, проветрить',type:'checkbox',why:'Расслабление.'},
     {title:'Гигиена',type:'checkbox',why:'Чистота.'},
     {title:'Читать 30 мин',type:'timer',duration:1800,why:'Успокаивает.'},
     {title:'Похвалить себя',type:'checkbox',why:'Позитив.'},
     {title:'Отбой',type:'checkbox',why:'Спокойной ночи.'}
   ]}
];

const KNOWLEDGE = [
  {category:'привычки',title:'Маленькие действия работают лучше больших планов',
   what:'Привычка — действие, которое мозг выполняет с минимальным усилием.',
   why:'Сила воли истощается за день, а привычка — нет.',
   how:'Мозг закрепляет связь «сигнал → действие → награда».',
   apply:'Выбери один сигнал и привяжи к нему короткое действие.',
   example:'После чистки зубов — 5 отжиманий.'},
  {category:'концентрация',title:'Что крадёт внимание и как это остановить',
   what:'Переключение между задачами создаёт «остаточное внимание».',
   why:'Даже короткое отвлечение снижает качество следующих 10–20 минут.',
   how:'Переключение требует времени на загрузку контекста.',
   apply:'Планируй один фокус-блок без переключений.',
   example:'20 минут без телефона дают больше, чем час с проверками.'},
  {category:'сон',title:'Как режим сна влияет на решения',
   what:'Качество сна определяет, насколько легко мозг фильтрует важное.',
   why:'Недосып повышает тягу к быстрым удовольствиям.',
   how:'Во сне мозг закрепляет память и восстанавливает самоконтроль.',
   apply:'Зафиксируй время отхода и лёгкий ритуал за 20–30 минут.',
   example:'Свет, тишина, дыхание — сигнал телу.'},
  {category:'обучение',title:'Активное вспоминание против перечитывания',
   what:'Активное вспоминание — попытка воспроизвести по памяти.',
   why:'Тренирует достать знание из памяти.',
   how:'Каждая попытка вспомнить укрепляет нейронный путь.',
   apply:'Закрывай текст и перескажи по памяти.',
   example:'Сначала вспомни перевод, потом проверь.'},
  {category:'время',title:'Почему список дел не работает без времени',
   what:'Список без привязки ко времени — набор намерений.',
   why:'Мозг откладывает решения без дедлайна.',
   how:'Конкретное время превращает намерение в обязательство.',
   apply:'Перенеси три главные задачи в интервалы.',
   example:'«Написать отчёт» → «14:00–14:40».'},
  {category:'привычки',title:'Что делать после пропущенного дня',
   what:'Один пропущенный день — статистика, а не новая линия.',
   why:'Единичный пропуск почти не влияет на устойчивость. Вина — влияет.',
   how:'Самокритика воспринимается как стресс.',
   apply:'Просто вернись к следующему действию.',
   example:'Пропустил зарядку — сделай завтрашнюю обычно.'}
];

function seedIfEmpty(){
  if (N.S.navlife.programs.length === 0){
    N.S.navlife.programs = BUILTIN_PROGRAMS.map(p => ({
      ...p, id: uid('prog'), builtin: true,
      steps: p.steps.map(s => ({ ...s, id: uid('pstep') }))
    }));
  }
  if (!N.S.navlife.baseRoutine || N.S.navlife.baseRoutine.length === 0){
    N.S.navlife.baseRoutine = [
      {id: uid('base'), title:'Утро', startTime:'06:30', endTime:'06:50', programTitle:'Утро'},
      {id: uid('base'), title:'Зарядка', startTime:'06:50', endTime:'07:30', programTitle:'Зарядка'},
      {id: uid('base'), title:'Контрастный душ', startTime:'07:30', endTime:'07:50', programTitle:'Контрастный душ'},
      {id: uid('base'), title:'Завтрак', startTime:'08:00', endTime:'08:20'},
      {id: uid('base'), title:'Обед', startTime:'13:00', endTime:'13:30'},
      {id: uid('base'), title:'Ужин', startTime:'19:00', endTime:'19:30'},
      {id: uid('base'), title:'Вечер', startTime:'21:00', endTime:'22:00', programTitle:'Вечер'}
    ];
  }
  if (!N.S.navlife.customKnowledge) N.S.navlife.customKnowledge = [];
  if (!N.S.navlife.baseSkip) N.S.navlife.baseSkip = {};
  if (N.S.navlife.goals.length === 0){
    N.S.navlife.goals = [{
      id: uid('goal'), title:'Выучить английский', icon:'🇬🇧',
      description:'Хочу уверенно понимать английскую речь.',
      status:'active', createdAt: todayKey(),
      steps:[
        {id: uid('gstep'), title:'Повторять 20 слов', completed:false, linkedScheduleItemId:null, linkedProgramId:null},
        {id: uid('gstep'), title:'Слушать речь', completed:false, linkedScheduleItemId:null, linkedProgramId:null},
        {id: uid('gstep'), title:'Упражнения', completed:false, linkedScheduleItemId:null, linkedProgramId:null},
        {id: uid('gstep'), title:'Читать текст', completed:false, linkedScheduleItemId:null, linkedProgramId:null}
      ]
    }];
  }
}

function renderGoals(){
  const root = document.createElement('div');
  root.className = 'screen';
  root.innerHTML = `
    <div class="row" style="margin-bottom:16px;gap:10px">
      <button class="icon-btn" id="back" type="button">←</button>
      <div class="h1" style="flex:1">Цели</div>
      <button class="btn btn-primary btn-sm" id="addGoal" type="button">+ Цель</button>
    </div>
    ${N.S.navlife.goals.length ? N.S.navlife.goals.map(g => {
      const total = g.steps.length, done = g.steps.filter(s => s.completed).length;
      const pct = total ? Math.round(done/total*100) : 0;
      return `<div class="card goal-card">
        <div class="goal-head">
          <div class="goal-icon">${g.icon||'🎯'}</div>
          <div style="flex:1">
            <div class="goal-title">${esc(g.title)}</div>
            ${g.description ? `<p class="goal-desc">${esc(g.description)}</p>` : ''}
          </div>
          <button class="icon-btn btn-danger" style="width:32px;height:32px;font-size:13px" data-delgoal="${g.id}">✕</button>
        </div>
        <div class="goal-progress">
          <div class="top"><span>${total?pct+'%':'нет шагов'}</span><span>${done}/${total}</span></div>
          <div class="bar"><i class="on" style="--p:${(pct/100).toFixed(3)}"></i></div>
        </div>
        <ul class="goal-steps">
          ${g.steps.map(s => `<li class="${s.completed?'done':''}">
            <button class="check ${s.completed?'on':''}" data-tg="${g.id}|${s.id}">${s.completed?'✓':''}</button>
            <span style="flex:1">${esc(s.title)}</span>
          </li>`).join('')}
        </ul>
      </div>`;
    }).join('') : '<div class="card" style="text-align:center;padding:32px"><p class="muted">Пока нет целей.</p></div>'}
    <div style="height:20px"></div>`;

  root.querySelector('#back').onclick = () => go('today');
  root.querySelector('#addGoal').onclick = openGoalModal;
  root.addEventListener('click', e => {
    const t = e.target.closest('[data-tg]');
    if (t){
      const [gid, sid] = t.dataset.tg.split('|');
      const g = N.S.navlife.goals.find(x => x.id === gid);
      const s = g.steps.find(x => x.id === sid);
      s.completed = !s.completed; saveState(); go('goals');
      if (window.Achievements) window.Achievements.check();
    }
    const dg = e.target.closest('[data-delgoal]');
    if (dg && confirm('Удалить цель?')){
      N.S.navlife.goals = N.S.navlife.goals.filter(g => g.id !== dg.dataset.delgoal);
      saveState(); go('goals');
    }
  });
  return root;
}

function openGoalModal(){
  let steps = [''];
  openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom:16px">Новая цель</div>
    <div class="field-row">
      <div class="field" style="flex:0 0 70px"><label>Иконка</label><input id="gIcon" maxlength="2" value="🎯"></div>
      <div class="field"><label>Название</label><input id="gTitle" placeholder="Например, Выучить английский"></div>
    </div>
    <div class="field"><label>Описание</label><textarea id="gDesc" placeholder="Зачем тебе эта цель"></textarea></div>
    <div class="field"><label>Шаги</label>
      <div id="gSteps"></div>
      <button class="btn btn-line btn-sm" id="gAddStep" type="button" style="margin-top:6px">+ Шаг</button>
    </div>
    <div style="display:flex;gap:10px;margin-top:8px">
      <button class="btn btn-ghost btn-full" id="gCancel" type="button">Отмена</button>
      <button class="btn btn-primary btn-full" id="gSave" type="button">Сохранить</button>
    </div>`, m => {
    const draw = () => {
      m.querySelector('#gSteps').innerHTML = steps.map((s, i) => `<div style="display:flex;gap:6px;margin-bottom:6px">
        <input data-si="${i}" value="${esc(s)}" placeholder="Шаг" style="flex:1;border:1px solid var(--line);border-radius:9px;padding:8px 10px;font-size:13.5px;background:var(--surface);color:var(--ink)">
        <button class="icon-btn btn-danger" style="width:36px;height:36px;font-size:13px" data-sdel="${i}" type="button">✕</button>
      </div>`).join('');
      m.querySelectorAll('[data-si]').forEach(inp => inp.oninput = () => { steps[+inp.dataset.si] = inp.value; });
      m.querySelectorAll('[data-sdel]').forEach(b => b.onclick = () => { steps.splice(+b.dataset.sdel, 1); draw(); });
    };
    draw();
    m.querySelector('#gAddStep').onclick = () => { steps.push(''); draw(); };
    m.querySelector('#gCancel').onclick = () => closeModal(m);
    m.querySelector('#gSave').onclick = () => {
      const title = m.querySelector('#gTitle').value.trim();
      if (!title){ toast('Введи название'); return; }
      const st = steps.filter(s => s.trim()).map(s => ({id: uid('gstep'), title: s.trim(), completed:false, linkedScheduleItemId:null, linkedProgramId:null}));
      N.S.navlife.goals.push({
        id: uid('goal'), title, icon: m.querySelector('#gIcon').value || '🎯',
        description: m.querySelector('#gDesc').value.trim(),
        status:'active', createdAt: todayKey(), steps: st
      });
      saveState(); closeModal(m); go('goals'); toast('Цель добавлена');
      if (window.Achievements) window.Achievements.check();
    };
  });
}

function renderPrograms(){
  const root = document.createElement('div');
  root.className = 'screen';
  root.innerHTML = `
    <div class="row" style="margin-bottom:16px;gap:10px">
      <button class="icon-btn" id="back" type="button">←</button>
      <div class="h1" style="flex:1">Программы</div>
      <button class="btn btn-primary btn-sm" id="addProg" type="button">+ Своя</button>
    </div>
    <div class="prog-grid">
      ${N.S.navlife.programs.map(p => {
        const dur = p.steps.reduce((s, st) => s + (st.type === 'timer' ? st.duration : 20), 0);
        return `<div class="card prog-card" data-prog="${p.id}">
          <div class="cat">${esc(p.category)}${p.builtin ? '' : '<span class="badge-custom">своя</span>'}</div>
          <h4>${esc(p.title)}</h4>
          <div class="desc">${esc(p.description||'')}</div>
          <div class="foot"><span>${p.steps.length} этапов</span><span>~${Math.round(dur/60)} мин</span></div>
        </div>`;
      }).join('')}
    </div>
    <div style="height:20px"></div>`;
  root.querySelector('#back').onclick = () => go('today');
  root.querySelector('#addProg').onclick = () => openProgramEditor(null);
  root.addEventListener('click', e => {
    const p = e.target.closest('[data-prog]');
    if (p) openProgramView(p.dataset.prog);
  });
  return root;
}

function openProgramView(id){
  const p = N.S.navlife.programs.find(x => x.id === id);
  if (!p) return;
  openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom:6px">${esc(p.title)}</div>
    <p class="muted" style="margin-bottom:16px">${esc(p.description||'')}</p>
    <div style="max-height:44vh;overflow-y:auto;margin-bottom:16px">
      ${p.steps.map((s, i) => `<div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--line)">
        <div style="font-family:'Fraunces',serif;color:var(--moss);font-weight:600;min-width:22px">${i+1}</div>
        <div style="flex:1">
          <div style="font-weight:600;font-size:14px">${esc(s.title)}</div>
          ${s.instructions ? `<div class="muted" style="font-size:12.5px;margin-top:2px">${esc(s.instructions)}</div>` : ''}
          ${s.why ? `<div style="font-size:12px;color:var(--moss);margin-top:2px">Зачем: ${esc(s.why)}</div>` : ''}
        </div>
      </div>`).join('')}
    </div>
    <div style="display:flex;gap:10px">
      ${p.builtin ? '' : '<button class="btn btn-line" id="pvEdit" type="button">Изменить</button>'}
      <button class="btn btn-ghost btn-full" id="pvClose" type="button">Закрыть</button>
      <button class="btn btn-primary btn-full" id="pvStart" type="button">Начать</button>
    </div>`, m => {
    m.querySelector('#pvClose').onclick = () => closeModal(m);
    m.querySelector('#pvStart').onclick = () => { closeModal(m); startProgramRun(p.id, null); };
    const ed = m.querySelector('#pvEdit');
    if (ed) ed.onclick = () => { closeModal(m); setTimeout(() => openProgramEditor(p.id), 150); };
  });
}

function openProgramEditor(editId){
  const p = editId ? N.S.navlife.programs.find(x => x.id === editId) : null;
  const isEd = !!p;
  const isBuiltin = p && p.builtin;
  let steps = p ? JSON.parse(JSON.stringify(p.steps)) : [
    {id: uid('pstep'), title:'', type:'timer', duration:30, instructions:'', why:''}
  ];
  const CATS_LIST = ['утро','физическая активность','обучение','английский','чтение','концентрация','восстановление','дыхательные практики','вечер','подготовка ко сну','своё'];
  openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom:16px">${isEd ? (isBuiltin ? 'Копия программы' : 'Изменить программу') : 'Новая программа'}</div>
    <div class="field"><label>Название</label><input id="pTitle" value="${p?esc(p.title):''}" placeholder="Например, Утренняя зарядка"></div>
    <div class="field"><label>Категория</label>
      <select id="pCat">${CATS_LIST.map(c => `<option value="${esc(c)}" ${p && p.category === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>
    </div>
    <div class="field"><label>Описание</label><textarea id="pDesc" placeholder="Зачем эта программа">${p?esc(p.description||''):''}</textarea></div>
    <div class="field">
      <label>Этапы</label>
      <div id="pSteps"></div>
      <button class="btn btn-line btn-sm" id="addPStep" type="button" style="margin-top:8px">+ Этап</button>
    </div>
    <div style="display:flex;gap:10px;margin-top:16px">
      ${isEd && !isBuiltin ? '<button class="btn btn-line btn-danger" id="pDel" type="button">Удалить</button>' : ''}
      <button class="btn btn-ghost btn-full" id="pCancel" type="button">Отмена</button>
      <button class="btn btn-primary btn-full" id="pSave" type="button">${isBuiltin ? 'Сохранить копию' : 'Сохранить'}</button>
    </div>`, m => {
    const stepsEl = m.querySelector('#pSteps');
    const drawSteps = () => {
      stepsEl.innerHTML = steps.map((s, i) => `
        <div class="pstep">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
            <div style="font-family:'Fraunces',serif;color:var(--moss);font-weight:600;width:20px">${i+1}</div>
            <input data-si="${i}|title" value="${esc(s.title||'')}" placeholder="Название этапа" style="flex:1;border:1px solid var(--line);border-radius:9px;padding:8px 10px;font-size:13.5px;background:var(--surface);color:var(--ink)">
            <button class="icon-btn" data-sup="${i}" type="button" style="width:30px;height:30px;font-size:12px">↑</button>
            <button class="icon-btn" data-sdown="${i}" type="button" style="width:30px;height:30px;font-size:12px">↓</button>
            <button class="icon-btn btn-danger" data-sdel="${i}" type="button" style="width:30px;height:30px;font-size:12px">✕</button>
          </div>
          <div class="field-row" style="margin-bottom:8px">
            <div class="field" style="flex:0 0 130px;margin:0">
              <label>Тип</label>
              <select data-si="${i}|type">
                <option value="timer" ${s.type === 'timer' ? 'selected' : ''}>Таймер</option>
                <option value="reps" ${s.type === 'reps' ? 'selected' : ''}>Повторы</option>
                <option value="checkbox" ${s.type === 'checkbox' ? 'selected' : ''}>Чекбокс</option>
                <option value="pause" ${s.type === 'pause' ? 'selected' : ''}>Пауза</option>
                <option value="instruction" ${s.type === 'instruction' ? 'selected' : ''}>Инструкция</option>
              </select>
            </div>
            ${(s.type === 'timer' || s.type === 'pause') ? `<div class="field" style="margin:0"><label>Секунд</label><input type="number" min="1" data-si="${i}|duration" value="${s.duration||30}"></div>` : ''}
            ${s.type === 'reps' ? `<div class="field" style="margin:0"><label>Повторений</label><input type="number" min="1" data-si="${i}|repetitions" value="${s.repetitions||10}"></div>` : ''}
          </div>
          <div class="field" style="margin-bottom:8px"><label>Инструкция</label><input data-si="${i}|instructions" value="${esc(s.instructions||'')}" placeholder="Что делать"></div>
          <div class="field" style="margin:0"><label>Зачем этот этап</label><input data-si="${i}|why" value="${esc(s.why||'')}" placeholder="Зачем"></div>
        </div>
      `).join('');
      stepsEl.querySelectorAll('[data-si]').forEach(el => {
        const [k, field] = el.dataset.si.split('|');
        const handler = () => {
          const idx = +k;
          if (field === 'duration' || field === 'repetitions') steps[idx][field] = +el.value || 0;
          else steps[idx][field] = el.value;
          if (field === 'type') drawSteps();
        };
        el.oninput = handler; el.onchange = handler;
      });
      stepsEl.querySelectorAll('[data-sup]').forEach(b => b.onclick = () => {
        const i = +b.dataset.sup;
        if (i > 0){ [steps[i-1], steps[i]] = [steps[i], steps[i-1]]; drawSteps(); }
      });
      stepsEl.querySelectorAll('[data-sdown]').forEach(b => b.onclick = () => {
        const i = +b.dataset.sdown;
        if (i < steps.length-1){ [steps[i+1], steps[i]] = [steps[i], steps[i+1]]; drawSteps(); }
      });
      stepsEl.querySelectorAll('[data-sdel]').forEach(b => b.onclick = () => {
        if (steps.length <= 1){ toast('Хотя бы один этап'); return; }
        steps.splice(+b.dataset.sdel, 1); drawSteps();
      });
    };
    drawSteps();
    m.querySelector('#addPStep').onclick = () => {
      steps.push({id: uid('pstep'), title:'', type:'timer', duration:30, instructions:'', why:''});
      drawSteps();
      const last = stepsEl.lastElementChild;
      if (last) last.scrollIntoView({behavior:'smooth', block:'center'});
    };
    m.querySelector('#pCancel').onclick = () => closeModal(m);
    m.querySelector('#pSave').onclick = () => {
      const title = m.querySelector('#pTitle').value.trim();
      if (!title){ toast('Введи название'); return; }
      const filtered = steps.filter(s => s.title.trim());
      if (!filtered.length){ toast('Добавь хотя бы один этап'); return; }
      const cat = m.querySelector('#pCat').value;
      const desc = m.querySelector('#pDesc').value.trim();
      if (isEd && !isBuiltin) Object.assign(p, {title, category:cat, description:desc, steps:filtered});
      else N.S.navlife.programs.push({
        id: uid('prog'), title, category:cat, description:desc,
        steps: filtered.map(s => ({...s, id: s.id || uid('pstep')})),
        builtin: false
      });
      saveState(); closeModal(m); go('programs');
      toast(isEd ? 'Обновлено' : 'Программа создана');
    };
    const del = m.querySelector('#pDel');
    if (del) del.onclick = () => {
      if (confirm('Удалить программу?')){
        N.S.navlife.programs = N.S.navlife.programs.filter(x => x.id !== p.id);
        saveState(); closeModal(m); go('programs');
      }
    };
  });
}

function getAllKnowledge(){
  return [...KNOWLEDGE, ...(N.S.navlife.customKnowledge || []).map(k => ({...k, custom:true}))];
}
function renderKnowledge(){
  const list = getAllKnowledge();
  const root = document.createElement('div');
  root.className = 'screen';
  root.innerHTML = `
    <div class="row" style="margin-bottom:16px;gap:10px">
      <button class="icon-btn" id="back" type="button">←</button>
      <div class="h1" style="flex:1">Знания</div>
      <button class="btn btn-primary btn-sm" id="addK" type="button">+ Тема</button>
    </div>
    <div class="k-list">
      ${list.map((k, i) => `<div class="k-item ${k.custom?'k-item-custom':''}" data-k="${i}">
        <div class="cat">${esc(k.category)}${k.custom ? '<span class="badge-custom">своя</span>' : ''}</div>
        <h4>${esc(k.title)}</h4>
        <div class="preview">${esc((k.what||'').slice(0, 110))}${(k.what||'').length > 110 ? '…' : ''}</div>
        <div class="arrow">→</div>
      </div>`).join('')}
    </div>
    <div style="height:20px"></div>`;
  root.querySelector('#back').onclick = () => go('today');
  root.querySelector('#addK').onclick = () => openKnowledgeEditor(null);
  root.addEventListener('click', e => {
    const it = e.target.closest('[data-k]');
    if (it) openKnowledgeModal(list[+it.dataset.k]);
  });
  return root;
}
function openKnowledgeModal(k){
  openModal(`
    <div class="modal-handle"></div>
    <div class="cat" style="color:var(--moss);font-size:12px;font-weight:600;margin-bottom:4px">${esc(k.category)}${k.custom ? '<span class="badge-custom">своя</span>' : ''}</div>
    <div class="h2" style="margin-bottom:16px">${esc(k.title)}</div>
    ${k.what ? `<h3 style="font-size:13px;color:var(--moss);margin-bottom:4px;font-weight:700">Что это?</h3><p class="muted" style="margin-bottom:14px">${esc(k.what)}</p>` : ''}
    ${k.why ? `<h3 style="font-size:13px;color:var(--moss);margin-bottom:4px;font-weight:700">Зачем?</h3><p class="muted" style="margin-bottom:14px">${esc(k.why)}</p>` : ''}
    ${k.how ? `<h3 style="font-size:13px;color:var(--moss);margin-bottom:4px;font-weight:700">Как работает?</h3><p class="muted" style="margin-bottom:14px">${esc(k.how)}</p>` : ''}
    ${k.apply ? `<h3 style="font-size:13px;color:var(--moss);margin-bottom:4px;font-weight:700">Как применить?</h3><p class="muted" style="margin-bottom:14px">${esc(k.apply)}</p>` : ''}
    ${k.example ? `<h3 style="font-size:13px;color:var(--moss);margin-bottom:4px;font-weight:700">Пример</h3><p class="muted" style="margin-bottom:14px">${esc(k.example)}</p>` : ''}
    <div style="display:flex;gap:10px;margin-top:8px">
      ${k.custom ? '<button class="btn btn-line" id="kcEdit" type="button">Изменить</button>' : ''}
      <button class="btn btn-primary btn-full btn-lg" id="kcClose" type="button">Понятно</button>
    </div>`, m => {
    m.querySelector('#kcClose').onclick = () => closeModal(m);
    const ed = m.querySelector('#kcEdit');
    if (ed) ed.onclick = () => { closeModal(m); setTimeout(() => openKnowledgeEditor(k.id), 150); };
  });
}
function openKnowledgeEditor(editId){
  const k = editId ? (N.S.navlife.customKnowledge || []).find(x => x.id === editId) : null;
  const isEd = !!k;
  const CATS_K = ['привычки','концентрация','сон','обучение','время','здоровье','питание','спорт','мышление','своё'];
  openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom:16px">${isEd ? 'Изменить тему' : 'Новая тема'}</div>
    <div class="field"><label>Название темы</label><input id="kTitle" value="${k?esc(k.title):''}" placeholder="Например, Сила маленьких шагов"></div>
    <div class="field"><label>Категория</label>
      <select id="kCat">${CATS_K.map(c => `<option value="${esc(c)}" ${k && k.category === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>
    </div>
    <div class="field"><label>Что это?</label><textarea id="kWhat">${k?esc(k.what||''):''}</textarea></div>
    <div class="field"><label>Зачем?</label><textarea id="kWhy">${k?esc(k.why||''):''}</textarea></div>
    <div class="field"><label>Как работает?</label><textarea id="kHow">${k?esc(k.how||''):''}</textarea></div>
    <div class="field"><label>Как применить?</label><textarea id="kApply">${k?esc(k.apply||''):''}</textarea></div>
    <div class="field"><label>Пример</label><textarea id="kExample">${k?esc(k.example||''):''}</textarea></div>
    <div style="display:flex;gap:10px;margin-top:16px">
      ${isEd ? '<button class="btn btn-line btn-danger" id="kDel" type="button">Удалить</button>' : ''}
      <button class="btn btn-ghost btn-full" id="kCancel" type="button">Отмена</button>
      <button class="btn btn-primary btn-full" id="kSave" type="button">Сохранить</button>
    </div>`, m => {
    m.querySelector('#kCancel').onclick = () => closeModal(m);
    m.querySelector('#kSave').onclick = () => {
      const title = m.querySelector('#kTitle').value.trim();
      if (!title){ toast('Введи название'); return; }
      const obj = {
        id: k ? k.id : uid('k'),
        category: m.querySelector('#kCat').value,
        title,
        what: m.querySelector('#kWhat').value.trim(),
        why: m.querySelector('#kWhy').value.trim(),
        how: m.querySelector('#kHow').value.trim(),
        apply: m.querySelector('#kApply').value.trim(),
        example: m.querySelector('#kExample').value.trim(),
        custom: true
      };
      if (!N.S.navlife.customKnowledge) N.S.navlife.customKnowledge = [];
      if (isEd){
        const idx = N.S.navlife.customKnowledge.findIndex(x => x.id === k.id);
        if (idx >= 0) N.S.navlife.customKnowledge[idx] = obj;
      } else {
        N.S.navlife.customKnowledge.push(obj);
      }
      saveState(); closeModal(m); go('knowledge');
      toast(isEd ? 'Обновлено' : 'Тема добавлена');
    };
    const del = m.querySelector('#kDel');
    if (del) del.onclick = () => {
      if (confirm('Удалить тему?')){
        N.S.navlife.customKnowledge = N.S.navlife.customKnowledge.filter(x => x.id !== k.id);
        saveState(); closeModal(m); go('knowledge');
      }
    };
  });
}

let runSession = null;
function startProgramRun(programId, scheduleId){
  const p = N.S.navlife.programs.find(x => x.id === programId);
  if (!p) return;
  runSession = { program: p, stepIndex: -1, scheduleId, timerHandle: null };
  document.querySelector('#nav').classList.add('hidden');
  renderRunnerFrame();
  runCountdown(() => advanceStep());
}
function renderRunnerFrame(){
  const host = document.querySelector('#screens');
  host.innerHTML = `<div class="screen active" style="min-height:100vh;display:flex;flex-direction:column">
    <div class="between" style="margin-bottom:14px">
      <button class="icon-btn" id="rrClose" type="button">✕</button>
      <div class="ex-title" style="flex:1;text-align:center">${esc(runSession.program.title)}</div>
      <div style="width:40px"></div>
    </div>
    <div class="ex-bar"><i id="rrBar"></i></div>
    <div id="rrContent" style="flex:1;display:flex;flex-direction:column;justify-content:center;text-align:center;padding:20px 0"></div>
  </div>`;
  host.querySelector('#rrClose').onclick = () => {
    if (runSession && runSession.timerHandle) clearInterval(runSession.timerHandle);
    runSession = null;
    go('today');
  };
}
function runCountdown(done){
  const c = document.querySelector('#rrContent');
  let n = 3;
  c.innerHTML = `<div style="font-family:'Fraunces',serif;font-size:120px;color:var(--amber);font-weight:500;line-height:1">${n}</div>`;
  const box = c.querySelector('div');
  const iv = setInterval(() => {
    n--;
    if (n > 0){ box.textContent = n; SFX.tap(); }
    else { clearInterval(iv); box.textContent = 'СТАРТ'; SFX.ok(); setTimeout(done, 500); }
  }, 700);
}
function advanceStep(){
  if (!runSession) return;
  if (runSession.timerHandle){ clearInterval(runSession.timerHandle); runSession.timerHandle = null; }
  runSession.stepIndex++;
  const steps = runSession.program.steps;
  const c = document.querySelector('#rrContent');
  const bar = document.querySelector('#rrBar');
  if (bar) bar.style.transform = `scaleX(${runSession.stepIndex / steps.length})`;
  if (runSession.stepIndex >= steps.length){ finishProgram(); return; }
  const step = steps[runSession.stepIndex];
  const why = step.why ? `<p class="muted" style="margin-bottom:16px">${esc(step.why)}</p>` : '';
  const instr = step.instructions ? `<p class="muted" style="margin-bottom:16px">${esc(step.instructions)}</p>` : '';
  if (step.type === 'timer' || step.type === 'pause'){
    let rem = step.duration || 30;
    SFX.timerStart();
    c.innerHTML = `
      <div class="tiny" style="margin-bottom:8px">${step.type === 'pause' ? 'ПАУЗА' : 'ЭТАП'} ${runSession.stepIndex+1} ИЗ ${steps.length}</div>
      <div class="h1" style="margin-bottom:10px">${esc(step.title)}</div>
      ${instr}${why}
      <div id="rrBig" style="font-family:'Fraunces',serif;font-size:88px;color:var(--moss);font-weight:500;line-height:1">${pad2(Math.floor(rem/60))}:${pad2(rem%60)}</div>
      <button class="btn btn-ghost btn-full" id="rrSkip" type="button" style="margin-top:30px;max-width:320px;margin-left:auto;margin-right:auto">Пропустить →</button>`;
    document.querySelector('#rrSkip').onclick = () => advanceStep();
    runSession.timerHandle = setInterval(() => {
      rem--;
      const big = document.querySelector('#rrBig');
      if (big) big.textContent = `${pad2(Math.floor(rem/60))}:${pad2(rem%60)}`;
      if (rem === 3 || rem === 2 || rem === 1) SFX.timerLast3();
      if (rem <= 0){
        clearInterval(runSession.timerHandle);
        runSession.timerHandle = null;
        SFX.timerEnd();
        setTimeout(() => advanceStep(), 650);
      }
    }, 1000);
  } else {
    const nextLabel = step.type === 'reps' ? 'Готово →' : step.type === 'checkbox' ? 'Отметить →' : 'Далее →';
    c.innerHTML = `
      <div class="tiny" style="margin-bottom:8px">ЭТАП ${runSession.stepIndex+1} ИЗ ${steps.length}</div>
      <div class="h1" style="margin-bottom:10px">${esc(step.title)}</div>
      ${instr}${why}
      ${step.type === 'reps' ? `<div style="font-family:'Fraunces',serif;font-size:88px;color:var(--moss);font-weight:500;line-height:1">${step.repetitions||''}</div><div class="muted" style="margin-top:6px">повторений</div>` : ''}
      <button class="btn btn-primary btn-full btn-lg" id="rrDone" type="button" style="margin-top:30px;max-width:320px;margin-left:auto;margin-right:auto">${nextLabel}</button>`;
    document.querySelector('#rrDone').onclick = () => { SFX.tick(); buzz(8); advanceStep(); };
  }
}
function finishProgram(){
  if (runSession && runSession.timerHandle) clearInterval(runSession.timerHandle);
  const c = document.querySelector('#rrContent');
  const wasScheduleId = runSession.scheduleId;
  const progId = runSession.program.id;
  const progTitle = runSession.program.title;
  c.innerHTML = `
    <div style="font-size:60px;margin-bottom:16px">✅</div>
    <div class="h1" style="margin-bottom:10px">Программа завершена</div>
    <p class="muted">«${esc(progTitle)}» пройдена.</p>
    <button class="btn btn-primary btn-full btn-lg" id="rrClose2" type="button" style="margin-top:24px;max-width:320px;margin-left:auto;margin-right:auto">Продолжить →</button>`;
  SFX.endMelody();
  runSession = null;
  if (wasScheduleId) N.completeScheduleItem(wasScheduleId, true);
  else {
    const linked = N.S.navlife.schedule.find(i => i.date === todayKey() && i.programId === progId && !i.completed);
    if (linked) N.completeScheduleItem(linked.id, true);
  }
  document.querySelector('#rrClose2').onclick = () => go('today');
}

window.seedIfEmpty = seedIfEmpty;
window.startProgramRun = startProgramRun;
window.BUILTIN_PROGRAMS = BUILTIN_PROGRAMS;
window.KNOWLEDGE = KNOWLEDGE;

window.App.registerScreen('goals', renderGoals);
window.App.registerScreen('programs', renderPrograms);
window.App.registerScreen('knowledge', renderKnowledge);
})();