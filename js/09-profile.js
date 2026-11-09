/* ═══ NAVLIFE · PROFILE · v4.5 (No XP) ═══ */
(function(){
'use strict';
const N = window.__nav;
if (!N){ console.error('[PROFILE] __nav not found'); return; }
const qs = (s, r=document) => r.querySelector(s);
const qsa = (s, r=document) => Array.from(r.querySelectorAll(s));
const _esc = (s) => String(s??'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const { go, saveState, esc, applyTheme, toast, openModal, closeModal,
        SFX, buzz, todayKey, resetState, avatarHtml } = N;

const AVATARS = ['🧠','🚀','🦉','🐺','🦊','🐙','🌟','⚡','🎯','🧩','🦁','🐬'];
const LEAD_TIME_OPTIONS = [1, 5, 10, 15, 30];
const THEMES = [
  { key:'light', label:'Светлая', emoji:'☀️' },
  { key:'dark', label:'Тёмная', emoji:'🌙' },
  { key:'forest', label:'Лес', emoji:'🌿' },
  { key:'sunset', label:'Закат', emoji:'🌅' },
  { key:'night', label:'Ночь', emoji:'🌌' }
];

/* ═══ Инжект стилей ═══ */
const STYLE_ID = 'navlife-profile-styles';
function ensureStyles(){
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
.profile-hero{ position:relative; border-radius:22px; padding:24px 22px 22px; background:var(--hero-bg); color:var(--hero-text); overflow:hidden; margin-bottom:16px; box-shadow:0 24px 60px -24px rgba(0,0,0,.5); }
.profile-hero::after{ content:'';position:absolute;right:-60px;top:-60px; width:220px;height:220px;border-radius:50%; background:radial-gradient(circle,rgba(184,127,53,.42),transparent 68%); pointer-events:none; }
.profile-hero-inner{position:relative;z-index:1;display:flex;gap:16px;align-items:center;}
.profile-avatar-wrap{ position:relative;flex-shrink:0; width:82px;height:82px; }
.profile-avatar-ring{ position:absolute;inset:-4px;border-radius:50%; background:conic-gradient(from 210deg,var(--amber),var(--moss),var(--amber)); animation:avatarSpin 12s linear infinite; }
@keyframes avatarSpin{to{transform:rotate(360deg)}}
.profile-avatar{ position:absolute;inset:0; border-radius:50%;overflow:hidden; display:grid;place-items:center; background:var(--paper);border:3px solid var(--paper); font-size:52px; }
.profile-avatar img{width:100%;height:100%;object-fit:cover;}
.profile-name{ font-family:'Fraunces',serif; font-size:22px;font-weight:600;color:var(--hero-text); letter-spacing:-.01em;line-height:1.1; }
.profile-sub{ font-size:12.5px;color:var(--hero-text-dim);margin-top:4px; }
.profile-edit-btn{ position:absolute;right:20px;top:20px;z-index:2; width:36px;height:36px;border-radius:50%; background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.2); color:var(--hero-text);display:grid;place-items:center;font-size:14px; cursor:pointer;transition:background .15s; }
.profile-edit-btn:hover{background:rgba(255,255,255,.22)}
.profile-tiles{ display:grid;grid-template-columns:1fr 1fr 1fr 1fr; gap:8px;margin-bottom:16px; }
@media(max-width:400px){.profile-tiles{grid-template-columns:1fr 1fr}}
.profile-tile{ padding:12px 10px;border-radius:14px;text-align:center; border:1px solid var(--line); background:var(--surface-raised); box-shadow:0 1px 0 0 rgba(255,255,255,.9) inset,0 6px 16px -10px rgba(27,33,29,.15); }
.profile-tile-em{font-size:20px;line-height:1;margin-bottom:6px;}
.profile-tile-val{ font-family:'Fraunces',serif; font-size:20px;font-weight:600; color:var(--ink);line-height:1.1; letter-spacing:-.01em; }
.profile-tile-lab{ font-size:9.5px;letter-spacing:.08em; text-transform:uppercase;color:var(--ink-mute); font-weight:700;margin-top:4px; }
.profile-menu{ background:var(--glass-bg); border:1px solid var(--glass-border); border-radius:16px; overflow:hidden; margin-bottom:16px; backdrop-filter:blur(20px) saturate(150%); -webkit-backdrop-filter:blur(20px) saturate(150%); box-shadow:0 1px 0 0 var(--glass-hi) inset,0 10px 30px -16px rgba(27,33,29,.18); }
.profile-menu-item{ display:flex;align-items:center;gap:14px; padding:14px 16px;cursor:pointer; border-bottom:1px solid var(--line-soft); transition:background .12s; background:transparent; width:100%;text-align:left; border-left:none;border-right:none;border-top:none; }
.profile-menu-item:last-child{border-bottom:none}
.profile-menu-item:hover{background:var(--paper)}
.profile-menu-item:active{background:var(--line-soft)}
.profile-menu-icon{ width:38px;height:38px;flex-shrink:0; border-radius:10px; display:grid;place-items:center;font-size:18px; }
.profile-menu-icon.moss{background:linear-gradient(135deg,var(--moss-soft),var(--paper));color:var(--moss)}
.profile-menu-icon.amber{background:linear-gradient(135deg,var(--amber-soft),var(--paper));color:var(--amber-dim)}
.profile-menu-icon.blue{background:linear-gradient(135deg,var(--blue-soft),var(--paper));color:var(--blue)}
.profile-menu-icon.rust{background:linear-gradient(135deg,var(--rust-soft),var(--paper));color:var(--rust)}
.profile-menu-icon.violet{background:linear-gradient(135deg,#EBDFF5,#F5EFFA);color:#6A4A7A}
.profile-menu-body{flex:1;min-width:0}
.profile-menu-title{font-size:14px;font-weight:600;color:var(--ink);letter-spacing:-.005em;}
.profile-menu-sub{font-size:11.5px;color:var(--ink-mute);margin-top:2px;}
.profile-menu-arrow{color:var(--ink-mute);font-size:16px;flex-shrink:0;}
.profile-section-title{ font-family:'Fraunces',serif; font-size:15px;font-weight:600; color:var(--ink); margin:22px 4px 10px; letter-spacing:-.01em; }
.profile-settings{ background:var(--glass-bg); border:1px solid var(--glass-border); border-radius:16px; overflow:hidden; backdrop-filter:blur(20px) saturate(150%); -webkit-backdrop-filter:blur(20px) saturate(150%); box-shadow:0 1px 0 0 var(--glass-hi) inset,0 10px 30px -16px rgba(27,33,29,.18); }
.profile-setting{ display:flex;align-items:center;justify-content:space-between; padding:14px 16px; border-bottom:1px solid var(--line-soft); gap:12px; }
.profile-setting:last-child{border-bottom:none}
.profile-setting-label{font-size:14px;font-weight:600;color:var(--ink);}
.profile-setting-desc{font-size:11.5px;color:var(--ink-mute);margin-top:2px;line-height:1.4;}
.profile-goal-row{display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;}
.profile-goal-chip{ padding:8px 16px;border-radius:100px; font-size:13px;font-weight:600; border:1.5px solid var(--line); background:var(--paper);color:var(--ink); cursor:pointer;transition:all .15s; min-width:48px; }
.profile-goal-chip.on{ background:var(--moss);color:#fff; border-color:var(--moss); box-shadow:0 6px 16px -6px rgba(63,97,82,.4); }
.profile-data-actions{ display:grid;grid-template-columns:1fr 1fr;gap:8px; padding:14px 16px; }
@media(max-width:400px){.profile-data-actions{grid-template-columns:1fr}}
.profile-data-btn{ padding:12px 14px;border-radius:12px; font-size:12.5px;font-weight:600; background:var(--paper);color:var(--ink); border:1px solid var(--line); cursor:pointer;transition:all .15s; display:flex;flex-direction:column;align-items:center;gap:4px; }
.profile-data-btn:hover{border-color:var(--moss);color:var(--moss)}
.profile-data-btn:active{transform:scale(.97)}
.profile-data-btn.danger{color:var(--rust)}
.profile-data-btn.danger:hover{border-color:var(--rust);color:var(--rust)}
.profile-data-btn .em{font-size:18px}
.ux-fs-btns { display: flex; gap: 6px; margin-top: 10px; }
.ux-fs-btns button { flex: 1; padding: 10px 6px; border-radius: 10px; font-size: 13px; font-weight: 700; background: var(--paper); color: var(--ink); border: 1px solid var(--line); cursor: pointer; transition: all .15s; }
.ux-fs-btns button.on { background: var(--moss); color: #fff; border-color: var(--moss); }
  `;
  document.head.appendChild(style);
}
ensureStyles();

function renderProfile(){
  const S = N.S;
  const leadTimes = S.shared.notificationLeadTimes || [1,5];
  const achTotal = (window.Achievements && window.Achievements.list || []).length;
  const achUnlocked = Object.keys(S.achievements || {}).length;
  const frInfo = window.Freezer ? window.Freezer.info() : { available: 2, max: 2 };

  const root = document.createElement('div');
  root.className = 'screen';

  root.innerHTML = `
    <div class="h1" style="margin-bottom:16px">Профиль</div>

    <div class="profile-hero">
      <button class="profile-edit-btn" id="editProfileBtn" type="button" aria-label="Изменить">✎</button>
      <div class="profile-hero-inner">
        <div class="profile-avatar-wrap">
          <div class="profile-avatar-ring"></div>
          <div class="profile-avatar">${avatarHtml(S.shared.avatar, 76)}</div>
        </div>
        <div style="flex:1;min-width:0">
          <div class="profile-name">${_esc(S.shared.name)}</div>
          <div class="profile-sub">${S.neurofit.totalSessions} тренировок · ${Math.round((S.neurofit.totalMs||0)/60000)} мин</div>
        </div>
      </div>
    </div>

    <div class="profile-tiles">
      <div class="profile-tile">
        <div class="profile-tile-em">🔥</div>
        <div class="profile-tile-val">${S.neurofit.streak}</div>
        <div class="profile-tile-lab">Серия</div>
      </div>
      <div class="profile-tile">
        <div class="profile-tile-em">⭐</div>
        <div class="profile-tile-val">${S.neurofit.bestStreak}</div>
        <div class="profile-tile-lab">Рекорд</div>
      </div>
      <div class="profile-tile">
        <div class="profile-tile-em">🏆</div>
        <div class="profile-tile-val">${achUnlocked}<span style="font-size:12px;color:var(--ink-mute);font-weight:500">/${achTotal}</span></div>
        <div class="profile-tile-lab">Бейджи</div>
      </div>
      <div class="profile-tile">
        <div class="profile-tile-em">🎯</div>
        <div class="profile-tile-val">${(S.navlife.goals||[]).length}</div>
        <div class="profile-tile-lab">Цели</div>
      </div>
    </div>

    <div class="profile-menu">
      <button class="profile-menu-item" id="openAchievements" type="button">
        <div class="profile-menu-icon amber">🏆</div>
        <div class="profile-menu-body">
          <div class="profile-menu-title">Достижения</div>
          <div class="profile-menu-sub">${achUnlocked} из ${achTotal} разблокировано</div>
        </div>
        <span class="profile-menu-arrow">›</span>
      </button>

      <button class="profile-menu-item" id="openFreezer" type="button">
        <div class="profile-menu-icon blue">❄️</div>
        <div class="profile-menu-body">
          <div class="profile-menu-title">Заморозка серии</div>
          <div class="profile-menu-sub">${frInfo.available} из ${frInfo.max} доступно в этом месяце</div>
        </div>
        <span class="profile-menu-arrow">›</span>
      </button>

      <button class="profile-menu-item" id="openReport" type="button">
        <div class="profile-menu-icon amber">📊</div>
        <div class="profile-menu-body">
          <div class="profile-menu-title">Отчёты</div>
          <div class="profile-menu-sub">Подробный отчёт · PNG или CSV</div>
        </div>
        <span class="profile-menu-arrow">›</span>
      </button>

      <button class="profile-menu-item" id="openICS" type="button">
        <div class="profile-menu-icon blue">📅</div>
        <div class="profile-menu-body">
          <div class="profile-menu-title">В календарь (.ics)</div>
          <div class="profile-menu-sub">Импорт в Google / Apple Calendar</div>
        </div>
        <span class="profile-menu-arrow">›</span>
      </button>

      <button class="profile-menu-item" id="openLevels" type="button">
        <div class="profile-menu-icon moss">🎚</div>
        <div class="profile-menu-body">
          <div class="profile-menu-title">Уровни упражнений</div>
          <div class="profile-menu-sub">Настроить сложность вручную</div>
        </div>
        <span class="profile-menu-arrow">›</span>
      </button>

      <button class="profile-menu-item" id="openHelp" type="button">
        <div class="profile-menu-icon violet">📖</div>
        <div class="profile-menu-body">
          <div class="profile-menu-title">Инструкция</div>
          <div class="profile-menu-sub">Как пользоваться приложением</div>
        </div>
        <span class="profile-menu-arrow">›</span>
      </button>
    </div>

    <div class="profile-section-title">⚙️ Настройки</div>
    <div class="profile-settings">
      <div class="profile-setting" style="flex-direction:column;align-items:stretch;gap:12px">
        <div>
          <div class="profile-setting-label">Тема оформления</div>
          <div class="profile-setting-desc">Настроение приложения</div>
        </div>
        <div class="profile-goal-row">
          ${THEMES.map(t => `<button class="profile-goal-chip ${S.shared.theme===t.key?'on':''}" data-theme="${t.key}" type="button">${t.emoji} ${t.label}</button>`).join('')}
        </div>
      </div>
      <div class="profile-setting">
        <div>
          <div class="profile-setting-label">Звук</div>
          <div class="profile-setting-desc">Сигналы и уведомления</div>
        </div>
        <div class="switch ${S.shared.sound?'on':''}" data-toggle="sound"></div>
      </div>
      <div class="profile-setting">
        <div>
          <div class="profile-setting-label">Вибрация</div>
          <div class="profile-setting-desc">Тактильный отклик</div>
        </div>
        <div class="switch ${S.shared.haptics?'on':''}" data-toggle="haptics"></div>
      </div>
      <div class="profile-setting" style="flex-direction:column;align-items:stretch;gap:12px">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
          <div>
            <div class="profile-setting-label">Уведомления о событиях</div>
            <div class="profile-setting-desc">Напоминания за N минут до старта</div>
          </div>
          <div class="switch ${S.shared.notifications?'on':''}" id="notifSw"></div>
        </div>
        <div id="leadTimesBlock" style="display:${S.shared.notifications?'block':'none'}">
          <div class="tiny" style="margin-bottom:8px;letter-spacing:.06em">НАПОМИНАТЬ ЗА</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${LEAD_TIME_OPTIONS.map(m => {
              const on = leadTimes.includes(m);
              return `<button type="button" data-lead="${m}" style="
                padding:8px 14px;border-radius:100px;font-size:12.5px;font-weight:600;
                background:${on ? 'var(--moss)' : 'var(--paper)'};
                color:${on ? '#fff' : 'var(--ink-soft)'};
                border:1px solid ${on ? 'var(--moss)' : 'var(--line)'};
                cursor:pointer;transition:all .15s;
              ">${on ? '✓ ' : ''}${m} мин</button>`;
            }).join('')}
          </div>
        </div>
      </div>
      <div class="profile-setting" style="flex-direction:column;align-items:stretch;gap:12px">
        <div>
          <div class="profile-setting-label">Цель тренировок в день</div>
          <div class="profile-setting-desc">Сколько сессий мозга делать ежедневно</div>
        </div>
        <div class="profile-goal-row">
          ${[1,3,5,7].map(n => `<button class="profile-goal-chip ${S.shared.dailyGoal===n?'on':''}" data-goal="${n}" type="button">${n}</button>`).join('')}
        </div>
      </div>
    </div>

    <div class="profile-section-title">💾 Данные</div>
    <div class="profile-settings">
      <div class="profile-setting" style="flex-direction:column;align-items:stretch;gap:12px">
        <div>
          <div class="profile-setting-label">Резервное копирование</div>
          <div class="profile-setting-desc">Локальный файл на всякий случай</div>
        </div>
        <div class="profile-data-actions" style="padding:0">
          <button class="profile-data-btn" id="expBtn" type="button">
            <span class="em">📤</span>
            <span>Экспорт JSON</span>
          </button>
          <button class="profile-data-btn" id="impBtn" type="button">
            <span class="em">📥</span>
            <span>Импорт JSON</span>
          </button>
        </div>
      </div>
      <div class="profile-setting" style="flex-direction:column;align-items:stretch;gap:12px">
        <div>
          <div class="profile-setting-label" style="color:var(--rust)">Опасная зона</div>
          <div class="profile-setting-desc">Полный сброс прогресса</div>
        </div>
        <div class="profile-data-actions" style="padding:0;grid-template-columns:1fr">
          <button class="profile-data-btn danger" id="rstBtn" type="button">
            <span class="em">🗑</span>
            <span>Стереть все данные</span>
          </button>
        </div>
      </div>
    </div>

    <div id="profile-ux-slot"></div>

    <div class="card" style="background:var(--rust-soft);border-color:transparent;margin-top:16px">
      <div class="tiny" style="color:var(--rust)">⚠️ ВАЖНО</div>
      <p style="font-size:12.5px;margin-top:8px;line-height:1.6;color:var(--rust)">
        NavLife — тренажёр привычек и внимания. Он не заменяет консультацию врача, психолога или тренера. Приложение помогает организовать день и подсказать закономерности в данных, но не ставит диагноз.
      </p>
    </div>
    <div style="height:20px"></div>`;

  root.querySelectorAll('[data-theme]').forEach(b => b.onclick = () => {
    S.shared.theme = b.dataset.theme;
    applyTheme();
    saveState(); SFX.tap(); buzz(8);
    go('profile');
  });

  root.querySelectorAll('[data-toggle]').forEach(sw => {
    sw.onclick = () => {
      const k = sw.dataset.toggle;
      S.shared[k] = !S.shared[k];
      sw.classList.toggle('on', S.shared[k]);
      saveState(); SFX.tap(); buzz(8);
    };
  });

  root.querySelectorAll('[data-goal]').forEach(b => b.onclick = () => {
    S.shared.dailyGoal = +b.dataset.goal;
    saveState(); SFX.tap(); buzz(8);
    root.querySelectorAll('[data-goal]').forEach(x => x.classList.toggle('on', +x.dataset.goal === S.shared.dailyGoal));
  });

  const notifSw = root.querySelector('#notifSw');
  const leadBlock = root.querySelector('#leadTimesBlock');
  if (notifSw) notifSw.onclick = async () => {
    if (!S.shared.notifications){
      const ok = await (window.requestNotifPerm ? window.requestNotifPerm() : Promise.resolve(false));
      if (!ok){ toast('Разреши уведомления в браузере'); return; }
      S.shared.notifications = true;
    } else {
      S.shared.notifications = false;
    }
    notifSw.classList.toggle('on', S.shared.notifications);
    leadBlock.style.display = S.shared.notifications ? 'block' : 'none';
    saveState(); SFX.tap();
    toast(S.shared.notifications ? 'Уведомления включены' : 'Выключено');
  };

  root.querySelectorAll('[data-lead]').forEach(b => b.onclick = () => {
    const m = +b.dataset.lead;
    let arr = S.shared.notificationLeadTimes || [1,5];
    if (arr.includes(m)) arr = arr.filter(x => x !== m);
    else arr.push(m);
    arr.sort((a,b) => a-b);
    S.shared.notificationLeadTimes = arr;
    if (N.S.meta && N.S.meta.notifShown) N.S.meta.notifShown = {};
    saveState(); SFX.tap();
    b.style.background = arr.includes(m) ? 'var(--moss)' : 'var(--paper)';
    b.style.color = arr.includes(m) ? '#fff' : 'var(--ink-soft)';
    b.style.borderColor = arr.includes(m) ? 'var(--moss)' : 'var(--line)';
    b.textContent = (arr.includes(m) ? '✓ ' : '') + m + ' мин';
  });

  root.querySelector('#editProfileBtn').onclick = openNameModal;
  root.querySelector('#openAchievements').onclick = () => { SFX.tap(); buzz(8); go('achievements'); };
  root.querySelector('#openFreezer').onclick = () => { SFX.tap(); buzz(8); window.Freezer && window.Freezer.openModal(); };
  root.querySelector('#openReport').onclick = () => { SFX.tap(); buzz(8); window.Reports && window.Reports.open(); };
  root.querySelector('#openICS').onclick = () => { SFX.tap(); buzz(8); window.ICS && window.ICS.open(); };
  root.querySelector('#openLevels').onclick = () => { SFX.tap(); buzz(8); go('levels'); };
  root.querySelector('#openHelp').onclick = () => { SFX.tap(); buzz(8); openHelpModal(); };
  root.querySelector('#expBtn').onclick = exportData;
  root.querySelector('#impBtn').onclick = importData;
  root.querySelector('#rstBtn').onclick = () => {
    if (confirm('Удалить весь прогресс? Это действие необратимо.')){
      resetState();
      applyTheme();
      go('onboarding');
    }
  };

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
      const el = qs('#avatarPreview', m);
      if (el) el.innerHTML = avatarHtml(newAvatar, 120);
    };
    qs('#uploadAvatarBtn', m).onclick = () => qs('#avatarInput', m).click();
    qs('#avatarInput', m).onchange = e => {
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
            qsa('[data-av]', m).forEach(x => x.classList.remove('on'));
            toast('Фото загружено');
          }catch(e){ toast('Не удалось'); }
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    };
    qsa('[data-av]', m).forEach(b => b.onclick = () => {
      newAvatar = b.dataset.av; newType = 'emoji';
      SFX.tap(); buzz(8);
      qsa('[data-av]', m).forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      updatePreview();
    });
    qs('#nmCancel', m).onclick = () => closeModal(m);
    qs('#nmSave', m).onclick = () => {
      S.shared.name = (qs('#nmIn', m).value || 'Игрок').slice(0,20).trim() || 'Игрок';
      S.shared.avatar = newAvatar;
      S.shared.avatarType = newType;
      saveState(); closeModal(m); go('profile');
      toast('Профиль обновлён');
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
    <p class="muted" style="margin-bottom:14px">Отмечай одним тапом. Можно связать с событием в расписании.</p>
    <h3 style="font-size:14px;margin-bottom:8px;color:var(--moss)">📅 Дела</h3>
    <p class="muted" style="margin-bottom:14px">День / Неделя / Месяц. Шаблоны для замены целого дня. Удерживай событие — перемещение.</p>
    <h3 style="font-size:14px;margin-bottom:8px;color:var(--moss)">😴 Сон и Настроение</h3>
    <p class="muted" style="margin-bottom:14px">Записывай. В Прогрессе увидишь корреляции между сном, настроением и делами.</p>
    <h3 style="font-size:14px;margin-bottom:8px;color:var(--moss)">🥗 Питание</h3>
    <p class="muted" style="margin-bottom:14px">Авто-план по цели, БЖУ 30/25/45, витамины и БАДы с учётом КБЖУ.</p>
    <h3 style="font-size:14px;margin-bottom:8px;color:var(--moss)">🧠 Мозг и Дыхание</h3>
    <p class="muted" style="margin-bottom:14px">19 упражнений + 6 дыхательных практик для сна, фокуса и сброса стресса.</p>
    <h3 style="font-size:14px;margin-bottom:8px;color:var(--moss)">📊 Отчёты</h3>
    <p class="muted" style="margin-bottom:14px">Подробный отчёт за 7/30/90 дней: питание, сон, мозг, привычки, дыхание, витамины, цели. PNG или CSV.</p>
    <button class="btn btn-primary btn-full btn-lg" id="hOk" type="button">Понятно</button>`, m => {
    qs('#hOk', m).onclick = () => closeModal(m);
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
console.log('[Profile] v4.5 loaded');
})();