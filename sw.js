const CACHE = 'navlife-v9';
const ASSETS = [
  './', './index.html', './manifest.json', './icon.svg',
  './css/base.css', './css/skin.css', './css/modules.css',
  './js/00-nutrition-data.js',
  './js/01-core.js','./js/02-home.js','./js/03-schedule.js','./js/04-nutrition.js',
  './js/05-brain.js','./js/06-goals.js','./js/07-onboarding.js','./js/08-stats.js',
  './js/09-profile.js','./js/10-habits.js','./js/11-sleep.js','./js/12-mood.js',
  './js/13-reflection.js','./js/14-achievements.js','./js/15-freezer.js',
  './js/16-feature-pack.js','./js/17-init.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')){
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then(cached => cached || fetch(req).then(res => {
    if (res && res.ok && res.type === 'basic'){
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
    }
    return res;
  })));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type:'window', includeUncontrolled:true }).then(list => {
    for (const c of list) if ('focus' in c) return c.focus();
    if (clients.openWindow) return clients.openWindow('./index.html');
  }));
});