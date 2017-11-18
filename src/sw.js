var CACHE_VERSION = '0.0.001';
var CACHE_NAME = 'app' + CACHE_VERSION;

self.addEventListener('install', function (event) {
    console.log('[ServiceWorker] install', event);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => fetch("bundle_manifest.json")
                .then(function(response){ 
                    return response.json();
                })
                .then(function(assets){
                    cache.addAll( [ //"/",
                                    assets["runtime.js"],
                                    assets["vendor.js"],
                                    assets["frb.js"],
                                    //assets["main.js"],
                                    //assets["main.css"],
                                    assets["assets\funny-home.jpg"],
                                    assets["assets\master.jpg"]
                                ]);
                })
          ).then(() => self.skipWaiting())
      );
});

self.addEventListener('activate', function (e) {
    console.log('[ServiceWorker] activate');
    e.waitUntil( caches.keys()
        .then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                            if (key !== CACHE_NAME) {
                                console.log(`[ServiceWorker] Removing old cache: '${key}'`);
                                return caches.delete(key);
                            }
                        }));
    })
    .then(function() { return self.clients.claim();})
    );
});

self.addEventListener('fetch', function (event) {
    const request = event.request;
    
    // Ignore not GET request.
    if (request.method !== 'GET') {
        console.log(`[ServiceWorker] Ignore non GET request ${request.method}`);
        return;
    }
    // Ignore different origin.
    const requestUrl = new URL(request.url);
    if (requestUrl.origin !== location.origin) {
        console.log(`[ServiceWorker] Ignore different origin ${requestUrl.origin}`)
        return;
    }
 
    event.respondWith(
        caches.match(event.request)
            .then(function (response) {
                // if cache hit - return response
                if (response) {
                    console.log("[ServiceWorker] from cache:", response.url);
                    return response;
                }
                

                console.log("[ServiceWorker] from server:", requestUrl);

                // IMPORTANT: Clone the request. A request is a stream and
                // can only be consumed once. Since we are consuming this
                // once by cache and once by the browser for fetch, we need
                // to clone the response.
                var fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    function (response) {

                        // Check if we received a valid response
                        if (response.type!=='opaque' && (response.status !== 200 || response.type !== 'basic')) {
                            return response;
                        }

                        /*
                            the following writes the response to cache and then returns it

                        // IMPORTANT: Clone the response. A response is a stream
                        // and because we want the browser to consume the response
                        // as well as the cache consuming the response, we need
                        // to clone it so we have two streams.
                        var responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(function (cache) {
                                cache.put(event.request, responseToCache);
                                console.log("[ServiceWorker] added response to cache: ", response.url);
                            });
                        */
                        return response;
                    }
                );
        })
    );
});