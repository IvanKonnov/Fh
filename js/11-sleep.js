/* ═══ NAVLIFE · SLEEP TRACKER · v3.1 · Premium + Cycles + Tips ═══ */
(function(){
'use strict';
const N = window.__nav;
if (!N){ console.error('[SLEEP] __nav not found'); return; }
const { go, saveState, esc, todayKey, fmtDate, openModal, closeModal, toast, SFX, buzz } = N;
const qs = (s, r=document) => r.querySelector(s);

const TIPS = [
  'Старайтесь ложиться и вставать в одно и то же время, даже в выходные.',
  'Избегайте экранов за час до сна — синий свет сбивает выработку мелатонина.',
  'Оптимальная температура в спальне — 18–20°C.',
  'Не пейте кофе и крепкий чай после 16:00.',
  'Проветривайте спальню перед сном.',
  'Тяжёлая еда на ночь мешает глубокому сну. Ужинайте за 2–3 часа до сна.',
  'Попробуйте дыхательную практику 4-7-8 перед сном, чтобы быстрее заснуть.'
];

function get(ds){ return N.S.sleep[ds || todayKey()] || null; }
function set(ds, data){ N.S.sleep = N.S.sleep || {}; N.S.sleep[ds] = { ...data, ts: Date.now() }; saveState(); }

function hoursBetween(bed, wake){
  if (!bed || !wake) return 0;
  const [bh, bm] = bed.split(':').map(Number);
  const [wh, wm] = wake.split(':').map(Number);
  if ([bh,bm,wh,wm].some(isNaN)) return 0;
  let m1 = bh*60 + bm;
  let m2 = wh*60 + wm;
  if (m2 <= m1) m2 += 24*60;
  return +((m2 - m1) / 60).toFixed(1);
}

function fmtTime(m){
  if (!isFinite(m)) return '--:--';
  let total = m % (24*60);
  if (total < 0) total += 24*60;
  const h = Math.floor(total/60);
  const min = Math.floor(total % 60);
  return String(h).padStart(2,'0') + ':' + String(min).padStart(2,'0');
}

function isValidTime(s){
  return typeof s === 'string' && /^\d{2}:\d{2}$/.test(s);
}

/* ═══ Модалка записи сна ═══ */
function openModal_(){
  const ds = todayKey();
  const cur = get(ds) || { bed:'23:00', wake:'07:00', quality:3 };
  let bed = cur.bed, wake = cur.wake, quality = cur.quality || 3;

  openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom:16px">😴 Сон</div>
    <p class="muted" style="margin-bottom:16px">Запись за ${new Date().toLocaleDateString('ru-RU',{day:'numeric',month:'long'})}</p>

    <div class="field-row">
      <div class="field">
        <label>Ложился в</label>
        <input id="sBed" type="time" value="${bed}" style="text-align:center;font-weight:600;font-size:16px">
      </div>
      <div class="field">
        <label>Встал в</label>
        <input id="sWake" type="time" value="${wake}" style="text-align:center;font-weight:600;font-size:16px">
      </div>
    </div>

    <div id="hoursBadge" style="text-align:center;padding:14px;background:var(--paper);border-radius:12px;margin-bottom:16px;font-family:'Fraunces',serif;font-size:22px;font-weight:600;">— ч</div>

    <div class="field">
      <label>Качество сна</label>
      <div style="display:flex;gap:6px">
        ${[1,2,3,4,5].map(n => `<button type="button" data-q="${n}" style="
          flex:1;padding:12px 6px;border-radius:10px;font-weight:700;font-size:15px;
          background:${quality===n?'var(--moss)':'var(--paper)'};
          color:${quality===n?'#fff':'var(--ink-soft)'};
          border:1px solid ${quality===n?'var(--moss)':'var(--line)'};
          cursor:pointer;transition:all .15s;
        ">${n}${n===1?' 😞':n===2?' 😐':n===3?' 🙂':n===4?' 😄':' 🤩'}</button>`).join('')}
      </div>
    </div>
    
    <div style="padding:14px 16px;background:var(--moss-soft);border-radius:12px;margin-bottom:20px;font-size:13px;line-height:1.55;color:var(--moss)">
      <b>💡 Совет:</b> ${TIPS[Math.floor(Math.random() * TIPS.length)]}
    </div>

    <div style="display:flex;gap:10px">
      <button class="btn btn-ghost btn-full" id="sCancel" type="button">Отмена</button>
      <button class="btn btn-primary btn-full" id="sSave" type="button">Сохранить</button>
    </div>
  `, m => {
    const updHours = () => {
      const h = hoursBetween(qs('#sBed',m).value, qs('#sWake',m).value);
      qs('#hoursBadge',m).textContent = h ? `${h} ч` : '—';
    };
    updHours();
    qs('#sBed',m).oninput = updHours;
    qs('#sWake',m).oninput = updHours;
    
    m.querySelectorAll('[data-q]').forEach(b => b.onclick = () => {
      quality = +b.dataset.q;
      SFX.tap(); buzz(6);
      m.querySelectorAll('[data-q]').forEach(x => {
        const on = +x.dataset.q === quality;
        x.style.background = on ? 'var(--moss)' : 'var(--paper)';
        x.style.color = on ? '#fff' : 'var(--ink-soft)';
        x.style.borderColor = on ? 'var(--moss)' : 'var(--line)';
      });
    });
    
    qs('#sCancel',m).onclick = () => closeModal(m);
    qs('#sSave',m).onclick = () => {
      const bedV = qs('#sBed',m).value;
      const wakeV = qs('#sWake',m).value;
      if (!isValidTime(bedV) || !isValidTime(wakeV)){ toast('Укажи время'); return; }
      const hours = hoursBetween(bedV, wakeV);
      set(ds, { bed: bedV, wake: wakeV, quality, hours });
      SFX.ok();
      if (window.Achievements) window.Achievements.check();
      closeModal(m); 
      N.go(N.currentScreen || 'today');
      toast('Сон записан');
    };
  });
}

/* ═══ Двусторонний калькулятор циклов ═══ */
function openCycleCalculator(initialMode = 'wake', initialTime = '07:00') {
  let mode = initialMode;
  let timeVal = isValidTime(initialTime) ? initialTime : '07:00';

  const layer = openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom:6px">🧮 Циклы сна</div>
    <p class="muted" style="margin-bottom:16px">Узнай идеальное время для сна или подъёма</p>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:16px" id="ccTabs">
      <button type="button" data-mode="wake" style="padding:12px 8px;border-radius:12px;font-size:13px;font-weight:600;background:${mode==='wake'?'var(--moss)':'var(--paper)'};color:${mode==='wake'?'#fff':'var(--ink)'};border:1.5px solid ${mode==='wake'?'var(--moss)':'var(--line)'};">Хочу встать в</button>
      <button type="button" data-mode="bed" style="padding:12px 8px;border-radius:12px;font-size:13px;font-weight:600;background:${mode==='bed'?'var(--moss)':'var(--paper)'};color:${mode==='bed'?'#fff':'var(--ink)'};border:1.5px solid ${mode==='bed'?'var(--moss)':'var(--line)'};">Хочу лечь в</button>
    </div>

    <div class="field">
      <label id="ccLabel">${mode === 'wake' ? 'Во сколько нужно встать?' : 'Во сколько планируешь лечь?'}</label>
      <input id="ccTime" type="time" value="${timeVal}" style="width:100%;padding:14px;font-size:22px;text-align:center;font-weight:600;font-family:'Fraunces',serif;border:1.5px solid var(--moss);border-radius:12px;background:var(--surface);color:var(--ink)">
    </div>

    <div id="ccResult" style="margin-bottom:16px"></div>

    <div style="padding:14px 16px;background:var(--paper);border-radius:12px;font-size:12px;line-height:1.55;color:var(--ink-soft);margin-bottom:16px">
      <b>Как это работает:</b> Сон состоит из циклов по 90 минут. Легче всего просыпаться в конце цикла. Мы заложили 15 минут на засыпание.
    </div>

    <button class="btn btn-primary btn-full btn-lg" id="ccDone" type="button">Понятно</button>
  `, m => {
    const input = m.querySelector('#ccTime');
    const label = m.querySelector('#ccLabel');
    const tabs = m.querySelectorAll('[data-mode]');
    const resEl = m.querySelector('#ccResult');

    function compute() {
      const v = input.value;
      if (!isValidTime(v)) return;
      timeVal = v;
      const [h, mi] = v.split(':').map(Number);
      const baseMin = h * 60 + mi;
      const opts = [];
      
      if (mode === 'wake') {
        for (let cycles = 6; cycles >= 3; cycles--) {
          let bedMin = baseMin - 15 - cycles * 90;
          while (bedMin < 0) bedMin += 24 * 60;
          opts.push({
            cycles,
            time: fmtTime(bedMin),
            label: `${cycles} циклов · ${Math.floor(cycles*90/60)}ч ${cycles*90%60 ? cycles*90%60+'м' : ''}`
          });
        }
      } else {
        for (let cycles = 6; cycles >= 3; cycles--) {
          let wakeMin = baseMin + 15 + cycles * 90;
          while (wakeMin >= 24 * 60) wakeMin -= 24 * 60;
          opts.push({
            cycles,
            time: fmtTime(wakeMin),
            label: `${cycles} циклов · ${Math.floor(cycles*90/60)}ч ${cycles*90%60 ? cycles*90%60+'м' : ''}`
          });
        }
      }

      resEl.innerHTML = opts.map(o => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 16px;background:var(--surface-raised);border:1px solid var(--line);border-radius:12px;margin-bottom:8px;box-shadow:var(--sh-1)">
          <div>
            <div style="font-size:13px;font-weight:700;color:var(--ink);margin-bottom:2px">${o.label}</div>
            <div style="font-size:11px;color:var(--ink-soft)">${mode === 'wake' ? 'оптимальное время отхода' : 'оптимальное время подъёма'}</div>
          </div>
          <div style="font-family:'Fraunces',serif;font-size:24px;font-weight:600;color:var(--moss)">${o.time}</div>
        </div>
      `).join('');
    }

    tabs.forEach(b => b.onclick = () => {
      mode = b.dataset.mode;
      tabs.forEach(x => {
        const on = x.dataset.mode === mode;
        x.style.background = on ? 'var(--moss)' : 'var(--paper)';
        x.style.color = on ? '#fff' : 'var(--ink)';
        x.style.borderColor = on ? 'var(--moss)' : 'var(--line)';
      });
      label.textContent = mode === 'wake' ? 'Во сколько нужно встать?' : 'Во сколько планируешь лечь?';
      SFX.tap();
      compute();
    });

    input.addEventListener('input', compute);
    compute();

    m.querySelector('#ccDone').onclick = () => closeModal(layer);
  });
}

/* ═══ Карточка на главной ═══ */
function todayCard(){
  const ds = todayKey();
  const s = get(ds);
  const randomTip = TIPS[Math.floor(Math.random() * TIPS.length)];

  if (!s){
    return `<div class="card" style="margin-top:14px;background:linear-gradient(135deg,#3F5A7A 0%,#2E4158 100%);border:none;color:#F4F2EA;padding:20px">
      <div class="between" style="margin-bottom:14px">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,.1);display:grid;place-items:center;font-size:22px">😴</div>
          <div>
            <div style="font-size:16px;font-weight:600;font-family:'Fraunces',serif">Сон</div>
            <div style="font-size:12px;color:#C7CEC5;margin-top:2px">Записей пока нет</div>
          </div>
        </div>
        <div style="font-size:32px;opacity:.3">🌙</div>
      </div>
      <div style="padding:12px;background:rgba(255,255,255,.08);border-radius:12px;margin-bottom:16px;font-size:12.5px;line-height:1.5;color:#C7CEC5">
        💡 <b>Совет:</b> ${randomTip}
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-primary btn-full" data-sleep-open type="button" style="background:#F3E3C8;color:#3F5A7A;font-weight:600;box-shadow:none">Записать сон</button>
        <button class="btn btn-ghost btn-full" data-sleep-calc type="button" style="background:rgba(255,255,255,.1);color:#fff;border:none">Циклы</button>
      </div>
    </div>`;
  }
  
  const q = s.quality || 0;
  return `<div class="sleep-card" style="padding:20px; border-radius:var(--r-lg)">
    <div class="sleep-head" style="margin-bottom:16px">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,.1);display:grid;place-items:center;font-size:22px">😴</div>
        <div>
          <div style="font-size:16px;font-weight:600;font-family:'Fraunces',serif;color:#fff">Сон</div>
          <div style="font-size:12px;color:#C7CEC5;margin-top:2px">${s.bed} — ${s.wake}</div>
        </div>
      </div>
      <div style="text-align:right">
        <div class="sleep-big" style="font-size:28px;color:#F3E3C8;line-height:1">${s.hours}<span style="font-size:14px">ч</span></div>
        <div style="font-size:11px;color:#C7CEC5;margin-top:4px;letter-spacing:.05em">ДЛИТЕЛЬНОСТЬ</div>
      </div>
    </div>
    
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <div class="sleep-quality" style="margin-bottom:0">
        ${[1,2,3,4,5].map(n => `<i class="${n <= q ? 'on' : ''}"></i>`).join('')}
      </div>
      <div style="font-size:12px;color:#C7CEC5">${q === 1 ? 'Плохо' : q === 2 ? 'Средне' : q === 3 ? 'Нормально' : q === 4 ? 'Хорошо' : 'Отлично'}</div>
    </div>
    
    <div style="display:flex;gap:8px">
      <button class="sleep-btn" data-sleep-open type="button" style="background:rgba(255,255,255,.15);flex:1">✎ Изменить</button>
      <button class="sleep-btn" data-sleep-calc type="button" style="background:rgba(255,255,255,.08);flex:1">🧮 Циклы</button>
    </div>
  </div>`;
}

function correlationInsight(){
  const S = N.S;
  const keys = Object.keys(S.sleep || {});
  if (keys.length < 3) return '';
  const moods = S.mood || {};
  const withBoth = keys.filter(k => moods[k] && S.sleep[k].hours > 0);
  if (withBoth.length < 3) return '';
  const short = withBoth.filter(k => S.sleep[k].hours < 6.5);
  const long = withBoth.filter(k => S.sleep[k].hours >= 7.5);
  const avg = arr => arr.length ? (arr.reduce((s,k) => s + moods[k].m, 0) / arr.length) : 0;
  const avgShort = short.length ? avg(short) : 0;
  const avgLong = long.length ? avg(long) : 0;
  if (!short.length || !long.length) return '';
  if (Math.abs(avgShort - avgLong) < 0.4) return '';
  const direction = avgLong > avgShort ? 'выше' : 'ниже';
  return `<div style="font-size:13px;line-height:1.55">
    <b>💡 Инсайт.</b> Когда ты спишь ≥7.5ч, настроение в среднем
    <b style="font-family:'Fraunces',serif">${avgLong.toFixed(1)}</b>,
    а при сне <6.5ч — <b style="font-family:'Fraunces',serif">${avgShort.toFixed(1)}</b>.
    Т.е. ${direction} на ${Math.abs(avgLong - avgShort).toFixed(1)}.
  </div>`;
}

function weekChart(){
  const days = [];
  for (let i = 6; i >= 0; i--){
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = fmtDate(d);
    days.push({ ds, s: get(ds) });
  }
  const maxH = Math.max(8, ...days.map(x => x.s ? x.s.hours : 0));
  return `
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">
      ${days.map(x => {
        const h = x.s ? x.s.hours : 0;
        const pct = Math.min(100, (h / maxH) * 100);
        return `<div style="text-align:center">
          <div style="font-size:10px;color:var(--ink-mute);font-weight:600;margin-bottom:4px">${['Вс','Пн','Вт','Ср','Чт','Пт','Сб'][new Date(x.ds+'T00:00:00').getDay()]}</div>
          <div style="height:60px;border-radius:6px;background:var(--paper);position:relative;overflow:hidden;border:1px solid var(--line)">
            <div style="position:absolute;bottom:0;left:0;right:0;height:${pct}%;background:linear-gradient(180deg,#3F5A7A,#2E4158);border-radius:6px 6px 3px 3px"></div>
          </div>
          <div style="font-size:9.5px;color:var(--ink-mute);margin-top:3px;font-weight:600">${h ? h + 'ч' : '—'}</div>
        </div>`;
      }).join('')}
    </div>`;
}

window.Sleep = { get, set, open: openModal_, openCalc: openCycleCalculator, todayCard, correlationInsight, weekChart, TIPS };
console.log('[Sleep] v3.1 (Premium) loaded');
})();