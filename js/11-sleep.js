/* ═══ NAVLIFE · SLEEP ═══ */
(function(){
'use strict';
const N = window.__nav;
const { go, saveState, esc, todayKey, fmtDate, openModal, closeModal, toast, SFX, buzz } = N;

function get(ds){ return N.S.sleep[ds || todayKey()] || null; }
function set(ds, data){ N.S.sleep = N.S.sleep || {}; N.S.sleep[ds] = { ...data, ts: Date.now() }; saveState(); }

function hoursBetween(bed, wake){
  if (!bed || !wake) return 0;
  const [bh, bm] = bed.split(':').map(Number);
  const [wh, wm] = wake.split(':').map(Number);
  let m1 = bh*60 + bm;
  let m2 = wh*60 + wm;
  if (m2 <= m1) m2 += 24*60;
  return +((m2 - m1) / 60).toFixed(1);
}

function openModal_(){
  const ds = todayKey();
  const cur = get(ds) || { bed:'23:00', wake:'07:00', quality:3 };
  let bed = cur.bed, wake = cur.wake, quality = cur.quality || 3;

  openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom:6px">😴 Сон</div>
    <p class="muted" style="margin-bottom:16px">Запись за ${new Date().toLocaleDateString('ru-RU',{day:'numeric',month:'long'})}</p>

    <div class="field-row">
      <div class="field"><label>Ложился в</label><input id="sBed" type="time" value="${bed}"></div>
      <div class="field"><label>Встал в</label><input id="sWake" type="time" value="${wake}"></div>
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

    <div style="display:flex;gap:10px;margin-top:8px">
      <button class="btn btn-ghost btn-full" id="sCancel" type="button">Отмена</button>
      <button class="btn btn-primary btn-full" id="sSave" type="button">Сохранить</button>
    </div>
  `, m => {
    const updHours = () => {
      const h = hoursBetween(m.querySelector('#sBed').value, m.querySelector('#sWake').value);
      m.querySelector('#hoursBadge').textContent = h ? `${h} ч` : '—';
    };
    updHours();
    m.querySelector('#sBed').oninput = updHours;
    m.querySelector('#sWake').oninput = updHours;
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
    m.querySelector('#sCancel').onclick = () => closeModal(m);
    m.querySelector('#sSave').onclick = () => {
      const bedV = m.querySelector('#sBed').value;
      const wakeV = m.querySelector('#sWake').value;
      if (!bedV || !wakeV){ toast('Укажи время'); return; }
      const hours = hoursBetween(bedV, wakeV);
      set(ds, { bed: bedV, wake: wakeV, quality, hours });
      SFX.ok();
      if (window.Achievements) window.Achievements.check();
      closeModal(m); go(N.currentScreen || 'today');
      toast('Сон записан');
    };
  });
}

function todayCard(){
  const ds = todayKey();
  const s = get(ds);
  if (!s){
    return `<button class="card tappable" data-sleep-open type="button" style="width:100%;text-align:left;margin-top:14px;background:linear-gradient(135deg,#3F5A7A 0%,#2E4158 100%);border-color:transparent;color:#F4F2EA">
      <div class="between">
        <div>
          <div class="tiny" style="color:#C7CEC5">СОН</div>
          <div style="font-size:15px;font-weight:600;margin-top:6px;color:#F4F2EA">Записать сон</div>
          <div style="font-size:12.5px;margin-top:2px;color:#C7CEC5;opacity:.9">Сколько спал, качество</div>
        </div>
        <div style="font-size:30px">😴</div>
      </div>
    </button>`;
  }
  const q = s.quality || 0;
  return `<div class="sleep-card">
    <div class="sleep-head">
      <div class="sleep-title">😴 Сон</div>
      <div class="sleep-big">${s.hours}ч</div>
    </div>
    <div class="sleep-times">
      <div>🌙 <b>${s.bed}</b></div>
      <div>☀️ <b>${s.wake}</b></div>
    </div>
    <div class="sleep-quality">
      ${[1,2,3,4,5].map(n => `<i class="${n <= q ? 'on' : ''}"></i>`).join('')}
    </div>
    <button class="sleep-btn" data-sleep-open type="button">Изменить</button>
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

window.Sleep = { get, set, open: openModal_, todayCard, correlationInsight, weekChart };
})();