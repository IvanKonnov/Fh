/* ═══ NAVLIFE · ACHIEVEMENT SOUNDS ═══
   Патч Achievements.check: разные звуки по редкости.
*/
(function(){
'use strict';
const N = window.__nav;
if (!N){ console.error('[ACH-RARITY] __nav not found'); return; }

/* Ждём загрузки 14-achievements.js */
setTimeout(() => {
  if (!window.Achievements || !N.SFX.badgeCommon) {
    console.warn('[ACH-RARITY] Achievements not ready');
    return;
  }

  const origBadge = N.SFX.badge;

  /* Патч: badge теперь смотрит, какой бейдж только что открылся */
  let lastUnlockedBadgeIds = [];

  /* Периодический аудит новых бейджей */
  setInterval(() => {
    const achievements = N.S.achievements || {};
    const currentIds = Object.keys(achievements);
    const newIds = currentIds.filter(id => !lastUnlockedBadgeIds.includes(id));
    
    if (newIds.length > 0 && lastUnlockedBadgeIds.length > 0){
      // Определяем максимальную редкость среди новых
      const rarities = newIds.map(id => window.getAchievementRarity ? window.getAchievementRarity(id) : 'common');
      const best = rarities.includes('secret') ? 'secret'
                 : rarities.includes('epic') ? 'epic'
                 : rarities.includes('rare') ? 'rare'
                 : 'common';
      
      if (window.playAchievementSound) {
        setTimeout(() => window.playAchievementSound(best), 50);
      }
      
      // Haptics по редкости
      if (window.Haptics) {
        if (best === 'secret' || best === 'epic') Haptics.play('success');
        else if (best === 'rare') Haptics.play('achievement');
        else Haptics.play('ok');
      }
    }
    
    lastUnlockedBadgeIds = currentIds;
  }, 400);

  // Инициализация текущего списка
  setTimeout(() => {
    lastUnlockedBadgeIds = Object.keys(N.S.achievements || {});
  }, 1500);

  /* Переопределяем SFX.badge чтобы не играл дважды — наша логика уже играет */
  N.SFX.badge = () => {
    // Пусто: свой звук сыграет аудит выше по редкости
  };

  console.log('[Achievement Rarity] patched');
}, 800);
})();