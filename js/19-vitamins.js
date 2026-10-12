/* ═══ NAVLIFE · VITAMINS/BADS · v3.0 · с пищевой ценностью ═══ */
(function(){
'use strict';
const N = window.__nav;
if (!N){ console.error('[VITAMINS] __nav not found'); return; }

const qs = (s, r=document) => r.querySelector(s);
const qsa = (s, r=document) => Array.from(r.querySelectorAll(s));
const _esc = (s) => String(s??'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const UNITS = ['мг', 'мкг', 'МЕ', 'г', 'кап', 'табл', 'мл', 'шт'];

function ensure(){
  if (!N.S.nutrition.vitamins) N.S.nutrition.vitamins = [];
  if (!N.S.nutrition.vitaminLog || typeof N.S.nutrition.vitaminLog !== 'object'){
    N.S.nutrition.vitaminLog = {};
  }
}

function currentDate(){
  const dv = N.S.nutrition.viewDate;
  return dv || N.todayKey();
}

/* ═══ Пищевая ценность за день от принятых витаминов ═══ */
function vitaminNutrition(ds){
  ensure();
  const vitamins = N.S.nutrition.vitamins;
  const log = N.S.nutrition.vitaminLog[ds] || [];
  let kcal = 0, p = 0, f = 0, c = 0;
  log.forEach(id => {
    const v = vitamins.find(x => x.id === id);
    if (!v) return;
    kcal += +v.kcal || 0;
    p    += +v.p    || 0;
    f    += +v.f    || 0;
    c    += +v.c    || 0;
  });
  return { kcal, p, f, c, count: log.length };
}

/* ═══ HTML блока ═══ */
function sectionHTML(){
  ensure();
  const ds = currentDate();
  const vitamins = N.S.nutrition.vitamins;
  const log = N.S.nutrition.vitaminLog[ds] || [];
  const takenCount = vitamins.filter(v => log.includes(v.id)).length;
  const vn = vitaminNutrition(ds);
  const hasNutrition = vn.kcal > 0 || vn.p > 0 || vn.f > 0 || vn.c > 0;

  return `
    <div class="card" data-vitamins-block style="margin-top:14px">
      <div class="between" style="margin-bottom:12px">
        <div>
          <div class="h3" style="font-family:'Fraunces',serif;font-size:16px">💊 Витамины и БАДы</div>
          <div class="muted" style="font-size:12px;margin-top:2px">
            ${vitamins.length ? `Принято ${takenCount} из ${vitamins.length}` : 'Список пока пуст'}
          </div>
        </div>
        <button class="btn btn-line btn-sm" data-vit-add type="button">+ Добавить</button>
      </div>

      ${hasNutrition ? `
        <div style="padding:8px 12px;background:var(--moss-soft);border-radius:8px;margin-bottom:10px;font-size:11.5px;color:var(--moss);display:flex;gap:10px;flex-wrap:wrap">
          <span>🧮 Учтено в дне:</span>
          ${vn.kcal ? `<b>${Math.round(vn.kcal)} ккал</b>` : ''}
          ${vn.p ? `<b>Б ${Math.round(vn.p)}г</b>` : ''}
          ${vn.f ? `<b>Ж ${Math.round(vn.f)}г</b>` : ''}
          ${vn.c ? `<b>У ${Math.round(vn.c)}г</b>` : ''}
        </div>
      ` : ''}

      ${vitamins.length ? `
        <div style="display:flex;flex-direction:column;gap:8px">
          ${vitamins.map(v => {
            const taken = log.includes(v.id);
            const hasNut = (+v.kcal || 0) + (+v.p || 0) + (+v.f || 0) + (+v.c || 0) > 0;
            const nutLine = hasNut ? [
              v.kcal ? `${Math.round(v.kcal)} ккал` : '',
              v.p ? `Б ${v.p}` : '',
              v.f ? `Ж ${v.f}` : '',
              v.c ? `У ${v.c}` : ''
            ].filter(Boolean).join(' · ') : '';
            return `
              <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:${taken ? 'var(--moss-soft)' : 'var(--paper)'};border:1px solid ${taken ? 'var(--moss)' : 'var(--line)'};border-radius:10px">
                <button data-vit-toggle="${v.id}" type="button" style="
                  width:24px;height:24px;border-radius:7px;flex-shrink:0;cursor:pointer;
                  background:${taken ? 'var(--moss)' : 'transparent'};
                  border:1.5px solid ${taken ? 'var(--moss)' : 'var(--line)'};
                  color:#fff;font-size:13px;font-weight:700;display:grid;place-items:center;
                ">${taken ? '✓' : ''}</button>
                <div style="flex:1;min-width:0">
                  <div style="font-size:13.5px;font-weight:600;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${_esc(v.name)}</div>
                  <div style="font-size:11.5px;color:var(--ink-soft);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                    ${v.dose} ${_esc(v.unit)}${v.notes ? ' · ' + _esc(v.notes) : ''}
                  </div>
                  ${nutLine ? `<div style="font-size:10.5px;color:var(--moss);font-weight:600;margin-top:3px">${nutLine}</div>` : ''}
                </div>
                <button class="icon-btn" data-vit-edit="${v.id}" type="button" style="width:28px;height:28px;font-size:12px;background:transparent;border-color:transparent;color:var(--ink-mute)">✎</button>
              </div>`;
          }).join('')}
        </div>
      ` : `
        <p class="muted" style="font-size:12.5px;line-height:1.55;text-align:center;padding:10px 0 4px">
          Добавь витамины, БАДы или добавки, которые принимаешь.<br>
          Отмечай приём одним тапом — калории и БЖУ учтутся в дневном итоге.
        </p>
      `}
    </div>
  `;
}

/* ═══ Редактор ═══ */
function openEditor(editId){
  ensure();
  const v = editId ? N.S.nutrition.vitamins.find(x => x.id === editId) : null;
  const isEd = !!v;
  let unit = v ? v.unit : 'мг';

  N.openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom:16px">${isEd ? 'Изменить' : 'Новый витамин / БАД'}</div>
    <div class="field"><label>Название</label>
      <input id="vName" value="${v ? _esc(v.name) : ''}" placeholder="Например, Витамин D3 или Омега-3" maxlength="40">
    </div>
    <div class="field-row">
      <div class="field"><label>Дозировка</label>
        <input id="vDose" type="number" min="0" step="0.01" value="${v ? v.dose : ''}" placeholder="2000">
      </div>
      <div class="field" style="flex:0 0 110px"><label>Единица</label>
        <select id="vUnit">${UNITS.map(u => `<option value="${u}" ${u===unit?'selected':''}>${u}</option>`).join('')}</select>
      </div>
    </div>
    <div class="field"><label>Заметка</label>
      <input id="vNotes" value="${v ? _esc(v.notes||'') : ''}" placeholder="Например, утром с едой" maxlength="60">
    </div>

    <div style="padding:12px 14px;background:var(--paper);border-radius:10px;margin-top:6px;margin-bottom:16px">
      <div class="tiny" style="letter-spacing:.06em;margin-bottom:4px">🍽 ПИЩЕВАЯ ЦЕННОСТЬ (по желанию)</div>
      <p class="muted" style="font-size:11.5px;line-height:1.5;margin-bottom:10px">
        Если у витамина/БАДа есть калории и БЖУ — заполни. Они добавятся в дневной итог при отметке приёма.
      </p>
      <div class="field-row">
        <div class="field" style="margin-bottom:0"><label>Ккал</label>
          <input id="vKcal" type="number" min="0" step="0.1" value="${v && v.kcal ? v.kcal : ''}" placeholder="0">
        </div>
        <div class="field" style="margin-bottom:0"><label>Белки, г</label>
          <input id="vP" type="number" min="0" step="0.1" value="${v && v.p ? v.p : ''}" placeholder="0">
        </div>
      </div>
      <div class="field-row" style="margin-top:8px">
        <div class="field" style="margin-bottom:0"><label>Жиры, г</label>
          <input id="vF" type="number" min="0" step="0.1" value="${v && v.f ? v.f : ''}" placeholder="0">
        </div>
        <div class="field" style="margin-bottom:0"><label>Углеводы, г</label>
          <input id="vC" type="number" min="0" step="0.1" value="${v && v.c ? v.c : ''}" placeholder="0">
        </div>
      </div>
    </div>

    <div style="display:flex;gap:10px">
      ${isEd ? '<button class="btn btn-line btn-danger" id="vDel" type="button">Удалить</button>' : ''}
      <button class="btn btn-ghost btn-full" id="vCancel" type="button">Отмена</button>
      <button class="btn btn-primary btn-full" id="vSave" type="button">${isEd ? 'Сохранить' : 'Добавить'}</button>
    </div>`, m => {
    qs('#vCancel', m).onclick = () => N.closeModal(m);
    qs('#vSave', m).onclick = () => {
      const name = qs('#vName', m).value.trim();
      const dose = parseFloat(qs('#vDose', m).value);
      const u = qs('#vUnit', m).value;
      const notes = qs('#vNotes', m).value.trim();
      const kc = parseFloat(qs('#vKcal', m).value) || 0;
      const pv = parseFloat(qs('#vP', m).value) || 0;
      const fv = parseFloat(qs('#vF', m).value) || 0;
      const cv = parseFloat(qs('#vC', m).value) || 0;
      if (!name){ N.toast('Введи название'); return; }
      if (!dose || dose <= 0){ N.toast('Введи дозировку'); return; }
      if (isEd){
        v.name = name; v.dose = dose; v.unit = u; v.notes = notes;
        v.kcal = kc; v.p = pv; v.f = fv; v.c = cv;
      } else {
        N.S.nutrition.vitamins.push({
          id: 'vit_' + Math.random().toString(36).slice(2,9),
          name, dose, unit: u, notes,
          kcal: kc, p: pv, f: fv, c: cv,
          createdAt: N.todayKey()
        });
      }
      N.saveState(); N.closeModal(m); N.go('nutrition');
      N.toast(isEd ? 'Обновлено' : 'Добавлено');
    };
    const del = qs('#vDel', m);
    if (del) del.onclick = () => {
      if (confirm('Удалить? Записи о приёме тоже удалятся.')){
        N.S.nutrition.vitamins = N.S.nutrition.vitamins.filter(x => x.id !== v.id);
        Object.keys(N.S.nutrition.vitaminLog || {}).forEach(k => {
          N.S.nutrition.vitaminLog[k] = (N.S.nutrition.vitaminLog[k] || []).filter(x => x !== v.id);
        });
        N.saveState(); N.closeModal(m); N.go('nutrition');
        N.toast('Удалено');
      }
    };
  });
}

/* ═══ Обработка кликов ═══ */
function handleClick(e){
  const target = e.target;
  if (!target) return false;

  const add = target.closest('[data-vit-add]');
  if (add){ e.preventDefault(); e.stopPropagation(); openEditor(null); return true; }

  const toggle = target.closest('[data-vit-toggle]');
  if (toggle){
    e.preventDefault(); e.stopPropagation();
    ensure();
    const id = toggle.dataset.vitToggle;
    const ds = currentDate();
    const log = N.S.nutrition.vitaminLog[ds] || [];
    if (log.includes(id)){
      N.S.nutrition.vitaminLog[ds] = log.filter(x => x !== id);
      N.SFX.tap();
    } else {
      N.S.nutrition.vitaminLog[ds] = [...log, id];
      N.SFX.ok(); N.buzz(10);
      if (window.Achievements) window.Achievements.check();
    }
    N.saveState();
    N.go('nutrition');
    return true;
  }

  const edit = target.closest('[data-vit-edit]');
  if (edit){ e.preventDefault(); e.stopPropagation(); openEditor(edit.dataset.vitEdit); return true; }

  return false;
}

/* ═══════════════════════════════════════════════════════════════════
   ПАТЧ ОТОБРАЖЕНИЯ ДНЕВНОГО ИТОГА
   После рендера экрана Питания — добавляем значения витаминов
   прямо в кольцо КБЖУ, прогресс-бары макро и текст «осталось».
   ═══════════════════════════════════════════════════════════════════ */
function applyVitaminTotalsToDOM(){
  const ds = currentDate();
  const vn = vitaminNutrition(ds);
  if (!vn.kcal && !vn.p && !vn.f && !vn.c) return;

  const host = qs('#screens');
  if (!host) return;

  const g = N.S.nutrition.goals;

  /* — Большое число ккал — */
  const bigEl = host.querySelector('.kcal-ring-inner .big');
  if (bigEl && vn.kcal){
    const base = parseInt(bigEl.textContent.replace(/\D/g, ''), 10) || 0;
    const total = base + Math.round(vn.kcal);
    bigEl.textContent = String(total);

    /* — Текст под числом — */
    const leftEl = host.querySelector('.kcal-ring-inner .left');
    if (leftEl){
      if (total > g.calories){
        leftEl.textContent = `+${total - g.calories} сверх`;
      } else {
        leftEl.textContent = `осталось ${g.calories - total}`;
      }
    }
  }

  /* — Полоски макро — */
  const barVals = host.querySelectorAll('.macro-bar-val');
  if (barVals.length >= 3){
    const pairs = [
      { idx: 0, add: vn.p, goal: g.protein },
      { idx: 1, add: vn.f, goal: g.fat },
      { idx: 2, add: vn.c, goal: g.carbs }
    ];
    pairs.forEach(p => {
      if (!p.add) return;
      const el = barVals[p.idx];
      const cur = parseInt((el.textContent || '0').split('/')[0].replace(/\D/g, ''), 10) || 0;
      el.textContent = `${cur + Math.round(p.add)}/${p.goal}г`;
    });

    /* — Полоски прогресса — */
    const fills = host.querySelectorAll('.macro-bar-fill');
    const pairsFill = [
      { idx: 0, val: (parseInt((barVals[0].textContent||'0').split('/')[0].replace(/\D/g,''),10)||0), goal: g.protein },
      { idx: 1, val: (parseInt((barVals[1].textContent||'0').split('/')[0].replace(/\D/g,''),10)||0), goal: g.fat },
      { idx: 2, val: (parseInt((barVals[2].textContent||'0').split('/')[0].replace(/\D/g,''),10)||0), goal: g.carbs }
    ];
    pairsFill.forEach(p => {
      if (fills[p.idx]){
        const pct = Math.min(100, Math.round(p.val / Math.max(1, p.goal) * 100));
        fills[p.idx].style.width = pct + '%';
      }
    });
  }
}

/* ═══ Инъекция блока в Питание ═══ */
function injectIntoNutrition(){
  const host = qs('#screens');
  if (!host) return;
  if (host.querySelector('[data-vitamins-block]')){
    /* Блок уже есть — просто обновляем кольцо */
    setTimeout(applyVitaminTotalsToDOM, 20);
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.innerHTML = sectionHTML();
  const block = wrapper.firstElementChild;
  if (!block) return;

  const notes = host.querySelector('#nutNotes');
  const notesCard = notes ? notes.closest('.card') : null;
  if (notesCard && notesCard.parentNode){
    notesCard.parentNode.insertBefore(block, notesCard);
  } else {
    const quick = host.querySelector('.nutri-quick');
    if (quick && quick.parentNode){
      quick.parentNode.insertBefore(block, quick.nextSibling);
    } else {
      host.appendChild(block);
    }
  }

  block.addEventListener('click', e => { if (handleClick(e)) e.stopPropagation(); }, true);

  /* Обновляем итог с задержкой, чтобы рендер уже был готов */
  setTimeout(applyVitaminTotalsToDOM, 30);
}

/* ═══ Регистрация ═══ */
window.Vitamins = {
  openEditor,
  vitaminNutrition,
  /* Старый API — заглушки для совместимости с 04-nutrition.js */
  renderSection: () => '',
  handleClick: () => false
};

window.App.hooks.afterGo.push(name => {
  if (name === 'nutrition') setTimeout(injectIntoNutrition, 60);
});
})();