/* ═══ NAVLIFE · DAY TEMPLATES · v2.0 · с полной заменой дня ═══ */
(function(){
'use strict';
const N = window.__nav;
if (!N){ console.error('[TEMPLATES] __nav not found'); return; }
const qs = (s, r=document) => r.querySelector(s);
const qsa = (s, r=document) => Array.from(r.querySelectorAll(s));
const _esc = (s) => String(s??'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function ensure(){
  if (!Array.isArray(N.S.navlife.dayTemplates)){
    N.S.navlife.dayTemplates = defaultTemplates();
  }
  if (!N.S.navlife.baseSkip) N.S.navlife.baseSkip = {};
}

function defaultTemplates(){
  return [
    {
      id: 'tpl_workday', name: 'Будний день', emoji: '💼',
      items: [
        { title:'Подъём', startTime:'07:00', endTime:'07:15' },
        { title:'Зарядка', startTime:'07:15', endTime:'07:45' },
        { title:'Душ и завтрак', startTime:'07:45', endTime:'08:30' },
        { title:'Работа', startTime:'09:00', endTime:'18:00' },
        { title:'Ужин', startTime:'19:00', endTime:'19:30' },
        { title:'Отдых', startTime:'19:30', endTime:'21:00' },
        { title:'Чтение', startTime:'21:00', endTime:'22:00' },
        { title:'Сон', startTime:'22:30', endTime:'23:00' }
      ]
    },
    {
      id: 'tpl_weekend', name: 'Выходной', emoji: '🌿',
      items: [
        { title:'Поздний подъём', startTime:'09:00', endTime:'09:30' },
        { title:'Завтрак', startTime:'09:30', endTime:'10:30' },
        { title:'Прогулка', startTime:'11:00', endTime:'13:00' },
        { title:'Обед', startTime:'13:00', endTime:'14:00' },
        { title:'Хобби / встреча', startTime:'15:00', endTime:'18:00' },
        { title:'Ужин', startTime:'19:00', endTime:'20:00' },
        { title:'Фильм / книга', startTime:'20:00', endTime:'22:00' },
        { title:'Сон', startTime:'23:00', endTime:'23:30' }
      ]
    },
    {
      id: 'tpl_home', name: 'Дома', emoji: '🏠',
      items: [
        { title:'Подъём', startTime:'08:00', endTime:'08:30' },
        { title:'Зарядка', startTime:'08:30', endTime:'09:00' },
        { title:'Завтрак', startTime:'09:00', endTime:'09:45' },
        { title:'Работа / учёба', startTime:'10:00', endTime:'13:00' },
        { title:'Обед', startTime:'13:00', endTime:'14:00' },
        { title:'Работа / учёба', startTime:'14:00', endTime:'18:00' },
        { title:'Ужин', startTime:'19:00', endTime:'20:00' },
        { title:'Прогулка / проветривание', startTime:'20:00', endTime:'20:30' },
        { title:'Релакс', startTime:'21:00', endTime:'22:30' }
      ]
    }
  ];
}

/* ═══════════════════════════════════════════════════════════════════
   ПОЛНАЯ ЗАМЕНА ДНЯ
   1. Удаляем ВСЕ события дня (включая базовые, повторяющиеся, свои)
   2. Ставим baseSkip на все пункты baseRoutine для этой даты —
      чтобы ensureBaseForDate НЕ генерировала их снова
   3. Добавляем события из шаблона
   ═══════════════════════════════════════════════════════════════════ */
function replaceDay(dateStr, templateId){
  ensure();
  const tpl = N.S.navlife.dayTemplates.find(t => t.id === templateId);
  if (!tpl) return { added: 0, removed: 0 };

  /* 1. Удаляем все события этого дня */
  const before = N.S.navlife.schedule.filter(i => i.date === dateStr).length;
  N.S.navlife.schedule = N.S.navlife.schedule.filter(i => i.date !== dateStr);

  /* 2. Помечаем все baseRoutine как skip для этого дня */
  N.S.navlife.baseSkip = N.S.navlife.baseSkip || {};
  (N.S.navlife.baseRoutine || []).forEach(b => {
    N.S.navlife.baseSkip[`${dateStr}|${b.id}`] = true;
  });

  /* 3. Добавляем события шаблона */
  let added = 0;
  tpl.items.forEach(item => {
    N.S.navlife.schedule.push({
      id: 'tpl_item_' + Math.random().toString(36).slice(2,9),
      title: item.title,
      type: 'task',
      startTime: item.startTime,
      endTime: item.endTime,
      date: dateStr,
      completed: false,
      programId: null,
      goalStepId: null,
      fromBase: false,
      fromRecurring: false,
      fromTemplate: tpl.id
    });
    added++;
  });

  N.saveState();
  if (N.computeDailyStats) N.computeDailyStats(dateStr);
  return { added, removed: before };
}

/* Снять все skip на этот день — на случай отката */
function clearDaySkip(dateStr){
  ensure();
  const baseSkip = N.S.navlife.baseSkip || {};
  Object.keys(baseSkip).forEach(k => {
    if (k.startsWith(dateStr + '|')) delete baseSkip[k];
  });
  N.saveState();
}

/* ═══ Модалка ═══ */
function openTemplatesModal(dateStr){
  ensure();
  dateStr = dateStr || N.S.navlife.viewDate || N.todayKey();
  const isToday = dateStr === N.todayKey();
  const dayLabel = isToday
    ? 'сегодня'
    : new Date(dateStr+'T00:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'long'});
  const existingCount = N.S.navlife.schedule.filter(i => i.date === dateStr).length;

  N.openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom:6px">📋 Шаблоны дня</div>
    <p class="muted" style="margin-bottom:16px">Шаблон <b style="color:var(--ink)">заменит весь день</b> — включая базовый распорядок. Применяется на ${dayLabel}.</p>

    ${existingCount ? `
      <div style="padding:10px 12px;background:var(--amber-soft);border-radius:10px;margin-bottom:14px;font-size:12px;color:var(--amber-dim);line-height:1.5">
        ⚠️ На этот день уже есть <b>${existingCount}</b> ${existingCount === 1 ? 'событие' : 'событий'}. Они будут удалены при применении шаблона.
      </div>
    ` : ''}

    <div style="display:grid;gap:10px" id="tplList"></div>
    <div style="margin-top:16px;display:flex;gap:10px">
      <button class="btn btn-ghost btn-full" id="tplNew" type="button">+ Свой шаблон</button>
      <button class="btn btn-ghost btn-full" id="tplCancel" type="button">Закрыть</button>
    </div>
  `, m => {
    const list = m.querySelector('#tplList');
    list.innerHTML = N.S.navlife.dayTemplates.map(t => `
      <div class="card" style="margin:0;padding:14px">
        <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:10px">
          <div style="font-size:28px;flex-shrink:0">${t.emoji}</div>
          <div style="flex:1;min-width:0">
            <div style="font-family:'Fraunces',serif;font-size:15px;font-weight:600">${_esc(t.name)}</div>
            <div class="muted" style="font-size:11.5px;margin-top:2px">${t.items.length} событий</div>
          </div>
          <button class="icon-btn" data-tpl-edit="${t.id}" type="button" style="width:28px;height:28px;font-size:12px;background:transparent;border-color:transparent;color:var(--ink-mute)">✎</button>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px">
          ${t.items.slice(0,5).map(i => `<span style="font-size:10.5px;padding:2px 8px;border-radius:100px;background:var(--paper);border:1px solid var(--line);color:var(--ink-soft)">${i.startTime} ${_esc(i.title)}</span>`).join('')}
          ${t.items.length > 5 ? `<span style="font-size:10.5px;padding:2px 8px;color:var(--ink-mute)">+${t.items.length-5}</span>` : ''}
        </div>
        <button class="btn btn-primary btn-sm btn-full" data-tpl-apply="${t.id}" type="button">Заменить день</button>
      </div>
    `).join('');

    list.querySelectorAll('[data-tpl-apply]').forEach(b => b.onclick = () => {
      const id = b.dataset.tplApply;
      if (existingCount){
        if (!confirm(`Заменить весь день? ${existingCount} существующих событий будут удалены.`)) return;
      }
      const res = replaceDay(dateStr, id);
      N.closeModal(m);
      N.SFX.win(); N.buzz([10, 30, 10]);
      N.toast(`День обновлён: ${res.removed} → ${res.added} событий`);
      setTimeout(() => N.go('schedule'), 120);
    });

    list.querySelectorAll('[data-tpl-edit]').forEach(b => b.onclick = () => {
      N.closeModal(m);
      setTimeout(() => openEditTemplate(b.dataset.tplEdit, dateStr), 150);
    });

    m.querySelector('#tplNew').onclick = () => {
      N.closeModal(m);
      setTimeout(() => openEditTemplate(null, dateStr), 150);
    };
    m.querySelector('#tplCancel').onclick = () => N.closeModal(m);
  });
}

/* ═══ Редактор шаблона ═══ */
function openEditTemplate(templateId, dateStr){
  ensure();
  const tpl = templateId ? N.S.navlife.dayTemplates.find(t => t.id === templateId) : null;
  const isEd = !!tpl;
  let items = tpl ? JSON.parse(JSON.stringify(tpl.items)) : [];

  N.openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom:16px">${isEd ? 'Изменить шаблон' : 'Новый шаблон'}</div>
    <div class="field-row">
      <div class="field" style="flex:0 0 70px"><label>Эмодзи</label><input id="tplEmoji" maxlength="2" value="${tpl ? tpl.emoji : '📋'}"></div>
      <div class="field"><label>Название</label><input id="tplName" value="${tpl ? _esc(tpl.name) : ''}" placeholder="Например, День из дома"></div>
    </div>
    <div class="field">
      <label>События</label>
      <div id="tplItems"></div>
      <div style="display:flex;gap:6px;margin-top:8px">
        <button class="btn btn-line btn-sm" id="tplAdd" type="button" style="flex:1">+ Событие</button>
        <button class="btn btn-line btn-sm" id="tplCopyDay" type="button" style="flex:1">📋 Скопировать день</button>
      </div>
    </div>
    <div style="display:flex;gap:10px;margin-top:16px">
      ${isEd ? '<button class="btn btn-line btn-danger" id="tplDel" type="button">Удалить</button>' : ''}
      <button class="btn btn-ghost btn-full" id="tplCancel" type="button">Отмена</button>
      <button class="btn btn-primary btn-full" id="tplSave" type="button">Сохранить</button>
    </div>
  `, m => {
    const itemsEl = m.querySelector('#tplItems');

    function drawItems(){
      itemsEl.innerHTML = items.map((it, i) => `
        <div style="padding:10px 12px;background:var(--paper);border-radius:10px;margin-bottom:6px">
          <div style="display:flex;gap:6px;align-items:center;margin-bottom:6px">
            <input data-ti="${i}|title" value="${_esc(it.title)}" placeholder="Название" style="flex:1;border:1px solid var(--line);border-radius:8px;padding:7px 10px;font-size:13.5px;background:var(--surface);color:var(--ink)">
            <button class="icon-btn btn-danger" data-ti-del="${i}" type="button" style="width:32px;height:32px;font-size:12px">✕</button>
          </div>
          <div style="display:flex;gap:6px;align-items:center">
            <input type="time" data-ti="${i}|startTime" value="${it.startTime}" style="flex:1;border:1px solid var(--line);border-radius:8px;padding:6px 8px;font-size:12.5px;background:var(--surface);color:var(--ink)">
            <span style="color:var(--ink-mute);font-size:12px">—</span>
            <input type="time" data-ti="${i}|endTime" value="${it.endTime}" style="flex:1;border:1px solid var(--line);border-radius:8px;padding:6px 8px;font-size:12.5px;background:var(--surface);color:var(--ink)">
          </div>
        </div>
      `).join('') || '<div class="muted" style="text-align:center;padding:12px;font-size:12.5px">Пока пусто</div>';
      itemsEl.querySelectorAll('[data-ti]').forEach(el => {
        const [k, field] = el.dataset.ti.split('|');
        el.oninput = () => { items[+k][field] = el.value; };
      });
      itemsEl.querySelectorAll('[data-ti-del]').forEach(b => b.onclick = () => {
        items.splice(+b.dataset.tiDel, 1); drawItems();
      });
    }
    drawItems();

    m.querySelector('#tplAdd').onclick = () => {
      items.push({ title:'Новое событие', startTime:'12:00', endTime:'13:00' });
      drawItems();
    };
    m.querySelector('#tplCopyDay').onclick = () => {
      const dayItems = N.S.navlife.schedule.filter(i => i.date === dateStr)
        .sort((a,b) => N.toMin(a.startTime) - N.toMin(b.startTime));
      if (!dayItems.length){ N.toast('На этот день нет событий'); return; }
      items = dayItems.map(i => ({ title: i.title, startTime: i.startTime, endTime: i.endTime }));
      drawItems();
      N.toast(`Скопировано ${dayItems.length} событий`);
    };
    m.querySelector('#tplCancel').onclick = () => N.closeModal(m);
    m.querySelector('#tplSave').onclick = () => {
      const nm = m.querySelector('#tplName').value.trim();
      if (!nm){ N.toast('Введи название'); return; }
      const em = m.querySelector('#tplEmoji').value.trim() || '📋';
      const cleanItems = items.filter(it => it.title.trim());
      if (!cleanItems.length){ N.toast('Добавь хотя бы одно событие'); return; }
      if (isEd){
        tpl.name = nm; tpl.emoji = em; tpl.items = cleanItems;
      } else {
        N.S.navlife.dayTemplates.push({
          id: 'tpl_' + Math.random().toString(36).slice(2,8),
          name: nm, emoji: em, items: cleanItems
        });
      }
      N.saveState(); N.closeModal(m);
      N.toast(isEd ? 'Обновлено' : 'Шаблон создан');
    };
    const del = m.querySelector('#tplDel');
    if (del) del.onclick = () => {
      if (confirm('Удалить шаблон?')){
        N.S.navlife.dayTemplates = N.S.navlife.dayTemplates.filter(t => t.id !== tpl.id);
        N.saveState(); N.closeModal(m);
        N.toast('Удалено');
      }
    };
  });
}

/* ═══ Кнопка в Делах ═══ */
window.App.hooks.afterGo.push(name => {
  if (name !== 'schedule') return;
  setTimeout(() => {
    const host = qs('#screens');
    if (!host) return;
    if (host.querySelector('[data-tpl-btn]')) return;
    const switcher = host.querySelector('[data-view-switch]');
    if (!switcher) return;

    const btn = document.createElement('button');
    btn.setAttribute('data-tpl-btn', '');
    btn.type = 'button';
    btn.className = 'btn btn-line btn-sm';
    btn.style.cssText = 'width:100%;margin-bottom:14px';
    btn.innerHTML = '📋 Шаблоны дня';
    btn.onclick = () => {
      N.SFX.tap();
      openTemplatesModal(N.S.navlife.viewDate);
    };
    switcher.parentNode.insertBefore(btn, switcher.nextSibling);
  }, 60);
});

window.DayTemplates = { open: openTemplatesModal, replace: replaceDay, clearDaySkip };
console.log('[Day Templates] v2.0 loaded');
})();