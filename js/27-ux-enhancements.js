/* ═══ NAVLIFE · UX ENHANCEMENTS · v2.0 ═══
   Размер шрифта · Reduced motion · Swipe-to-close · Count-up · Breathing nav · PWA shortcuts
*/
(function(){
'use strict';
const N = window.__nav;
if (!N){ console.error('[UX] __nav not found'); return; }
const qs = (s, r=document) => r.querySelector(s);
const qsa = (s, r=document) => Array.from(r.querySelectorAll(s));

/* ═══ Стили ═══ */
const STYLE_ID = 'navlife-ux-styles';
function ensureStyles(){
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
@keyframes barBounce {
  0% { transform: scaleX(var(--p, 0)); }
  40% { transform: scaleX(calc(var(--p, 0) * 1.08)); }
  100% { transform: scaleX(var(--p, 0)); }
}
.bar > i.on { animation: barBounce .6s cubic-bezier(.22,1.4,.36,1) 1; }

@keyframes navBreathe {
  0%, 100% { transform: translateY(-1px) scale(1); }
  50%      { transform: translateY(-2px) scale(1.12); }
}
.nav-btn.active .ni { animation: navBreathe 3s ease-in-out infinite; }

html[data-reduce-motion="true"] *,
html[data-reduce-motion="true"] *::before,
html[data-reduce-motion="true"] *::after {
  animation-duration: .01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: .01ms !important;
}

.modal-handle { cursor: grab; touch-action: none; }

.ux-extras-card .ux-block {
  padding: 14px 0;
  border-top: 1px solid var(--line);
}
.ux-extras-card .ux-block:first-of-type {
  border-top: none;
  padding-top: 0;
}
.ux-extras-card .ux-fs-btns {
  display: flex;
  gap: 6px;
  margin-top: 10px;
}
.ux-extras-card .ux-fs-btns button {
  flex: 1;
  padding: 10px 6px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  background: var(--paper);
  color: var(--ink);
  border: 1px solid var(--line);
  cursor: pointer;
  transition: all .15s;
}
.ux-extras-card .ux-fs-btns button.on {
  background: var(--moss);
  color: #fff;
  border-color: var(--moss);
}
  `;
  document.head.appendChild(s);
}
ensureStyles();

/* ═══ РАЗМЕР ШРИФТА ═══ */
const FONT_SCALES = [0.9, 1.0, 1.1, 1.25];
function applyFontScale(){
  const scale = N.S.shared.fontScale || 1;
  if (scale === 1) {
    document.body.style.zoom = '';
  } else {
    document.body.style.zoom = String(scale);
  }
}

/* ═══ REDUCED MOTION ═══ */
function applyReduceMotion(){
  const on = !!N.S.shared.reduceMotion;
  document.documentElement.dataset.reduceMotion = on ? 'true' : 'false';
}

setTimeout(() => { applyFontScale(); applyReduceMotion(); }, 50);

/* ═══ КАРТОЧКА «Продвинутые настройки» в Профиле ═══ */
function injectProfileExtras(){
  const host = qs('#screens');
  if (!host) return;
  if (host.querySelector('[data-ux-extras-card]')) return;

  const scale = N.S.shared.fontScale || 1;
  const reduce = !!N.S.shared.reduceMotion;

  const card = document.createElement('div');
  card.className = 'card ux-extras-card';
  card.setAttribute('data-ux-extras-card', '');
  card.innerHTML = `
    <div class="h3" style="margin-bottom:14px;font-family:'Fraunces',serif;font-size:16px">🎛 Продвинутые настройки</div>

    <div class="ux-block" style="border-top:none;padding-top:0">
      <div class="between" style="margin-bottom:6px">
        <div>
          <div class="h3">Размер шрифта</div>
          <div class="muted" style="font-size:11.5px;margin-top:2px">Увеличить для удобства чтения</div>
        </div>
        <div class="tiny" id="uxFsVal" style="font-family:'Fraunces',serif;font-size:15px;color:var(--moss);font-weight:600">${Math.round(scale*100)}%</div>
      </div>
      <div class="ux-fs-btns" id="uxFsBtns">
        ${FONT_SCALES.map(s => `
          <button type="button" data-fs="${s}" class="${Math.abs(scale-s) < 0.01 ? 'on' : ''}">
            ${Math.round(s*100)}%
          </button>
        `).join('')}
      </div>
    </div>

    <div class="ux-block">
      <div class="between">
        <div>
          <div class="h3">Меньше анимаций</div>
          <div class="muted" style="font-size:11.5px;margin-top:2px">Убирает все эффекты и переходы</div>
        </div>
        <div class="switch ${reduce ? 'on' : ''}" id="uxReduceSw"></div>
      </div>
    </div>
  `;

  /* Вставляем в конец — перед блоком «Важно» если он есть, иначе в самый конец */
  const disclaimer = Array.from(host.querySelectorAll('.card'))
    .find(c => c.textContent.includes('медицинское устройство'));
  if (disclaimer && disclaimer.parentNode){
    disclaimer.parentNode.insertBefore(card, disclaimer);
  } else {
    host.appendChild(card);
  }

  /* Обработчики */
  card.querySelectorAll('[data-fs]').forEach(b => b.onclick = () => {
    const v = parseFloat(b.dataset.fs);
    N.S.shared.fontScale = v;
    N.saveState();
    applyFontScale();
    card.querySelectorAll('[data-fs]').forEach(x => {
      x.classList.toggle('on', Math.abs(parseFloat(x.dataset.fs) - v) < 0.01);
    });
    const valEl = card.querySelector('#uxFsVal');
    if (valEl) valEl.textContent = Math.round(v*100) + '%';
    N.SFX.tap(); if (window.Haptics) Haptics.play('ok');
  });

  const sw = card.querySelector('#uxReduceSw');
  if (sw) sw.onclick = () => {
    N.S.shared.reduceMotion = !N.S.shared.reduceMotion;
    N.saveState();
    applyReduceMotion();
    sw.classList.toggle('on', N.S.shared.reduceMotion);
    N.SFX.tap(); if (window.Haptics) Haptics.play('ok');
  };
}

window.App.hooks.afterGo.push(name => {
  if (name !== 'profile') return;
  setTimeout(injectProfileExtras, 120);
});

/* ═══ COUNT-UP ═══ */
const counted = new WeakSet();
function countUp(el, duration){
  if (!el || counted.has(el)) return;
  counted.add(el);
  const raw = el.textContent.trim();
  const m = raw.match(/^(\D*)(\d+(?:[.,]\d+)?)(\D*)$/);
  if (!m) return;
  const [, pre, num, post] = m;
  const target = parseFloat(num.replace(',', '.'));
  if (!isFinite(target) || target === 0) return;
  const start = performance.now();
  const tick = t => {
    const p = Math.min(1, (t - start) / duration);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = pre + Math.round(target * e) + post;
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = raw;
  };
  requestAnimationFrame(tick);
}
function runCountUps(){
  if (N.S.shared.reduceMotion) return;
  qsa('.kcal-ring-inner .big, .goal-ring-value, .goal-period-value, .result-score').forEach(el => {
    countUp(el, 700);
  });
}

/* ═══ SWIPE-TO-CLOSE ═══ */
let swipeState = null;
document.addEventListener('touchstart', e => {
  const modal = e.target.closest('.modal');
  if (!modal) return;
  if (e.target.closest('input, textarea, select, button, a')) return;
  if (modal.scrollTop > 2) return;
  swipeState = {
    modal, layer: modal.parentNode,
    startY: e.touches[0].clientY,
    startX: e.touches[0].clientX,
    dy: 0, active: false
  };
}, { passive: true });

document.addEventListener('touchmove', e => {
  if (!swipeState) return;
  const dy = e.touches[0].clientY - swipeState.startY;
  const dx = Math.abs(e.touches[0].clientX - swipeState.startX);
  if (!swipeState.active && dy > 10 && dy > dx * 1.5){
    swipeState.active = true;
    swipeState.modal.style.transition = 'none';
  }
  if (swipeState.active){
    swipeState.dy = dy;
    swipeState.modal.style.transform = `translateX(-50%) translateY(${dy}px)`;
  }
}, { passive: true });

document.addEventListener('touchend', () => {
  if (!swipeState) return;
  const { modal, layer, dy, active } = swipeState;
  if (active && dy > 100){
    modal.style.transition = 'transform .25s ease';
    modal.style.transform = 'translateX(-50%) translateY(120%)';
    setTimeout(() => { try { N.closeModal(layer); } catch(e){} }, 260);
  } else if (active) {
    modal.style.transition = 'transform .25s cubic-bezier(.22,1,.36,1)';
    modal.style.transform = 'translateX(-50%) translateY(0)';
  }
  swipeState = null;
});

/* ═══ PWA SHORTCUTS ═══ */
function handleShortcut(action){
  if (!action) return;
  switch(action){
    case 'water': {
      const ds = N.todayKey();
      if (!N.S.nutrition.days[ds]) {
        N.S.nutrition.days[ds] = { meals:{breakfast:[],lunch:[],dinner:[],snack:[]}, water:0, notes:'' };
      }
      N.S.nutrition.days[ds].water = (N.S.nutrition.days[ds].water || 0) + 200;
      N.S.nutrition.viewDate = ds;
      N.saveState();
      N.toast('💧 +200 мл воды');
      setTimeout(() => N.go('nutrition'), 200);
      break;
    }
    case 'habit': N.go('habits'); break;
    case 'brain': N.go('brain'); break;
    case 'goal':
      N.go('goals');
      setTimeout(() => {
        if (window.Goals && window.Goals.openEditor) window.Goals.openEditor(null);
      }, 400);
      break;
  }
}
setTimeout(() => {
  const params = new URLSearchParams(location.search);
  const action = params.get('action');
  if (!action) return;
  try { history.replaceState(null, '', location.pathname); } catch(e){}
  setTimeout(() => handleShortcut(action), 700);
}, 800);

window.App.hooks.afterGo.push(name => {
  requestAnimationFrame(runCountUps);
});

console.log('[UX Enhancements] v2.0 loaded');
})();