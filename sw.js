const CACHE_NAME = 'rotina-mensal-v1';
const ASSETS = [
  '/controle-rotina/',
  '/controle-rotina/index.html',
  '/controle-rotina/manifest.json'
];

// Instala e faz cache dos arquivos principais
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Ativa e limpa caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Responde requisicoes: tenta rede, cai para cache se offline
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});

// Notificacoes agendadas (recebidas via postMessage)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { title, body, delay } = event.data;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon: '/controle-rotina/icon-192.png',
        badge: '/controle-rotina/icon-192.png',
        vibrate: [200, 100, 200],
        tag: 'rotina-lembrete',
        renotify: true
      });
    }, delay);
  }
});
