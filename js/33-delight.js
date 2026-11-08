/* ═══ NAVLIFE · DELIGHT · v1.0 · Confetti & Perfect Day ═══ */
(function(){
'use strict';
const N = window.__nav;
if (!N){ console.error('[DELIGHT] __nav not found'); return; }

/* ═══ CSS для конфетти и светлячков ═══ */
const STYLE_ID = 'navlife-delight-styles';
function ensureStyles(){
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
#confetti-canvas {
  position: fixed; inset: 0; width: 100%; height: 100%;
  pointer-events: none; z-index: 9999;
}
.perfect-day-bg {
  position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
}
.firefly {
  position: absolute; width: 4px; height: 4px; border-radius: 50%;
  background: #F3E3C8; box-shadow: 0 0 10px 2px #F3E3C8;
  animation: floatFirefly 8s infinite alternate ease-in-out;
  opacity: 0;
}
@keyframes floatFirefly {
  0% { transform: translate(0, 0) scale(1); opacity: 0; }
  20% { opacity: 0.8; }
  80% { opacity: 0.8; }
  100% { transform: translate(100px, -150px) scale(1.5); opacity: 0; }
}
@keyframes perfectPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.005); }
}
.perfect-pulse {
  animation: perfectPulse 4s infinite ease-in-out;
  transform-origin: center top;
}
  `;
  document.head.appendChild(s);
}
ensureStyles();

/* ═══ ДВИЖОК КОНФЕТТИ ═══ */
window.Confetti = {
  _canvas: null,
  _ctx: null,
  _particles: [],
  _raf: null,

  fire() {
    if (!this._canvas) {
      this._canvas = document.createElement('canvas');
      this._canvas.id = 'confetti-canvas';
      document.body.appendChild(this._canvas);
      this._ctx = this._canvas.getContext('2d');
      this._resize();
      window.addEventListener('resize', () => this._resize());
    }
    this._resize();

    const colors = ['#B87F35', '#3F6152', '#8FAE9B', '#F3E3C8', '#D9A85E'];
    const W = this._canvas.width;
    const H = this._canvas.height;

    for (let i = 0; i < 80; i++) {
      this._particles.push({
        x: W / 2 + (Math.random() - 0.5) * 100,
        y: H / 2 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 1.5) * 15, // Вверх
        size: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.2,
        life: 1
      });
    }

    if (!this._raf) this._loop();
  },

  _resize() {
    if (!this._canvas) return;
    this._canvas.width = window.innerWidth * window.devicePixelRatio;
    this._canvas.height = window.innerHeight * window.devicePixelRatio;
    this._ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  },

  _loop() {
    const W = window.innerWidth;
    const H = window.innerHeight;
    this._ctx.clearRect(0, 0, W, H);

    for (let i = this._particles.length - 1; i >= 0; i--) {
      const p = this._particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4; // Гравитация
      p.vx *= 0.98; // Сопротивление
      p.vy *= 0.98;
      p.rot += p.vr;
      p.life -= 0.015;

      if (p.life <= 0 || p.y > H + 50) {
        this._particles.splice(i, 1);
        continue;
      }

      this._ctx.save();
      this._ctx.translate(p.x, p.y);
      this._ctx.rotate(p.rot);
      this._ctx.globalAlpha = p.life;
      this._ctx.fillStyle = p.color;
      this._ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      this._ctx.restore();
    }

    if (this._particles.length > 0) {
      this._raf = requestAnimationFrame(() => this._loop());
    } else {
      this._raf = null;
      this._ctx.clearRect(0, 0, W, H);
    }
  }
};

/* ═══ ПЕРЕХВАТЧИК ТОСТОВ (Триггеры праздника) ═══ */
const origToast = N.toast;
N.toast = function(msg, ms, cls) {
  // Определяем, за что давать конфетти
  let fire = false;
  if (typeof msg === 'string') {
    if (msg.includes('цель достигнута') || msg.includes('Цель достигнута')) fire = true; // Закрытие цели
    if (msg.includes('теперь в твоём саду')) fire = true; // Сбор дерева
    if (msg.includes('все дела дня')) fire = true; // Все дела выполнены
    if (cls === 'gold' && msg.includes('🏆')) fire = true; // Редкое достижение
  }

  if (fire) {
    window.Confetti.fire();
    if (window.Haptics) Haptics.play('success');
  }

  return origToast.call(this, msg, ms, cls);
};

/* ═══ СВЕТЛЯЧКИ ДЛЯ «ИДЕАЛЬНОГО ДНЯ» ═══ */
window.renderFireflies = function(container) {
  if (!container) return;
  container.querySelectorAll('.perfect-day-bg').forEach(el => el.remove());

  const bg = document.createElement('div');
  bg.className = 'perfect-day-bg';

  for (let i = 0; i < 15; i++) {
    const f = document.createElement('div');
    f.className = 'firefly';
    f.style.left = `${Math.random() * 100}%`;
    f.style.top = `${Math.random() * 100}%`;
    f.style.animationDelay = `${Math.random() * 5}s`;
    f.style.animationDuration = `${6 + Math.random() * 6}s`;
    bg.appendChild(f);
  }
  container.appendChild(bg);
};

console.log('[Delight] v1.0 (Confetti & Fireflies) loaded');
})();