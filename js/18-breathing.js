/* ═══ NAVLIFE · BREATHING · v2.1 · самодостаточный ═══ */
(function(){
'use strict';
const N = window.__nav;
if (!N){ console.error('[BREATHING] __nav not found'); return; }

const qs = (s, r=document) => r.querySelector(s);
const qsa = (s, r=document) => Array.from(r.querySelectorAll(s));
const _esc = (s) => String(s??'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ═══════════════════════════════════════════════════════════════════
   СТИЛИ — встраиваю динамически, чтобы не зависеть от modules.css
   ═══════════════════════════════════════════════════════════════════ */
const STYLE_ID = 'navlife-breath-styles';
function ensureStyles(){
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
.breath-screen{
  position:fixed !important;
  inset:0 !important;
  z-index:9999 !important;
  background:linear-gradient(155deg,#0F1A14 0%,#000000 100%) !important;
  color:#F4F2EA !important;
  display:flex !important;
  flex-direction:column !important;
  font-family:'IBM Plex Sans',-apple-system,sans-serif !important;
  overflow:hidden;
  animation:breathFadeIn .35s cubic-bezier(.22,1,.36,1);
}
@keyframes breathFadeIn{from{opacity:0}to{opacity:1}}
.breath-screen .breath-header{
  padding:20px 22px 12px;
  display:flex;justify-content:space-between;align-items:flex-start;
  flex-shrink:0;
  position:relative;z-index:10;
}
.breath-screen .breath-eyebrow{
  font-size:11.5px;letter-spacing:.18em;text-transform:uppercase;
  color:#8FAE9B;font-weight:600;margin-bottom:6px;
}
.breath-screen .breath-timer{
  font-family:'Fraunces',serif;font-size:24px;font-weight:600;
  color:#F3E3C8;letter-spacing:-.01em;line-height:1;
}
.breath-screen .breath-close{
  width:44px;height:44px;border-radius:50%;
  background:rgba(255,255,255,.1);color:#F4F2EA;
  border:none;display:grid;place-items:center;font-size:18px;
  cursor:pointer;transition:background .15s,transform .14s;
  flex-shrink:0;
}
.breath-screen .breath-close:hover{background:rgba(255,255,255,.2)}
.breath-screen .breath-close:active{transform:scale(.92)}
.breath-screen .breath-stage{
  flex:1 1 auto;display:grid;place-items:center;
  padding:12px;
  min-height:0;
}
.breath-screen .breath-circle-wrap{
  position:relative;
  width:min(76vw,320px);
  aspect-ratio:1 / 1;
  display:grid;place-items:center;
}
.breath-screen .breath-pulse{
  position:absolute;inset:0;border-radius:50%;
  background:radial-gradient(circle,rgba(143,174,155,.14),transparent 68%);
  animation:breathPulse 6s ease-in-out infinite;
}
@keyframes breathPulse{
  0%,100%{transform:scale(.92);opacity:.7}
  50%{transform:scale(1.08);opacity:1}
}
.breath-screen .breath-circle{
  position:absolute;
  width:72%;height:72%;border-radius:50%;
  background:radial-gradient(circle,rgba(143,174,155,.6) 0%,rgba(143,174,155,.18) 68%,transparent 78%);
  box-shadow:0 0 90px rgba(143,174,155,.4),inset 0 0 40px rgba(143,174,155,.2);
  will-change:transform;
  transform:scale(1.55);
  transition:none;
}
.breath-screen .breath-info{
  position:absolute;inset:0;
  display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  pointer-events:none;text-align:center;z-index:2;
}
.breath-screen .breath-phase{
  font-family:'Fraunces',serif;font-size:24px;font-weight:600;
  letter-spacing:-.01em;color:#FFFFFF;
  text-shadow:0 2px 12px rgba(0,0,0,.4);
}
.breath-screen .breath-counter{
  font-family:'Fraunces',serif;font-size:84px;font-weight:500;
  line-height:1;color:#F3E3C8;margin-top:10px;
  letter-spacing:-.04em;
  text-shadow:0 2px 20px rgba(0,0,0,.4);
}
.breath-screen .breath-controls{
  display:flex;justify-content:center;
  padding:14px 20px;flex-shrink:0;
}
.breath-screen .breath-btn{
  padding:15px 32px;border-radius:100px;
  background:rgba(255,255,255,.12);color:#F4F2EA;
  border:none;font-size:15px;font-weight:600;cursor:pointer;
  transition:background .15s,transform .14s;
  font-family:inherit;
}
.breath-screen .breath-btn:hover{background:rgba(255,255,255,.22)}
.breath-screen .breath-btn:active{transform:scale(.95)}
.breath-screen .breath-progress{
  height:4px;margin:0 22px 24px;border-radius:4px;
  background:rgba(255,255,255,.1);overflow:hidden;
  flex-shrink:0;
}
.breath-screen .breath-progress > div{
  height:100%;background:#F3E3C8;border-radius:4px;
  transition:width .2s linear;width:0;
}
  `;
  document.head.appendChild(style);
}

/* ═══ Практики ═══ */
const PRACTICES = [
  {
    id:'478', name:'4-7-8', emoji:'🌙', tag:'Сон · Тревога',
    short:'Успокаивает и помогает уснуть',
    desc:'Долгий выдох активирует парасимпатическую систему — тело переходит в режим отдыха. Техника доктора Эндрю Вейла.',
    useCases:['Перед сном','При тревоге','После стрессового дня'],
    pattern:[
      { phase:'inhale', seconds:4, label:'Вдох',     scale:'expand' },
      { phase:'hold',   seconds:7, label:'Задержка', scale:'hold' },
      { phase:'exhale', seconds:8, label:'Выдох',    scale:'shrink' }
    ],
    presets:[3,4,5],
    vibro:{ inhale:[15,40,15,40], hold:[10,60,10], exhale:[20,50,20,50,20] }
  },
  {
    id:'box', name:'Box Breathing', emoji:'⬜', tag:'Фокус · Стресс',
    short:'Возвращает ясность под давлением',
    desc:'Ровный ритм 4-4-4-4. Техника боевых пловцов Navy SEALs. Синхронизирует дыхание и пульс, снижает панику.',
    useCases:['Перед важным разговором','В стрессе','Для концентрации'],
    pattern:[
      { phase:'inhale', seconds:4, label:'Вдох',     scale:'expand' },
      { phase:'hold',   seconds:4, label:'Задержка', scale:'hold' },
      { phase:'exhale', seconds:4, label:'Выдох',    scale:'shrink' },
      { phase:'hold2',  seconds:4, label:'Задержка', scale:'hold' }
    ],
    presets:[3,4,5],
    vibro:{ inhale:[15,40,15,40], hold:[10,60,10], exhale:[20,50,20,50], hold2:[10,60,10] }
  },
  {
    id:'physio', name:'Физиологический вздох', emoji:'💨', tag:'Быстрый сброс стресса',
    short:'Снимает тревогу за 1–3 цикла',
    desc:'Двойной вдох + длинный выдох. Раздувает альвеолы, быстро выводит CO₂ — самый быстрый способ успокоиться.',
    useCases:['В момент тревоги','Перед выступлением','Когда накрывает'],
    pattern:[
      { phase:'inhale',  seconds:3, label:'Вдох',        scale:'expand' },
      { phase:'inhale2', seconds:1, label:'Добор',       scale:'expand2' },
      { phase:'exhale',  seconds:6, label:'Долгий выдох', scale:'shrink' }
    ],
    presets:[2,3,4],
    vibro:{ inhale:[15,40,15,40], inhale2:[15,20,15], exhale:[25,60,25,60] }
  },
  {
    id:'coherent', name:'Резонансное 5.5', emoji:'💗', tag:'HRV · Баланс',
    short:'Оптимум для сердца и стрессоустойчивости',
    desc:'Вдох 5.5 сек, выдох 5.5 сек — это ≈5.5 дыханий в минуту, оптимум для вариабельности сердечного ритма.',
    useCases:['Регулярная практика','Для сна','Для спокойствия ума'],
    pattern:[
      { phase:'inhale', seconds:5.5, label:'Вдох',  scale:'expand' },
      { phase:'exhale', seconds:5.5, label:'Выдох', scale:'shrink' }
    ],
    presets:[3,5,10],
    vibro:{ inhale:[20,50,20,50], exhale:[25,60,25,60] }
  },
  {
    id:'triangle', name:'Треугольник', emoji:'🔺', tag:'Утро · Спокойствие',
    short:'Мягкий ритм для начинающих',
    desc:'Вдох 4 — задержка 4 — выдох 4. Простая практика для входа в ритм и спокойного утра.',
    useCases:['Утром','Для начинающих','Пауза в течение дня'],
    pattern:[
      { phase:'inhale', seconds:4, label:'Вдох',     scale:'expand' },
      { phase:'hold',   seconds:4, label:'Задержка', scale:'hold' },
      { phase:'exhale', seconds:4, label:'Выдох',    scale:'shrink' }
    ],
    presets:[2,3,5],
    vibro:{ inhale:[15,40,15,40], hold:[10,60,10], exhale:[20,50,20,50] }
  },
  {
    id:'nadi', name:'Нади Шодхана', emoji:'🧘', tag:'Баланс · Медитация',
    short:'Попеременное дыхание ноздрями',
    desc:'Классическая йогическая практика. Попеременно закрывай ноздри. Балансирует полушария, даёт ясность.',
    useCases:['Перед медитацией','Для ясности ума','Вечером'],
    pattern:[
      { phase:'inhale',  seconds:4, label:'Вдох слева',   scale:'expand' },
      { phase:'hold',    seconds:4, label:'Задержка',     scale:'hold' },
      { phase:'exhale',  seconds:4, label:'Выдох справа', scale:'shrink' },
      { phase:'inhale2', seconds:4, label:'Вдох справа',  scale:'expand' },
      { phase:'hold2',   seconds:4, label:'Задержка',     scale:'hold' },
      { phase:'exhale2', seconds:4, label:'Выдох слева',  scale:'shrink' }
    ],
    presets:[3,5],
    vibro:{ inhale:[15,40,15,40], hold:[10,60,10], exhale:[20,50,20,50], inhale2:[15,40,15,40], hold2:[10,60,10], exhale2:[20,50,20,50] }
  }
];

/* ═══ Экран списка практик ═══ */
function renderBreathingList(){
  const totalSessions = (N.S.breathing && N.S.breathing.totalSessions) || 0;
  const totalMin = Math.round(((N.S.breathing && N.S.breathing.totalMs) || 0) / 60000);
  const root = document.createElement('div');
  root.className = 'screen';
  root.innerHTML = `
    <div class="row" style="margin-bottom:16px;gap:10px">
      <button class="icon-btn" id="bBack" type="button">←</button>
      <div class="h1" style="flex:1">Дыхание</div>
    </div>
    <div class="hero" style="background:linear-gradient(155deg,#2A3A2F 0%,#1B211D 62%)">
      <div class="hero-inner">
        <div class="eyebrow">ДЫХАТЕЛЬНЫЕ ПРАКТИКИ</div>
        <div class="lead">Успокоить ум и тело</div>
        <p class="why">Круг дышит, вибро-паттерн, счётчик фаз. 2–5 минут.</p>
        <div style="display:flex;gap:14px;margin-top:14px;font-size:12.5px;color:#C7CEC5">
          <span>🧘 ${totalSessions} сессий</span><span>⏱ ${totalMin} мин</span>
        </div>
      </div>
    </div>
    <div class="cat-title"><span>🌬️</span><span>Выбери практику</span></div>
    <div style="display:grid;gap:10px">
      ${PRACTICES.map(p => `
        <button class="card tappable" data-practice="${p.id}" type="button" style="width:100%;text-align:left;padding:16px 18px;margin:0">
          <div style="display:flex;gap:14px;align-items:flex-start">
            <div style="font-size:32px;line-height:1;flex-shrink:0">${p.emoji}</div>
            <div style="flex:1;min-width:0">
              <div style="font-family:'Fraunces',serif;font-size:16px;font-weight:600;margin-bottom:2px">${_esc(p.name)}</div>
              <div class="tiny" style="color:var(--moss);font-weight:600;margin-bottom:6px">${_esc(p.tag)}</div>
              <div class="muted" style="font-size:12.5px;line-height:1.5">${_esc(p.short)}</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
                ${p.pattern.map(ph => `<span style="font-size:10.5px;padding:2px 8px;border-radius:100px;background:var(--paper);border:1px solid var(--line);color:var(--ink-soft);font-weight:600">${ph.label} ${ph.seconds}с</span>`).join('')}
              </div>
            </div>
            <div style="color:var(--ink-mute);font-size:20px;align-self:center">›</div>
          </div>
        </button>
      `).join('')}
    </div>
    <div style="height:20px"></div>`;
  qs('#bBack', root).onclick = () => N.go('brain');
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-practice]');
    if (b){
      const p = PRACTICES.find(x => x.id === b.dataset.practice);
      if (p) openPracticeModal(p);
    }
  });
  return root;
}

/* ═══ Модалка с описанием ═══ */
function openPracticeModal(practice){
  let selectedMin = practice.presets[Math.floor(practice.presets.length / 2)] || 3;
  N.openModal(`
    <div class="modal-handle"></div>
    <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:14px">
      <div style="font-size:42px;line-height:1">${practice.emoji}</div>
      <div style="flex:1">
        <div class="h2" style="font-size:20px;margin-bottom:2px">${_esc(practice.name)}</div>
        <div class="tiny" style="color:var(--moss);font-weight:600">${_esc(practice.tag)}</div>
      </div>
    </div>
    <p class="muted" style="font-size:13.5px;line-height:1.55;margin-bottom:14px">${_esc(practice.desc)}</p>
    <div style="padding:10px 12px;background:var(--moss-soft);border-radius:10px;margin-bottom:14px">
      <div class="tiny" style="color:var(--moss);letter-spacing:.08em;margin-bottom:6px">КОГДА ПРИМЕНЯТЬ</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        ${practice.useCases.map(u => `<span style="font-size:11.5px;padding:4px 10px;border-radius:100px;background:var(--paper);color:var(--moss);font-weight:600">${_esc(u)}</span>`).join('')}
      </div>
    </div>
    <div class="tiny" style="margin-bottom:8px">РИТМ ДЫХАНИЯ</div>
    <div style="display:grid;gap:6px;margin-bottom:16px">
      ${practice.pattern.map((ph, i) => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--paper);border-radius:8px;font-size:13.5px">
          <span style="font-weight:600">${i+1}. ${_esc(ph.label)}</span>
          <b style="color:var(--moss);font-family:'Fraunces',serif">${ph.seconds}с</b>
        </div>
      `).join('')}
    </div>
    <div class="tiny" style="margin-bottom:8px">ДЛИТЕЛЬНОСТЬ</div>
    <div style="display:flex;gap:8px;margin-bottom:18px">
      ${practice.presets.map(m => `
        <button type="button" data-min="${m}" style="
          flex:1;padding:14px 8px;border-radius:12px;font-size:15px;font-weight:600;
          background:${selectedMin===m ? 'var(--moss)' : 'var(--paper)'};
          color:${selectedMin===m ? '#fff' : 'var(--ink)'};
          border:1.5px solid ${selectedMin===m ? 'var(--moss)' : 'var(--line)'};
          cursor:pointer;transition:all .15s;
        ">${m} мин</button>
      `).join('')}
    </div>
    <div style="display:flex;gap:10px">
      <button class="btn btn-ghost btn-full" id="bpCancel" type="button">Отмена</button>
      <button class="btn btn-primary btn-full btn-lg" id="bpStart" type="button">▶ Начать</button>
    </div>
  `, m => {
    qsa('[data-min]', m).forEach(b => b.onclick = () => {
      selectedMin = +b.dataset.min;
      N.SFX.tap(); N.buzz(8);
      qsa('[data-min]', m).forEach(x => {
        const on = +x.dataset.min === selectedMin;
        x.style.background = on ? 'var(--moss)' : 'var(--paper)';
        x.style.color = on ? '#fff' : 'var(--ink)';
        x.style.borderColor = on ? 'var(--moss)' : 'var(--line)';
      });
    });
    qs('#bpCancel', m).onclick = () => N.closeModal(m);
    qs('#bpStart', m).onclick = () => {
      N.closeModal(m);
      setTimeout(() => startSession(practice, selectedMin * 60), 220);
    };
  });
}

/* ═══ Полноэкранная сессия ═══ */
let session = null;

function startSession(practice, totalSeconds){
  if (session) return;
  ensureStyles(); // ⬅ ключевой момент — гарантируем стили
  session = {
    practice, totalSeconds, elapsed: 0,
    phaseIdx: 0, phaseElapsed: 0, paused: false,
    cycleCount: 0, handle: null
  };
  renderSessionScreen();
  updateBreathingUI();
  session.handle = setInterval(tickSession, 100);
}

function endSession(early){
  if (!session) return;
  clearInterval(session.handle);
  const elapsedSec = Math.round(session.elapsed);
  const practice = session.practice;
  const cycles = session.cycleCount;
  const wasEarly = !!early;
  session = null;

  const scr = document.getElementById('breath-screen');
  if (scr) scr.remove();

  if (elapsedSec >= 10){
    if (!N.S.breathing) N.S.breathing = { totalSessions:0, totalMs:0, sessions:[] };
    N.S.breathing.totalSessions = (N.S.breathing.totalSessions || 0) + 1;
    N.S.breathing.totalMs = (N.S.breathing.totalMs || 0) + elapsedSec * 1000;
    N.S.breathing.sessions = N.S.breathing.sessions || [];
    N.S.breathing.sessions.push({
      practiceId: practice.id, d: N.todayKey(),
      seconds: elapsedSec, cycles, ts: Date.now(), early: wasEarly
    });
    if (N.S.breathing.sessions.length > 200){
      N.S.breathing.sessions = N.S.breathing.sessions.slice(-200);
    }
    N.saveState();
  }

  if (wasEarly){
    N.SFX.tap();
    N.go('programs');
    return;
  }

  N.SFX.win(); N.buzz([18, 40, 18]);
  const host = qs('#screens');
  if (!host) return;
  host.innerHTML = '';
  const scr2 = document.createElement('div');
  scr2.className = 'screen active';
  scr2.style.cssText = 'display:flex;flex-direction:column;justify-content:center;text-align:center;min-height:80vh';
  scr2.innerHTML = `
    <div style="font-size:64px;margin-bottom:16px">🌿</div>
    <div class="h2" style="margin-bottom:8px">Практика завершена</div>
    <p class="muted" style="margin-bottom:22px">${_esc(practice.name)} · ${Math.floor(elapsedSec/60)} мин</p>
    <div style="display:flex;justify-content:center;gap:22px;margin-bottom:22px">
      <div><div style="font-family:'Fraunces',serif;font-size:32px;font-weight:600;color:var(--moss)">${cycles}</div><div class="tiny">циклов</div></div>
      <div style="width:1px;background:var(--line)"></div>
      <div><div style="font-family:'Fraunces',serif;font-size:32px;font-weight:600;color:var(--moss)">${Math.floor(elapsedSec/60)}</div><div class="tiny">минут</div></div>
    </div>
    <div style="max-width:300px;margin:0 auto">
      <button class="btn btn-primary btn-full btn-lg" id="bDone" type="button">Готово</button>
    </div>`;
  host.appendChild(scr2);
  qs('#bDone').onclick = () => {
    if (window.Achievements) window.Achievements.check();
    N.go('programs');
  };
}

function renderSessionScreen(){
  const existing = document.getElementById('breath-screen');
  if (existing) existing.remove();
  const practice = session.practice;
  const scr = document.createElement('div');
  scr.id = 'breath-screen';
  scr.className = 'breath-screen';
  scr.innerHTML = `
    <div class="breath-header">
      <div>
        <div class="breath-eyebrow">${_esc(practice.name)}</div>
        <div class="breath-timer" id="bTimer">--:--</div>
      </div>
      <button class="breath-close" id="bExit" type="button" aria-label="Завершить">✕</button>
    </div>
    <div class="breath-stage">
      <div class="breath-circle-wrap">
        <div class="breath-pulse"></div>
        <div class="breath-circle" id="bCircle"></div>
        <div class="breath-info">
          <div class="breath-phase" id="bPhase">Приготовься…</div>
          <div class="breath-counter" id="bCounter">·</div>
        </div>
      </div>
    </div>
    <div class="breath-controls">
      <button class="breath-btn" id="bPause" type="button">⏸ Пауза</button>
    </div>
    <div class="breath-progress"><div id="bProgress"></div></div>
  `;
  document.body.appendChild(scr);

  qs('#bExit').onclick = () => {
    if (!session) return;
    session.paused = true;
    if (confirm('Завершить практику?')) endSession(true);
    else { session.paused = false; qs('#bPause').textContent = '⏸ Пауза'; }
  };
  qs('#bPause').onclick = () => {
    if (!session) return;
    session.paused = !session.paused;
    qs('#bPause').textContent = session.paused ? '▶ Продолжить' : '⏸ Пауза';
    N.SFX.tap(); N.buzz(8);
  };
}

function tickSession(){
  if (!session || session.paused) return;
  const DT = 0.1;
  session.elapsed += DT;
  session.phaseElapsed += DT;

  const practice = session.practice;
  const pattern = practice.pattern;
  const cur = pattern[session.phaseIdx];

  if (session.phaseElapsed >= cur.seconds){
    session.phaseElapsed = 0;
    session.phaseIdx++;
    if (session.phaseIdx >= pattern.length){
      session.phaseIdx = 0;
      session.cycleCount++;
    }
    const nextPhase = pattern[session.phaseIdx];
    const vibroArr = practice.vibro[nextPhase.phase];
    if (vibroArr) N.buzz(vibroArr);
    if (nextPhase.scale === 'expand' || nextPhase.scale === 'expand2') N.SFX.tap();
    else if (nextPhase.scale === 'shrink') N.SFX.ok();
  }

  updateBreathingUI();
  if (session.elapsed >= session.totalSeconds) endSession(false);
}

function updateBreathingUI(){
  if (!session) return;
  const practice = session.practice;
  const cur = practice.pattern[session.phaseIdx];
  const phaseProgress = Math.min(1, session.phaseElapsed / cur.seconds);

  const counterEl = document.getElementById('bCounter');
  if (counterEl) counterEl.textContent = Math.max(1, Math.ceil(cur.seconds - session.phaseElapsed));

  const phaseEl = document.getElementById('bPhase');
  if (phaseEl) phaseEl.textContent = cur.label;

  const circle = document.getElementById('bCircle');
  if (circle){
    const ease = t => t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2;
    let scale = 1.55;
    if (cur.scale === 'expand'){
      scale = 0.85 + 0.7 * ease(phaseProgress);
    } else if (cur.scale === 'expand2'){
      scale = 1.55 + 0.2 * ease(phaseProgress);
    } else if (cur.scale === 'shrink'){
      scale = 1.55 - 0.7 * ease(phaseProgress);
    }
    circle.style.transform = `scale(${scale})`;
  }

  const progEl = document.getElementById('bProgress');
  if (progEl) progEl.style.width = `${Math.min(100, session.elapsed / session.totalSeconds * 100)}%`;

  const timerEl = document.getElementById('bTimer');
  if (timerEl){
    const remaining = Math.max(0, Math.ceil(session.totalSeconds - session.elapsed));
    timerEl.textContent = `${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')}`;
  }
}

/* ═══ Инъекция в экран Программы ═══ */
function injectIntoPrograms(){
  const host = qs('#screens');
  if (!host) return;
  if (host.querySelector('[data-breathing-block]')) return;

  const block = document.createElement('div');
  block.setAttribute('data-breathing-block', '');
  block.innerHTML = `
    <div class="cat-title" style="margin-top:24px"><span>🌬️</span><span>Дыхательные практики</span></div>
    <p class="muted" style="font-size:12.5px;margin-bottom:12px;line-height:1.5">Полноэкранный таймер с дыханием круга, вибро и счётчиком. 2–5 минут. Каждая практика — под своё состояние.</p>
    <div class="prog-grid">
      ${PRACTICES.map(p => `
        <div class="card prog-card" data-breathing="${p.id}">
          <div class="cat">${_esc(p.tag)}</div>
          <h4>${p.emoji} ${_esc(p.name)}</h4>
          <div class="desc">${_esc(p.short)}</div>
          <div class="foot"><span>${p.pattern.length} фаз · ${p.presets[0]}–${p.presets[p.presets.length-1]} мин</span></div>
        </div>
      `).join('')}
    </div>
  `;

  const progGrid = host.querySelector('.prog-grid');
  if (progGrid && progGrid.parentNode){
    progGrid.parentNode.insertBefore(block, progGrid.nextSibling);
  } else {
    host.appendChild(block);
  }

  qsa('[data-breathing]', block).forEach(card => {
    card.onclick = () => {
      const p = PRACTICES.find(x => x.id === card.dataset.breathing);
      if (p){ N.SFX.tap(); N.buzz(8); openPracticeModal(p); }
    };
  });
}

/* ═══ Регистрация ═══ */
window.Breathing = { practices: PRACTICES };
window.App.registerScreen('breathing', renderBreathingList);

window.App.hooks.afterGo.push(name => {
  if (name === 'programs') setTimeout(injectIntoPrograms, 60);
});
})();