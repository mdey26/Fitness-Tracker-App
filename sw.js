// FitTracker Service Worker
const CACHE_NAME = 'fittracker-v1.0.0';
const STATIC_CACHE = 'fittracker-static-v1';
const DYNAMIC_CACHE = 'fittracker-dynamic-v1';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css', 
  '/app.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Error caching static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests
  if (request.method === 'GET') {
    // For navigation requests (HTML pages)
    if (request.mode === 'navigate') {
      event.respondWith(
        caches.match('/index.html')
          .then(response => {
            return response || fetch('/index.html');
          })
          .catch(() => {
            return caches.match('/index.html');
          })
      );
      return;
    }

    // For static assets
    if (STATIC_ASSETS.some(asset => request.url.includes(asset))) {
      event.respondWith(
        caches.match(request)
          .then(response => {
            if (response) {
              console.log('[SW] Serving from cache:', request.url);
              return response;
            }

            console.log('[SW] Fetching from network:', request.url);
            return fetch(request)
              .then(fetchResponse => {
                const responseClone = fetchResponse.clone();
                caches.open(STATIC_CACHE)
                  .then(cache => {
                    cache.put(request, responseClone);
                  });
                return fetchResponse;
              });
          })
          .catch(() => {
            console.log('[SW] Network failed, serving from cache:', request.url);
            return caches.match(request);
          })
      );
      return;
    }

    // For dynamic content (API calls, external resources)
    event.respondWith(
      fetch(request)
        .then(response => {
          // Only cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          console.log('[SW] Network failed, checking cache for:', request.url);
          return caches.match(request);
        })
    );
  }
});

// Background sync for offline data
self.addEventListener('sync', event => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'sync-user-data') {
    event.waitUntil(syncUserData());
  }
});

// Push notifications
self.addEventListener('push', event => {
  console.log('[SW] Push notification received');

  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'open-app',
        title: 'Open FitTracker',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/close.png'
      }
    ],
    tag: 'fittracker-notification',
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification('FitTracker', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'open-app') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper function to sync user data when back online
async function syncUserData() {
  try {
    // Get cached user data
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedData = await cache.match('/api/user-data');

    if (cachedData) {
      const userData = await cachedData.json();
      console.log('[SW] Syncing user data:', userData);

      // Here you would send the data to your server
      // For this demo, we'll just log it
      console.log('[SW] User data sync completed');
    }
  } catch (error) {
    console.error('[SW] Error syncing user data:', error);
  }
}

// Log service worker status
console.log('[SW] Service Worker loaded and ready');
