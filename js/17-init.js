/* ═══ NAVLIFE · INIT ═══ */
(function(){
'use strict';
const N = window.__nav;
const { applyTheme, go, saveState, ensureAudio, todayKey } = N;

applyTheme();

if (window.seedIfEmpty) window.seedIfEmpty();

if (N.migrateBaseRefs) try{ N.migrateBaseRefs(); }catch(e){ console.warn('[migrateBaseRefs]', e); }
if (N.ensureRecurringEvents) try{ N.ensureRecurringEvents(); }catch(e){ console.warn('[ensureRecurringEvents]', e); }
if (N.ensureBaseEventsForFuture) try{ N.ensureBaseEventsForFuture(); }catch(e){ console.warn('[ensureBaseEventsForFuture]', e); }
if (N.refreshStreak) try{ N.refreshStreak(); }catch(e){ console.warn('[refreshStreak]', e); }
if (N.ensureToday) try{ N.ensureToday(); }catch(e){ console.warn('[ensureToday]', e); }

const today = todayKey();
if (!N.S.nutrition.viewDate || N.S.nutrition.viewDate < today){
  N.S.nutrition.viewDate = today;
  N.S.nutrition._manualDate = false;
}
if (!N.S.navlife.viewDate || N.S.navlife.viewDate < today){
  N.S.navlife.viewDate = today;
}

if (window.Achievements) setTimeout(() => window.Achievements.check(), 1200);

if (!N.S.shared.onboarded) go('onboarding');
else go('today');

document.addEventListener('visibilitychange', () => {
  if (!document.hidden){
    if (N.ensureToday) N.ensureToday();
    const t = todayKey();
    if (N.S.nutrition.viewDate < t && !N.S.nutrition._manualDate){
      N.S.nutrition.viewDate = t;
      saveState();
    }
    if (N.currentScreen === 'today') go('today');
  } else {
    saveState();
  }
});

window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && N.modalStack.length > 0) N.closeModal();
});

const unlock = () => {
  ensureAudio();
  window.removeEventListener('touchstart', unlock);
  window.removeEventListener('click', unlock);
  window.removeEventListener('keydown', unlock);
};
window.addEventListener('touchstart', unlock, {once:true, passive:true});
window.addEventListener('click', unlock, {once:true});
window.addEventListener('keydown', unlock, {once:true});

console.log('[NavLife] Init done ✓');
})();