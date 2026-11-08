/* ═══ NAVLIFE · SMOOTH UI (No Jump) ═══
   Убирает прыжок в начало страницы и сохраняет 
   открытые карточки при обновлении данных.
*/
(function(){
'use strict';
const N = window.__nav;
if (!N) { console.error('[SMOOTH UI] __nav not found'); return; }

// Отключаем авто-восстановление скролла браузером (чтобы не было конфликтов)
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

const originalGo = N.go;

N.go = function(name){
  const isSameScreen = N.currentScreen === name;
  let scrollY = window.scrollY;
  let openMeals = [];
  
  // Если мы обновляем текущий экран, запоминаем открытые аккордеоны (приёмы пищи)
  if (isSameScreen) {
    document.querySelectorAll('.meal-card.open').forEach(el => {
      openMeals.push(el.getAttribute('data-meal'));
    });
  }
  
  // Вызываем оригинальный рендер экрана
  originalGo(name);
  
  // Восстанавливаем состояние, если это тот же экран
  if (isSameScreen) {
    // Возвращаем открытые карточки
    openMeals.forEach(mealId => {
      const card = document.querySelector(`.meal-card[data-meal="${mealId}"]`);
      if (card) card.classList.add('open');
    });
    
    // Возвращаем скролл на место
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: scrollY, behavior: 'instant' });
      });
    });
  }
};

console.log('[Smooth UI] Scroll & state preservation enabled');
})();