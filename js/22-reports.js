/* ═══ NAVLIFE · REPORTS · Canvas PDF + CSV ═══ */
(function(){
'use strict';
const N = window.__nav;
if (!N){ console.error('[REPORTS] __nav not found'); return; }
const qs = (s, r=document) => r.querySelector(s);

/* ═══ Собрать данные за N дней ═══ */
function collectData(days){
  const out = [];
  for (let i = days - 1; i >= 0; i--){
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = N.fmtDate(d);
    const nut = window.nutritionToday ? window.nutritionToday(ds) : {kcal:0,protein:0,fat:0,carbs:0,water:0};
    const day = N.S.nutrition.days[ds] || {};
    const items = N.S.navlife.schedule.filter(x => x.date === ds);
    const done = items.filter(x => x.completed).length;
    const total = items.length;
    const sessions = N.S.neurofit.sessions.filter(s => s.d === ds);
    const brainAcc = sessions.length ? Math.round(sessions.reduce((a,s) => a+s.acc,0)/sessions.length) : null;
    const sleep = N.S.sleep[ds] ? N.S.sleep[ds].hours : null;
    const mood = N.S.mood[ds] ? N.S.mood[ds].m : null;
    const habitsDone = (N.S.habits||[]).filter(h => ((h.log||{})[ds] || 0) >= (h.target||1)).length;
    const habitsTotal = (N.S.habits||[]).length;
    out.push({
      ds, date: d,
      kcal: nut.kcal, protein: nut.protein, fat: nut.fat, carbs: nut.carbs, water: nut.water,
      scheduleDone: done, scheduleTotal: total,
      schedulePct: total ? Math.round(done/total*100) : 0,
      brainSessions: sessions.length, brainAcc,
      sleep, mood, habitsDone, habitsTotal,
      habitsPct: habitsTotal ? Math.round(habitsDone/habitsTotal*100) : 0
    });
  }
  return out;
}

/* ═══ Утилиты ═══ */
function avg(arr){ return arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0; }
function nonNull(arr){ return arr.filter(x => x !== null && x !== undefined); }

/* ═══════════════════════════════════════════════════════════════════
   CANVAS PDF-отчёт (сохраняется как PNG)
   ═══════════════════════════════════════════════════════════════════ */
function generateReportImage(days = 30){
  const data = collectData(days);
  const W = 900;
  const H = 1400;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  /* Фон */
  const grad = ctx.createLinearGradient(0,0,0,H);
  grad.addColorStop(0,'#F8F8F4');
  grad.addColorStop(1,'#EDEFEA');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,W,H);

  /* Заголовок */
  ctx.fillStyle = '#1B211D';
  ctx.font = 'bold 40px Georgia, serif';
  ctx.fillText('NavLife', 60, 90);

  ctx.fillStyle = '#3F6152';
  ctx.font = '600 18px -apple-system, sans-serif';
  ctx.fillText('ОТЧЁТ О ПРОГРЕССЕ', 60, 120);

  const endDate = new Date();
  const startDate = new Date(); startDate.setDate(endDate.getDate() - days + 1);
  ctx.fillStyle = '#7B857B';
  ctx.font = '15px -apple-system, sans-serif';
  const periodLabel = `${startDate.toLocaleDateString('ru-RU',{day:'numeric',month:'long'})} — ${endDate.toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'})}`;
  ctx.fillText(periodLabel, 60, 148);
  ctx.fillText(`Пользователь: ${N.S.shared.name}`, 60, 172);

  /* Разделитель */
  ctx.strokeStyle = '#D8DBD1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 195);
  ctx.lineTo(W-60, 195);
  ctx.stroke();

  /* === Сводные метрики (большие карточки) === */
  const metrics = [
    { label:'СЕРИЯ', value: String(N.S.neurofit.streak), sub:'дней подряд', icon:'🔥', color:'#B87F35' },
    { label:'СРЕДНИЙ СОН', value: nonNull(data.map(d=>d.sleep)).length ? avg(nonNull(data.map(d=>d.sleep))).toFixed(1) + ' ч' : '—', sub: `${nonNull(data.map(d=>d.sleep)).length} дней`, icon:'😴', color:'#3F5A7A' },
    { label:'СРЕДНЕЕ НАСТРОЕНИЕ', value: nonNull(data.map(d=>d.mood)).length ? avg(nonNull(data.map(d=>d.mood))).toFixed(1) + '/5' : '—', sub: `${nonNull(data.map(d=>d.mood)).length} дней`, icon:'🙂', color:'#3F6152' },
    { label:'ДЕЛА', value: Math.round(avg(data.map(d=>d.schedulePct))) + '%', sub: 'средний %', icon:'📋', color:'#4F7563' }
  ];

  const cardW = (W - 60*2 - 3*14) / 4;
  const cardH = 130;
  const cardY = 220;

  metrics.forEach((m, i) => {
    const x = 60 + i * (cardW + 14);
    /* карточка */
    roundRect(ctx, x, cardY, cardW, cardH, 14);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#D8DBD1';
    ctx.stroke();

    /* иконка */
    ctx.font = '26px -apple-system, sans-serif';
    ctx.fillStyle = '#1B211D';
    ctx.fillText(m.icon, x + 14, cardY + 36);

    /* label */
    ctx.fillStyle = '#7B857B';
    ctx.font = '600 10px -apple-system, sans-serif';
    ctx.fillText(m.label, x + 14, cardY + 60);

    /* value */
    ctx.fillStyle = m.color;
    ctx.font = 'bold 28px Georgia, serif';
    ctx.fillText(m.value, x + 14, cardY + 98);

    /* sub */
    ctx.fillStyle = '#7B857B';
    ctx.font = '11px -apple-system, sans-serif';
    ctx.fillText(m.sub, x + 14, cardY + 118);
  });

  /* === График активности === */
  const chartY = 400;
  ctx.fillStyle = '#1B211D';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText('Активность по дням', 60, chartY);

  const chartH = 240;
  const chartW = W - 120;
  const barCount = Math.min(days, 30);
  const barData = data.slice(-barCount);
  const barGap = 4;
  const barW = Math.max(2, (chartW - (barCount - 1) * barGap) / barCount);

  /* Сетка */
  ctx.strokeStyle = '#E5E7E0';
  for (let i = 0; i <= 4; i++){
    const y = chartY + 30 + chartH - (chartH * i / 4);
    ctx.beginPath();
    ctx.moveTo(60, y);
    ctx.lineTo(W - 60, y);
    ctx.stroke();
  }

  /* Подпись оси */
  ctx.fillStyle = '#7B857B';
  ctx.font = '10px -apple-system, sans-serif';
  ctx.fillText('100%', W-85, chartY + 40);
  ctx.fillText('50%',  W-85, chartY + 30 + chartH/2);
  ctx.fillText('0%',   W-85, chartY + 30 + chartH);

  /* Столбики */
  barData.forEach((d, i) => {
    const x = 60 + i * (barW + barGap);
    const hS = (d.schedulePct / 100) * chartH;
    const hH = (d.habitsPct / 100) * chartH;
    /* делятся друг за другом */
    if (hS > 0){
      roundRect(ctx, x, chartY + 30 + chartH - hS, barW / 2 - 1, hS, 3);
      ctx.fillStyle = '#3F6152';
      ctx.fill();
    }
    if (hH > 0){
      roundRect(ctx, x + barW / 2 + 1, chartY + 30 + chartH - hH, barW / 2 - 1, hH, 3);
      ctx.fillStyle = '#B87F35';
      ctx.fill();
    }
  });

  /* Легенда */
  ctx.fillStyle = '#3F6152';
  ctx.fillRect(W-220, chartY - 12, 12, 12);
  ctx.fillStyle = '#1B211D';
  ctx.font = '12px -apple-system, sans-serif';
  ctx.fillText('Дела', W-204, chartY - 2);

  ctx.fillStyle = '#B87F35';
  ctx.fillRect(W-150, chartY - 12, 12, 12);
  ctx.fillStyle = '#1B211D';
  ctx.fillText('Привычки', W-134, chartY - 2);

  /* === Блок "Итого за период" === */
  const sumY = chartY + 30 + chartH + 40;

  ctx.fillStyle = '#1B211D';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText('Итого за период', 60, sumY);

  const totals = [
    { label:'Тренировок мозга', value: data.reduce((s,d) => s+d.brainSessions, 0) },
    { label:'Средняя точность', value: nonNull(data.map(d=>d.brainAcc)).length ? Math.round(avg(nonNull(data.map(d=>d.brainAcc)))) + '%' : '—' },
    { label:'Принято воды', value: (data.reduce((s,d) => s+d.water, 0) / 1000).toFixed(1) + ' л' },
    { label:'Средняя калорийность', value: Math.round(avg(data.map(d=>d.kcal))) + ' ккал' }
  ];

  const tRowY = sumY + 20;
  const tRowW = (W - 120 - 14) / 2;
  const tRowH = 58;
  totals.forEach((t, i) => {
    const row = Math.floor(i/2);
    const col = i % 2;
    const x = 60 + col * (tRowW + 14);
    const y = tRowY + row * (tRowH + 10);

    roundRect(ctx, x, y, tRowW, tRowH, 12);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#D8DBD1';
    ctx.stroke();

    ctx.fillStyle = '#7B857B';
    ctx.font = '11px -apple-system, sans-serif';
    ctx.fillText(t.label, x + 14, y + 22);

    ctx.fillStyle = '#1B211D';
    ctx.font = 'bold 20px Georgia, serif';
    ctx.fillText(String(t.value), x + 14, y + 48);
  });

  /* === Футер === */
  ctx.fillStyle = '#7B857B';
  ctx.font = '11px -apple-system, sans-serif';
  const genDate = new Date().toLocaleString('ru-RU');
  ctx.fillText(`Отчёт сгенерирован: ${genDate}`, 60, H - 50);

  ctx.fillStyle = '#3F6152';
  ctx.font = 'bold 12px -apple-system, sans-serif';
  ctx.fillText('NavLife · маршрут дня', W - 200, H - 50);

  return canvas;
}

function roundRect(ctx, x, y, w, h, r){
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/* ═══ Скачать PNG ═══ */
function downloadPNG(days){
  const canvas = generateReportImage(days);
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `navlife-report-${N.todayKey()}-${days}d.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    N.toast('Отчёт сохранён');
    N.SFX.win();
  }, 'image/png', 0.95);
}

/* ═══ CSV ═══ */
function downloadCSV(days){
  const data = collectData(days);
  const header = ['Дата','Ккал','Белки','Жиры','Углеводы','Вода_мл','Сон_ч','Настроение','Энергия','Дела_%','Привычки_%','Тренировки','Точность_%'];
  const rows = data.map(d => [
    d.ds, d.kcal, d.protein, d.fat, d.carbs, d.water,
    d.sleep !== null ? d.sleep : '', d.mood !== null ? d.mood : '', '',
    d.schedulePct, d.habitsPct, d.brainSessions,
    d.brainAcc !== null ? d.brainAcc : ''
  ]);
  const csv = '\uFEFF' + [header, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], {type: 'text/csv;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `navlife-data-${N.todayKey()}-${days}d.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  N.toast('CSV сохранён');
}

/* ═══ Модалка отчёта ═══ */
function openReportModal(){
  let days = 30;
  let format = 'png';

  N.openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom:6px">📊 Отчёт</div>
    <p class="muted" style="margin-bottom:18px">Выбери период и формат. Отчёт можно показать тренеру, врачу или сохранить для себя.</p>

    <div class="field">
      <label>Период</label>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:6px">
        ${[7,30,90].map(n => `
          <button type="button" data-days="${n}" style="
            padding:14px 8px;border-radius:12px;font-size:14px;font-weight:600;
            background:${days===n?'var(--moss)':'var(--paper)'};
            color:${days===n?'#fff':'var(--ink)'};
            border:1.5px solid ${days===n?'var(--moss)':'var(--line)'};
            cursor:pointer;transition:all .15s;
          ">${n} дней</button>`).join('')}
      </div>
    </div>

    <div class="field">
      <label>Формат</label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px">
        <button type="button" data-fmt="png" style="
          padding:14px 10px;border-radius:12px;font-size:13.5px;font-weight:600;text-align:left;
          background:${format==='png'?'var(--moss-soft)':'var(--paper)'};
          color:${format==='png'?'var(--moss)':'var(--ink)'};
          border:1.5px solid ${format==='png'?'var(--moss)':'var(--line)'};
          cursor:pointer;
        ">
          <div style="font-size:22px;margin-bottom:4px">🖼</div>
          <div>Картинка-отчёт</div>
          <div style="font-size:10.5px;opacity:.75;font-weight:500;margin-top:2px">Графики + сводки</div>
        </button>
        <button type="button" data-fmt="csv" style="
          padding:14px 10px;border-radius:12px;font-size:13.5px;font-weight:600;text-align:left;
          background:${format==='csv'?'var(--moss-soft)':'var(--paper)'};
          color:${format==='csv'?'var(--moss)':'var(--ink)'};
          border:1.5px solid ${format==='csv'?'var(--moss)':'var(--line)'};
          cursor:pointer;
        ">
          <div style="font-size:22px;margin-bottom:4px">📄</div>
          <div>CSV-таблица</div>
          <div style="font-size:10.5px;opacity:.75;font-weight:500;margin-top:2px">Для Excel / Sheets</div>
        </button>
      </div>
    </div>

    <div style="display:flex;gap:10px;margin-top:16px">
      <button class="btn btn-ghost btn-full" id="repCancel" type="button">Отмена</button>
      <button class="btn btn-primary btn-full btn-lg" id="repGen" type="button">Скачать</button>
    </div>
  `, m => {
    m.querySelectorAll('[data-days]').forEach(b => b.onclick = () => {
      days = +b.dataset.days;
      N.SFX.tap();
      m.querySelectorAll('[data-days]').forEach(x => {
        const on = +x.dataset.days === days;
        x.style.background = on ? 'var(--moss)' : 'var(--paper)';
        x.style.color = on ? '#fff' : 'var(--ink)';
        x.style.borderColor = on ? 'var(--moss)' : 'var(--line)';
      });
    });
    m.querySelectorAll('[data-fmt]').forEach(b => b.onclick = () => {
      format = b.dataset.fmt;
      N.SFX.tap();
      m.querySelectorAll('[data-fmt]').forEach(x => {
        const on = x.dataset.fmt === format;
        x.style.background = on ? 'var(--moss-soft)' : 'var(--paper)';
        x.style.color = on ? 'var(--moss)' : 'var(--ink)';
        x.style.borderColor = on ? 'var(--moss)' : 'var(--line)';
      });
    });
    m.querySelector('#repCancel').onclick = () => N.closeModal(m);
    m.querySelector('#repGen').onclick = () => {
      N.closeModal(m);
      setTimeout(() => {
        if (format === 'png') downloadPNG(days);
        else downloadCSV(days);
      }, 200);
    };
  });
}

/* ═══ Кнопка в Профиль ═══ */
window.App.hooks.afterGo.push(name => {
  if (name !== 'profile') return;
  setTimeout(() => {
    const host = qs('#screens');
    if (!host) return;
    if (host.querySelector('[data-report-btn]')) return;
    const card = document.createElement('button');
    card.className = 'card tappable';
    card.setAttribute('data-report-btn', '');
    card.type = 'button';
    card.style.cssText = 'width:100%;text-align:left';
    card.innerHTML = `
      <div class="between">
        <div>
          <div class="h3" style="margin-bottom:2px">📊 Отчёты</div>
          <div class="muted" style="font-size:12.5px">Картинка или CSV за 7 / 30 / 90 дней</div>
        </div>
        <div style="font-size:18px;color:var(--ink-mute)">›</div>
      </div>`;
    card.onclick = () => { N.SFX.tap(); openReportModal(); };

    /* Вставим после блока "Данные" */
    const cards = host.querySelectorAll('.card');
    const dataCard = Array.from(cards).find(c => c.textContent.includes('Экспорт') && c.textContent.includes('Импорт'));
    if (dataCard && dataCard.parentNode){
      dataCard.parentNode.insertBefore(card, dataCard.nextSibling);
    } else {
      host.appendChild(card);
    }
  }, 80);
});

window.Reports = { open: openReportModal, generateImage: generateReportImage, downloadPNG, downloadCSV };
console.log('[Reports] loaded');
})();