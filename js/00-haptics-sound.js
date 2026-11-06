/* ═══ NAVLIFE · HAPTICS + SOUND LIBRARY ═══
   Паттерны вибраций + звуки достижений по редкости.
*/
(function(){
'use strict';
const N = window.__nav;
if (!N){ console.error('[HAPTICS] __nav not found'); return; }

/* ═══ Паттерны ═══ */
const PATTERNS = {
  tap:        8,
  ok:         [10, 40, 10],
  done:       [12, 30, 12],
  achievement:[20, 40, 20, 40, 20],
  reminder:   [50, 200, 50],
  error:      [30, 30, 30],
  win:        [10, 30, 10, 30, 10, 30, 10],
  success:    [12, 40, 12, 40, 12, 40, 12, 40, 12],
  edge:       [8, 20, 8]
};

window.Haptics = {
  play(name){
    if (!N.S.shared.haptics) return;
    if (!navigator.vibrate) return;
    const p = PATTERNS[name];
    if (p) {
      try { navigator.vibrate(p); } catch(e){}
    }
  },
  patterns: PATTERNS
};

/* ═══ Звуки достижений по редкости ═══
   Используем существующие SFX как строительные блоки.
*/
N.SFX.badgeCommon = () => N.SFX.ok();
N.SFX.badgeRare = () => {
  N.SFX.ok();
  setTimeout(() => N.SFX.tap(), 220);
  setTimeout(() => N.SFX.tap(), 320);
};
N.SFX.badgeEpic = () => N.SFX.levelup();
N.SFX.badgeSecret = () => N.SFX.endMelody();

/* ═══ Карта редкостей ═══ */
window.ACHIEVEMENT_RARITY = {
  // common (базовые, легко получить)
  habits_first:'common', brain_first:'common', mood_first:'common',
  reflect_1:'common', sleep_first:'common', goal_first:'common',
  schedule_10:'common', water_7:'common', sleep_7:'common',
  kcal_7:'common', habits_5:'common',
  // rare (требуют стабильности)
  streak_3:'rare', streak_7:'rare', brain_10:'rare', brain_50:'rare',
  water_30:'rare', kcal_30:'rare', goal_done:'rare', brain_perfect:'rare',
  habits_streak7:'rare', mood_7:'rare', reflect_4:'rare', sleep_8h_7:'rare',
  // epic (долгий путь)
  streak_14:'epic', streak_30:'epic', brain_100:'epic', brain_all:'epic',
  habits_streak30:'epic', mood_30:'epic', reflect_12:'epic',
  schedule_100:'epic', schedule_perfect_day:'epic',
  // secret (легендарные)
  streak_100:'secret'
};

window.getAchievementRarity = (id) => window.ACHIEVEMENT_RARITY[id] || 'common';

/* ═══ Хелпер ═══ */
window.playAchievementSound = (rarity) => {
  const map = {
    common: N.SFX.badgeCommon,
    rare:   N.SFX.badgeRare,
    epic:   N.SFX.badgeEpic,
    secret: N.SFX.badgeSecret
  };
  (map[rarity] || map.common)();
};

console.log('[Haptics+Sound] loaded');
})();