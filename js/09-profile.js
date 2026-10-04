/* ═══ NAVLIFE · PROFILE ═══ */
(function(){
'use strict';
const N = window.__nav;
const { go, saveState, esc, levelInfo, applyTheme, toast, openModal, closeModal,
        SFX, buzz, todayKey, resetState, avatarHtml } = N;
const AVATARS = ['🧠','🚀','🦉','🐺','🦊','🐙','🌟','⚡','🎯','🧩','🦁','🐬'];

function renderProfile(){
  const S = N.S;
  const li = levelInfo(S.neurofit.xp);
  const root = document.createElement('div');
  root.className = 'screen';
  root.innerHTML = `
    <div class="h1" style="margin-bottom:18px">Профиль</div>
    <div class="card" style="text-align:center">
      <div class="avatar-preview">${avatarHtml(S.shared.avatar, 120)}</div>
      <div style="font-size:20px;font-weight:600;font-family:'Fraunces',serif">${esc(S.shared.name)}</div>
      <div class="muted" style="margin-top:4px">Уровень ${li.level} · ${S.neurofit.xp} XP</div>
      <button class="btn btn-ghost" id="editName" type="button" style="margin-top:14px">Изменить</button>
    </div>

    <div class="stat-grid" style="margin-bottom:14px">
      <div class="stat"><b>${S.neurofit.streak} 🔥</b><span>серия</span></div>
      <div class="stat"><b>${S.neurofit.bestStreak}</b><span>рекорд серии</span></div>
      <div class="stat"><b>${S.neurofit.totalSessions}</b><span>тренировок</span></div>
      <div class="stat"><b>${S.navlife.goals.length}</b><span>целей</span></div>
    </div>

    <button class="card tappable" id="openAchievements" type="button" style="width:100%;text-align:left">
      <div class="between">
        <div><div class="h3" style="margin-bottom:2px">🏆 Достижения</div><div class="muted" style="font-size:12.5px" id="ach-count">Загрузка…</div></div>
        <div style="font-size:18px;color:var(--ink-mute)">›</div>
      </div>
    </button>

    <button class="card tappable" id="openFreezer" type="button" style="width:100%;text-align:left">
      <div class="between">
        <div><div class="h3" style="margin-bottom:2px">❄️ Заморозка серии</div><div class="muted" style="font-size:12.5px" id="fr-count">Загрузка…</div></div>
        <div style="font-size:18px;color:var(--ink-mute)">›</div>
      </div>
    </button>

    <button class="card tappable" id="openLevels" type="button" style="width:100%;text-align:left">
      <div class="between">
        <div><div class="h3" style="margin-bottom:2px">🎚 Уровни упражнений</div><div class="muted" style="font-size:12.5px">Сложность вручную</div></div>
        <div style="font-size:18px;color:var(--ink-mute)">›</div>
      </div>
    </button>

    <button class="card tappable" id="openHelp" type="button" style="width:100%;text-align:left">
      <div class="between">
        <div><div class="h3" style="margin-bottom:2px">📖 Инструкция</div><div class="muted" style="font-size:12.5px">Как пользоваться</div></div>
        <div style="font-size:18px;color:var(--ink-mute)">›</div>
      </div>
    </button>

    <div class="card">
      <div class="h3" style="margin-bottom:16px;font-family:'Fraunces',serif;font-size:16px">Настройки</div>
      <div class="between" style="padding:12px 0;border-bottom:1px solid var(--line)">
        <div><div class="h3">Тёмная тема</div></div>
        <div class="switch ${S.shared.theme==='dark'?'on':''}" data-toggle="theme"></div>
      </div>
      <div class="between" style="padding:12px 0;border-bottom:1px solid var(--line)">
        <div><div class="h3">Звук</div></div>
        <div class="switch ${S.shared.sound?'on':''}" data-toggle="sound"></div>
      </div>
      <div class="between" style="padding:12px 0;border-bottom:1px solid var(--line)">
        <div><div class="h3">Вибрация</div></div>
        <div class="switch ${S.shared.haptics?'on':''}" data-toggle="haptics"></div>
      </div>
      <div class="between" style="padding:12px 0;border-bottom:1px solid var(--line)">
        <div><div class="h3">Уведомления</div><div class="muted" style="font-size:11.5px;margin-top:2px">За минуту до старта</div></div>
        <div class="switch ${S.shared.notifications?'on':''}" id="notifSw"></div>
      </div>
      <div style="padding:16px 0 4px">
        <div class="h3" style="margin-bottom:4px">Цель тренировок в день</div>
        <div class="muted" style="font-size:12.5px;margin-bottom:14px">Сколько раз тренировать мозг</div>
        <div class="row" style="gap:8px;flex-wrap:wrap">
          ${[1,3,5,7].map(n => `<button class="chip ${S.shared.dailyGoal===n?'moss':''}" data-goal="${n}" type="button">${n}</button>`).join('')}
        </div>
      </div>
    </div>

    <div class="card">
      <div class="h3" style="margin-bottom:12px;font-family:'Fraunces',serif;font-size:16px">Данные</div>
      <p class="muted" style="font-size:12.5px;margin-bottom:14px">Всё хранится локально.</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-ghost" id="expBtn" type="button" style="flex:1;min-width:100px">Экспорт</button>
        <button class="btn btn-ghost" id="impBtn" type="button" style="flex:1;min-width:100px">Импорт</button>
        <button class="btn btn-ghost btn-danger" id="rstBtn" type="button" style="flex:1;min-width:100px">Сбросить</button>
      </div>
    </div>

    <div class="card" style="background:var(--rust-soft);border-color:transparent">
      <div class="tiny" style="color:var(--rust)">Важно</div>
      <p style="font-size:12.5px;margin-top:8px;line-height:1.6;color:var(--rust)">Приложение — тренажёр, а не медицинское устройство.</p>
    </div>
    <div style="height:20px"></div>`;

  root.querySelectorAll('[data-toggle]').forEach(sw => {
    sw.onclick = () => {
      const k = sw.dataset.toggle;
      if (k === 'theme'){ S.shared.theme = S.shared.theme === 'dark' ? 'light' : 'dark'; applyTheme(); sw.classList.toggle('on', S.shared.theme === 'dark'); }
      else { S.shared[k] = !S.shared[k]; sw.classList.toggle('on', S.shared[k]); }
      saveState(); SFX.tap(); buzz(8);
    };
  });
  root.querySelectorAll('[data-goal]').forEach(b => b.onclick = () => { S.shared.dailyGoal = +b.dataset.goal; saveState(); SFX.tap(); go('profile'); });

  const notifSw = root.querySelector('#notifSw');
  if (notifSw) notifSw.onclick = async () => {
    if (!S.shared.notifications){
      const ok = await (window.requestNotifPerm ? window.requestNotifPerm() : Promise.resolve(false));
      if (!ok){ toast('Разреши уведомления в браузере'); return; }
      S.shared.notifications = true;
    } else S.shared.notifications = false;
    notifSw.classList.toggle('on', S.shared.notifications);
    saveState(); SFX.tap();
    toast(S.shared.notifications ? 'Уведомления включены' : 'Выключено');
  };

  root.querySelector('#editName').onclick = openNameModal;
  root.querySelector('#openLevels').onclick = () => go('levels');
  root.querySelector('#openHelp').onclick = () => openHelpModal();
  root.querySelector('#openAchievements').onclick = () => go('achievements');
  root.querySelector('#openFreezer').onclick = () => window.Freezer && window.Freezer.openModal();
  root.querySelector('#expBtn').onclick = exportData;
  root.querySelector('#impBtn').onclick = importData;
  root.querySelector('#rstBtn').onclick = () => {
    if (confirm('Удалить весь прогресс?')){ resetState(); applyTheme(); go('onboarding'); }
  };

  requestAnimationFrame(() => {
    const ac = root.querySelector('#ach-count');
    if (ac && window.Achievements){
      const total = window.Achievements.list.length;
      const unlocked = Object.keys(S.achievements || {}).length;
      ac.textContent = `${unlocked} / ${total} разблокировано`;
    }
    const fr = root.querySelector('#fr-count');
    if (fr && window.Freezer){
      const info = window.Freezer.info();
      fr.textContent = `${info.available} / ${info.max} доступно в этом месяце`;
    }
  });
  return root;
}

function openNameModal(){
  const S = N.S;
  openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom:16px">Профиль</div>
    <div class="field"><label>Имя</label><input id="nmIn" value="${esc(S.shared.name)}" maxlength="20"></div>
    <div class="tiny" style="margin-bottom:10px">Текущий аватар</div>
    <div class="avatar-preview" id="avatarPreview" style="margin-bottom:16px">${avatarHtml(S.shared.avatar, 120)}</div>
    <button class="btn btn-ghost btn-full" id="uploadAvatarBtn" type="button" style="margin-bottom:14px">📷 Загрузить свою фотографию</button>
    <input type="file" id="avatarInput" accept="image/*" style="display:none">
    <div class="tiny" style="margin-bottom:10px">Или выбери эмодзи</div>
    <div class="avatar-grid">
      ${AVATARS.map(a => `<button class="avatar-opt ${S.shared.avatarType==='emoji' && S.shared.avatar===a?'on':''}" data-av="${a}" type="button">${a}</button>`).join('')}
    </div>
    <div style="display:flex;gap:10px;margin-top:16px">
      <button class="btn btn-ghost btn-full" id="nmCancel" type="button">Отмена</button>
      <button class="btn btn-primary btn-full" id="nmSave" type="button">Сохранить</button>
    </div>`, m => {
    let newAvatar = S.shared.avatar;
    let newType = S.shared.avatarType || 'emoji';
    const updatePreview = () => {
      const el = m.querySelector('#avatarPreview');
      if (el) el.innerHTML = avatarHtml(newAvatar, 120);
    };
    m.querySelector('#uploadAvatarBtn').onclick = () => m.querySelector('#avatarInput').click();
    m.querySelector('#avatarInput').onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')){ toast('Нужна картинка'); return; }
      const reader = new FileReader();
      reader.onload = ev => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 200; canvas.height = 200;
          const ctx = canvas.getContext('2d');
          const size = Math.min(img.width, img.height);
          const sx = (img.width - size) / 2, sy = (img.height - size) / 2;
          ctx.drawImage(img, sx, sy, size, size, 0, 0, 200, 200);
          try{
            newAvatar = canvas.toDataURL('image/jpeg', 0.85);
            newType = 'photo';
            updatePreview();
            m.querySelectorAll('[data-av]').forEach(x => x.classList.remove('on'));
            toast('Фото загружено');
          }catch(e){ toast('Не удалось'); }
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    };
    m.querySelectorAll('[data-av]').forEach(b => b.onclick = () => {
      newAvatar = b.dataset.av; newType = 'emoji';
      SFX.tap(); buzz(8);
      m.querySelectorAll('[data-av]').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      updatePreview();
    });
    m.querySelector('#nmCancel').onclick = () => closeModal(m);
    m.querySelector('#nmSave').onclick = () => {
      S.shared.name = (m.querySelector('#nmIn').value || 'Игрок').slice(0,20).trim() || 'Игрок';
      S.shared.avatar = newAvatar;
      S.shared.avatarType = newType;
      saveState(); closeModal(m); go('profile'); toast('Профиль обновлён');
    };
  });
}

function openHelpModal(){
  openModal(`
    <div class="modal-handle"></div>
    <div class="h2" style="margin-bottom:16px">Инструкция</div>
    <h3 style="font-size:14px;margin-bottom:8px;color:var(--moss)">🏠 Сегодня</h3>
    <p class="muted" style="margin-bottom:14px">Маршрут дня: что делать сейчас, что дальше.</p>
    <h3 style="font-size:14px;margin-bottom:8px;color:var(--moss)">✅ Привычки</h3>
    <p class="muted" style="margin-bottom:14px">Отдельный модуль. Отмечай одним тапом, каждая ведёт свою серию.</p>
    <h3 style="font-size:14px;margin-bottom:8px;color:var(--moss)">📅 Дела</h3>
    <p class="muted" style="margin-bottom:14px">День / Неделя / Месяц. Удерживай событие в дне — перемещение по времени.</p>
    <h3 style="font-size:14px;margin-bottom:8px;color:var(--moss)">😴 Сон</h3>
    <p class="muted" style="margin-bottom:14px">Записывай время сна и качество. Смотри корреляцию с настроением в Прогрессе.</p>
    <h3 style="font-size:14px;margin-bottom:8px;color:var(--moss)">🥗 Питание</h3>
    <p class="muted" style="margin-bottom:14px">КБЖУ, вода, вес, дневник еды.</p>
    <h3 style="font-size:14px;margin-bottom:8px;color:var(--moss)">🧠 Мозг</h3>
    <p class="muted" style="margin-bottom:14px">19 упражнений, 3 режима, 6 уровней.</p>
    <h3 style="font-size:14px;margin-bottom:8px;color:var(--moss)">🏆 Достижения</h3>
    <p class="muted" style="margin-bottom:14px">30 бейджей. Разблокируются по событиям.</p>
    <h3 style="font-size:14px;margin-bottom:8px;color:var(--moss)">❄️ Заморозка</h3>
    <p class="muted" style="margin-bottom:16px">2 заморозки в месяц. Если пропустил день — серия не сбросится.</p>
    <button class="btn btn-primary btn-full btn-lg" id="hOk" type="button">Понятно</button>`, m => {
    m.querySelector('#hOk').onclick = () => closeModal(m);
  });
}

function exportData(){
  const blob = new Blob([JSON.stringify(N.S, null, 2)], { type:'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'navlife-' + todayKey() + '.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast('Файл сохранён');
}
function importData(){
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = '.json,application/json';
  inp.onchange = () => {
    const f = inp.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try{
        const d = JSON.parse(r.result);
        N.S = d;
        saveState(); applyTheme(); go('today');
        toast('Данные загружены');
      }catch(e){ toast('Не удалось прочитать файл'); }
    };
    r.readAsText(f);
  };
  inp.click();
}

window.App.registerScreen('profile', renderProfile);
window.openHelpModal = openHelpModal;
})();