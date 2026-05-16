/**
 * Service Worker - 番茄钟 PWA 离线支持
 */
const CACHE_NAME = 'tomato-clock-v1';

const ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/storage.js',
  '/js/notification.js',
  '/js/settings.js',
  '/js/timer.js',
  '/js/history.js',
  '/js/chart.js',
  '/js/ui.js',
  '/js/app.js',
  '/assets/images/icon-192.png',
  '/assets/images/icon-512.png'
];

// install: 缓存所有静态资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// activate: 清理旧版本缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// fetch: 缓存优先策略，失败回退网络
self.addEventListener('fetch', (event) => {
  // 忽略非 GET 请求
  if (event.request.method !== 'GET') {
    return;
  }

  // 忽略 CDN 请求（Chart.js 等）
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) {
          return cached;
        }

        return fetch(event.request).then(response => {
          // 只缓存成功的响应
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // 克隆响应，因为响应流只能使用一次
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
      .catch(() => {
        // 网络失败时返回离线页面（如果有的话）
        return new Response('离线状态，请检查网络连接', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      })
  );
});
