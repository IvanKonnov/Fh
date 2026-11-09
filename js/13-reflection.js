/* ═══ NAVLIFE · REFLECTION · v3.0 · True Diary ═══ */
(function(){
'use strict';
const N = window.__nav;
const { go, saveState, esc, todayKey, openModal, closeModal, toast, SFX } = N;

/* ═══ МОДАЛКА НАПИСАНИЯ ═══ */
function open(){
  openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom:6px">Новая запись</div>
    <p class="muted" style="margin-bottom:18px">${new Date().toLocaleDateString('ru-RU', {weekday:'long', day:'numeric', month:'long'})}</p>
    
    <div class="field">
      <label>Что получилось?</label>
      <textarea id="rfQ1" style="min-height:70px;width:100%;border:1px solid var(--line);border-radius:9px;padding:10px 12px;font-family:inherit;background:var(--surface);color:var(--ink);font-size:14px" placeholder="Победы, приятные моменты, благодарности..."></textarea>
    </div>
    <div class="field">
      <label>Что не получилось?</label>
      <textarea id="rfQ2" style="min-height:70px;width:100%;border:1px solid var(--line);border-radius:9px;padding:10px 12px;font-family:inherit;background:var(--surface);color:var(--ink);font-size:14px" placeholder="Что было сложно, над чем стоит подумать..."></textarea>
    </div>
    <div class="field">
      <label>Планы или выводы</label>
      <textarea id="rfQ3" style="min-height:70px;width:100%;border:1px solid var(--line);border-radius:9px;padding:10px 12px;font-family:inherit;background:var(--surface);color:var(--ink);font-size:14px" placeholder="Что изменить, попробовать, сделать..."></textarea>
    </div>
    
    <div style="display:flex;gap:10px;margin-top:16px">
      <button class="btn btn-ghost btn-full" id="rfCancel" type="button">Отмена</button>
      <button class="btn btn-primary btn-full" id="rfSave" type="button">Сохранить</button>
    </div>
  `, m => {
    m.querySelector('#rfCancel').onclick = () => closeModal(m);
    m.querySelector('#rfSave').onclick = () => {
      const q1 = m.querySelector('#rfQ1').value.trim();
      const q2 = m.querySelector('#rfQ2').value.trim();
      const q3 = m.querySelector('#rfQ3').value.trim();
      if (!q1 && !q2 && !q3){ toast('Заполни хотя бы одно поле'); return; }
      
      if (!N.S.reflections) N.S.reflections = [];
      
      // ДОБАВЛЯЕМ новую запись, не перезаписываем старую!
      N.S.reflections.push({
        id: 'refl_' + Math.random().toString(36).slice(2,9),
        date: todayKey(),
        q1, q2, q3,
        ts: Date.now()
      });
      
      saveState();
      closeModal(m);
      toast('Запись добавлена ✓');
      SFX.ok();
      if (window.Achievements) window.Achievements.check();
      
      // Перерисовываем текущий экран (статистику)
      if (N.currentScreen === 'stats') go('stats');
    };
  });
}

/* ═══ ИСТОРИЯ (Все записи) ═══ */
function history(){
  const list = (N.S.reflections || []).slice().sort((a, b) => b.ts - a.ts);
  
  openModal(`
    <div class="modal-handle"></div>
    <div class="between" style="margin-bottom:16px">
      <div class="h2">Дневник рефлексии</div>
      <div class="tiny">${list.length} записей</div>
    </div>
    
    <div style="max-height:60vh;overflow-y:auto;padding-right:4px">
      ${list.length ? list.map((r, index) => {
        const d = new Date(r.ts);
        const dateStr = d.toLocaleDateString('ru-RU', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'});
        return `
          <div class="card" style="padding:16px;margin-bottom:10px" id="refl-card-${index}">
            <div class="between" style="margin-bottom:10px">
              <div class="tiny" style="color:var(--moss);font-weight:600">${dateStr}</div>
              <button class="icon-btn btn-danger" data-del-refl="${index}" type="button" style="width:28px;height:28px;font-size:12px;background:transparent;border-color:transparent" title="Удалить">✕</button>
            </div>
            ${r.q1 ? `<div style="font-size:13px;margin-bottom:8px;line-height:1.5"><b style="color:var(--moss)">+</b> ${esc(r.q1)}</div>` : ''}
            ${r.q2 ? `<div style="font-size:13px;margin-bottom:8px;line-height:1.5"><b style="color:var(--rust)">−</b> ${esc(r.q2)}</div>` : ''}
            ${r.q3 ? `<div style="font-size:13px;line-height:1.5"><b style="color:var(--amber-dim)">→</b> ${esc(r.q3)}</div>` : ''}
          </div>
        `;
      }).join('') : '<p class="muted" style="text-align:center;padding:24px 0">Пока нет записей.</p>'}
    </div>
    
    <div style="display:flex;gap:10px;margin-top:16px">
      <button class="btn btn-ghost btn-full" id="rflClose" type="button">Закрыть</button>
      <button class="btn btn-primary btn-full" id="rflNew" type="button">+ Новая запись</button>
    </div>
  `, m => {
    m.querySelector('#rflClose').onclick = () => closeModal(m);
    m.querySelector('#rflNew').onclick = () => {
      closeModal(m);
      setTimeout(open, 200);
    };
    
    m.querySelectorAll('[data-del-refl]').forEach(btn => {
      btn.onclick = () => {
        const idx = +btn.dataset.delRefl;
        const item = list[idx];
        if (!item) return;
        
        if (confirm('Удалить эту запись?')) {
          N.S.reflections = N.S.reflections.filter(r => r.ts !== item.ts);
          saveState();
          SFX.tap();
          closeModal(m);
          setTimeout(history, 200); // Переоткрываем историю
          if (N.currentScreen === 'stats') go('stats');
        }
      };
    });
  });
}

/* ═══ КАРТОЧКА В ПРОГРЕССЕ ═══ */
function statsCard(){
  const list = (N.S.reflections || []).slice().sort((a, b) => b.ts - a.ts);
  const count = list.length;
  const latest = list[0];
  
  let previewHTML = '';
  if (latest) {
    const d = new Date(latest.ts);
    const dateStr = d.toLocaleDateString('ru-RU', {day:'numeric', month:'short'});
    const text = latest.q1 || latest.q2 || latest.q3 || '...';
    previewHTML = `
      <div style="margin-top:14px;padding:12px 14px;background:var(--paper);border-radius:12px;border:1px solid var(--line)">
        <div class="tiny" style="margin-bottom:6px;color:var(--moss);font-weight:600">Последняя запись · ${dateStr}</div>
        <div style="font-size:13px;line-height:1.5;color:var(--ink-soft);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${esc(text)}</div>
      </div>
    `;
  }

  return `<div class="card">
    <div class="between">
      <div>
        <div class="h3" style="font-family:'Fraunces',serif;font-size:16px">📓 Дневник рефлексии</div>
        <div class="muted" style="font-size:12.5px;margin-top:2px">${count ? `Всего ${count} записей` : 'Осмысляй свой опыт'}</div>
      </div>
      <div style="font-size:24px">📓</div>
    </div>
    
    ${previewHTML}
    
    <div style="display:flex;gap:8px;margin-top:14px">
      <button class="btn btn-primary btn-full" id="statsReflectBtn" type="button">+ Написать</button>
      ${count ? `<button class="btn btn-ghost" id="statsReflectHistBtn" type="button" style="flex:0 0 auto">Все (${count})</button>` : ''}
    </div>
  </div>`;
}

window.Reflection = { open, history, statsCard };
})();